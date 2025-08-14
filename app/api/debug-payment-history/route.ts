import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"
import { cookies } from "next/headers"
import { verifyToken } from "@/lib/auth-utils"

export async function GET(request: Request) {
  try {
    console.log("=== DEBUG PAYMENT HISTORY API CALLED ===")

    const cookieStore = await cookies()
    const sessionToken =
      cookieStore.get("session-id")?.value ||
      cookieStore.get("user-session")?.value ||
      cookieStore.get("auth-token")?.value

    if (!sessionToken) {
      return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 })
    }

    let userId: string
    try {
      const tokenData = await verifyToken(sessionToken)
      userId = tokenData.userId
      console.log("User ID from token:", userId)
    } catch (error) {
      console.error("Token verification failed:", error)
      return NextResponse.json({ success: false, error: "Invalid session" }, { status: 401 })
    }

    // 1. Check all appointments for this user
    console.log("=== CHECKING ALL APPOINTMENTS FOR USER ===")
    const { data: allAppointments, error: appointmentsError } = await supabaseAdmin
      .from("tbl_comprehensive_appointments")
      .select("*")
      .eq("user_id", userId)

    console.log("All appointments for user:", {
      data: allAppointments,
      error: appointmentsError,
      count: allAppointments?.length || 0,
    })

    // 2. Check fully paid appointments specifically
    const { data: fullyPaidAppointments, error: fullyPaidError } = await supabaseAdmin
      .from("tbl_comprehensive_appointments")
      .select("*")
      .eq("user_id", userId)
      .eq("payment_status", "fully_paid")

    console.log("Fully paid appointments:", {
      data: fullyPaidAppointments,
      error: fullyPaidError,
      count: fullyPaidAppointments?.length || 0,
    })

    // 3. Check all payment transactions for this user
    const { data: userTransactions, error: userTransactionsError } = await supabaseAdmin
      .from("tbl_payment_transactions")
      .select("*")
      .eq("user_id", userId)

    console.log("All user transactions:", {
      data: userTransactions,
      error: userTransactionsError,
      count: userTransactions?.length || 0,
    })

    // 4. If we have fully paid appointments, check for transactions by appointment IDs
    let transactionsByAppointmentIds: any[] = []
    if (fullyPaidAppointments && fullyPaidAppointments.length > 0) {
      const appointmentIds = fullyPaidAppointments.map((apt) => apt.id)
      console.log("Checking transactions for appointment IDs:", appointmentIds)

      const { data: txnsByAptIds, error: txnsByAptIdsError } = await supabaseAdmin
        .from("tbl_payment_transactions")
        .select("*")
        .in("appointment_id", appointmentIds)

      transactionsByAppointmentIds = txnsByAptIds || []
      console.log("Transactions by appointment IDs:", {
        data: transactionsByAppointmentIds,
        error: txnsByAptIdsError,
        count: transactionsByAppointmentIds.length,
      })
    }

    // 5. Check verified transactions specifically
    const { data: verifiedTransactions, error: verifiedError } = await supabaseAdmin
      .from("tbl_payment_transactions")
      .select("*")
      .eq("user_id", userId)
      .eq("status", "verified")

    console.log("Verified transactions for user:", {
      data: verifiedTransactions,
      error: verifiedError,
      count: verifiedTransactions?.length || 0,
    })

    // 6. Try the join query to see if it works
    let joinQueryWorked = false
    let joinError = null
    let joinedTransactions: any[] = []

    try {
      const { data: joinedData, error: joinErr } = await supabaseAdmin
        .from("tbl_payment_transactions")
        .select(`
          *,
          tbl_comprehensive_appointments!inner (*)
        `)
        .eq("user_id", userId)

      joinQueryWorked = !joinErr
      joinError = joinErr?.message || null
      joinedTransactions = joinedData || []
      console.log("Join query result:", {
        worked: joinQueryWorked,
        error: joinError,
        data: joinedTransactions,
        count: joinedTransactions.length,
      })
    } catch (error: any) {
      joinError = error.message
      console.log("Join query failed:", error)
    }

    // 7. Get unique payment statuses from all appointments
    const uniquePaymentStatuses = [...new Set(allAppointments?.map((apt) => apt.payment_status).filter(Boolean) || [])]

    // 8. Check if there are any transactions with mismatched appointment_payment_status
    let mismatchedTransactions: any[] = []
    if (transactionsByAppointmentIds.length > 0 && fullyPaidAppointments && fullyPaidAppointments.length > 0) {
      mismatchedTransactions = transactionsByAppointmentIds.filter((txn) => {
        const appointment = fullyPaidAppointments.find((apt) => apt.id === txn.appointment_id)
        return appointment && appointment.payment_status !== txn.appointment_payment_status
      })
      console.log("Mismatched transactions (appointment_payment_status vs actual):", mismatchedTransactions)
    }

    return NextResponse.json({
      success: true,
      debug: {
        userId,
        totalAppointments: allAppointments?.length || 0,
        fullyPaidAppointmentsCount: fullyPaidAppointments?.length || 0,
        userTransactionsCount: userTransactions?.length || 0,
        transactionsByAppointmentIdsCount: transactionsByAppointmentIds.length,
        verifiedTransactionsCount: verifiedTransactions?.length || 0,
        joinQueryWorked,
        joinError,
        uniquePaymentStatuses,
        mismatchedTransactionsCount: mismatchedTransactions.length,
        sampleAppointments: allAppointments?.slice(0, 3) || [],
        sampleUserTransactions: userTransactions?.slice(0, 3) || [],
        sampleTransactionsByAppointmentIds: transactionsByAppointmentIds.slice(0, 3) || [],
        sampleMismatchedTransactions: mismatchedTransactions.slice(0, 3) || [],
      },
    })
  } catch (error: any) {
    console.error("Unexpected error in debug payment history route:", error)
    return NextResponse.json(
      { success: false, message: "An unexpected error occurred", error: error.message },
      { status: 500 },
    )
  }
}
