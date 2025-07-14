import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"
import { cookies } from "next/headers"
import { verifyToken } from "@/lib/auth-utils"

export async function GET(request: Request) {
  try {
    console.log("=== DEBUG PAYMENT HISTORY API CALLED ===")

    const cookieStore = await cookies()

    // Try multiple session cookie names
    const sessionToken =
      cookieStore.get("session-id")?.value ||
      cookieStore.get("user-session")?.value ||
      cookieStore.get("auth-token")?.value

    console.log("Available cookies for debug:", {
      "session-id": cookieStore.get("session-id")?.value ? "exists" : "missing",
      "user-session": cookieStore.get("user-session")?.value ? "exists" : "missing",
      "auth-token": cookieStore.get("auth-token")?.value ? "exists" : "missing",
    })

    if (!sessionToken) {
      console.log("No session token found for debug")
      return NextResponse.json(
        {
          success: false,
          error: "Not authenticated",
          debug: {
            cookiesFound: Object.keys(cookieStore.getAll()).length,
            availableCookies: Object.keys(cookieStore.getAll()),
          },
        },
        { status: 401 },
      )
    }

    let userId: string
    try {
      const tokenData = await verifyToken(sessionToken)
      userId = tokenData.userId
      console.log("Debug - User ID from token:", userId)
    } catch (error) {
      console.error("Debug - Token verification failed:", error)
      return NextResponse.json(
        {
          success: false,
          error: "Invalid session",
          debug: {
            tokenLength: sessionToken.length,
            tokenStart: sessionToken.substring(0, 10),
            verificationError: error instanceof Error ? error.message : "Unknown error",
          },
        },
        { status: 401 },
      )
    }

    // Get all payment transactions for this user
    const { data: userTransactions, error: userTransError } = await supabaseAdmin
      .from("tbl_payment_transactions")
      .select("*")
      .eq("user_id", userId)

    console.log("Debug - User transactions:", userTransactions?.length || 0)

    // Get verified transactions
    const { data: verifiedTransactions, error: verifiedError } = await supabaseAdmin
      .from("tbl_payment_transactions")
      .select("*")
      .eq("user_id", userId)
      .eq("status", "verified")

    console.log("Debug - Verified transactions:", verifiedTransactions?.length || 0)

    // Get all appointments for this user
    const { data: userAppointments, error: appointmentsError } = await supabaseAdmin
      .from("tbl_comprehensive_appointments")
      .select("*")
      .eq("user_id", userId)

    console.log("Debug - User appointments:", userAppointments?.length || 0)

    // Get fully paid appointments
    const { data: fullyPaidAppointments, error: fullyPaidError } = await supabaseAdmin
      .from("tbl_comprehensive_appointments")
      .select("*")
      .eq("user_id", userId)
      .eq("payment_status", "fully_paid")

    console.log("Debug - Fully paid appointments:", fullyPaidAppointments?.length || 0)

    // Get unique payment statuses
    const uniquePaymentStatuses = [...new Set(userAppointments?.map((apt) => apt.payment_status) || [])]

    // Get unique transaction statuses
    const uniqueTransactionStatuses = [...new Set(userTransactions?.map((trans) => trans.status) || [])]

    return NextResponse.json({
      success: true,
      debug: {
        userId,
        userTransactionsCount: userTransactions?.length || 0,
        verifiedTransactionsCount: verifiedTransactions?.length || 0,
        userAppointmentsCount: userAppointments?.length || 0,
        fullyPaidAppointmentsCount: fullyPaidAppointments?.length || 0,
        uniquePaymentStatuses,
        uniqueTransactionStatuses,
        userTransactions:
          userTransactions?.map((t) => ({
            id: t.id,
            appointment_id: t.appointment_id,
            amount: t.amount,
            payment_type: t.payment_type,
            payment_method: t.payment_method,
            status: t.status,
            created_at: t.created_at,
          })) || [],
        fullyPaidAppointments:
          fullyPaidAppointments?.map((apt) => ({
            id: apt.id,
            event_type: apt.event_type,
            payment_status: apt.payment_status,
            status: apt.status,
            updated_at: apt.updated_at,
          })) || [],
        errors: {
          userTransError: userTransError?.message,
          verifiedError: verifiedError?.message,
          appointmentsError: appointmentsError?.message,
          fullyPaidError: fullyPaidError?.message,
        },
      },
    })
  } catch (error: any) {
    console.error("Debug payment history error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        debug: {
          errorType: error.constructor.name,
          errorMessage: error.message,
          errorStack: error.stack,
        },
      },
      { status: 500 },
    )
  }
}
