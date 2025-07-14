import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"
import { cookies } from "next/headers"

export async function GET() {
  try {
    const cookieStore = await cookies()
    const sessionId = cookieStore.get("session-id")?.value
    if (!sessionId) {
      return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 })
    }

    const { data: sessionData, error: sessionAuthError } = await supabaseAdmin
      .from("tbl_sessions")
      .select("*, tbl_users(role)")
      .eq("id", sessionId)
      .single()

    if (sessionAuthError || !sessionData || sessionData.tbl_users?.role !== "admin") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 })
    }

    console.log("=== Admin: Fetching all payment transactions ===")

    const { data: transactions, error } = await supabaseAdmin
      .from("tbl_payment_transactions")
      .select(`
        *,
        tbl_users (id, full_name, email, phone),
        tbl_comprehensive_appointments (id, event_type, event_date, event_time, guest_count, total_package_amount, down_payment_amount)
      `)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching payment transactions:", error)
      return NextResponse.json(
        { success: false, message: "Failed to fetch payment transactions", error: error.message },
        { status: 500 },
      )
    }

    console.log(`Found ${transactions?.length || 0} payment transactions`)
    return NextResponse.json({ success: true, transactions: transactions || [], count: transactions?.length || 0 })
  } catch (error) {
    console.error("Unexpected error in admin payment transactions route:", error)
    return NextResponse.json(
      {
        success: false,
        message: "An unexpected error occurred",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
