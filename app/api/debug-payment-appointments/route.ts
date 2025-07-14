import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { supabaseAdmin } from "@/lib/supabase"

export async function GET() {
  try {
    console.log("=== DEBUG PAYMENT APPOINTMENTS API ===")

    const cookieStore = await cookies()
    const sessionId = cookieStore.get("session-id")?.value

    if (!sessionId) {
      return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 })
    }

    // Get session with user
    const { data: session, error: sessionError } = await supabaseAdmin
      .from("tbl_sessions")
      .select(`*, tbl_users (id, email, first_name, last_name, full_name, role)`)
      .eq("id", sessionId)
      .gt("expires_at", new Date().toISOString())
      .single()

    if (sessionError || !session || !session.tbl_users) {
      return NextResponse.json({ success: false, error: "Session expired or user not found" }, { status: 401 })
    }

    const user = session.tbl_users

    // Get all appointments for this user
    const { data: appointments, error: appointmentsError } = await supabaseAdmin
      .from("tbl_comprehensive_appointments")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (appointmentsError) {
      return NextResponse.json({ success: false, error: appointmentsError.message }, { status: 500 })
    }

    // Get all payment transactions for this user
    const { data: transactions, error: transactionsError } = await supabaseAdmin
      .from("tbl_payment_transactions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    const analysis =
      appointments?.map((apt) => {
        const aptTransactions = transactions?.filter((t) => t.appointment_id === apt.id) || []

        // Updated logic: show appointments that are ready for payment
        const isReadyForPayment =
          // Status should be TASTING_COMPLETED (ready for first payment) OR confirmed (ready for remaining payment)
          (apt.status === "TASTING_COMPLETED" || apt.status === "confirmed") &&
          // Payment status should not be fully paid or refunded
          apt.payment_status !== "fully_paid" &&
          apt.payment_status !== "refunded"

        return {
          id: apt.id.slice(0, 8),
          status: apt.status,
          payment_status: apt.payment_status,
          pending_payment_type: apt.pending_payment_type,
          updated_at: apt.updated_at,
          shouldShowInPaymentCenter: isReadyForPayment,
          transactions: aptTransactions.map((t) => ({
            payment_type: t.payment_type,
            status: t.status,
            amount: t.amount,
          })),
          reasoning: {
            statusCheck: `Status is ${apt.status} (${apt.status === "TASTING_COMPLETED" || apt.status === "confirmed" ? "✅" : "❌"})`,
            paymentCheck: `Payment is ${apt.payment_status} (${apt.payment_status !== "fully_paid" && apt.payment_status !== "refunded" ? "✅" : "❌"})`,
          },
        }
      }) || []

    const appointmentsForPayment = analysis.filter((apt) => apt.shouldShowInPaymentCenter).length

    return NextResponse.json({
      success: true,
      userId: user.id,
      totalAppointments: appointments?.length || 0,
      appointmentsForPayment,
      analysis,
      transactions: transactions || [],
    })
  } catch (error: any) {
    console.error("Debug payment appointments error:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
