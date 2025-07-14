import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"
import { sendEmail } from "@/lib/email"

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { action, notes } = await request.json()

    console.log(`=== Admin: ${action} payment for appointment ${id} ===`)

    // Validate action
    const validActions = ["verify", "reject"]
    if (!validActions.includes(action)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid action",
        },
        { status: 400 },
      )
    }

    // Get appointment with user details
    const { data: appointment, error: fetchError } = await supabaseAdmin
      .from("tbl_comprehensive_appointments")
      .select(`
        *,
        tbl_users (
          id,
          full_name,
          email,
          phone,
          first_name,
          last_name
        )
      `)
      .eq("id", id)
      .single()

    if (fetchError || !appointment) {
      console.error("Appointment not found:", fetchError)
      return NextResponse.json(
        {
          success: false,
          message: "Appointment not found",
        },
        { status: 404 },
      )
    }

    const updateData: any = {
      admin_notes: notes || null,
      updated_at: new Date().toISOString(),
    }

    let emailSubject = ""
    let emailContent = ""

    if (action === "verify") {
      // Determine the final payment status based on the pending payment type
      const finalPaymentStatus = appointment.pending_payment_type === "full_payment" ? "fully_paid" : "partially_paid"

      // Verify payment - update status to confirmed and set the correct payment status
      updateData.status = "confirmed"
      updateData.payment_status = finalPaymentStatus
      updateData.pending_payment_type = null // Clear the pending type

      const isFullPayment = finalPaymentStatus === "fully_paid"

      emailSubject = `Payment Verified - Booking Confirmed ${appointment.id.slice(0, 8)}`
      emailContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #10b981;">✅ Payment Verified - Booking Confirmed!</h2>
          <p>Dear ${appointment.tbl_users.first_name},</p>
          <p>Great news! Your payment has been verified and your booking is now confirmed.</p>
          <div style="background-color: #f0fdf4; border: 1px solid #10b981; border-radius: 8px; padding: 16px; margin: 20px 0;">
            <h4 style="color: #059669; margin-top: 0;">💰 Payment Status</h4>
            <p style="color: #059669;">
              ${
                isFullPayment
                  ? "✅ Full payment received and verified."
                  : `✅ Down payment received and verified.<br>💰 Remaining balance due on event day.`
              }
            </p>
          </div>
          <p>We'll contact you closer to your event date to finalize all details.</p>
          <p>Thank you for choosing Jo Pacheco Wedding & Events!</p>
        </div>
      `
    } else if (action === "reject") {
      // Reject payment - revert to unpaid status
      updateData.payment_status = "unpaid"
      updateData.status = "TASTING_COMPLETED" // Back to tasting completed so they can pay again
      updateData.pending_payment_type = null // Clear the pending type

      emailSubject = `Payment Issue - Action Required ${appointment.id.slice(0, 8)}`
      emailContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #ef4444;">⚠️ Payment Verification Issue</h2>
          
          <p>Dear ${appointment.tbl_users.first_name},</p>
          
          <p>We encountered an issue with your payment verification and need your assistance.</p>
          
          <div style="background-color: #fef2f2; border: 1px solid #ef4444; border-radius: 8px; padding: 16px; margin: 20px 0;">
            <h4 style="color: #dc2626; margin-top: 0;">❌ Payment Issue</h4>
            <p style="color: #dc2626;">
              Your payment could not be verified. This may be due to:
            </p>
            <ul style="color: #dc2626;">
              <li>Incorrect payment amount</li>
              <li>Invalid reference number</li>
              <li>Payment proof not clear</li>
              <li>Payment not received</li>
            </ul>
          </div>
          
          ${
            notes
              ? `
          <div style="background-color: #f3f4f6; border-radius: 8px; padding: 16px; margin: 20px 0;">
            <h4 style="margin-top: 0;">Admin Notes:</h4>
            <p>${notes}</p>
          </div>
          `
              : ""
          }
          
          <div style="background-color: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 16px; margin: 20px 0;">
            <h4 style="color: #92400e; margin-top: 0;">🔄 Next Steps</h4>
            <p style="color: #92400e;">
              Please log in to your account and submit your payment again with the correct information.
              Your booking is still reserved while we resolve this issue.
            </p>
          </div>
          
          <p>If you have any questions, please contact us immediately.</p>
          
          <p>Best regards,<br>Jo Pacheco Wedding & Events Team</p>
        </div>
      `
    }

    // Update appointment
    const { error: updateError } = await supabaseAdmin
      .from("tbl_comprehensive_appointments")
      .update(updateData)
      .eq("id", id)

    if (updateError) {
      console.error("Failed to update payment status:", updateError)
      return NextResponse.json({ success: false, error: "Failed to update payment status" }, { status: 500 })
    }

    // Send email notification to customer
    try {
      await sendEmail({
        to: appointment.tbl_users.email,
        subject: emailSubject,
        html: emailContent,
      })

      console.log(`✅ ${action} email sent to:`, appointment.tbl_users.email)
    } catch (emailError) {
      console.error(`❌ Error sending ${action} email:`, emailError)
    }

    console.log(`Successfully ${action}ed payment for appointment ${id}`)

    return NextResponse.json({
      success: true,
      message: `Payment ${action}ed successfully`,
      action,
    })
  } catch (error) {
    console.error("Unexpected error in payment verification:", error)
    return NextResponse.json(
      {
        success: false,
        message: "An unexpected error occurred",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
