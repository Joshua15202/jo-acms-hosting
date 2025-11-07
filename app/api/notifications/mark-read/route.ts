import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id")
    const { notificationId } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (notificationId) {
      // Mark specific notification as read
      const { error } = await supabaseAdmin
        .from("tbl_notifications")
        .update({ is_read: true })
        .eq("id", notificationId)
        .eq("user_id", userId)

      if (error) {
        console.error("Error marking notification as read:", error)
        return NextResponse.json({ error: "Failed to mark notification as read" }, { status: 500 })
      }
    } else {
      // Mark all notifications as read
      const { error } = await supabaseAdmin
        .from("tbl_notifications")
        .update({ is_read: true })
        .eq("user_id", userId)
        .eq("is_read", false)

      if (error) {
        console.error("Error marking all notifications as read:", error)
        return NextResponse.json({ error: "Failed to mark notifications as read" }, { status: 500 })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in mark-read API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
