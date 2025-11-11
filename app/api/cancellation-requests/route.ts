import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"
import { cookies } from "next/headers"

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

    // Create notification for user
    await supabaseAdmin.from("tbl_notifications").insert({
      user_id: session.user_id,
      appointment_id: appointmentId,
      title: "Cancellation Request Submitted",
      message: "Your cancellation request has been submitted and is pending admin review.",
      type: "cancellation_request",
      is_read: false,
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
