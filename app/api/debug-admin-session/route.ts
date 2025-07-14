import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"
import { cookies } from "next/headers"

export async function GET() {
  try {
    console.log("=== Debug Admin Session ===")

    const cookieStore = await cookies()
    const sessionId = cookieStore.get("session-id")?.value

    console.log("Session ID from cookie:", sessionId)

    if (!sessionId) {
      return NextResponse.json({
        success: false,
        message: "No session ID found in cookies",
        sessionId: null,
        userRole: null,
      })
    }

    // Check session in database
    const { data: sessionData, error: sessionError } = await supabaseAdmin
      .from("tbl_sessions")
      .select("*, tbl_users(id, email, role, full_name)")
      .eq("id", sessionId)
      .single()

    if (sessionError) {
      console.error("Session lookup error:", sessionError)
      return NextResponse.json({
        success: false,
        message: "Session lookup failed",
        error: sessionError.message,
        sessionId,
        userRole: null,
      })
    }

    console.log("Session data:", sessionData)

    return NextResponse.json({
      success: true,
      message: "Session found",
      sessionId,
      userRole: sessionData?.tbl_users?.role,
      userEmail: sessionData?.tbl_users?.email,
      userName: sessionData?.tbl_users?.full_name,
      sessionData: sessionData,
    })
  } catch (error) {
    console.error("Debug session error:", error)
    return NextResponse.json({
      success: false,
      message: "Unexpected error",
      error: error instanceof Error ? error.message : "Unknown error",
    })
  }
}
