import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"
import { cookies } from "next/headers"

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: requestId } = await params
    const cookieStore = await cookies()
    const adminAuthenticated = cookieStore.get("adminAuthenticated")?.value
    const adminUserCookie = cookieStore.get("adminUser")?.value

    if (adminAuthenticated !== "true") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    let adminName = "Admin"
    if (adminUserCookie) {
      try {
        const adminData = JSON.parse(adminUserCookie)
        adminName = adminData.name || "Admin"
      } catch (e) {
        console.log("Could not parse admin cookie")
      }
    }

    const body = await request.json()
    const { action, adminFeedback } = body

    if (!action || !["approve", "reject"].includes(action)) {
      return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 })
    }

    // Get the reschedule request
    const { data: rescheduleRequest, error: fetchError } = await supabaseAdmin
      .from("tbl_reschedule_requests")
      .select("*")
      .eq("id", requestId)
      .single()

    if (fetchError || !rescheduleRequest) {
      return NextResponse.json({ success: false, error: "Reschedule request not found" }, { status: 404 })
    }

    if (rescheduleRequest.status !== "pending") {
      return NextResponse.json({ success: false, error: "Request has already been processed" }, { status: 400 })
    }

    // Update reschedule request status
    const { error: updateRequestError } = await supabaseAdmin
      .from("tbl_reschedule_requests")
      .update({
        status: action === "approve" ? "approved" : "rejected",
        admin_feedback: adminFeedback,
        updated_at: new Date().toISOString(),
      })
      .eq("id", requestId)

    if (updateRequestError) {
      return NextResponse.json(
        { success: false, error: "Failed to update reschedule request" },
        { status: 500 },
      )
    }

    // If approved, update the appointment
    if (action === "approve") {
      const updateData: any = {
        event_date: rescheduleRequest.new_event_date,
        event_time: rescheduleRequest.new_event_time,
        time_slot: rescheduleRequest.new_event_time,
        status: "rescheduled",
        updated_at: new Date().toISOString(),
      }

      if (rescheduleRequest.penalty_applied) {
        updateData.total_package_amount = rescheduleRequest.new_total_amount
        updateData.down_payment_amount = Math.round(rescheduleRequest.new_total_amount * 0.5)
        
        const { data: appointment } = await supabaseAdmin
          .from("tbl_comprehensive_appointments")
          .select("admin_notes")
          .eq("id", rescheduleRequest.appointment_id)
          .single()

        updateData.admin_notes =
          `${appointment?.admin_notes || ""}\n\n[${new Date().toISOString()}] Reschedule penalty: ₱${rescheduleRequest.penalty_amount.toLocaleString()} (10%). Original: ${rescheduleRequest.current_event_date} ${rescheduleRequest.current_event_time}. New: ${rescheduleRequest.new_event_date} ${rescheduleRequest.new_event_time}. Approved by: ${adminName}`.trim()
      }

      const { error: updateAppointmentError } = await supabaseAdmin
        .from("tbl_comprehensive_appointments")
        .update(updateData)
        .eq("id", rescheduleRequest.appointment_id)

      if (updateAppointmentError) {
        return NextResponse.json(
          { success: false, error: "Failed to update appointment" },
          { status: 500 },
        )
      }

      // Update related tasting if exists
      const { data: tasting } = await supabaseAdmin
        .from("tbl_food_tastings")
        .select("id")
        .eq("appointment_id", rescheduleRequest.appointment_id)
        .single()

      if (tasting) {
        await supabaseAdmin
          .from("tbl_food_tastings")
          .update({
            status: "rescheduled",
            updated_at: new Date().toISOString(),
          })
          .eq("id", tasting.id)
      }
    }

    // Send notification to user
    const message =
      action === "approve"
        ? `Your reschedule request has been approved. Your appointment has been moved to ${rescheduleRequest.new_event_date} at ${rescheduleRequest.new_event_time}.${rescheduleRequest.penalty_applied ? ` A penalty of ₱${rescheduleRequest.penalty_amount.toLocaleString()} has been applied.` : ""}${adminFeedback ? ` Admin notes: ${adminFeedback}` : ""}`
        : `Your reschedule request has been rejected. Your appointment remains on ${rescheduleRequest.current_event_date} at ${rescheduleRequest.current_event_time}.${adminFeedback ? ` Reason: ${adminFeedback}` : ""}`

    await supabaseAdmin.from("tbl_notifications").insert({
      user_id: rescheduleRequest.user_id,
      appointment_id: rescheduleRequest.appointment_id,
      title: action === "approve" ? "Reschedule Request Approved" : "Reschedule Request Rejected",
      type: "reschedule",
      message,
      is_read: false,
      created_at: new Date().toISOString(),
    })

    return NextResponse.json({
      success: true,
      message: `Reschedule request ${action === "approve" ? "approved" : "rejected"} successfully`,
    })
  } catch (error) {
    console.error("Error in PATCH /api/admin/reschedule-requests/[id]:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
