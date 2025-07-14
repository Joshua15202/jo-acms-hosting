import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"
import { cookies } from "next/headers"

export async function GET() {
  try {
    console.log("=== Debug Sessions ===")

    const cookieStore = await cookies()
    const sessionId = cookieStore.get("session-id")?.value

    console.log("Current session ID:", sessionId)

    if (!sessionId) {
      return NextResponse.json({
        error: "No session ID found in cookies",
        sessionId: null,
        sessions: null,
      })
    }

    // Get all sessions from the database
    const { data: sessions, error } = await supabaseAdmin
      .from("tbl_sessions")
      .select(`
        id,
        user_id,
        expires_at,
        created_at,
        tbl_users (id, email, full_name)
      `)
      .order("created_at", { ascending: false })
      .limit(10)

    if (error) {
      console.error("Error fetching sessions:", error)
      return NextResponse.json({
        error: error.message,
        sessionId: sessionId,
        sessions: null,
      })
    }

    // Check if current session exists
    const currentSession = sessions?.find((s) => s.id === sessionId)

    return NextResponse.json({
      currentSessionId: sessionId,
      currentSessionExists: !!currentSession,
      currentSession: currentSession,
      totalSessions: sessions?.length || 0,
      allSessions: sessions || [],
    })
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : "Unknown error",
      sessionId: null,
      sessions: null,
    })
  }
}
