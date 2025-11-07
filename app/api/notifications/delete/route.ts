import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export async function DELETE(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id")

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { notificationId } = body

    if (notificationId) {
      // Delete a specific notification
      const { error } = await supabaseAdmin
        .from("tbl_notifications")
        .delete()
        .eq("id", notificationId)
        .eq("user_id", userId) // Ensure user can only delete their own notifications

      if (error) {
        console.error("Error deleting notification:", error)
        return NextResponse.json({ error: "Failed to delete notification" }, { status: 500 })
      }

      return NextResponse.json({ success: true, message: "Notification deleted" })
    } else {
      // Delete all notifications for the user
      const { error } = await supabaseAdmin.from("tbl_notifications").delete().eq("user_id", userId)

      if (error) {
        console.error("Error deleting all notifications:", error)
        return NextResponse.json({ error: "Failed to delete notifications" }, { status: 500 })
      }

      return NextResponse.json({ success: true, message: "All notifications deleted" })
    }
  } catch (error) {
    console.error("Error in delete notifications API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
