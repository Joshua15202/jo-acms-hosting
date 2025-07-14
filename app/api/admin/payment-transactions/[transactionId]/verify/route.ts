import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"
import { sendEmail } from "@/lib/email"
import { cookies } from "next/headers"

export async function PATCH(request: Request, { params }: { params: Promise<{ transactionId: string }> }) {
  try {
    console.log("=== Payment Verification API Called ===")

    const { transactionId } = await params
    console.log("Transaction ID:", transactionId)

    const cookieStore = await cookies()
    console.log("BYPASSING AUTHENTICATION FOR DEBUGGING")

    const body = await request.json()
    const { action, notes, appointmentId, paymentType } = body

    console.log("Verification action:", action)
    console.log("Admin notes:", notes)
    console.log("Appointment ID:", appointmentId)
    console.log("Payment type:", paymentType)

    // Get the transaction details first to understand the context
    const { data: transactionDetails, error: transactionFetchError } = await supabaseAdmin
      .from("tbl_payment_transactions")
      .select("*")
      .eq("id", transactionId)
      .single()

    if (transactionFetchError || !transactionDetails) {
      console.error("Error fetching transaction details:", transactionFetchError)
      return NextResponse.json(
        { success: false, message: "Transaction not found", error: transactionFetchError?.message },
        { status: 404 },
      )
    }

    console.log("Transaction details:", {
      id: transactionDetails.id,
      payment_type: transactionDetails.payment_type,
      appointment_payment_status: transactionDetails.appointment_payment_status,
      amount: transactionDetails.amount,
    })

    // Update the payment transaction
    const { data: updatedTransaction, error: updateError } = await supabaseAdmin
      .from("tbl_payment_transactions")
      .update({
        status: action, // "verified" or "rejected"
        admin_notes: notes,
        updated_at: new Date().toISOString(),
      })
      .eq("id", transactionId)
      .select(`
        *,
        tbl_users (
          id, 
          full_name, 
          first_name,
          email, 
          phone
        ),
        tbl_comprehensive_appointments (
          id, 
          event_type, 
          event_date, 
          event_time, 
          guest_count, 
          total_package_amount, 
          down_payment_amount,
          payment_status
        )
      `)
      .single()

    if (updateError) {
      console.error("Error updating payment transaction:", updateError)
      return NextResponse.json(
        { success: false, message: "Failed to update payment transaction", error: updateError.message },
        { status: 500 },
      )
    }

    console.log("Payment transaction updated successfully")

    // If payment is verified, update the main appointment record
    if (action === "verified" && appointmentId) {
      console.log("Updating main appointment payment status...")
      console.log(
        "Original appointment payment status when transaction was created:",
        transactionDetails.appointment_payment_status,
      )

      const updateData: any = {
        updated_at: new Date().toISOString(),
      }

      // Determine the new payment status based on payment type and original status
      if (paymentType === "down_payment") {
        // User paid down payment - they still need to pay remaining balance
        updateData.payment_status = "partially_paid"
        updateData.status = "confirmed" // Confirm the appointment when down payment is verified
        console.log("Setting payment_status to 'partially_paid' for down payment")
      } else if (paymentType === "full_payment") {
        // User paid full amount - no more payments needed
        updateData.payment_status = "fully_paid"
        updateData.status = "confirmed"
        console.log("Setting payment_status to 'fully_paid' for full payment")
      } else if (paymentType === "remaining_balance") {
        // User paid remaining balance - no more payments needed
        updateData.payment_status = "fully_paid"
        updateData.status = "confirmed"
        console.log("Setting payment_status to 'fully_paid' for remaining balance")
      }

      // Clear the pending payment type since it's now resolved
      updateData.pending_payment_type = null

      const { error: appointmentUpdateError } = await supabaseAdmin
        .from("tbl_comprehensive_appointments")
        .update(updateData)
        .eq("id", appointmentId)

      if (appointmentUpdateError) {
        console.error("Error updating appointment payment status:", appointmentUpdateError)
        // Don't fail the whole operation, just log the error
      } else {
        console.log("Appointment payment status updated successfully to:", updateData.payment_status)
        console.log("Cleared pending_payment_type")
      }
    } else if (action === "rejected" && appointmentId) {
      console.log("Payment rejected - reverting appointment payment status...")

      // When a payment is rejected, we need to revert to the status before this transaction
      const originalStatus = transactionDetails.appointment_payment_status
      console.log("Reverting to original appointment payment status:", originalStatus)

      // Check if there are any other verified payments for this appointment to determine the correct status
      const { data: verifiedPayments, error: verifiedPaymentsError } = await supabaseAdmin
        .from("tbl_payment_transactions")
        .select("payment_type, status, appointment_payment_status")
        .eq("appointment_id", appointmentId)
        .eq("status", "verified")
        .neq("id", transactionId) // Exclude the current transaction

      let revertStatus = originalStatus || "unpaid" // Use the original status or default to unpaid

      if (!verifiedPaymentsError && verifiedPayments && verifiedPayments.length > 0) {
        console.log("Found other verified payments:", verifiedPayments)

        // Check if there's a verified down payment
        const hasVerifiedDownPayment = verifiedPayments.some((p) => p.payment_type === "down_payment")
        const hasVerifiedFullPayment = verifiedPayments.some((p) => p.payment_type === "full_payment")
        const hasVerifiedRemainingBalance = verifiedPayments.some((p) => p.payment_type === "remaining_balance")

        if (hasVerifiedFullPayment || (hasVerifiedDownPayment && hasVerifiedRemainingBalance)) {
          revertStatus = "fully_paid"
        } else if (hasVerifiedDownPayment) {
          revertStatus = "partially_paid"
        } else {
          revertStatus = "unpaid"
        }
      }

      console.log("Reverting appointment payment status to:", revertStatus)

      const { error: appointmentUpdateError } = await supabaseAdmin
        .from("tbl_comprehensive_appointments")
        .update({
          payment_status: revertStatus,
          pending_payment_type: null, // Clear pending payment type
          updated_at: new Date().toISOString(),
        })
        .eq("id", appointmentId)

      if (appointmentUpdateError) {
        console.error("Error updating appointment after rejection:", appointmentUpdateError)
      } else {
        console.log("Appointment payment status reverted to:", revertStatus)
        console.log("Cleared pending_payment_type")
      }
    }

    // Send email notification to user
    try {
      const user = updatedTransaction.tbl_users
      const appointment = updatedTransaction.tbl_comprehensive_appointments

      if (action === "verified") {
        const paymentTypeLabel =
          paymentType === "down_payment"
            ? "Down Payment"
            : paymentType === "remaining_balance"
              ? "Remaining Balance"
              : "Full Payment"

        const emailContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #10b981;">✅ Payment Verified!</h2>
            <p>Dear ${user.first_name},</p>
            <p>Great news! Your ${paymentTypeLabel.toLowerCase()} has been verified and your booking is now confirmed.</p>
            <div style="background-color: #f3f4f6; border-radius: 8px; padding: 16px; margin: 20px 0;">
              <h4 style="margin-top: 0;">Payment Details:</h4>
              <p><strong>Transaction ID:</strong> ${updatedTransaction.id.slice(0, 8)}...</p>
              <p><strong>Amount:</strong> ₱${updatedTransaction.amount.toLocaleString()}</p>
              <p><strong>Payment Type:</strong> ${paymentTypeLabel}</p>
              <p><strong>Event:</strong> ${appointment.event_type} on ${new Date(appointment.event_date).toLocaleDateString()}</p>
              <p><strong>Status:</strong> ${paymentType === "full_payment" || paymentType === "remaining_balance" ? "Fully Paid" : "Down Payment Received"}</p>
            </div>
            ${
              notes
                ? `<div style="background-color: #ecfdf5; border: 1px solid #10b981; border-radius: 8px; padding: 16px; margin: 20px 0;">
              <h4 style="color: #065f46; margin-top: 0;">Admin Notes:</h4>
              <p style="color: #065f46;">${notes}</p>
            </div>`
                : ""
            }
            ${
              paymentType === "down_payment"
                ? `<p><strong>Next Step:</strong> You can now pay the remaining balance anytime before your event date. Visit your payment page to complete the payment.</p>`
                : `<p>Your booking is now fully paid and confirmed! We'll be in touch with further details about your event.</p>`
            }
            <p>Best regards,<br>Jo Pacheco Wedding & Events Team</p>
          </div>
        `

        await sendEmail({
          to: user.email,
          subject: `${paymentTypeLabel} Verified - Booking ${paymentType === "full_payment" || paymentType === "remaining_balance" ? "Fully Confirmed" : "Confirmed"}`,
          html: emailContent,
        })
      } else {
        const paymentTypeLabel =
          paymentType === "down_payment"
            ? "Down Payment"
            : paymentType === "remaining_balance"
              ? "Remaining Balance"
              : "Full Payment"

        const emailContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #ef4444;">❌ Payment Verification Issue</h2>
            <p>Dear ${user.first_name},</p>
            <p>We were unable to verify your recent ${paymentTypeLabel.toLowerCase()} submission. Please review the details below and resubmit your payment.</p>
            <div style="background-color: #f3f4f6; border-radius: 8px; padding: 16px; margin: 20px 0;">
              <h4 style="margin-top: 0;">Payment Details:</h4>
              <p><strong>Transaction ID:</strong> ${updatedTransaction.id.slice(0, 8)}...</p>
              <p><strong>Amount:</strong> ₱${updatedTransaction.amount.toLocaleString()}</p>
              <p><strong>Payment Type:</strong> ${paymentTypeLabel}</p>
              <p><strong>Reference:</strong> ${updatedTransaction.reference_number}</p>
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
          subject: `${paymentTypeLabel} Verification Required - Please Resubmit`,
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
      transaction: updatedTransaction,
    })
  } catch (error) {
    console.error("Unexpected error in payment verification route:", error)
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
