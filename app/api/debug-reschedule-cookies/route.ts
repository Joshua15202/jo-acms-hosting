import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { supabaseAdmin } from "@/lib/supabase"

export async function GET() {
  try {
    const cookieStore = await cookies()
    const allCookies = cookieStore.getAll()

    console.log("=== ALL COOKIES ===")
    allCookies.forEach((cookie) => {
      console.log(`${cookie.name}: ${cookie.value.substring(0, 20)}...`)
    })

    // Check if session exists in tbl_sessions
    const sessionId = cookieStore.get("session-id")?.value
    if (sessionId) {
      const { data: session, error } = await supabaseAdmin.from("tbl_sessions").select("*").eq("id", sessionId).single()

      console.log("Session lookup result:", { found: !!session, error })

      return NextResponse.json({
        success: true,
        cookies: allCookies.map((c) => ({
          name: c.name,
          value: c.value.substring(0, 20) + "...",
          hasValue: !!c.value,
        })),
        sessionId: sessionId.substring(0, 20) + "...",
        sessionFound: !!session,
        sessionError: error?.message,
      })
    }

    return NextResponse.json({
      success: true,
      cookies: allCookies.map((c) => ({
        name: c.name,
        value: c.value.substring(0, 20) + "...",
        hasValue: !!c.value,
      })),
      noSessionId: true,
    })
  } catch (error) {
    console.error("Error checking cookies:", error)
    return NextResponse.json({ success: false, error: "Failed to check cookies" }, { status: 500 })
  }
}
