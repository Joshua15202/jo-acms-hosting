import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

// Force dynamic rendering - prevent any caching
export const dynamic = "force-dynamic"
export const revalidate = 0

export async function POST(req: NextRequest) {
  try {
    const { appointmentId, amount, paymentType, paymentMethod, reference, notes } = await req.json()

    console.log("[v0] Recording walk-in payment:", { appointmentId, amount, paymentType, paymentMethod, reference })

    // Record the payment transaction
    const { data: transaction, error: transactionError } = await supabaseAdmin
      .from("tbl_payment_transactions")
      .insert({
        appointment_id: appointmentId,
        user_id: null, // Walk-in customers don't have user accounts
        amount,
        payment_type: paymentType,
        payment_method: paymentMethod,
        reference_number: reference,
        notes: notes || null,
        proof_image_url: null, // No proof needed for in-person payments
        status: "verified", // Auto-verify walk-in payments since they're recorded by admin
        admin_notes: "Walk-in customer payment recorded by admin",
      })
      .select()
      .single()

    if (transactionError) {
      console.error("[v0] Error creating payment transaction:", transactionError)
      return NextResponse.json({ success: false, message: "Failed to record payment transaction" }, { status: 500 })
    }

    console.log("[v0] Payment transaction created:", transaction)

    let newPaymentStatus = "unpaid"
    const newAppointmentStatus = "confirmed" // Always set to confirmed after payment

    if (paymentType === "full_payment") {
      newPaymentStatus = "fully_paid"
    } else if (paymentType === "remaining_balance") {
      newPaymentStatus = "fully_paid" // Remaining balance payment completes the payment
    } else if (paymentType === "down_payment") {
      newPaymentStatus = "partially_paid"
    } else if (paymentType === "cash") {
      // Cash can be either down payment or full payment
      newPaymentStatus = "partially_paid"
    }

    const { error: appointmentUpdateError } = await supabaseAdmin
      .from("tbl_comprehensive_appointments")
      .update({
        payment_status: newPaymentStatus,
        status: newAppointmentStatus, // Set to confirmed after payment is recorded
      })
      .eq("id", appointmentId)

    if (appointmentUpdateError) {
      console.error("[v0] Error updating appointment:", appointmentUpdateError)
      // Don't fail the whole request, payment was recorded
    }

    console.log("[v0] Appointment updated to payment status:", newPaymentStatus, "and status:", newAppointmentStatus)

    return NextResponse.json({
      success: true,
      message: "Walk-in payment recorded successfully",
      transaction,
    })
  } catch (error: any) {
    console.error("[v0] Error in walk-in payment submission:", error)
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}
