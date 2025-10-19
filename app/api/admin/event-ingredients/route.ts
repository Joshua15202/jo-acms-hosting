import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export const dynamic = "force-dynamic"
export const revalidate = 0

// Weight estimation per guest (in grams)
const WEIGHT_PER_GUEST = {
  beef: 200,
  pork: 200,
  chicken: 180,
  seafood: 160,
  vegetables: 120,
  default: 150,
}

function getIngredientCategory(itemName: string): string {
  const name = itemName.toLowerCase()
  if (name.includes("beef") || name.includes("steak") || name.includes("brisket")) return "beef"
  if (name.includes("pork") || name.includes("ham") || name.includes("bacon")) return "pork"
  if (name.includes("chicken") || name.includes("poultry")) return "chicken"
  if (name.includes("fish") || name.includes("salmon") || name.includes("seafood") || name.includes("shrimp"))
    return "seafood"
  if (name.includes("vegetable") || name.includes("veggie") || name.includes("salad")) return "vegetables"
  return "other"
}

function calculateWeight(itemName: string, guestCount: number): number {
  const category = getIngredientCategory(itemName)
  const weightPerGuest = WEIGHT_PER_GUEST[category as keyof typeof WEIGHT_PER_GUEST] || WEIGHT_PER_GUEST.default
  return (weightPerGuest * guestCount) / 1000 // Convert to kg
}

function parseMainCourses(mainCourses: any): any[] {
  if (!mainCourses) return []

  const courses = []

  try {
    // Handle string JSON
    const menuData = typeof mainCourses === "string" ? JSON.parse(mainCourses) : mainCourses

    console.log("Parsing main courses data:", JSON.stringify(menuData, null, 2))

    // If it's an array, extract names from objects or return strings directly
    if (Array.isArray(menuData)) {
      menuData.forEach((item) => {
        if (typeof item === "string") {
          courses.push(item)
        } else if (typeof item === "object" && item !== null && item.name) {
          courses.push(item.name)
        }
      })
      return courses.filter((item) => item && typeof item === "string")
    }

    // If it's an object, extract all values that are arrays or objects with names
    if (typeof menuData === "object" && menuData !== null) {
      Object.values(menuData).forEach((value) => {
        if (Array.isArray(value)) {
          value.forEach((item) => {
            if (typeof item === "string") {
              courses.push(item)
            } else if (typeof item === "object" && item !== null && (item as any).name) {
              courses.push((item as any).name)
            }
          })
        } else if (typeof value === "string") {
          courses.push(value)
        } else if (typeof value === "object" && value !== null && (value as any).name) {
          courses.push((value as any).name)
        }
      })
    }
  } catch (error) {
    console.error("Error parsing main courses:", error)
  }

  return courses.filter((item) => item && typeof item === "string")
}

export async function GET() {
  try {
    console.log("=== Fetching Event Ingredients Overview ===")

    // Get today's date in YYYY-MM-DD format
    const today = new Date()
    const todayStr = today.toISOString().split("T")[0]
    console.log("Today's date:", todayStr)

    // Get all future appointments - include more statuses
    const { data: appointments, error } = await supabaseAdmin
      .from("tbl_comprehensive_appointments")
      .select(`
        id,
        event_date,
        event_type,
        contact_first_name,
        contact_last_name,
        guest_count,
        main_courses,
        status,
        admin_notes
      `)
      .gte("event_date", todayStr)
      .order("event_date", { ascending: true })

    if (error) {
      console.error("Error fetching appointments:", error)
      return NextResponse.json({ error: "Failed to fetch appointments" }, { status: 500 })
    }

    console.log(`Found ${appointments?.length || 0} appointments with event_date >= ${todayStr}`)

    if (appointments && appointments.length > 0) {
      console.log("Sample appointment:", JSON.stringify(appointments[0], null, 2))
      console.log(
        "All appointment statuses:",
        appointments.map((a) => ({ id: a.id, status: a.status, date: a.event_date })),
      )
    }

    // Filter for confirmed bookings only
    const confirmedAppointments =
      appointments?.filter((appointment) => {
        const isConfirmed = ["confirmed", "tasting_confirmed", "tasting_completed"].includes(
          appointment.status?.toLowerCase() || "",
        )
        if (!isConfirmed) {
          console.log(`Filtering out appointment ${appointment.id} with status: ${appointment.status}`)
        }
        return isConfirmed
      }) || []

    console.log(`Found ${confirmedAppointments.length} confirmed appointments`)

    // Filter out events that have already been confirmed for ingredients
    const pendingAppointments =
      confirmedAppointments.filter(
        (appointment) => !appointment.admin_notes || !appointment.admin_notes.includes("INGREDIENTS_CONFIRMED"),
      ) || []

    console.log(`Found ${pendingAppointments.length} pending appointments (not yet confirmed for ingredients)`)

    const eventIngredients = pendingAppointments.map((appointment) => {
      const eventDate = new Date(appointment.event_date)
      const today = new Date()
      const daysUntilEvent = Math.ceil((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

      console.log(`Processing appointment ${appointment.id}:`, {
        event_date: appointment.event_date,
        days_until_event: daysUntilEvent,
        main_courses: appointment.main_courses,
      })

      // Parse main courses from main_courses column
      const mainCourses = parseMainCourses(appointment.main_courses)
      console.log(`Parsed ${mainCourses.length} main courses for appointment ${appointment.id}:`, mainCourses)

      // Calculate weights for each main course item
      const mainCourseItems = mainCourses.map((item) => ({
        name: item,
        category: getIngredientCategory(item),
        weight_kg: calculateWeight(item, appointment.guest_count),
      }))

      // Calculate total weight
      const totalWeight = mainCourseItems.reduce((sum, item) => sum + item.weight_kg, 0)

      return {
        id: appointment.id,
        appointment_id: appointment.id,
        event_date: appointment.event_date,
        event_type: appointment.event_type || "Event",
        customer_name: `${appointment.contact_first_name} ${appointment.contact_last_name}`,
        guest_count: appointment.guest_count,
        main_course_items: mainCourseItems,
        total_weight_kg: Math.round(totalWeight * 100) / 100, // Round to 2 decimal places
        status: "pending",
        days_until_event: daysUntilEvent,
        can_confirm: daysUntilEvent <= 1,
        urgency_level:
          daysUntilEvent <= 1 ? "critical" : daysUntilEvent <= 3 ? "high" : daysUntilEvent <= 7 ? "medium" : "low",
      }
    })

    // Filter out events with no main course items
    const validEventIngredients = eventIngredients.filter((event) => event.main_course_items.length > 0)

    console.log(`Found ${validEventIngredients.length} valid events with main course items`)

    // Calculate summary statistics
    const summary = {
      total_events: validEventIngredients.length,
      total_guests: validEventIngredients.reduce((sum, event) => sum + event.guest_count, 0),
      total_weight_kg:
        Math.round(validEventIngredients.reduce((sum, event) => sum + event.total_weight_kg, 0) * 100) / 100,
      ready_to_confirm: validEventIngredients.filter((event) => event.can_confirm).length,
      by_urgency: {
        critical: validEventIngredients.filter((event) => event.urgency_level === "critical").length,
        high: validEventIngredients.filter((event) => event.urgency_level === "high").length,
        medium: validEventIngredients.filter((event) => event.urgency_level === "medium").length,
        low: validEventIngredients.filter((event) => event.urgency_level === "low").length,
      },
    }

    // Calculate category breakdown
    const categoryBreakdown: Record<string, number> = {}
    validEventIngredients.forEach((event) => {
      event.main_course_items.forEach((item) => {
        categoryBreakdown[item.category] = (categoryBreakdown[item.category] || 0) + item.weight_kg
      })
    })

    // Round category weights
    Object.keys(categoryBreakdown).forEach((category) => {
      categoryBreakdown[category] = Math.round(categoryBreakdown[category] * 100) / 100
    })

    console.log(`Returning ${validEventIngredients.length} events with summary:`, summary)

    return NextResponse.json(
      {
        events: validEventIngredients,
        summary,
        category_breakdown: categoryBreakdown,
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      },
    )
  } catch (error) {
    console.error("Error in event ingredients API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
