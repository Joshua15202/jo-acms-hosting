import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"
import { cookies } from "next/headers"

export async function GET() {
  try {
    console.log("=== DEBUG APPOINTMENT CREATION ===")

    const cookieStore = await cookies()
    const sessionId = cookieStore.get("session-id")?.value

    if (!sessionId) {
      return NextResponse.json({ error: "No session ID found" }, { status: 401 })
    }

    // Get session with user
    const { data: session, error: sessionError } = await supabaseAdmin
      .from("tbl_sessions")
      .select(`
        *,
        tbl_users (id, email, first_name, last_name, full_name, role, is_verified, phone)
      `)
      .eq("id", sessionId)
      .gt("expires_at", new Date().toISOString())
      .single()

    if (sessionError || !session) {
      return NextResponse.json({ error: "Session not found or expired" }, { status: 401 })
    }

    const user = session.tbl_users
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 401 })
    }

    // Get all appointments for this user (including recent ones)
    const { data: appointments, error: appointmentsError } = await supabaseAdmin
      .from("tbl_comprehensive_appointments")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10)

    // Get all appointments created in the last hour
    const oneHourAgo = new Date()
    oneHourAgo.setHours(oneHourAgo.getHours() - 1)

    const { data: recentAppointments, error: recentError } = await supabaseAdmin
      .from("tbl_comprehensive_appointments")
      .select("*")
      .eq("user_id", user.id)
      .gte("created_at", oneHourAgo.toISOString())
      .order("created_at", { ascending: false })

    // Get total count of appointments for this user
    const { count: totalCount, error: countError } = await supabaseAdmin
      .from("tbl_comprehensive_appointments")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)

    return NextResponse.json({
      success: true,
      debug: {
        user: {
          id: user.id,
          email: user.email,
          name: user.full_name,
        },
        session: {
          id: sessionId,
          expires_at: session.expires_at,
        },
        appointments: {
          total: totalCount || 0,
          recent: appointments?.length || 0,
          lastHour: recentAppointments?.length || 0,
        },
        recentAppointments:
          appointments?.map((apt) => ({
            id: apt.id,
            event_type: apt.event_type,
            status: apt.status,
            created_at: apt.created_at,
            event_date: apt.event_date,
          })) || [],
        lastHourAppointments:
          recentAppointments?.map((apt) => ({
            id: apt.id,
            event_type: apt.event_type,
            status: apt.status,
            created_at: apt.created_at,
            event_date: apt.event_date,
          })) || [],
      },
      errors: {
        appointmentsError: appointmentsError?.message || null,
        recentError: recentError?.message || null,
        countError: countError?.message || null,
      },
    })
  } catch (error: any) {
    console.error("Debug appointment creation error:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
