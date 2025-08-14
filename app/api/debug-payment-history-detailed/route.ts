import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"
import { cookies } from "next/headers"
import { verifyToken } from "@/lib/auth-utils"

export async function GET() {
  try {
    console.log("=== DETAILED PAYMENT HISTORY DEBUG API CALLED ===")

    const cookieStore = await cookies()
    const sessionToken =
      cookieStore.get("session-id")?.value ||
      cookieStore.get("user-session")?.value ||
      cookieStore.get("auth-token")?.value

    if (!sessionToken) {
      return NextResponse.json({ success: false, error: "No session token found" })
    }

    let userId: string
    let tokenData: any
    try {
      tokenData = await verifyToken(sessionToken)
      userId = tokenData.userId
      console.log("User ID from token:", userId)
    } catch (error) {
      console.error("Token verification failed:", error)
      return NextResponse.json({ success: false, error: "Token verification failed" })
    }

    // 1. Check if user exists
    const { data: user, error: userError } = await supabaseAdmin.from("tbl_users").select("*").eq("id", userId).single()

    console.log("User check:", { exists: !!user, error: userError?.message })

    // 2. Get all transactions for this user
    const { data: allTransactions, error: transactionError } = await supabaseAdmin
      .from("tbl_payment_transactions")
      .select("*")
      .eq("user_id", userId)

    console.log(`Found ${allTransactions?.length || 0} total transactions for user`)

    // 3. Get all appointments for this user using the correct table name
    const { data: allAppointments, error: appointmentError } = await supabaseAdmin
      .from("tbl_comprehensive_appointments")
      .select("*")
      .eq("user_id", userId)

    console.log(`Found ${allAppointments?.length || 0} total appointments for user`)

    // 4. Get verified transactions with appointment details
    const { data: verifiedTransactions, error: verifiedError } = await supabaseAdmin
      .from("tbl_payment_transactions")
      .select(`
        *,
        tbl_comprehensive_appointments (
          id,
          contact_first_name,
          contact_last_name,
          event_type,
          event_date,
          guest_count,
          total_package_amount,
          status,
          theme,
          beverage_selection
        )
      `)
      .eq("user_id", userId)
      .eq("status", "verified")

    console.log(`Found ${verifiedTransactions?.length || 0} verified transactions`)

    // 5. Manual join attempt - get transactions and appointments separately
    const { data: transactionsOnly, error: transOnlyError } = await supabaseAdmin
      .from("tbl_payment_transactions")
      .select("*")
      .eq("user_id", userId)
      .eq("status", "verified")

    const appointmentIds = transactionsOnly?.map((t) => t.appointment_id).filter(Boolean) || []

    let matchingAppointments: any[] = []
    if (appointmentIds.length > 0) {
      const { data: appointments, error: apptError } = await supabaseAdmin
        .from("tbl_comprehensive_appointments")
        .select("*")
        .in("id", appointmentIds)

      matchingAppointments = appointments || []
      console.log(`Found ${matchingAppointments.length} matching appointments for transaction IDs`)
    }

    // 6. Get system-wide stats for context
    const { count: systemTransactionsCount } = await supabaseAdmin
      .from("tbl_payment_transactions")
      .select("*", { count: "exact", head: true })

    const { count: systemAppointmentsCount } = await supabaseAdmin
      .from("tbl_comprehensive_appointments")
      .select("*", { count: "exact", head: true })

    // Get sample system transactions
    const { data: sampleSystemTransactions } = await supabaseAdmin
      .from("tbl_payment_transactions")
      .select("id, user_id, status, amount, payment_type")
      .limit(5)

    // Get sample system appointments
    const { data: sampleSystemAppointments } = await supabaseAdmin
      .from("tbl_comprehensive_appointments")
      .select("id, user_id, event_type, payment_status")
      .limit(5)

    return NextResponse.json({
      success: true,
      debug: {
        userId,
        tokenData: {
          userId: tokenData.userId,
          email: tokenData.email,
          firstName: tokenData.firstName || tokenData.first_name,
          lastName: tokenData.lastName || tokenData.last_name,
        },
        user: user ? { ...user, password_hash: "[HIDDEN]" } : null,
        userExists: !!user,
        userError: userError?.message,

        totalTransactions: allTransactions?.length || 0,
        totalAppointments: allAppointments?.length || 0,
        verifiedTransactionsCount: verifiedTransactions?.length || 0,

        allTransactions: allTransactions || [],
        allAppointments: allAppointments || [],
        verifiedTransactions: verifiedTransactions || [],

        manualJoinResults: {
          transactionsCount: transactionsOnly?.length || 0,
          appointmentIds,
          matchingAppointmentsCount: matchingAppointments.length,
          transactions: transactionsOnly || [],
          appointments: matchingAppointments,
        },

        systemHasTransactions: systemTransactionsCount || 0,
        systemHasAppointments: systemAppointmentsCount || 0,
        sampleSystemTransactions: sampleSystemTransactions || [],
        sampleSystemAppointments: sampleSystemAppointments || [],

        errors: {
          userError: userError?.message,
          transactionError: transactionError?.message,
          appointmentError: appointmentError?.message,
          verifiedError: verifiedError?.message,
          transOnlyError: transOnlyError?.message,
        },
      },
    })
  } catch (error: any) {
    console.error("Unexpected error in detailed debug route:", error)
    return NextResponse.json(
      { success: false, message: "An unexpected error occurred", error: error.message },
      { status: 500 },
    )
  }
}
