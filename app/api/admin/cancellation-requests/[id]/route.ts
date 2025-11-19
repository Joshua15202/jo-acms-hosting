import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"
import { createAdminNotification } from "@/lib/admin-notifications"

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const body = await request.json()
    const { action, adminFeedback } = body // action: "approve" or "reject"

    // Get the cancellation request
    const { data: cancellationRequest, error: fetchError } = await supabaseAdmin
      .from("tbl_cancellation_requests")
      .select("*")
      .eq("id", id)
      .single()

    if (fetchError || !cancellationRequest) {
      return NextResponse.json({ success: false, error: "Cancellation request not found" }, { status: 404 })
    }

    if (cancellationRequest.status !== "pending") {
      return NextResponse.json({ success: false, error: "Request has already been processed" }, { status: 400 })
    }

    const newStatus = action === "approve" ? "approved" : "rejected"

    // Update cancellation request status
    const { error: updateError } = await supabaseAdmin
      .from("tbl_cancellation_requests")
      .update({
        status: newStatus,
        admin_feedback: adminFeedback || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)

    if (updateError) {
      console.error("Error updating cancellation request:", updateError)
      return NextResponse.json({ success: false, error: "Failed to update request" }, { status: 500 })
    }

    // If approved, cancel the appointment
    if (action === "approve") {
      const { error: cancelError } = await supabaseAdmin
        .from("tbl_comprehensive_appointments")
        .update({
          status: "cancelled",
          admin_notes: `Cancelled via approved cancellation request. Admin feedback: ${adminFeedback || "None"}`,
          updated_at: new Date().toISOString(),
        })
        .eq("id", cancellationRequest.appointment_id)

      if (cancelError) {
        console.error("Error cancelling appointment:", cancelError)
        return NextResponse.json({ success: false, error: "Failed to cancel appointment" }, { status: 500 })
      }

      // Update related tasting if exists
      await supabaseAdmin
        .from("tbl_food_tastings")
        .update({
          status: "cancelled",
          updated_at: new Date().toISOString(),
        })
        .eq("appointment_id", cancellationRequest.appointment_id)
    }

    const { data: user } = await supabaseAdmin
      .from("tbl_users")
      .select("username, email, phone")
      .eq("id", cancellationRequest.user_id)
      .single()

    const { data: appointment } = await supabaseAdmin
      .from("tbl_comprehensive_appointments")
      .select("event_type, event_date, event_time, guests, venue")
      .eq("id", cancellationRequest.appointment_id)
      .single()

    const customerName = user?.username || "Unknown"
    const customerEmail = user?.email || ""
    const customerPhone = user?.phone || ""

    // Format event date and time
    const eventDate = appointment?.event_date
      ? new Date(appointment.event_date).toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : "Not specified"
    const eventTime = appointment?.event_time || "Not specified"

    const notificationMessage =
      action === "approve"
        ? `Your cancellation request for the ${appointment?.event_type || "event"} appointment on ${eventDate} at ${eventTime} has been approved.\n\nYour appointment has been cancelled.${adminFeedback ? `\n\nAdmin feedback: ${adminFeedback}` : ""}`
        : `Your cancellation request for the ${appointment?.event_type || "event"} appointment on ${eventDate} at ${eventTime} has been rejected.\n\nYour appointment is still scheduled.${adminFeedback ? `\n\nReason: ${adminFeedback}` : ""}`

    await supabaseAdmin.from("tbl_notifications").insert({
      user_id: cancellationRequest.user_id,
      appointment_id: cancellationRequest.appointment_id,
      title: action === "approve" ? "Cancellation Request Approved" : "Cancellation Request Rejected",
      message: notificationMessage,
      type: "cancellation_response",
      is_read: false,
    })

    await createAdminNotification({
      appointmentId: cancellationRequest.appointment_id,
      title: action === "approve" ? "Cancellation Request Approved" : "Cancellation Request Rejected",
      message: `A cancellation request from ${customerName} has been ${action === "approve" ? "approved" : "rejected"}.

Event Details:
• Event Type: ${appointment?.event_type || "Not specified"}
• Guest Count: ${appointment?.guests || "Not specified"} guests
• Event Date: ${eventDate}
• Event Time: ${eventTime}
• Venue: ${appointment?.venue || "Not specified"}

Customer Information:
• Name: ${customerName}
• Email: ${customerEmail}
• Phone: ${customerPhone}

${adminFeedback ? `Admin Feedback: ${adminFeedback}` : ""}

Status: ${action === "approve" ? "Appointment has been cancelled" : "Appointment remains scheduled"}`,
      type: action === "approve" ? "cancellation_approved" : "cancellation_rejected",
      metadata: {
        event_type: appointment?.event_type,
        event_date: appointment?.event_date,
        event_time: eventTime,
        guests: appointment?.guests,
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone,
        action: action,
        admin_feedback: adminFeedback || null,
      },
    })

    return NextResponse.json({
      success: true,
      message: `Cancellation request ${action === "approve" ? "approved" : "rejected"} successfully`,
    })
  } catch (error) {
    console.error("Error processing cancellation request:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
