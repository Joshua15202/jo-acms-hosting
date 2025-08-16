import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"
import { cookies } from "next/headers"

export async function GET() {
  try {
    console.log("=== SCHEDULING APPOINTMENTS API CALLED ===")

    const cookieStore = await cookies()
    const sessionId = cookieStore.get("session-id")?.value

    console.log("Session ID from cookies:", sessionId ? "Present" : "Missing")

    if (!sessionId) {
      console.log("No session ID found")
      return NextResponse.json({ success: false, error: "Not authenticated: No session ID found." }, { status: 401 })
    }

    // Get session with user using the same pattern as other API routes
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
      console.error("Session lookup error:", sessionError?.message)
      return NextResponse.json({ success: false, error: "Session expired. Please log in again." }, { status: 401 })
    }

    const user = session.tbl_users
    if (!user) {
      console.error("User not found for session")
      return NextResponse.json({ success: false, error: "User not found. Please log in again." }, { status: 401 })
    }

    console.log("User found:", user.email, "User ID:", user.id)

    // Get all appointments for this user
    const { data: appointments, error: appointmentsError } = await supabaseAdmin
      .from("tbl_comprehensive_appointments")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (appointmentsError) {
      console.error("Error fetching appointments:", appointmentsError)
      return NextResponse.json({
        success: false,
        error: "Failed to fetch appointments",
        details: appointmentsError.message,
      })
    }

    console.log(`Found ${appointments?.length || 0} appointments for user ${user.id}`)

    // Log each appointment for debugging
    if (appointments && appointments.length > 0) {
      appointments.forEach((apt, index) => {
        console.log(`Appointment ${index + 1}:`, {
          id: apt.id.substring(0, 8),
          event_type: apt.event_type,
          status: apt.status,
          payment_status: apt.payment_status,
          event_date: apt.event_date,
          created_at: apt.created_at,
        })
      })
    } else {
      console.log("No appointments found for user")
    }

    return NextResponse.json({
      success: true,
      appointments: appointments || [],
      totalAppointments: appointments?.length || 0,
      debug: {
        userId: user.id,
        userEmail: user.email,
        appointmentsCount: appointments?.length || 0,
        appointmentStatuses: appointments?.map((apt) => apt.status) || [],
        paymentStatuses: appointments?.map((apt) => apt.payment_status) || [],
      },
    })
  } catch (error: any) {
    console.error("Unexpected error in scheduling appointments route:", error)
    return NextResponse.json(
      { success: false, message: "An unexpected error occurred", error: error.message },
      { status: 500 },
    )
  }
}
