import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token, preferredDate, preferredTime, alternativeDate, alternativeTime, notes } = body

    if (!token || !preferredDate || !preferredTime) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    // Find the tasting appointment by tasting token in the new table
    const { data: tastingAppointment, error: fetchError } = await supabaseAdmin
      .from("tbl_food_tastings")
      .select(`
        *,
        appointment:tbl_comprehensive_appointments (id, status)
      `)
      .eq("tasting_token", token)
      .single()

    if (fetchError || !tastingAppointment) {
      console.error("Error finding tasting appointment:", fetchError)
      return NextResponse.json({ success: false, error: "Invalid or expired token" }, { status: 404 })
    }

    // Update the tasting appointment with reschedule preferences in tbl_food_tastings
    const rescheduleData = {
      status: "reschedule_requested",
      reschedule_preferences: {
        preferredDate,
        preferredTime,
        alternativeDate: alternativeDate || null,
        alternativeTime: alternativeTime || null,
        notes: notes || null,
        requestedAt: new Date().toISOString(),
      },
    }

    const { error: updateTastingError } = await supabaseAdmin
      .from("tbl_food_tastings")
      .update(rescheduleData)
      .eq("id", tastingAppointment.id)

    if (updateTastingError) {
      console.error("Error updating tasting appointment:", updateTastingError)
      return NextResponse.json({ success: false, error: "Failed to save reschedule request" }, { status: 500 })
    }

    // Update the main appointment status in tbl_comprehensive_appointments
    const { error: updateMainAppointmentError } = await supabaseAdmin
      .from("tbl_comprehensive_appointments")
      .update({
        status: "TASTING_RESCHEDULE_REQUESTED",
      })
      .eq("id", tastingAppointment.appointment_id)

    if (updateMainAppointmentError) {
      console.error("Error updating main appointment status for reschedule:", updateMainAppointmentError)
    }

    return NextResponse.json({ success: true, message: "Reschedule request submitted successfully" })
  } catch (error) {
    console.error("Error in tasting reschedule:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
