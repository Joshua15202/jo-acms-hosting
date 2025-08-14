import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"
import { cookies } from "next/headers"
import { verifyToken } from "@/lib/auth-utils"

export async function GET(request: Request) {
  try {
    console.log("=== DEBUG SPECIFIC USER DATA API CALLED ===")

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
    } catch (error) {
      return NextResponse.json({ success: false, error: "Invalid session" }, { status: 401 })
    }

    // Get detailed user information
    console.log("=== FETCHING USER DETAILS ===")
    const { data: users, error: userError } = await supabaseAdmin.from("tbl_users").select("*").eq("id", userId)

    console.log("User query result:", { users, error: userError })

    // Get ALL appointments for this user with full details
    console.log("=== FETCHING ALL APPOINTMENTS WITH FULL DETAILS ===")
    const { data: appointments, error: appointmentsError } = await supabaseAdmin
      .from("tbl_comprehensive_appointments")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    console.log("All appointments:", { appointments, error: appointmentsError })

    // Get ALL payment transactions for this user
    console.log("=== FETCHING ALL PAYMENT TRANSACTIONS ===")
    const { data: transactions, error: transactionsError } = await supabaseAdmin
      .from("tbl_payment_transactions")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    console.log("All transactions:", { transactions, error: transactionsError })

    // Analyze each appointment to see why it might not show in payment center
    const appointmentAnalysis =
      appointments?.map((apt) => {
        const isStatusReady = apt.status === "TASTING_COMPLETED" || apt.status === "confirmed"
        const needsPayment = apt.payment_status !== "fully_paid" && apt.payment_status !== "refunded"
        const shouldShowInPaymentCenter = isStatusReady && needsPayment

        return {
          id: apt.id,
          event_type: apt.event_type,
          status: apt.status,
          payment_status: apt.payment_status,
          pending_payment_type: apt.pending_payment_type,
          created_at: apt.created_at,
          updated_at: apt.updated_at,
          event_date: apt.event_date,
          total_package_amount: apt.total_package_amount,
          down_payment_amount: apt.down_payment_amount,
          remaining_balance: apt.remaining_balance,
          // Analysis
          isStatusReady,
          needsPayment,
          shouldShowInPaymentCenter,
          reasonNotShowing: !shouldShowInPaymentCenter
            ? !isStatusReady
              ? `Status '${apt.status}' is not ready (needs TASTING_COMPLETED or confirmed)`
              : `Payment status '${apt.payment_status}' doesn't need payment`
            : null,
        }
      }) || []

    // Check if there are any sessions for this user
    console.log("=== CHECKING USER SESSIONS ===")
    const { data: sessions, error: sessionsError } = await supabaseAdmin
      .from("tbl_user_sessions")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(5)

    console.log("User sessions:", { sessions, error: sessionsError })

    // Get some general statistics
    const totalAppointments = appointments?.length || 0
    const totalTransactions = transactions?.length || 0
    const appointmentsReadyForPayment = appointmentAnalysis.filter((apt) => apt.shouldShowInPaymentCenter).length

    // Get unique statuses
    const uniqueAppointmentStatuses = [...new Set(appointments?.map((apt) => apt.status) || [])]
    const uniquePaymentStatuses = [...new Set(appointments?.map((apt) => apt.payment_status) || [])]
    const uniqueTransactionStatuses = [...new Set(transactions?.map((txn) => txn.status) || [])]

    return NextResponse.json({
      success: true,
      debug: {
        userId,
        timestamp: new Date().toISOString(),

        // User information
        userExists: users && users.length > 0,
        userCount: users?.length || 0,
        userDetails: users?.[0] || null,

        // Appointments analysis
        totalAppointments,
        appointmentsReadyForPayment,
        appointmentAnalysis,
        uniqueAppointmentStatuses,
        uniquePaymentStatuses,

        // Transactions
        totalTransactions,
        uniqueTransactionStatuses,
        transactionDetails: transactions || [],

        // Sessions
        activeSessions: sessions?.length || 0,
        recentSessions: sessions?.slice(0, 3) || [],

        // Raw data for debugging
        rawAppointments: appointments || [],
        rawTransactions: transactions || [],

        // Errors
        userError: userError?.message || null,
        appointmentsError: appointmentsError?.message || null,
        transactionsError: transactionsError?.message || null,
        sessionsError: sessionsError?.message || null,
      },
    })
  } catch (error: any) {
    console.error("Unexpected error in debug specific user data route:", error)
    return NextResponse.json(
      {
        success: false,
        message: "An unexpected error occurred",
        error: error.message,
      },
      { status: 500 },
    )
  }
}
