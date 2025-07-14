import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export async function GET() {
  try {
    console.log("=== DEBUGGING MENU ITEMS TABLE ===")

    // Get table structure first
    const { data: tableInfo, error: tableError } = await supabaseAdmin.from("tbl_menu_items").select("*").limit(5)

    if (tableError) {
      console.error("Table access error:", tableError)
      return NextResponse.json({
        success: false,
        error: "Cannot access tbl_menu_items table",
        details: tableError,
      })
    }

    // Get total count
    const { count, error: countError } = await supabaseAdmin
      .from("tbl_menu_items")
      .select("*", { count: "exact", head: true })

    if (countError) {
      console.error("Count error:", countError)
    }

    const totalItems = count || 0
    console.log(`Total items in database: ${totalItems}`)

    if (!tableInfo || tableInfo.length === 0) {
      return NextResponse.json({
        success: true,
        message: "Table exists but is empty",
        totalItems: 0,
        availableColumns: [],
        sampleData: null,
      })
    }

    // Analyze table structure
    const availableColumns = Object.keys(tableInfo[0])
    console.log("Available columns:", availableColumns)

    // Get sample data from each category
    const { data: allItems, error: allError } = await supabaseAdmin
      .from("tbl_menu_items")
      .select("*")
      .order("category")
      .order("name")

    if (allError) {
      console.error("Error fetching all items:", allError)
    }

    // Group by category
    const itemsByCategory = (allItems || []).reduce(
      (acc, item) => {
        const category = item.category || "unknown"
        if (!acc[category]) {
          acc[category] = []
        }
        acc[category].push(item)
        return acc
      },
      {} as Record<string, any[]>,
    )

    const categoryStats = Object.entries(itemsByCategory).map(([category, items]) => ({
      category,
      count: items.length,
      sampleItems: items.slice(0, 3).map((item) => ({
        id: item.id,
        name: item.name || item.item_name || item.menu_name,
        price: item.price || item.price_per_guest || item.menu_price,
      })),
    }))

    console.log("Category breakdown:", categoryStats)

    return NextResponse.json({
      success: true,
      totalItems,
      availableColumns,
      categoryStats,
      sampleData: tableInfo[0],
      allCategories: Object.keys(itemsByCategory),
      debug: {
        tableAccessible: true,
        hasData: totalItems > 0,
        columnMapping: {
          name: availableColumns.filter((col) => col.includes("name")),
          price: availableColumns.filter((col) => col.includes("price") || col.includes("cost")),
          category: availableColumns.filter((col) => col.includes("category")),
        },
      },
    })
  } catch (error) {
    console.error("Debug API error:", error)
    return NextResponse.json({
      success: false,
      error: "Internal server error during debug",
      details: error,
    })
  }
}
