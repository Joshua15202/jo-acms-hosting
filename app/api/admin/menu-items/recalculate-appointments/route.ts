import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"
import { calculatePackagePricingWithMenuItems, type MenuSelections } from "@/lib/pricing-calculator"

export async function POST(request: NextRequest) {
  try {
    const { reason, itemName, oldPrice, newPrice, category } = await request.json()

    console.log(`=== RECALCULATING APPOINTMENTS ===`)
    console.log(`Reason: ${reason}`)
    if (itemName) console.log(`Item: ${itemName} (${category})`)
    if (oldPrice && newPrice) console.log(`Price change: ₱${oldPrice} → ₱${newPrice}`)

    // Get all current menu items for pricing calculations
    const { data: menuItemsData, error: menuError } = await supabaseAdmin.from("tbl_menu_items").select("*")

    if (menuError) {
      console.error("Error fetching menu items:", menuError)
      return NextResponse.json({ success: false, error: "Failed to fetch menu items" }, { status: 500 })
    }

    // Group menu items by category
    const menuItems = (menuItemsData || []).reduce(
      (acc, item) => {
        const category = (item.category || "other").toLowerCase()
        if (!acc[category]) {
          acc[category] = []
        }

        acc[category].push({
          id: item.id,
          name: item.name || item.item_name || item.menu_name || "Unknown",
          category: category,
          price: Number(item.price || item.price_per_guest || item.menu_price || 0),
          description: item.description || item.menu_description || "",
        })

        return acc
      },
      {} as { [category: string]: any[] },
    )

    console.log("Menu items grouped by category:", Object.keys(menuItems))

    // Get all appointments that need recalculation (not cancelled or completed)
    const { data: appointments, error: appointmentsError } = await supabaseAdmin
      .from("tbl_comprehensive_appointments")
      .select("*")
      .in("status", [
        "pending",
        "confirmed",
        "PENDING_TASTING_CONFIRMATION",
        "TASTING_CONFIRMED",
        "TASTING_RESCHEDULE_REQUESTED",
      ])

    if (appointmentsError) {
      console.error("Error fetching appointments:", appointmentsError)
      return NextResponse.json({ success: false, error: "Failed to fetch appointments" }, { status: 500 })
    }

    console.log(`Found ${appointments?.length || 0} appointments to recalculate`)

    let updatedCount = 0
    const updateResults = []

    for (const appointment of appointments || []) {
      try {
        // Parse menu selections from appointment
        const menuSelections: MenuSelections = {
          mainCourses: parseMenuSelection(appointment.main_courses),
          pasta: parseMenuSelection(appointment.pasta || appointment.pasta_selection),
          dessert: parseMenuSelection(appointment.dessert || appointment.dessert_selection),
          beverage: parseMenuSelection(appointment.beverage || appointment.beverage_selection),
        }

        console.log(`Recalculating appointment ${appointment.id}:`, menuSelections)

        // Calculate new pricing
        const newPricing = calculatePackagePricingWithMenuItems(
          appointment.guest_count,
          menuSelections,
          menuItems,
          appointment.event_type,
        )

        console.log(`New pricing for appointment ${appointment.id}:`, {
          oldTotal: appointment.total_package_amount,
          newTotal: newPricing.totalAmount,
          oldDeposit: appointment.down_payment_amount,
          newDeposit: newPricing.downPayment,
        })

        // Update appointment with new pricing
        const { error: updateError } = await supabaseAdmin
          .from("tbl_comprehensive_appointments")
          .update({
            total_package_amount: newPricing.totalAmount,
            down_payment_amount: newPricing.downPayment,
            budget_min: newPricing.totalAmount,
            budget_max: newPricing.totalAmount,
            updated_at: new Date().toISOString(),
            // Add a note about the price update
            admin_notes:
              `${appointment.admin_notes || ""}\n[${new Date().toISOString()}] Pricing updated due to menu price changes: ${reason}`.trim(),
          })
          .eq("id", appointment.id)

        if (updateError) {
          console.error(`Error updating appointment ${appointment.id}:`, updateError)
          updateResults.push({
            appointmentId: appointment.id,
            success: false,
            error: updateError.message,
          })
        } else {
          updatedCount++
          updateResults.push({
            appointmentId: appointment.id,
            success: true,
            oldTotal: appointment.total_package_amount,
            newTotal: newPricing.totalAmount,
            difference: newPricing.totalAmount - (appointment.total_package_amount || 0),
          })
        }
      } catch (calcError) {
        console.error(`Error calculating pricing for appointment ${appointment.id}:`, calcError)
        updateResults.push({
          appointmentId: appointment.id,
          success: false,
          error: calcError instanceof Error ? calcError.message : "Calculation error",
        })
      }
    }

    console.log(`=== RECALCULATION COMPLETE ===`)
    console.log(`Updated ${updatedCount} out of ${appointments?.length || 0} appointments`)

    return NextResponse.json({
      success: true,
      message: `Successfully recalculated ${updatedCount} appointments`,
      details: {
        reason,
        itemName,
        priceChange: oldPrice && newPrice ? { oldPrice, newPrice } : null,
        totalAppointments: appointments?.length || 0,
        updatedCount,
        results: updateResults,
      },
    })
  } catch (error) {
    console.error("Error in recalculate appointments:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to recalculate appointments",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

// Helper function to parse menu selections from database
function parseMenuSelection(selection: any): string[] {
  if (!selection) return []

  if (typeof selection === "string") {
    try {
      // Try to parse as JSON first
      const parsed = JSON.parse(selection)
      if (Array.isArray(parsed)) {
        return parsed.map((item) => (typeof item === "object" ? item.name || String(item) : String(item)))
      }
    } catch {
      // If JSON parsing fails, treat as comma-separated string
    }

    return selection
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item.length > 0)
  }

  if (Array.isArray(selection)) {
    return selection
      .map((item) => {
        if (typeof item === "object" && item !== null) {
          if ("name" in item) return String(item.name)
          return JSON.stringify(item)
        }
        return String(item)
      })
      .filter((item) => item.length > 0)
  }

  return []
}
