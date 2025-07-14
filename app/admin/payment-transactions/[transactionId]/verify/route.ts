import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"
import { sendEmail } from "@/lib/email"
import { cookies } from "next/headers"

export async function PATCH(request: NextRequest, { params }: { params: { transactionId: string } }) {
  try {
    const cookieStore = await cookies()
    const sessionId = cookieStore.get("session-id")?.value
    if (!sessionId) {
      return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 })
    }

    const { data: sessionData, error: sessionAuthError } = await supabaseAdmin
      .from("tbl_sessions")
      .select("*, tbl_users(role)")
      .eq("id", sessionId)
      .single()

    if (sessionAuthError || !sessionData || sessionData.tbl_users?.role !== "admin") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 })
    }

    const { transactionId } = params
    const { action, notes, appointmentId, paymentType } = await request.json()

    console.log(`=== Admin: ${action} payment transaction ${transactionId} ===`)

    // Update the transaction status
    const { data: transaction, error: updateError } = await supabaseAdmin
      .from("tbl_payment_transactions")
      .update({
        status: action, // 'verified' or 'rejected'
        admin_notes: notes,
        updated_at: new Date().toISOString(),
      })
      .eq("id", transactionId)
      .select(`
        *,
        tbl_users (id, full_name, email, first_name),
        tbl_comprehensive_appointments (id, event_type, event_date)
      `)
      .single()

    if (updateError || !transaction) {
      console.error("Error updating transaction:", updateError)
      return NextResponse.json({ success: false, message: "Failed to update transaction" }, { status: 500 })
    }

    // Update the main appointment based on verification result
    if (action === "verified") {
      // If verified, update appointment payment status based on payment type
      const newPaymentStatus = paymentType === "full_payment" ? "fully_paid" : "partially_paid"

      const { error: appointmentUpdateError } = await supabaseAdmin
        .from("tbl_comprehensive_appointments")
        .update({
          payment_status: newPaymentStatus,
          status: "confirmed", // Confirm the appointment when payment is verified
          updated_at: new Date().toISOString(),
        })
        .eq("id", appointmentId)

      if (appointmentUpdateError) {
        console.error("Error updating appointment after verification:", appointmentUpdateError)
      }
    } else if (action === "rejected") {
      // If rejected, set payment status back to unpaid so user can resubmit
      const { error: appointmentUpdateError } = await supabaseAdmin
        .from("tbl_comprehensive_appointments")
        .update({
          payment_status: "unpaid",
          updated_at: new Date().toISOString(),
        })
        .eq("id", appointmentId)

      if (appointmentUpdateError) {
        console.error("Error updating appointment after rejection:", appointmentUpdateError)
      }
    }

    // Send email notification to user
    try {
      const user = transaction.tbl_users
      const appointment = transaction.tbl_comprehensive_appointments

      if (action === "verified") {
        const emailContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #10b981;">✅ Payment Verified!</h2>
            <p>Dear ${user.first_name},</p>
            <p>Great news! Your payment has been verified and your booking is now confirmed.</p>
            <div style="background-color: #f3f4f6; border-radius: 8px; padding: 16px; margin: 20px 0;">
              <h4 style="margin-top: 0;">Payment Details:</h4>
              <p><strong>Transaction ID:</strong> ${transaction.id.slice(0, 8)}...</p>
              <p><strong>Amount:</strong> ₱${transaction.amount.toLocaleString()}</p>
              <p><strong>Event:</strong> ${appointment.event_type} on ${new Date(appointment.event_date).toLocaleDateString()}</p>
              <p><strong>Status:</strong> ${paymentType === "full_payment" ? "Fully Paid" : "Down Payment Received"}</p>
            </div>
            ${
              notes
                ? `<div style="background-color: #ecfdf5; border: 1px solid #10b981; border-radius: 8px; padding: 16px; margin: 20px 0;">
              <h4 style="color: #065f46; margin-top: 0;">Admin Notes:</h4>
              <p style="color: #065f46;">${notes}</p>
            </div>`
                : ""
            }
            <p>Your booking is now confirmed! We'll be in touch with further details about your event.</p>
            <p>Best regards,<br>Jo Pacheco Wedding & Events Team</p>
          </div>
        `

        await sendEmail({
          to: user.email,
          subject: `Payment Verified - Booking Confirmed`,
          html: emailContent,
        })
      } else {
        const emailContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #ef4444;">❌ Payment Verification Issue</h2>
            <p>Dear ${user.first_name},</p>
            <p>We were unable to verify your recent payment submission. Please review the details below and resubmit your payment.</p>
            <div style="background-color: #f3f4f6; border-radius: 8px; padding: 16px; margin: 20px 0;">
              <h4 style="margin-top: 0;">Payment Details:</h4>
              <p><strong>Transaction ID:</strong> ${transaction.id.slice(0, 8)}...</p>
              <p><strong>Amount:</strong> ₱${transaction.amount.toLocaleString()}</p>
              <p><strong>Reference:</strong> ${transaction.reference_number}</p>
            </div>
            ${
              notes
                ? `<div style="background-color: #fef2f2; border: 1px solid #ef4444; border-radius: 8px; padding: 16px; margin: 20px 0;">
              <h4 style="color: #991b1b; margin-top: 0;">Reason for Rejection:</h4>
              <p style="color: #991b1b;">${notes}</p>
            </div>`
                : ""
            }
            <p>Please visit your payment page to submit a new payment with the correct details.</p>
            <p>If you have any questions, please contact us.</p>
            <p>Best regards,<br>Jo Pacheco Wedding & Events Team</p>
          </div>
        `

        await sendEmail({
          to: user.email,
          subject: `Payment Verification Required - Please Resubmit`,
          html: emailContent,
        })
      }

      console.log(`✅ ${action} notification email sent to:`, user.email)
    } catch (emailError) {
      console.error(`❌ Error sending ${action} notification email:`, emailError)
    }

    return NextResponse.json({
      success: true,
      message: `Payment ${action} successfully`,
      transaction: transaction,
    })
  } catch (error) {
    console.error(`Error ${action === "verified" ? "verifying" : "rejecting"} payment:`, error)
    return NextResponse.json(
      {
        success: false,
        message: `Failed to ${action} payment`,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
