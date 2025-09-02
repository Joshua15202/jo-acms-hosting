import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const { item_name, category, condition, notes } = body
    const { id } = params

    if (!item_name || !category) {
      return NextResponse.json({ error: "Item name and category are required" }, { status: 400 })
    }

    const { data: updatedItem, error } = await supabaseAdmin
      .from("tbl_inventory")
      .update({
        item_name,
        category,
        condition: condition || "good",
        notes: notes || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("Error updating inventory item:", error)
      return NextResponse.json({ error: "Failed to update inventory item" }, { status: 500 })
    }

    return NextResponse.json({ item: updatedItem })
  } catch (error) {
    console.error("Error in inventory PUT API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    const { error } = await supabaseAdmin.from("tbl_inventory").delete().eq("id", id)

    if (error) {
      console.error("Error deleting inventory item:", error)
      return NextResponse.json({ error: "Failed to delete inventory item" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in inventory DELETE API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
