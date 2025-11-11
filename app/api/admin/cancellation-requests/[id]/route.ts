import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

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

    // Create notification for user
    const notificationMessage =
      action === "approve"
        ? `Your cancellation request has been approved. ${adminFeedback ? `Admin feedback: ${adminFeedback}` : ""}`
        : `Your cancellation request has been rejected. ${adminFeedback ? `Reason: ${adminFeedback}` : ""}`

    await supabaseAdmin.from("tbl_notifications").insert({
      user_id: cancellationRequest.user_id,
      appointment_id: cancellationRequest.appointment_id,
      title: action === "approve" ? "Cancellation Request Approved" : "Cancellation Request Rejected",
      message: notificationMessage,
      type: "cancellation_response",
      is_read: false,
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
