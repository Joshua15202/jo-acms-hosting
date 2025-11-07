import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)

    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 })
    }

    const { error } = await supabaseAdmin.from("tbl_blocked_dates").delete().eq("id", id)

    if (error) {
      console.error("Error deleting blocked date:", error)
      return NextResponse.json({ error: "Failed to delete blocked date" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in DELETE /api/admin/blocked-dates/[id]:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
