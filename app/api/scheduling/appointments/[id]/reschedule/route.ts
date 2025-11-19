import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"
import { cookies } from "next/headers"
import { differenceInHours } from "date-fns"
import { createAdminNotification } from "@/lib/admin-notifications"

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

    const cookieStore = await cookies()
    const sessionId = cookieStore.get("session-id")?.value

    if (!sessionId) {
      console.log("ERROR: No session-id cookie found")
      return NextResponse.json(
        {
          success: false,
          error: "Not authenticated - no session cookie found",
        },
        { status: 401 },
      )
    }

    console.log("Looking up session in tbl_sessions...")
    const { data: session, error: sessionError } = await supabaseAdmin
      .from("tbl_sessions")
      .select("user_id, expires_at")
      .eq("id", sessionId)
      .single()

    if (sessionError || !session) {
      console.log("ERROR: Session lookup failed:", sessionError)
      return NextResponse.json(
        {
          success: false,
          error: "Invalid session",
          details: sessionError?.message,
        },
        { status: 401 },
      )
    }

    const expiresAt = new Date(session.expires_at)
    const now = new Date()
    if (expiresAt < now) {
      console.log("ERROR: Session expired")
      return NextResponse.json({ success: false, error: "Session expired" }, { status: 401 })
    }

    console.log("Looking up appointment...")
    const { data: appointment, error: fetchError } = await supabaseAdmin
      .from("tbl_comprehensive_appointments")
      .select("*")
      .eq("id", appointmentId)
      .eq("user_id", session.user_id)
      .single()

    if (fetchError || !appointment) {
      console.log("ERROR: Appointment lookup failed:", fetchError)
      return NextResponse.json(
        {
          success: false,
          error: "Appointment not found",
          details: fetchError?.message,
        },
        { status: 404 },
      )
    }

    console.log("Current appointment:")
    console.log("  - Date:", appointment.event_date)
    console.log("  - Time:", appointment.event_time)
    console.log("  - Status:", appointment.status)

    if (appointment.status === "cancelled" || appointment.status === "completed") {
      console.log("ERROR: Cannot reschedule - status is", appointment.status)
      return NextResponse.json(
        { success: false, error: "Cannot reschedule cancelled or completed appointments" },
        { status: 400 },
      )
    }

    const originalDate = new Date(appointment.event_date)
    const newDate = new Date(new_date)

    if (originalDate.getFullYear() !== newDate.getFullYear()) {
      console.log("ERROR: Cannot reschedule to a different year")
      return NextResponse.json(
        {
          success: false,
          error: `You can only reschedule within the year ${originalDate.getFullYear()}.`,
        },
        { status: 400 },
      )
    }

    const currentDate = new Date()
    const originalEventDate = new Date(appointment.event_date)
    const hoursUntilEvent = differenceInHours(originalEventDate, currentDate)

    let penaltyApplied = false
    let penaltyAmount = 0
    let updatedTotalAmount = appointment.total_package_amount || 0

    if (hoursUntilEvent < 24 && hoursUntilEvent > 0) {
      penaltyApplied = true
      penaltyAmount = Math.round((appointment.total_package_amount || 0) * 0.1)
      updatedTotalAmount = (appointment.total_package_amount || 0) + penaltyAmount
      console.log("10% penalty applies. Amount:", penaltyAmount)
    }

    // Check if new time slot is available (CRITICAL: exclude current appointment)
    console.log("Checking if new time slot is available...")
    const { data: conflictingAppointments, error: conflictError } = await supabaseAdmin
      .from("tbl_comprehensive_appointments")
      .select("id")
      .eq("event_date", new_date)
      .eq("event_time", new_time)
      .in("status", ["pending", "confirmed", "rescheduled", "PENDING_TASTING_CONFIRMATION", "TASTING_CONFIRMED", "TASTING_COMPLETED"])
      .neq("id", appointmentId) // CRITICAL: Exclude current appointment

    if (conflictError) {
      console.log("ERROR: Failed to check availability:", conflictError)
      return NextResponse.json(
        {
          success: false,
          error: "Failed to check time slot availability",
          details: conflictError.message,
        },
        { status: 500 },
      )
    }

    if (conflictingAppointments && conflictingAppointments.length > 0) {
      console.log("ERROR: Time slot already booked")
      console.log("Conflicting appointments:", conflictingAppointments)
      return NextResponse.json(
        { success: false, error: "This time slot is not available. Please select a different time." },
        { status: 400 },
      )
    }

    console.log("✓ Time slot is available")

    const updateData: any = {
      event_date: new_date,
      event_time: new_time,
      time_slot: new_time,
      status: "rescheduled",
      updated_at: new Date().toISOString(),
    }

    if (penaltyApplied) {
      updateData.total_package_amount = updatedTotalAmount
      updateData.down_payment_amount = Math.round(updatedTotalAmount * 0.5)
      updateData.admin_notes =
        `${appointment.admin_notes || ""}\n\n[${new Date().toISOString()}] Reschedule penalty: ₱${penaltyAmount.toLocaleString()} (10%). Original: ${appointment.event_date} ${appointment.event_time}. New: ${new_date} ${new_time}.`.trim()
    }

    console.log("Updating appointment...")
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

    console.log("✓ Appointment updated successfully")

    try {
      const { data: user } = await supabaseAdmin
        .from("tbl_users")
        .select("full_name, email, phone")
        .eq("id", session.user_id)
        .single()

      const notificationMessage = penaltyApplied
        ? `Your appointment has been rescheduled to ${new_date} at ${new_time}. A 10% penalty of ₱${penaltyAmount.toLocaleString()} has been applied.`
        : `Your appointment has been successfully rescheduled to ${new_date} at ${new_time}.`

      await supabaseAdmin.from("tbl_notifications").insert({
        user_id: session.user_id,
        appointment_id: appointmentId,
        title: "Appointment Rescheduled",
        type: "reschedule",
        message: notificationMessage,
        is_read: false,
        created_at: new Date().toISOString(),
      })

      const eventDetails = `Event: ${appointment.event_type} for ${appointment.guest_count} guests`
      const customerInfo = `Customer: ${user?.full_name || "Unknown"} (${user?.email || "No email"}, ${user?.phone || "No phone"})`
      const dateChange = `Original: ${appointment.event_date} at ${appointment.event_time} → New: ${new_date} at ${new_time}`
      const penaltyText = penaltyApplied 
        ? `\nPenalty Applied: ₱${penaltyAmount.toLocaleString()} (10%) | New Total: ₱${updatedTotalAmount.toLocaleString()}` 
        : ""
      
      await createAdminNotification({
        type: "appointment_reschedule",
        title: "Appointment Rescheduled by User",
        message: `${eventDetails}\n${customerInfo}\n${dateChange}${penaltyText}`,
        metadata: {
          appointmentId,
          userId: session.user_id,
          customerName: user?.full_name,
          customerEmail: user?.email,
          customerPhone: user?.phone,
          eventType: appointment.event_type,
          oldDate: appointment.event_date,
          oldTime: appointment.event_time,
          newDate: new_date,
          newTime: new_time,
          guestCount: appointment.guest_count,
          penaltyApplied,
          penaltyAmount,
          newTotal: updatedTotalAmount,
        },
      })

      console.log("✓ Notifications created for user and admin")
    } catch (notifError) {
      console.error("Error creating notifications:", notifError)
      // Don't fail the reschedule if notification fails
    }

    // Update related tasting if exists
    const { data: tasting } = await supabaseAdmin
      .from("tbl_food_tastings")
      .select("id")
      .eq("appointment_id", appointmentId)
      .single()

    if (tasting) {
      console.log("Updating related tasting status...")
      await supabaseAdmin
        .from("tbl_food_tastings")
        .update({
          status: "rescheduled",
          updated_at: new Date().toISOString(),
        })
        .eq("id", tasting.id)
      console.log("✓ Tasting updated")
    }

    console.log("=== RESCHEDULE SUCCESS ===")

    return NextResponse.json({
      success: true,
      message: "Appointment rescheduled successfully",
      penalty_applied: penaltyApplied,
      penalty_amount: penaltyAmount,
      new_total: updatedTotalAmount,
      old_date: appointment.event_date,
      old_time: appointment.event_time,
      new_date,
      new_time,
    })
  } catch (error) {
    console.error("=== RESCHEDULE ERROR ===")
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
