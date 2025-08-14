import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"
import { cookies } from "next/headers"
import { verifyToken } from "@/lib/auth-utils"

export async function GET() {
  try {
    console.log("=== SCHEDULING APPOINTMENTS API CALLED ===")

    const cookieStore = await cookies()
    const sessionToken =
      cookieStore.get("session-id")?.value ||
      cookieStore.get("user-session")?.value ||
      cookieStore.get("auth-token")?.value

    if (!sessionToken) {
      console.log("No session token found")
      return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 })
    }

    let userId: string
    try {
      const tokenData = await verifyToken(sessionToken)
      userId = tokenData.userId
      console.log("User ID from token:", userId)
    } catch (error) {
      console.error("Token verification failed:", error)
      return NextResponse.json({ success: false, error: "Invalid session" }, { status: 401 })
    }

    // Get all appointments for this user
    const { data: appointments, error: appointmentsError } = await supabaseAdmin
      .from("tbl_comprehensive_appointments")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (appointmentsError) {
      console.error("Error fetching appointments:", appointmentsError)
      return NextResponse.json({
        success: false,
        error: "Failed to fetch appointments",
        details: appointmentsError.message,
      })
    }

    console.log(`Found ${appointments?.length || 0} appointments for user ${userId}`)

    // Log each appointment for debugging
    if (appointments && appointments.length > 0) {
      appointments.forEach((apt, index) => {
        console.log(`Appointment ${index + 1}:`, {
          id: apt.id.substring(0, 8),
          event_type: apt.event_type,
          status: apt.status,
          payment_status: apt.payment_status,
          pending_payment_type: apt.pending_payment_type,
          total_package_amount: apt.total_package_amount,
          created_at: apt.created_at,
        })
      })
    }

    return NextResponse.json({
      success: true,
      appointments: appointments || [],
      totalAppointments: appointments?.length || 0,
      debug: {
        userId,
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
