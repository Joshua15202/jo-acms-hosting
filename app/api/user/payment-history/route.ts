import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"
import { cookies } from "next/headers"

export async function GET() {
  try {
    console.log("=== PAYMENT HISTORY API CALLED ===")

    const cookieStore = await cookies()
    const sessionId = cookieStore.get("session-id")?.value

    if (!sessionId) {
      console.log("No session ID found in cookies")
      return NextResponse.json({ success: false, message: "No session found" }, { status: 401 })
    }

    console.log("Session ID found:", sessionId)

    // Get session from database with user info
    const { data: session, error: sessionError } = await supabaseAdmin
      .from("tbl_sessions")
      .select(`
        *,
        tbl_users (id, email, first_name, last_name, full_name, role, phone)
      `)
      .eq("id", sessionId)
      .gt("expires_at", new Date().toISOString())
      .single()

    if (sessionError || !session || !session.tbl_users) {
      console.log("Session not found or expired:", sessionError?.message)
      return NextResponse.json({ success: false, message: "Session expired" }, { status: 401 })
    }

    const user = session.tbl_users
    console.log("User found:", user.email)

    // Get all verified payment transactions for this user
    const { data: transactions, error: transactionError } = await supabaseAdmin
      .from("tbl_payment_transactions")
      .select("*")
      .eq("user_id", user.id)
      .eq("status", "verified")
      .order("created_at", { ascending: false })

    if (transactionError) {
      console.error("Error fetching transactions:", transactionError)
      return NextResponse.json({
        success: false,
        error: "Failed to fetch payment transactions",
        details: transactionError.message,
      })
    }

    console.log(`Found ${transactions?.length || 0} verified transactions for user`)

    // For each transaction, get the appointment details
    const transactionsWithAppointments = []

    if (transactions && transactions.length > 0) {
      for (const transaction of transactions) {
        const { data: appointment, error: appointmentError } = await supabaseAdmin
          .from("tbl_comprehensive_appointments")
          .select("*")
          .eq("id", transaction.appointment_id)
          .single()

        if (appointment && !appointmentError) {
          transactionsWithAppointments.push({
            ...transaction,
            tbl_comprehensive_appointments: appointment,
          })
        } else {
          console.log(`Could not find appointment ${transaction.appointment_id} for transaction ${transaction.id}`)
        }
      }
    }

    console.log(`Successfully joined ${transactionsWithAppointments.length} transactions with appointments`)

    return NextResponse.json({
      success: true,
      transactions: transactionsWithAppointments,
      user: {
        id: user.id,
        email: user.email,
        name: user.full_name || `${user.first_name} ${user.last_name}`,
      },
      totalTransactions: transactionsWithAppointments.length,
      debug: {
        userId: user.id,
        userExists: true,
        rawTransactionsCount: transactions?.length || 0,
        joinedTransactionsCount: transactionsWithAppointments.length,
      },
    })
  } catch (error: any) {
    console.error("Unexpected error in payment history route:", error)
    return NextResponse.json(
      { success: false, message: "An unexpected error occurred", error: error.message },
      { status: 500 },
    )
  }
}
