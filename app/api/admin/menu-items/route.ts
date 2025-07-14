import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export async function GET() {
  try {
    console.log("Fetching menu items for admin...")

    // First, let's try to get all columns to see what's available
    const { data: menuItems, error } = await supabaseAdmin
      .from("tbl_menu_items")
      .select("*")
      .order("category", { ascending: true })
      .order("name", { ascending: true })

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ success: false, error: "Failed to fetch menu items", details: error }, { status: 500 })
    }

    console.log(`Found ${menuItems?.length || 0} menu items`)
    console.log("Sample item:", menuItems?.[0])

    if (!menuItems || menuItems.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          menuItems: [],
          categoryStats: {},
          totalItems: 0,
        },
      })
    }

    // Check what columns are available in the first item
    const availableColumns = Object.keys(menuItems[0])
    console.log("Available columns:", availableColumns)

    // Transform data with flexible column mapping
    const transformedItems = menuItems.map((item) => {
      // Try different possible column names for name
      const name = item.name || item.item_name || item.menu_name || "Unknown Item"

      // Try different possible column names for price
      const price = Number(item.price || item.price_per_guest || item.menu_price || item.cost || 0)

      // Try different possible column names for category
      const category = (item.category || item.menu_category || "other").toLowerCase()

      return {
        id: item.id,
        name: name,
        price: price,
        category: category,
        description: item.description || item.menu_description || "",
        created_at: item.created_at,
        updated_at: item.updated_at,
      }
    })

    console.log("Transformed items sample:", transformedItems[0])

    // Group by category for statistics
    const categoryStats = transformedItems.reduce(
      (acc, item) => {
        const cat = item.category || "other"
        if (!acc[cat]) {
          acc[cat] = {
            count: 0,
            totalValue: 0,
            avgPrice: 0,
          }
        }
        acc[cat].count++
        acc[cat].totalValue += item.price
        acc[cat].avgPrice = acc[cat].totalValue / acc[cat].count
        return acc
      },
      {} as Record<string, { count: number; totalValue: number; avgPrice: number }>,
    )

    console.log("Category stats:", categoryStats)

    return NextResponse.json({
      success: true,
      data: {
        menuItems: transformedItems,
        categoryStats,
        totalItems: transformedItems.length,
      },
      debug: {
        availableColumns,
        rawSample: menuItems[0],
      },
    })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ success: false, error: "Internal server error", details: error }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, category, price, description } = await request.json()

    if (!name || !category || !price) {
      return NextResponse.json({ success: false, error: "Name, category, and price are required" }, { status: 400 })
    }

    // Validate price is a positive number
    const numericPrice = Number.parseFloat(price)
    if (isNaN(numericPrice) || numericPrice <= 0) {
      return NextResponse.json({ success: false, error: "Price must be a positive number" }, { status: 400 })
    }

    console.log(`Adding new menu item: ${name} (${category}) - ₱${numericPrice}`)

    // Check what columns exist in the table first
    const { data: sampleData } = await supabaseAdmin.from("tbl_menu_items").select("*").limit(1)

    const availableColumns = sampleData && sampleData.length > 0 ? Object.keys(sampleData[0]) : []
    console.log("Available columns for insert:", availableColumns)

    // Build insert object based on available columns
    const insertData: any = {
      category: category.toLowerCase(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    // Add name field(s)
    if (availableColumns.includes("name")) {
      insertData.name = name
    }
    if (availableColumns.includes("item_name")) {
      insertData.item_name = name
    }
    if (availableColumns.includes("menu_name")) {
      insertData.menu_name = name
    }

    // Add price field(s)
    if (availableColumns.includes("price")) {
      insertData.price = numericPrice
    }
    if (availableColumns.includes("price_per_guest")) {
      insertData.price_per_guest = numericPrice
    }
    if (availableColumns.includes("menu_price")) {
      insertData.menu_price = numericPrice
    }

    // Add description if provided and column exists
    if (description && availableColumns.includes("description")) {
      insertData.description = description
    }
    if (description && availableColumns.includes("menu_description")) {
      insertData.menu_description = description
    }

    console.log("Insert data:", insertData)

    const { data, error } = await supabaseAdmin.from("tbl_menu_items").insert(insertData).select().single()

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ success: false, error: "Failed to create menu item", details: error }, { status: 500 })
    }

    console.log("Successfully created menu item:", data)

    // After creating new item, trigger price update for existing appointments
    try {
      await fetch(`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/admin/recalculate-appointments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: "New menu item added", itemName: name }),
      })
    } catch (recalcError) {
      console.warn("Failed to trigger appointment recalculation:", recalcError)
    }

    return NextResponse.json({
      success: true,
      data: {
        id: data.id,
        name: data.name || data.item_name || data.menu_name,
        price: Number(data.price || data.price_per_guest || data.menu_price),
        category: data.category,
        description: data.description || data.menu_description,
        created_at: data.created_at,
        updated_at: data.updated_at,
      },
    })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ success: false, error: "Internal server error", details: error }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, name, category, price, description } = await request.json()

    if (!id || !name || !category || !price) {
      return NextResponse.json({ success: false, error: "ID, name, category, and price are required" }, { status: 400 })
    }

    // Validate price is a positive number
    const numericPrice = Number.parseFloat(price)
    if (isNaN(numericPrice) || numericPrice <= 0) {
      return NextResponse.json({ success: false, error: "Price must be a positive number" }, { status: 400 })
    }

    console.log(`Updating menu item ${id}: ${name} (${category}) - ₱${numericPrice}`)

    // Get the old price for comparison
    const { data: oldItem } = await supabaseAdmin.from("tbl_menu_items").select("*").eq("id", id).single()

    const oldPrice = oldItem ? Number(oldItem.price || oldItem.price_per_guest || oldItem.menu_price || 0) : 0

    // Check what columns exist in the table first
    const { data: sampleData } = await supabaseAdmin.from("tbl_menu_items").select("*").limit(1)

    const availableColumns = sampleData && sampleData.length > 0 ? Object.keys(sampleData[0]) : []
    console.log("Available columns for update:", availableColumns)

    // Build update object based on available columns
    const updateData: any = {
      category: category.toLowerCase(),
      updated_at: new Date().toISOString(),
    }

    // Add name field(s)
    if (availableColumns.includes("name")) {
      updateData.name = name
    }
    if (availableColumns.includes("item_name")) {
      updateData.item_name = name
    }
    if (availableColumns.includes("menu_name")) {
      updateData.menu_name = name
    }

    // Add price field(s)
    if (availableColumns.includes("price")) {
      updateData.price = numericPrice
    }
    if (availableColumns.includes("price_per_guest")) {
      updateData.price_per_guest = numericPrice
    }
    if (availableColumns.includes("menu_price")) {
      updateData.menu_price = numericPrice
    }

    // Add description if provided and column exists
    if (description !== undefined) {
      if (availableColumns.includes("description")) {
        updateData.description = description
      }
      if (availableColumns.includes("menu_description")) {
        updateData.menu_description = description
      }
    }

    console.log("Update data:", updateData)

    const { data, error } = await supabaseAdmin.from("tbl_menu_items").update(updateData).eq("id", id).select().single()

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ success: false, error: "Failed to update menu item", details: error }, { status: 500 })
    }

    console.log("Successfully updated menu item:", data)

    // If price changed, trigger recalculation of existing appointments
    if (oldPrice !== numericPrice) {
      console.log(`Price changed from ₱${oldPrice} to ₱${numericPrice} for ${name}`)

      try {
        const recalcResponse = await fetch(
          `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/admin/recalculate-appointments`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              reason: "Menu price updated",
              itemName: name,
              oldPrice,
              newPrice: numericPrice,
              category: category.toLowerCase(),
            }),
          },
        )

        if (recalcResponse.ok) {
          const recalcResult = await recalcResponse.json()
          console.log("Appointment recalculation triggered:", recalcResult)
        }
      } catch (recalcError) {
        console.warn("Failed to trigger appointment recalculation:", recalcError)
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        id: data.id,
        name: data.name || data.item_name || data.menu_name,
        price: Number(data.price || data.price_per_guest || data.menu_price),
        category: data.category,
        description: data.description || data.menu_description,
        created_at: data.created_at,
        updated_at: data.updated_at,
      },
      priceChanged: oldPrice !== numericPrice,
      oldPrice,
      newPrice: numericPrice,
    })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ success: false, error: "Internal server error", details: error }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ success: false, error: "ID is required" }, { status: 400 })
    }

    console.log(`Deleting menu item ${id}`)

    // Get item details before deletion for logging
    const { data: itemToDelete } = await supabaseAdmin.from("tbl_menu_items").select("*").eq("id", id).single()

    const { error } = await supabaseAdmin.from("tbl_menu_items").delete().eq("id", id)

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ success: false, error: "Failed to delete menu item", details: error }, { status: 500 })
    }

    console.log("Successfully deleted menu item:", id)

    // Trigger recalculation since a menu item was removed
    if (itemToDelete) {
      try {
        await fetch(
          `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/admin/recalculate-appointments`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              reason: "Menu item deleted",
              itemName: itemToDelete.name || itemToDelete.item_name,
              category: itemToDelete.category,
            }),
          },
        )
      } catch (recalcError) {
        console.warn("Failed to trigger appointment recalculation:", recalcError)
      }
    }

    return NextResponse.json({
      success: true,
      message: "Menu item deleted successfully",
    })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ success: false, error: "Internal server error", details: error }, { status: 500 })
  }
}
