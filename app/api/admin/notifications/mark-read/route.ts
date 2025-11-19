import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    const adminUsername = request.headers.get("x-admin-username")
    const { notificationId } = await request.json()

    if (!adminUsername) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (notificationId) {
      // Mark specific notification as read
      const { error } = await supabaseAdmin
        .from("tbl_admin_notifications")
        .update({ is_read: true })
        .eq("id", notificationId)
        .eq("admin_username", adminUsername)

      if (error) {
        console.error("Error marking admin notification as read:", error)
        return NextResponse.json({ error: "Failed to mark notification as read" }, { status: 500 })
      }
    } else {
      // Mark all notifications as read
      const { error } = await supabaseAdmin
        .from("tbl_admin_notifications")
        .update({ is_read: true })
        .eq("admin_username", adminUsername)
        .eq("is_read", false)

      if (error) {
        console.error("Error marking all admin notifications as read:", error)
        return NextResponse.json({ error: "Failed to mark notifications as read" }, { status: 500 })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in admin mark-read API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
