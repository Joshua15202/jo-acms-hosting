import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { supabaseAdmin } from "@/lib/supabase"

export async function GET() {
  try {
    console.log("=== API GET /api/scheduling/appointments: START ===")

    const cookieStore = await cookies()
    const sessionId = cookieStore.get("session-id")?.value

    if (!sessionId) {
      console.log("No session ID found")
      return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 })
    }

    // Get session with user
    const { data: session, error: sessionError } = await supabaseAdmin
      .from("tbl_sessions")
      .select(`*, tbl_users (id, email, first_name, last_name, full_name, role)`)
      .eq("id", sessionId)
      .gt("expires_at", new Date().toISOString())
      .single()

    if (sessionError || !session || !session.tbl_users) {
      console.log("Session error or no user:", sessionError?.message)
      return NextResponse.json({ success: false, error: "Session expired or user not found" }, { status: 401 })
    }

    const user = session.tbl_users
    console.log("User found:", user.email, "ID:", user.id)

    // Fetch ALL appointments for this user - don't filter here, let the client decide
    const { data: appointments, error: appointmentsError } = await supabaseAdmin
      .from("tbl_comprehensive_appointments")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (appointmentsError) {
      console.error("Error fetching appointments:", appointmentsError)
      return NextResponse.json(
        { success: false, error: "Failed to fetch appointments", details: appointmentsError.message },
        { status: 500 },
      )
    }

    console.log(`Found ${appointments?.length || 0} total appointments for user ${user.id}`)

    // Log each appointment's key details
    appointments?.forEach((apt, index) => {
      console.log(`Appointment ${index + 1}:`, {
        id: apt.id.slice(0, 8),
        status: apt.status,
        payment_status: apt.payment_status,
        pending_payment_type: apt.pending_payment_type,
        event_type: apt.event_type,
        event_date: apt.event_date,
      })
    })

    console.log("=== API GET /api/scheduling/appointments: SUCCESS ===")
    return NextResponse.json({
      success: true,
      appointments: appointments || [],
      user: {
        id: user.id,
        email: user.email,
        name: user.full_name,
      },
    })
  } catch (error: any) {
    console.error("=== API GET /api/scheduling/appointments: ERROR ===")
    console.error("Error fetching appointments:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error", details: error.message },
      { status: 500 },
    )
  }
}
