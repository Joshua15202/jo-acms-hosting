import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"
import { cookies } from "next/headers"

export async function GET() {
  try {
    console.log("=== DEBUG AUTH FLOW ===")

    // Get all cookies
    const cookieStore = await cookies()
    const allCookies = cookieStore.getAll()
    console.log("All cookies:", allCookies)

    // Check for session cookie
    const sessionCookie = cookieStore.get("session-id")
    console.log("Session cookie:", sessionCookie)

    let currentUser = null
    let sessionInfo = null

    if (sessionCookie?.value) {
      // Check if session exists in database
      const { data: session, error: sessionError } = await supabaseAdmin
        .from("tbl_sessions")
        .select("*")
        .eq("id", sessionCookie.value)
        .single()

      console.log("Session lookup:", { session, sessionError })
      sessionInfo = session

      if (session && !sessionError) {
        // Get user info
        const { data: user, error: userError } = await supabaseAdmin
          .from("tbl_users")
          .select("*")
          .eq("id", session.user_id)
          .single()

        console.log("User lookup:", { user, userError })
        currentUser = user
      }
    }

    // Get database stats
    const { data: allUsers, error: usersError } = await supabaseAdmin
      .from("tbl_users")
      .select("id, email, first_name, last_name, created_at")

    const { data: allSessions, error: sessionsError } = await supabaseAdmin.from("tbl_sessions").select("*")

    const { data: allAppointments, error: appointmentsError } = await supabaseAdmin
      .from("tbl_comprehensive_appointments")
      .select("id, user_id, status, payment_status, event_type, created_at")

    return NextResponse.json({
      success: true,
      debug: {
        cookies: {
          all: allCookies,
          sessionCookie: sessionCookie,
        },
        authentication: {
          hasSessionCookie: !!sessionCookie?.value,
          sessionExists: !!sessionInfo,
          userExists: !!currentUser,
          currentUser: currentUser
            ? {
                id: currentUser.id,
                email: currentUser.email,
                name: `${currentUser.first_name} ${currentUser.last_name}`,
                role: currentUser.role,
              }
            : null,
          sessionInfo: sessionInfo,
        },
        database: {
          totalUsers: allUsers?.length || 0,
          totalSessions: allSessions?.length || 0,
          totalAppointments: allAppointments?.length || 0,
          users: allUsers || [],
          sessions: allSessions || [],
          appointments: allAppointments || [],
        },
        errors: {
          usersError,
          sessionsError,
          appointmentsError,
        },
      },
    })
  } catch (error: any) {
    console.error("Debug auth flow error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        stack: error.stack,
      },
      { status: 500 },
    )
  }
}
