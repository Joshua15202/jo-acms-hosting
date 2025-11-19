import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"
import { cookies } from "next/headers"
import { createAdminNotification } from "@/lib/admin-notifications"

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: appointmentId } = await params
    const body = await request.json()
    const { reason } = body

    console.log("=== CANCEL REQUEST START ===")
    console.log("Appointment ID:", appointmentId)
    console.log("Reason:", reason)

    // Get user from session
    const cookieStore = await cookies()
    const sessionId = cookieStore.get("session-id")?.value

    if (!sessionId) {
      console.log("ERROR: No session-id cookie found")
      return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 })
    }

    console.log("Looking up session...")
    const { data: session } = await supabaseAdmin
      .from("tbl_sessions")
      .select("user_id, expires_at")
      .eq("id", sessionId)
      .single()

    if (!session) {
      console.log("ERROR: Invalid session")
      return NextResponse.json({ success: false, error: "Invalid session" }, { status: 401 })
    }

    // Check if session is expired
    const expiresAt = new Date(session.expires_at)
    const now = new Date()
    if (expiresAt < now) {
      console.log("ERROR: Session expired")
      return NextResponse.json({ success: false, error: "Session expired" }, { status: 401 })
    }

    console.log("Session valid for user:", session.user_id)

    // Get the appointment
    console.log("Looking up appointment...")
    const { data: appointment, error: fetchError } = await supabaseAdmin
      .from("tbl_comprehensive_appointments")
      .select("*")
      .eq("id", appointmentId)
      .eq("user_id", session.user_id)
      .single()

    if (fetchError || !appointment) {
      console.log("ERROR: Appointment not found")
      return NextResponse.json({ success: false, error: "Appointment not found" }, { status: 404 })
    }

    console.log("Appointment found:")
    console.log("  - Status:", appointment.status)
    console.log("  - Payment status:", appointment.payment_status)

    // Check if appointment can be cancelled
    if (appointment.status === "cancelled" || appointment.status === "completed") {
      console.log("ERROR: Cannot cancel - appointment is already", appointment.status)
      return NextResponse.json({ success: false, error: "Cannot cancel this appointment" }, { status: 400 })
    }

    // FIXED: Check if any payment has been made
    // Only consider it as "has payment" if payment_status is "deposit_paid" or "fully_paid"
    const hasPaymentStatus =
      appointment.payment_status === "deposit_paid" || appointment.payment_status === "fully_paid"

    console.log("Checking for payment transactions...")
    const { data: paymentTransactions, error: paymentError } = await supabaseAdmin
      .from("tbl_payment_transactions")
      .select("id, status, payment_type")
      .eq("appointment_id", appointmentId)
      .in("status", ["verified", "pending"])

    if (paymentError) {
      console.log("Warning: Error checking payments:", paymentError)
    }

    const hasPaymentTransaction = paymentTransactions && paymentTransactions.length > 0

    console.log("Payment check results:")
    console.log("  - Has payment status:", hasPaymentStatus)
    console.log("  - Payment status value:", appointment.payment_status)
    console.log("  - Has payment transactions:", hasPaymentTransaction)
    console.log("  - Payment transactions:", paymentTransactions)

    if (hasPaymentStatus || hasPaymentTransaction) {
      console.log("ERROR: Cannot cancel - payment has been made")
      const paymentTypes = paymentTransactions?.map((t) => t.payment_type).join(", ") || "payment"
      return NextResponse.json(
        {
          success: false,
          error: `Cannot cancel appointment because ${paymentTypes} has already been made. Please contact us at jo.pacheco.catering@gmail.com or call 0917-629-1878 for assistance.`,
        },
        { status: 400 },
      )
    }

    console.log("No payment found - proceeding with cancellation")

    // Update the appointment
    const cancelNote = `[${new Date().toISOString()}] Appointment cancelled by user. Reason: ${reason || "No reason provided"}`
    const updatedNotes = `${appointment.admin_notes || ""}\n\n${cancelNote}`.trim()

    console.log("Updating appointment status to cancelled...")
    const { error: updateError } = await supabaseAdmin
      .from("tbl_comprehensive_appointments")
      .update({
        status: "cancelled",
        admin_notes: updatedNotes,
        updated_at: new Date().toISOString(),
      })
      .eq("id", appointmentId)

    if (updateError) {
      console.error("ERROR: Failed to cancel appointment:", updateError)
      return NextResponse.json({ success: false, error: "Failed to cancel appointment" }, { status: 500 })
    }

    console.log("Appointment cancelled successfully")

    const { data: user } = await supabaseAdmin
      .from("tbl_users")
      .select("username, email, phone")
      .eq("id", session.user_id)
      .single()

    const customerName = user?.username || "Unknown"
    const customerEmail = user?.email || ""
    const customerPhone = user?.phone || ""

    // Format event date and time
    const eventDate = new Date(appointment.event_date).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
    const eventTime = appointment.event_time || "Not specified"

    await supabaseAdmin.from("tbl_notifications").insert({
      user_id: session.user_id,
      appointment_id: appointmentId,
      title: "Appointment Cancelled",
      message: `Your ${appointment.event_type} appointment on ${eventDate} at ${eventTime} has been cancelled successfully.${reason ? `\n\nReason: ${reason}` : ""}`,
      type: "cancellation",
      is_read: false,
    })

    await createAdminNotification({
      appointmentId,
      title: "Appointment Cancelled by User",
      message: `${customerName} has cancelled their ${appointment.event_type} appointment.

Event Details:
• Event Type: ${appointment.event_type}
• Guest Count: ${appointment.guests} guests
• Event Date: ${eventDate}
• Event Time: ${eventTime}
• Venue: ${appointment.venue || "Not specified"}

Customer Information:
• Name: ${customerName}
• Email: ${customerEmail}
• Phone: ${customerPhone}

Cancellation Reason: ${reason || "No reason provided"}`,
      type: "cancellation",
      metadata: {
        event_type: appointment.event_type,
        event_date: appointment.event_date,
        event_time: eventTime,
        guests: appointment.guests,
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone,
        cancellation_reason: reason || "No reason provided",
      },
    })

    // Update tasting appointment if exists
    console.log("Checking for related tasting...")
    const { data: tasting } = await supabaseAdmin
      .from("tbl_food_tastings")
      .select("id")
      .eq("appointment_id", appointmentId)
      .single()

    if (tasting) {
      console.log("Updating tasting status to cancelled")
      await supabaseAdmin
        .from("tbl_food_tastings")
        .update({
          status: "cancelled",
          updated_at: new Date().toISOString(),
        })
        .eq("id", tasting.id)
    } else {
      console.log("No related tasting found")
    }

    console.log("=== CANCEL REQUEST SUCCESS ===")

    return NextResponse.json({
      success: true,
      message: "Appointment cancelled successfully",
    })
  } catch (error) {
    console.error("=== CANCEL REQUEST ERROR ===")
    console.error("Error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
