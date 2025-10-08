import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"
import { cookies } from "next/headers"
import { differenceInHours } from "date-fns"

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: appointmentId } = await params
    const body = await request.json()
    const { new_date, new_time } = body

    console.log("=== RESCHEDULE REQUEST START ===")
    console.log("Appointment ID:", appointmentId)
    console.log("New date:", new_date)
    console.log("New time:", new_time)

    if (!new_date || !new_time) {
      console.log("Missing required fields")
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    // Get session-id cookie (this is what the login API sets)
    const cookieStore = await cookies()
    const sessionId = cookieStore.get("session-id")?.value

    console.log("Session ID found:", !!sessionId)
    if (sessionId) {
      console.log("Session ID (first 20 chars):", sessionId.substring(0, 20))
    } else {
      console.log("ERROR: No session-id cookie found")
      const allCookies = cookieStore.getAll()
      console.log(
        "Available cookies:",
        allCookies.map((c) => c.name),
      )
      return NextResponse.json(
        {
          success: false,
          error: "Not authenticated - no session cookie found",
        },
        { status: 401 },
      )
    }

    // Look up session in tbl_sessions (not tbl_user_sessions)
    console.log("Looking up session in tbl_sessions...")
    const { data: session, error: sessionError } = await supabaseAdmin
      .from("tbl_sessions")
      .select("user_id, expires_at")
      .eq("id", sessionId)
      .single()

    if (sessionError) {
      console.log("ERROR: Session lookup failed:", sessionError)
      return NextResponse.json(
        {
          success: false,
          error: "Invalid session - session not found in database",
          details: sessionError.message,
        },
        { status: 401 },
      )
    }

    if (!session) {
      console.log("ERROR: No session found for ID")
      return NextResponse.json({ success: false, error: "Invalid session - not found" }, { status: 401 })
    }

    console.log("Session found for user ID:", session.user_id)
    console.log("Session expires at:", session.expires_at)

    // Check if session is expired
    const expiresAt = new Date(session.expires_at)
    const now = new Date()
    if (expiresAt < now) {
      console.log("ERROR: Session expired")
      console.log("Expires at:", expiresAt)
      console.log("Current time:", now)
      return NextResponse.json({ success: false, error: "Session expired" }, { status: 401 })
    }

    // Get the appointment
    console.log("Looking up appointment...")
    const { data: appointment, error: fetchError } = await supabaseAdmin
      .from("tbl_comprehensive_appointments")
      .select("*")
      .eq("id", appointmentId)
      .eq("user_id", session.user_id)
      .single()

    if (fetchError) {
      console.log("ERROR: Appointment lookup failed:", fetchError)
      return NextResponse.json(
        {
          success: false,
          error: "Appointment not found",
          details: fetchError.message,
        },
        { status: 404 },
      )
    }

    if (!appointment) {
      console.log("ERROR: No appointment found")
      return NextResponse.json({ success: false, error: "Appointment not found" }, { status: 404 })
    }

    console.log("Appointment found:")
    console.log("  - ID:", appointment.id)
    console.log("  - Current date:", appointment.event_date)
    console.log("  - Current time:", appointment.event_time)
    console.log("  - Status:", appointment.status)

    // Check if appointment can be rescheduled
    if (appointment.status === "cancelled" || appointment.status === "completed") {
      console.log("ERROR: Cannot reschedule - status is", appointment.status)
      return NextResponse.json(
        { success: false, error: "Cannot reschedule cancelled or completed appointments" },
        { status: 400 },
      )
    }

    // NEW RESTRICTION: Check if the new date is within the same year as the original booking
    const originalDate = new Date(appointment.event_date)
    const newDate = new Date(new_date)

    if (originalDate.getFullYear() !== newDate.getFullYear()) {
      console.log("ERROR: Cannot reschedule to a different year")
      console.log("  - Original year:", originalDate.getFullYear())
      console.log("  - New year:", newDate.getFullYear())
      return NextResponse.json(
        {
          success: false,
          error: `You can only reschedule within the year ${originalDate.getFullYear()}. Please select a date in the same year as your original booking.`,
        },
        { status: 400 },
      )
    }

    // Calculate hours until original event
    const currentDate = new Date()
    const originalEventDate = new Date(appointment.event_date)
    const hoursUntilEvent = differenceInHours(originalEventDate, currentDate)

    console.log("Hours until original event:", hoursUntilEvent)

    // Apply 10% penalty if rescheduling within 24 hours
    let penaltyApplied = false
    let penaltyAmount = 0
    let updatedTotalAmount = appointment.total_package_amount || 0

    if (hoursUntilEvent < 24 && hoursUntilEvent > 0) {
      penaltyApplied = true
      penaltyAmount = Math.round((appointment.total_package_amount || 0) * 0.1)
      updatedTotalAmount = (appointment.total_package_amount || 0) + penaltyAmount
      console.log("Penalty applies:")
      console.log("  - Penalty amount:", penaltyAmount)
      console.log("  - New total:", updatedTotalAmount)
    } else {
      console.log("No penalty applies")
    }

    // Check if new time slot is available
    console.log("Checking if new time slot is available...")
    const { data: existingBooking } = await supabaseAdmin
      .from("tbl_comprehensive_appointments")
      .select("id")
      .eq("event_date", new_date)
      .eq("event_time", new_time)
      .in("status", ["pending", "confirmed", "PENDING_TASTING_CONFIRMATION", "TASTING_CONFIRMED"])
      .neq("id", appointmentId)
      .single()

    if (existingBooking) {
      console.log("ERROR: Time slot already booked by appointment:", existingBooking.id)
      return NextResponse.json(
        { success: false, error: "This time slot is not available. Please select a different time." },
        { status: 400 },
      )
    }

    console.log("Time slot is available")

    // Update the appointment
    const updateData: any = {
      event_date: new_date,
      event_time: new_time,
      time_slot: new_time,
      updated_at: new Date().toISOString(),
    }

    // Add penalty if applicable
    if (penaltyApplied) {
      updateData.total_package_amount = updatedTotalAmount
      updateData.down_payment_amount = Math.round(updatedTotalAmount * 0.5)
      updateData.admin_notes =
        `${appointment.admin_notes || ""}\n\n[${new Date().toISOString()}] Reschedule penalty applied: ₱${penaltyAmount.toLocaleString()} (10% of package amount). Original date: ${appointment.event_date} ${appointment.event_time}. New date: ${new_date} ${new_time}.`.trim()
    }

    console.log("Updating appointment with data:", updateData)

    const { error: updateError } = await supabaseAdmin
      .from("tbl_comprehensive_appointments")
      .update(updateData)
      .eq("id", appointmentId)

    if (updateError) {
      console.error("ERROR: Failed to update appointment:", updateError)
      return NextResponse.json(
        {
          success: false,
          error: "Failed to reschedule appointment",
          details: updateError.message,
        },
        { status: 500 },
      )
    }

    console.log("Appointment updated successfully")

    // Update tasting appointment if exists
    console.log("Checking for related tasting...")
    const { data: tasting } = await supabaseAdmin
      .from("tbl_food_tastings")
      .select("id")
      .eq("appointment_id", appointmentId)
      .single()

    if (tasting) {
      console.log("Updating tasting status to rescheduled")
      const { error: tastingError } = await supabaseAdmin
        .from("tbl_food_tastings")
        .update({
          status: "rescheduled",
          updated_at: new Date().toISOString(),
        })
        .eq("id", tasting.id)

      if (tastingError) {
        console.log("Warning: Failed to update tasting:", tastingError)
      } else {
        console.log("Tasting updated successfully")
      }
    } else {
      console.log("No related tasting found")
    }

    console.log("=== RESCHEDULE REQUEST SUCCESS ===")

    return NextResponse.json({
      success: true,
      message: "Appointment rescheduled successfully",
      penalty_applied: penaltyApplied,
      penalty_amount: penaltyAmount,
      new_total: updatedTotalAmount,
    })
  } catch (error) {
    console.error("=== RESCHEDULE REQUEST ERROR ===")
    console.error("Error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
