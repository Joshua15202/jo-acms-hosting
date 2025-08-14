import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export async function GET(request: Request) {
  try {
    console.log("=== DEBUG ALL PAYMENT DATA API CALLED ===")

    // Get all appointments
    const { data: allAppointments, error: appointmentsError } = await supabaseAdmin
      .from("tbl_comprehensive_appointments")
      .select("*")
      .order("created_at", { ascending: false })

    if (appointmentsError) {
      console.error("Error fetching appointments:", appointmentsError)
      return NextResponse.json({ success: false, error: appointmentsError.message }, { status: 500 })
    }

    // Get all payment transactions
    const { data: allTransactions, error: transactionsError } = await supabaseAdmin
      .from("tbl_payment_transactions")
      .select("*")
      .order("created_at", { ascending: false })

    if (transactionsError) {
      console.error("Error fetching transactions:", transactionsError)
      return NextResponse.json({ success: false, error: transactionsError.message }, { status: 500 })
    }

    console.log(`Found ${allAppointments?.length || 0} appointments and ${allTransactions?.length || 0} transactions`)

    // Create summary data
    const uniqueUsers = new Set([
      ...(allAppointments?.map((apt) => apt.user_id) || []),
      ...(allTransactions?.map((txn) => txn.user_id) || []),
    ])

    const uniqueAppointmentStatuses = [
      ...new Set(allAppointments?.map((apt) => apt.payment_status).filter(Boolean) || []),
    ]
    const uniqueTransactionStatuses = [...new Set(allTransactions?.map((txn) => txn.status).filter(Boolean) || [])]
    const uniqueAppointmentPaymentStatuses = [
      ...new Set(allTransactions?.map((txn) => txn.appointment_payment_status).filter(Boolean) || []),
    ]

    // Find mismatched transactions
    const mismatchedTransactions = []
    if (allTransactions && allAppointments) {
      const appointmentMap = new Map()
      allAppointments.forEach((apt) => {
        appointmentMap.set(apt.id, apt.payment_status)
      })

      for (const txn of allTransactions) {
        const actualAppointmentStatus = appointmentMap.get(txn.appointment_id)
        if (actualAppointmentStatus && actualAppointmentStatus !== txn.appointment_payment_status) {
          mismatchedTransactions.push({
            transactionId: txn.id,
            appointmentId: txn.appointment_id,
            userId: txn.user_id,
            amount: txn.amount,
            paymentType: txn.payment_type,
            transactionStatus: txn.status,
            transactionAppointmentStatus: txn.appointment_payment_status,
            actualAppointmentStatus: actualAppointmentStatus,
          })
        }
      }
    }

    // Group appointments by user
    const appointmentsByUser: Record<string, any> = {}
    allAppointments?.forEach((apt) => {
      if (!appointmentsByUser[apt.user_id]) {
        appointmentsByUser[apt.user_id] = {
          count: 0,
          statuses: new Set(),
        }
      }
      appointmentsByUser[apt.user_id].count++
      appointmentsByUser[apt.user_id].statuses.add(apt.payment_status)
    })

    // Convert sets to arrays
    Object.keys(appointmentsByUser).forEach((userId) => {
      appointmentsByUser[userId].statuses = Array.from(appointmentsByUser[userId].statuses)
    })

    // Group transactions by user
    const transactionsByUser: Record<string, any> = {}
    allTransactions?.forEach((txn) => {
      if (!transactionsByUser[txn.user_id]) {
        transactionsByUser[txn.user_id] = {
          count: 0,
          statuses: new Set(),
          appointmentStatuses: new Set(),
        }
      }
      transactionsByUser[txn.user_id].count++
      transactionsByUser[txn.user_id].statuses.add(txn.status)
      transactionsByUser[txn.user_id].appointmentStatuses.add(txn.appointment_payment_status)
    })

    // Convert sets to arrays
    Object.keys(transactionsByUser).forEach((userId) => {
      transactionsByUser[userId].statuses = Array.from(transactionsByUser[userId].statuses)
      transactionsByUser[userId].appointmentStatuses = Array.from(transactionsByUser[userId].appointmentStatuses)
    })

    return NextResponse.json({
      success: true,
      summary: {
        totalAppointments: allAppointments?.length || 0,
        totalTransactions: allTransactions?.length || 0,
        uniqueUsers: uniqueUsers.size,
        mismatchedTransactionsCount: mismatchedTransactions.length,
        uniqueAppointmentStatuses,
        uniqueTransactionStatuses,
        uniqueAppointmentPaymentStatuses,
      },
      mismatchedTransactions,
      appointmentsByUser,
      transactionsByUser,
      sampleAppointments: allAppointments?.slice(0, 10) || [],
      sampleTransactions: allTransactions?.slice(0, 10) || [],
    })
  } catch (error: any) {
    console.error("Unexpected error in debug all payment data route:", error)
    return NextResponse.json(
      { success: false, message: "An unexpected error occurred", error: error.message },
      { status: 500 },
    )
  }
}
