import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export async function POST(request: Request) {
  try {
    console.log("=== FIXING PAYMENT TRANSACTION STATUS ===")

    // Get all payment transactions
    const { data: allTransactions, error: transactionsError } = await supabaseAdmin
      .from("tbl_payment_transactions")
      .select("*")

    if (transactionsError) {
      console.error("Error fetching transactions:", transactionsError)
      return NextResponse.json({ success: false, error: transactionsError.message }, { status: 500 })
    }

    console.log(`Found ${allTransactions?.length || 0} payment transactions`)

    if (!allTransactions || allTransactions.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No payment transactions found to update",
        updated: 0,
      })
    }

    // Get all appointments
    const appointmentIds = allTransactions.map((txn) => txn.appointment_id)
    const { data: appointments, error: appointmentsError } = await supabaseAdmin
      .from("tbl_comprehensive_appointments")
      .select("id, payment_status")
      .in("id", appointmentIds)

    if (appointmentsError) {
      console.error("Error fetching appointments:", appointmentsError)
      return NextResponse.json({ success: false, error: appointmentsError.message }, { status: 500 })
    }

    console.log(`Found ${appointments?.length || 0} appointments`)

    // Create a map of appointment_id -> current payment_status
    const appointmentStatusMap = new Map()
    appointments?.forEach((apt) => {
      appointmentStatusMap.set(apt.id, apt.payment_status)
    })

    // Find transactions that need updating
    const transactionsToUpdate = allTransactions.filter((txn) => {
      const currentAppointmentStatus = appointmentStatusMap.get(txn.appointment_id)
      return currentAppointmentStatus && currentAppointmentStatus !== txn.appointment_payment_status
    })

    console.log(`Found ${transactionsToUpdate.length} transactions that need status updates`)

    if (transactionsToUpdate.length === 0) {
      return NextResponse.json({
        success: true,
        message: "All payment transactions already have correct appointment_payment_status",
        updated: 0,
      })
    }

    // Update each transaction
    let updatedCount = 0
    const updateResults = []

    for (const txn of transactionsToUpdate) {
      const currentAppointmentStatus = appointmentStatusMap.get(txn.appointment_id)
      console.log(`Updating transaction ${txn.id}: ${txn.appointment_payment_status} -> ${currentAppointmentStatus}`)

      const { error: updateError } = await supabaseAdmin
        .from("tbl_payment_transactions")
        .update({
          appointment_payment_status: currentAppointmentStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", txn.id)

      if (updateError) {
        console.error(`Error updating transaction ${txn.id}:`, updateError)
        updateResults.push({
          transactionId: txn.id,
          success: false,
          error: updateError.message,
        })
      } else {
        updatedCount++
        updateResults.push({
          transactionId: txn.id,
          success: true,
          oldStatus: txn.appointment_payment_status,
          newStatus: currentAppointmentStatus,
        })
      }
    }

    console.log(`Successfully updated ${updatedCount} transactions`)

    return NextResponse.json({
      success: true,
      message: `Updated ${updatedCount} payment transactions with correct appointment_payment_status`,
      updated: updatedCount,
      total: transactionsToUpdate.length,
      results: updateResults,
    })
  } catch (error: any) {
    console.error("Unexpected error in fix payment transaction status route:", error)
    return NextResponse.json(
      { success: false, message: "An unexpected error occurred", error: error.message },
      { status: 500 },
    )
  }
}
