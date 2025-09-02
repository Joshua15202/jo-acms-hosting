import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export async function GET() {
  try {
    const { data: inventory, error } = await supabaseAdmin
      .from("tbl_inventory")
      .select("*")
      .order("category", { ascending: true })
      .order("item_name", { ascending: true })

    if (error) {
      console.error("Error fetching inventory:", error)
      return NextResponse.json({ error: "Failed to fetch inventory" }, { status: 500 })
    }

    return NextResponse.json({ inventory })
  } catch (error) {
    console.error("Error in inventory API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { item_name, category, condition, notes } = body

    if (!item_name || !category) {
      return NextResponse.json({ error: "Item name and category are required" }, { status: 400 })
    }

    const { data: newItem, error } = await supabaseAdmin
      .from("tbl_inventory")
      .insert({
        item_name,
        category,
        condition: condition || "good",
        notes: notes || null,
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating inventory item:", error)
      return NextResponse.json({ error: "Failed to create inventory item" }, { status: 500 })
    }

    return NextResponse.json({ item: newItem })
  } catch (error) {
    console.error("Error in inventory POST API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
