import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"
import { createAdminNotification } from "@/lib/admin-notifications"

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const body = await request.json()
    const { action, adminFeedback } = body // action: "approve" or "reject"

    // Get the cancelled appointment
    const { data: cancellationRequest, error: fetchError } = await supabaseAdmin
      .from("tbl_comprehensive_appointments")
      .select("*")
      .eq("id", id)
      .eq("status", "cancelled")
      .single()

    if (fetchError || !cancellationRequest) {
      return NextResponse.json({ success: false, error: "Cancellation request not found" }, { status: 404 })
    }

    const appointment = cancellationRequest;

    // Check if already processed by looking for admin feedback
    if (appointment.admin_notes?.includes("Admin feedback:")) {
      return NextResponse.json({ success: false, error: "Request has already been processed" }, { status: 400 })
    }

    const newStatus = action === "approve" ? "approved" : "rejected"

    // Update appointment with admin feedback
    const adminNotesUpdate = `${appointment.admin_notes || ""}\nAdmin feedback: ${action === "approve" ? "Approved" : "Rejected"}${adminFeedback ? ` - ${adminFeedback}` : ""}`
    
    const { error: updateError } = await supabaseAdmin
      .from("tbl_comprehensive_appointments")
      .update({
        status: action === "approve" ? "cancelled" : appointment.status,
        admin_notes: adminNotesUpdate,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)

    if (updateError) {
      console.error("Error updating cancellation request:", updateError)
      return NextResponse.json({ success: false, error: "Failed to update request" }, { status: 500 })
    }

    // If rejected, restore the appointment to its previous status
    if (action === "reject") {
      // Try to restore to confirmed or previous status
      await supabaseAdmin
        .from("tbl_comprehensive_appointments")
        .update({
          status: "confirmed",
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
    }

    // Update related tasting if exists
    await supabaseAdmin
      .from("tbl_food_tastings")
      .update({
        status: action === "approve" ? "cancelled" : "confirmed",
        updated_at: new Date().toISOString(),
      })
      .eq("appointment_id", id)

    // Get user details if user_id exists
    let user = null
    if (appointment.user_id) {
      const { data: userData } = await supabaseAdmin
        .from("tbl_users")
        .select("username, email, phone, first_name, last_name")
        .eq("id", appointment.user_id)
        .single()
      user = userData
    }

    const customerName = user?.username || `${appointment.contact_first_name || ""} ${appointment.contact_last_name || ""}`.trim() || "Walk-In Customer"
    const customerEmail = user?.email || appointment.contact_email || ""
    const customerPhone = user?.phone || appointment.contact_phone || ""

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

    // Only send user notification if user_id exists
    if (appointment.user_id) {
      await supabaseAdmin.from("tbl_notifications").insert({
        user_id: appointment.user_id,
        appointment_id: appointment.id,
        title: action === "approve" ? "Cancellation Request Approved" : "Cancellation Request Rejected",
        message: notificationMessage,
        type: "cancellation_response",
        is_read: false,
      })
    }

    await createAdminNotification({
      appointmentId: appointment.id,
      title: action === "approve" ? "Cancellation Request Approved" : "Cancellation Request Rejected",
      message: `A cancellation request from ${customerName} has been ${action === "approve" ? "approved" : "rejected"}.

Event Details:
• Event Type: ${appointment?.event_type || "Not specified"}
• Guest Count: ${appointment?.guest_count || "Not specified"} guests
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
        guests: appointment?.guest_count,
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
