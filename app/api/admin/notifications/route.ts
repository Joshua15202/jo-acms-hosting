import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    const adminUsername = request.headers.get("x-admin-username")

    if (!adminUsername) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Fetch notifications for the admin, ordered by most recent first
    const { data: notifications, error } = await supabaseAdmin
      .from("tbl_admin_notifications")
      .select("*")
      .eq("admin_username", adminUsername)
      .order("created_at", { ascending: false })
      .limit(50)

    if (error) {
      console.error("Error fetching admin notifications:", error)
      return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 })
    }

    // Count unread notifications
    const unreadCount = notifications?.filter((n: any) => !n.is_read).length || 0

    return NextResponse.json({
      notifications: notifications || [],
      unreadCount,
    })
  } catch (error) {
    console.error("Error in admin notifications API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
