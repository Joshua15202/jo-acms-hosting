import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"
import { cookies } from "next/headers"
import { createAdminNotification } from "@/lib/admin-notifications"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { appointmentId, reason, attachmentUrl } = body

    console.log("[v0] Cancellation request received:", { appointmentId, reason, hasAttachment: !!attachmentUrl })

    // Get user from session
    const cookieStore = await cookies()
    const sessionId = cookieStore.get("session-id")?.value

    if (!sessionId) {
      console.log("[v0] No session ID found")
      return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 })
    }

    const { data: session } = await supabaseAdmin
      .from("tbl_sessions")
      .select("user_id, expires_at")
      .eq("id", sessionId)
      .single()

    if (!session || new Date(session.expires_at) < new Date()) {
      console.log("[v0] Invalid or expired session")
      return NextResponse.json({ success: false, error: "Invalid or expired session" }, { status: 401 })
    }

    console.log("[v0] User authenticated:", session.user_id)

    // Verify appointment belongs to user and has payment
    const { data: appointment } = await supabaseAdmin
      .from("tbl_comprehensive_appointments")
      .select("*")
      .eq("id", appointmentId)
      .eq("user_id", session.user_id)
      .single()

    if (!appointment) {
      console.log("[v0] Appointment not found")
      return NextResponse.json({ success: false, error: "Appointment not found" }, { status: 404 })
    }

    console.log("[v0] Appointment found:", { id: appointment.id, payment_status: appointment.payment_status })

    // Check if already has pending request
    const { data: existingRequest } = await supabaseAdmin
      .from("tbl_cancellation_requests")
      .select("id")
      .eq("appointment_id", appointmentId)
      .eq("status", "pending")
      .single()

    if (existingRequest) {
      console.log("[v0] Existing pending request found")
      return NextResponse.json(
        { success: false, error: "A cancellation request is already pending for this appointment" },
        { status: 400 },
      )
    }

    // Create cancellation request
    const { data: cancellationRequest, error } = await supabaseAdmin
      .from("tbl_cancellation_requests")
      .insert({
        appointment_id: appointmentId,
        user_id: session.user_id,
        reason,
        attachment_url: attachmentUrl || null,
        status: "pending",
      })
      .select()
      .single()

    if (error) {
      console.error("[v0] Error creating cancellation request:", error)
      return NextResponse.json(
        { success: false, error: error.message || "Failed to create cancellation request" },
        { status: 500 },
      )
    }

    console.log("[v0] Cancellation request created successfully:", cancellationRequest.id)

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
      title: "Cancellation Request Submitted",
      message: `Your cancellation request for the ${appointment.event_type} appointment on ${eventDate} at ${eventTime} has been submitted and is pending admin review.\n\nYou will be notified once the request is processed.`,
      type: "cancellation_request",
      is_read: false,
    })

    await createAdminNotification({
      appointmentId,
      title: "New Cancellation Request",
      message: `${customerName} has submitted a cancellation request for their ${appointment.event_type} appointment.

Event Details:
• Event Type: ${appointment.event_type}
• Guest Count: ${appointment.guests} guests
• Event Date: ${eventDate}
• Event Time: ${eventTime}
• Venue: ${appointment.venue || "Not specified"}
• Payment Status: ${appointment.payment_status || "unpaid"}

Customer Information:
• Name: ${customerName}
• Email: ${customerEmail}
• Phone: ${customerPhone}

Cancellation Reason: ${reason || "No reason provided"}

${attachmentUrl ? "Supporting document attached." : ""}

Action Required: Please review and approve/reject this request.`,
      type: "cancellation_request",
      metadata: {
        event_type: appointment.event_type,
        event_date: appointment.event_date,
        event_time: eventTime,
        guests: appointment.guests,
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone,
        payment_status: appointment.payment_status,
        cancellation_reason: reason || "No reason provided",
        has_attachment: !!attachmentUrl,
      },
    })

    return NextResponse.json({
      success: true,
      data: cancellationRequest,
    })
  } catch (error) {
    console.error("[v0] Error in cancellation request:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
