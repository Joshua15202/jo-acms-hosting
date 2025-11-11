import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export async function GET() {
  try {
    const { data: menuItems, error } = await supabaseAdmin
      .from("tbl_menu_items")
      .select("*")
      .eq("is_active", true)
      .order("category")
      .order("item_name")

    if (error) {
      console.error("Error fetching menu items:", error)
      return NextResponse.json({ success: false, error: "Failed to fetch menu items" }, { status: 500 })
    }

    // Group menu items by category
    const groupedMenuItems = menuItems.reduce(
      (acc, item) => {
        const category = item.category
        if (!acc[category]) {
          acc[category] = []
        }
        acc[category].push(item)
        return acc
      },
      {} as Record<string, any[]>,
    )

    return NextResponse.json({
      success: true,
      menuItems: groupedMenuItems,
    })
  } catch (error) {
    console.error("Error in menu items API:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
