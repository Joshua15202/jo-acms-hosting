import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { supabaseAdmin } from "@/lib/supabase"
import { sendEmail } from "@/lib/email"
import { put } from "@vercel/blob"

export async function POST(request: NextRequest) {
  try {
    console.log("=== API POST /api/submit-payment: START ===")

    const cookieStore = await cookies()
    const sessionId = cookieStore.get("session-id")?.value
    if (!sessionId) {
      return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 })
    }

    const { data: session, error: sessionError } = await supabaseAdmin
      .from("tbl_sessions")
      .select(`*, tbl_users (id, email, first_name, last_name, full_name)`)
      .eq("id", sessionId)
      .gt("expires_at", new Date().toISOString())
      .single()

    if (sessionError || !session || !session.tbl_users) {
      return NextResponse.json({ success: false, error: "Session expired or user not found" }, { status: 401 })
    }
    const user = session.tbl_users

    const formData = await request.formData()
    const appointmentId = formData.get("appointmentId") as string
    const amount = Number.parseFloat(formData.get("amount") as string)
    const paymentType = formData.get("paymentType") as "down_payment" | "full_payment" | "remaining_balance"
    const paymentMethod = formData.get("paymentMethod") as string
    const reference = formData.get("reference") as string
    const notes = formData.get("notes") as string
    const proofImageFile = formData.get("proofImage") as File | null

    console.log("Payment submission data:", {
      appointmentId,
      amount,
      paymentType,
      paymentMethod,
      reference,
      userId: user.id,
    })

    if (!proofImageFile) {
      return NextResponse.json({ success: false, error: "Payment proof image is required" }, { status: 400 })
    }
    if (!appointmentId || isNaN(amount) || !paymentType || !paymentMethod || !reference) {
      return NextResponse.json({ success: false, error: "Missing required payment details" }, { status: 400 })
    }

    // UPDATED: Check appointment eligibility - allow both TASTING_COMPLETED and confirmed status
    const { data: appointment, error: appointmentError } = await supabaseAdmin
      .from("tbl_comprehensive_appointments")
      .select("*")
      .eq("id", appointmentId)
      .eq("user_id", user.id)
      .in("status", ["TASTING_COMPLETED", "confirmed"]) // Allow both statuses
      .in("payment_status", ["unpaid", "pending_payment", "partially_paid"]) // Allow partially paid for remaining balance
      .single()

    if (appointmentError || !appointment) {
      console.error("Appointment verification failed:", appointmentError)
      console.log("Appointment lookup details:", {
        appointmentId,
        userId: user.id,
        error: appointmentError?.message,
      })

      // Let's also check what appointment actually exists
      const { data: debugAppointment, error: debugError } = await supabaseAdmin
        .from("tbl_comprehensive_appointments")
        .select("id, status, payment_status, user_id")
        .eq("id", appointmentId)
        .single()

      console.log("Debug appointment lookup:", {
        found: !!debugAppointment,
        appointment: debugAppointment,
        error: debugError?.message,
      })

      return NextResponse.json(
        {
          success: false,
          error: "Appointment not found, not ready for payment, or already fully paid.",
          debug: {
            appointmentId,
            userId: user.id,
            appointmentFound: !!debugAppointment,
            appointmentDetails: debugAppointment,
            originalError: appointmentError?.message,
          },
        },
        { status: 400 },
      )
    }

    console.log("Current appointment details:", {
      id: appointment.id.slice(0, 8),
      status: appointment.status,
      payment_status: appointment.payment_status,
      pending_payment_type: appointment.pending_payment_type,
    })

    // Additional validation based on current payment status
    if (appointment.payment_status === "pending_payment") {
      return NextResponse.json(
        {
          success: false,
          error: "A payment is already pending review for this appointment. Please wait for verification.",
        },
        { status: 400 },
      )
    }

    if (appointment.payment_status === "partially_paid" && paymentType === "down_payment") {
      return NextResponse.json(
        {
          success: false,
          error: "Down payment has already been made for this appointment. Please pay the remaining balance.",
        },
        { status: 400 },
      )
    }

    // Upload image to Vercel Blob
    const blobFileName = `payment_proofs/${appointmentId}-${Date.now()}-${proofImageFile.name}`
    const blob = await put(blobFileName, proofImageFile, {
      access: "public",
      contentType: proofImageFile.type,
    })
    const proofImageUrl = blob.url
    console.log("Proof image uploaded to Vercel Blob:", proofImageUrl)

    // Insert into tbl_payment_transactions with the current appointment payment status
    const { data: transaction, error: transactionError } = await supabaseAdmin
      .from("tbl_payment_transactions")
      .insert({
        appointment_id: appointmentId,
        user_id: user.id,
        amount: amount,
        payment_type: paymentType,
        payment_method: paymentMethod,
        reference_number: reference,
        notes: notes,
        proof_image_url: proofImageUrl,
        status: "pending_verification",
        appointment_payment_status: appointment.payment_status, // Store the current appointment payment status
      })
      .select()
      .single()

    if (transactionError) {
      console.error("Failed to insert payment transaction:", transactionError)
      return NextResponse.json({ success: false, error: "Failed to record payment transaction" }, { status: 500 })
    }
    console.log(
      "Payment transaction recorded:",
      transaction.id,
      "with appointment_payment_status:",
      appointment.payment_status,
    )

    // Update appointment's payment status to pending_payment
    const { error: updateAppointmentError } = await supabaseAdmin
      .from("tbl_comprehensive_appointments")
      .update({
        payment_status: "pending_payment",
        pending_payment_type: paymentType,
        updated_at: new Date().toISOString(),
      })
      .eq("id", appointmentId)

    if (updateAppointmentError) {
      console.error("Failed to update appointment payment status:", updateAppointmentError)
      return NextResponse.json(
        { success: false, error: "Failed to update appointment status after recording transaction" },
        { status: 500 },
      )
    }

    console.log("Appointment payment status updated to pending_payment with pending_payment_type:", paymentType)

    try {
      const paymentTypeLabel =
        paymentType === "down_payment"
          ? "Down Payment (50%)"
          : paymentType === "remaining_balance"
            ? "Remaining Balance"
            : "Full Payment"

      await supabaseAdmin.from("tbl_notifications").insert({
        user_id: user.id,
        appointment_id: appointmentId,
        title: "Payment Submitted",
        message: `Your ${paymentTypeLabel} of ₱${amount.toLocaleString()} has been submitted and is pending verification. We'll notify you once it's verified.`,
        type: "payment",
        is_read: false,
      })

      console.log("✅ Payment submission notification created for user:", user.id)
    } catch (notificationError) {
      console.error("❌ Error creating payment submission notification:", notificationError)
    }

    // Send confirmation email to user
    try {
      const paymentTypeLabel =
        paymentType === "down_payment"
          ? "Down Payment (50%)"
          : paymentType === "remaining_balance"
            ? "Remaining Balance"
            : "Full Payment"

      const emailContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #e11d48;">💳 Payment Submitted Successfully!</h2>
          <p>Dear ${user.first_name},</p>
          <p>Thank you for submitting your ${paymentTypeLabel.toLowerCase()} for your catering appointment!</p>
          <div style="background-color: #f3f4f6; border-radius: 8px; padding: 16px; margin: 20px 0;">
            <h4 style="margin-top: 0;">Payment Details:</h4>
            <p><strong>Transaction ID:</strong> ${transaction.id}</p>
            <p><strong>Appointment ID:</strong> ${appointmentId.slice(0, 8)}...</p>
            <p><strong>Amount:</strong> ₱${amount.toLocaleString()}</p>
            <p><strong>Payment Method:</strong> ${paymentMethod}</p>
            <p><strong>Reference:</strong> ${reference}</p>
            <p><strong>Type:</strong> ${paymentTypeLabel}</p>
          </div>
          <div style="background-color: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 16px; margin: 20px 0;">
            <h4 style="color: #92400e; margin-top: 0;">⏳ Payment Verification</h4>
            <p style="color: #92400e;">Your payment is being verified by our team. We will confirm your payment within 24-48 hours and send you a confirmation email once verified.</p>
          </div>
          <p>Best regards,<br>Jo Pacheco Wedding & Events Team</p>
        </div>
      `
      await sendEmail({
        to: user.email,
        subject: `${paymentTypeLabel} Submitted - Transaction ${transaction.id.slice(0, 8)}`,
        html: emailContent,
      })
      console.log("✅ Payment confirmation email sent to:", user.email)
    } catch (emailError) {
      console.error("❌ Error sending payment confirmation email:", emailError)
    }

    // Send notification email to admin
    try {
      const paymentTypeLabel =
        paymentType === "down_payment"
          ? "Down Payment"
          : paymentType === "remaining_balance"
            ? "Remaining Balance"
            : "Full Payment"

      const adminEmailContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #e11d48;">💳 New ${paymentTypeLabel} Submission for Verification</h2>
          <p>A customer has submitted a ${paymentTypeLabel.toLowerCase()} that requires verification.</p>
          <div style="background-color: #f3f4f6; border-radius: 8px; padding: 16px; margin: 20px 0;">
            <h4 style="margin-top: 0;">Transaction Details:</h4>
            <p><strong>Transaction ID:</strong> ${transaction.id}</p>
            <p><strong>Customer:</strong> ${user.full_name} (${user.email})</p>
            <p><strong>Appointment ID:</strong> ${appointmentId}</p>
            <p><strong>Payment Type:</strong> <strong>${paymentTypeLabel}</strong></p>
            <p><strong>Amount Submitted:</strong> ₱${amount.toLocaleString()}</p>
            <p><strong>Payment Method:</strong> ${paymentMethod}</p>
            <p><strong>Reference:</strong> ${reference}</p>
            <p><strong>Notes:</strong> ${notes || "None"}</p>
            <p><strong>Proof Image:</strong> <a href="${proofImageUrl}" target="_blank">View Proof</a></p>
            <p><strong>Appointment Status When Submitted:</strong> ${appointment.payment_status}</p>
          </div>
          <p>Please log in to the admin panel to verify this payment.</p>
        </div>
      `
      await sendEmail({
        to: "admin@jopacheco.com",
        subject: `${paymentTypeLabel} Verification Required - Transaction ${transaction.id.slice(0, 8)}`,
        html: adminEmailContent,
      })
      console.log("✅ Admin notification email sent")
    } catch (emailError) {
      console.error("❌ Error sending admin notification email:", emailError)
    }

    console.log("=== API POST /api/submit-payment: SUCCESS ===")
    return NextResponse.json({
      success: true,
      message: "Payment submitted successfully! We will verify your payment within 24-48 hours.",
      transactionId: transaction.id,
    })
  } catch (error: any) {
    console.error("=== API POST /api/submit-payment: ERROR ===")
    console.error("Error processing payment:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error", details: error.message },
      { status: 500 },
    )
  }
}
