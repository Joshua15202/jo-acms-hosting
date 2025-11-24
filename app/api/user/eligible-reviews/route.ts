import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ success: false, error: "User ID required" }, { status: 400 })
    }

    // Get completed appointments
    const { data: appointments, error } = await supabaseAdmin
      .from("tbl_comprehensive_appointments")
      .select("id, event_type, event_date")
      .eq("user_id", userId)
      .eq("status", "completed")

    if (error) {
      return NextResponse.json({ success: false, error: "Failed to fetch appointments" }, { status: 500 })
    }

    // Get existing reviews
    const { data: reviews, error: reviewError } = await supabaseAdmin
      .from("tbl_testimonials")
      .select("appointment_id")
      .eq("user_id", userId)

    if (reviewError && reviewError.code === "42P01") {
      console.log("[v0] Testimonials table does not exist yet, returning all completed appointments")
      return NextResponse.json({ success: true, data: appointments || [] })
    }

    const reviewedAppointmentIds = new Set(reviews?.map((r) => r.appointment_id) || [])

    // Filter for eligible appointments (completed but not reviewed)
    const eligibleAppointments = appointments.filter((appt) => !reviewedAppointmentIds.has(appt.id))

    return NextResponse.json({ success: true, data: eligibleAppointments })
  } catch (error) {
    console.error("Error fetching eligible reviews:", error)
    return NextResponse.json({ success: true, data: [] })
  }
}
