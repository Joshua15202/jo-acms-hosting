import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"
import { cookies } from "next/headers"

export async function GET() {
  try {
    console.log("=== AUTH ME API CALLED ===")

    const cookieStore = await cookies()
    const sessionId = cookieStore.get("session-id")?.value

    if (!sessionId) {
      console.log("No session ID found in cookies")
      return NextResponse.json({ success: false, message: "No session found" }, { status: 401 })
    }

    console.log("Session ID found:", sessionId)

    // Get session from database
    const { data: session, error: sessionError } = await supabaseAdmin
      .from("tbl_sessions")
      .select("*")
      .eq("id", sessionId)
      .single()

    if (sessionError || !session) {
      console.log("Session not found in database:", sessionError)
      return NextResponse.json({ success: false, message: "Invalid session" }, { status: 401 })
    }

    // Check if session is expired
    const now = new Date()
    const expiresAt = new Date(session.expires_at)

    if (now > expiresAt) {
      console.log("Session expired")
      // Delete expired session
      await supabaseAdmin.from("tbl_sessions").delete().eq("id", sessionId)

      return NextResponse.json({ success: false, message: "Session expired" }, { status: 401 })
    }

    console.log("Session is valid, getting user data")

    // Get user data
    const { data: user, error: userError } = await supabaseAdmin
      .from("tbl_users")
      .select("id, first_name, last_name, full_name, email, role, phone")
      .eq("id", session.user_id)
      .single()

    if (userError || !user) {
      console.log("User not found:", userError)
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 })
    }

    console.log("User data retrieved:", user.email)

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.full_name,
        email: user.email,
        role: user.role,
        phone: user.phone,
      },
    })
  } catch (error) {
    console.error("Auth me API error:", error)
    return NextResponse.json({ success: false, message: "An unexpected error occurred" }, { status: 500 })
  }
}
