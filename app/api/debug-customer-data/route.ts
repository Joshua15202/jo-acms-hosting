import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get("email") || "blacksights99@gmail.com"

    console.log(`=== DEBUGGING CUSTOMER DATA FOR: ${email} ===`)

    // Find the user
    const { data: user, error: userError } = await supabaseAdmin
      .from("tbl_users")
      .select("*")
      .eq("email", email)
      .single()

    if (userError || !user) {
      return NextResponse.json({
        success: false,
        message: "User not found",
        error: userError?.message,
      })
    }

    console.log(`Found user:`, user)

    // Check all payment transactions for this user
    const { data: payments, error: paymentsError } = await supabaseAdmin
      .from("tbl_payment_transactions")
      .select("*")
      .eq("user_id", user.id)

    console.log(`Payments for user:`, payments)

    // Check appointments in tbl_appointments
    const { data: appointments, error: appointmentsError } = await supabaseAdmin
      .from("tbl_appointments")
      .select("*")
      .eq("user_id", user.id)

    console.log(`Appointments in tbl_appointments:`, appointments)

    // Check appointments in tbl_comprehensive_appointments
    const { data: comprehensiveAppointments, error: comprehensiveError } = await supabaseAdmin
      .from("tbl_comprehensive_appointments")
      .select("*")
      .eq("user_id", user.id)

    console.log(`Appointments in tbl_comprehensive_appointments:`, comprehensiveAppointments)

    // Check if there are any appointments with different user_id formats
    const { data: allPayments, error: allPaymentsError } = await supabaseAdmin
      .from("tbl_payment_transactions")
      .select("user_id, amount, status")
      .limit(10)

    const { data: allAppointments, error: allAppointmentsError } = await supabaseAdmin
      .from("tbl_comprehensive_appointments")
      .select("user_id, event_type, status")
      .limit(10)

    return NextResponse.json({
      success: true,
      debug: {
        searchEmail: email,
        userFound: !!user,
        userData: user,
        paymentsCount: payments?.length || 0,
        paymentsData: payments,
        appointmentsCount: appointments?.length || 0,
        appointmentsData: appointments,
        comprehensiveAppointmentsCount: comprehensiveAppointments?.length || 0,
        comprehensiveAppointmentsData: comprehensiveAppointments,
        samplePayments: allPayments?.slice(0, 5),
        sampleAppointments: allAppointments?.slice(0, 5),
        userIdFormat: user?.id,
        userIdType: typeof user?.id,
      },
    })
  } catch (error) {
    console.error("Error in debug customer data:", error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    })
  }
}
