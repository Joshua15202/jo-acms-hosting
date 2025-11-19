import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export async function DELETE(request: NextRequest) {
  try {
    const adminUsername = request.headers.get("x-admin-username")

    if (!adminUsername) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { notificationId } = body

    if (notificationId) {
      // Delete a specific notification
      const { error } = await supabaseAdmin
        .from("tbl_admin_notifications")
        .delete()
        .eq("id", notificationId)
        .eq("admin_username", adminUsername)

      if (error) {
        console.error("Error deleting admin notification:", error)
        return NextResponse.json({ error: "Failed to delete notification" }, { status: 500 })
      }

      return NextResponse.json({ success: true, message: "Notification deleted" })
    } else {
      // Delete all notifications for the admin
      const { error } = await supabaseAdmin.from("tbl_admin_notifications").delete().eq("admin_username", adminUsername)

      if (error) {
        console.error("Error deleting all admin notifications:", error)
        return NextResponse.json({ error: "Failed to delete notifications" }, { status: 500 })
      }

      return NextResponse.json({ success: true, message: "All notifications deleted" })
    }
  } catch (error) {
    console.error("Error in delete admin notifications API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
