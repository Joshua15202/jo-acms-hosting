import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    const { category, price } = await request.json()

    if (!category || !price) {
      return NextResponse.json({ success: false, error: "Category and price are required" }, { status: 400 })
    }

    // Validate price is a positive number
    const numericPrice = Number.parseFloat(price)
    if (isNaN(numericPrice) || numericPrice <= 0) {
      return NextResponse.json({ success: false, error: "Price must be a positive number" }, { status: 400 })
    }

    console.log(`Updating all items in category "${category}" to ₱${numericPrice}`)

    // First, get all items in this category to see what we're updating
    const { data: itemsToUpdate, error: fetchError } = await supabaseAdmin
      .from("tbl_menu_items")
      .select("*")
      .eq("category", category.toLowerCase())

    if (fetchError) {
      console.error("Error fetching items to update:", fetchError)
      return NextResponse.json({ success: false, error: "Failed to fetch items to update" }, { status: 500 })
    }

    if (!itemsToUpdate || itemsToUpdate.length === 0) {
      return NextResponse.json({ success: false, error: `No items found in category "${category}"` }, { status: 404 })
    }

    console.log(`Found ${itemsToUpdate.length} items to update in category "${category}"`)

    // Check what columns exist in the table
    const availableColumns = Object.keys(itemsToUpdate[0])
    console.log("Available columns:", availableColumns)

    // Build update object based on available columns
    const updateData: any = {
      updated_at: new Date().toISOString(),
    }

    // Add price field(s) based on what columns exist
    if (availableColumns.includes("price")) {
      updateData.price = numericPrice
    }
    if (availableColumns.includes("price_per_guest")) {
      updateData.price_per_guest = numericPrice
    }
    if (availableColumns.includes("menu_price")) {
      updateData.menu_price = numericPrice
    }

    console.log("Update data:", updateData)

    // Update all items in the category
    const { data: updatedItems, error: updateError } = await supabaseAdmin
      .from("tbl_menu_items")
      .update(updateData)
      .eq("category", category.toLowerCase())
      .select()

    if (updateError) {
      console.error("Error updating category prices:", updateError)
      return NextResponse.json(
        { success: false, error: "Failed to update category prices", details: updateError },
        { status: 500 },
      )
    }

    console.log(`Successfully updated ${updatedItems?.length || 0} items`)

    // Calculate old vs new pricing for logging
    const oldTotalValue = itemsToUpdate.reduce((sum, item) => {
      return sum + Number(item.price || item.price_per_guest || item.menu_price || 0)
    }, 0)

    const newTotalValue = (updatedItems?.length || 0) * numericPrice

    // Trigger recalculation of existing appointments since category prices changed
    try {
      console.log("Triggering appointment recalculation...")
      const recalcResponse = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/admin/recalculate-appointments`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            reason: `Category price update: ${category}`,
            category: category.toLowerCase(),
            newPrice: numericPrice,
            itemsAffected: updatedItems?.length || 0,
          }),
        },
      )

      if (recalcResponse.ok) {
        const recalcResult = await recalcResponse.json()
        console.log("Appointment recalculation result:", recalcResult)
      } else {
        const errorText = await recalcResponse.text()
        console.warn("Failed to trigger appointment recalculation:", errorText)
      }
    } catch (recalcError) {
      console.warn("Failed to trigger appointment recalculation:", recalcError)
    }

    return NextResponse.json({
      success: true,
      message: `Successfully updated ${updatedItems?.length || 0} items in ${category} category`,
      data: {
        category,
        newPrice: numericPrice,
        updatedCount: updatedItems?.length || 0,
        oldTotalValue,
        newTotalValue,
        savings: newTotalValue - oldTotalValue,
        updatedItems:
          updatedItems?.map((item) => ({
            id: item.id,
            name: item.name || item.item_name || item.menu_name,
            oldPrice: itemsToUpdate.find((old) => old.id === item.id)?.price || 0,
            newPrice: numericPrice,
          })) || [],
      },
    })
  } catch (error) {
    console.error("Error in update category price:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
