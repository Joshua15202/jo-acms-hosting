import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export async function GET(request: Request) {
  try {
    console.log("=== Admin Payment Transactions API Called ===")
    // For now, bypassing auth for debugging. Re-enable for production.
    console.log("BYPASSING AUTHENTICATION FOR DEBUGGING")
    // const cookieStore = await cookies()
    // const adminAuthenticated = cookieStore.get("admin-authenticated")?.value
    // if (adminAuthenticated !== "true") {
    //   return NextResponse.json({ success: false, error: "Unauthorized - Admin access required" }, { status: 403 })
    // }

    const { data: transactions, error } = await supabaseAdmin
      .from("tbl_payment_transactions")
      .select(`
        id,
        appointment_id,
        user_id,
        amount,
        payment_type,
        payment_method,
        reference_number,
        notes,
        proof_image_url,
        status,
        admin_notes,
        created_at,
        updated_at,
        tbl_users (
          id, 
          full_name, 
          email, 
          phone,
          first_name 
        ),
        tbl_comprehensive_appointments (
          id, 
          event_type, 
          event_date, 
          event_time, 
          guest_count, 
          total_package_amount, 
          down_payment_amount,
          payment_status 
        )
      `)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching payment transactions:", error)
      return NextResponse.json(
        { success: false, message: "Failed to fetch transactions", error: error.message },
        { status: 500 },
      )
    }

    return NextResponse.json({ success: true, transactions })
  } catch (error: any) {
    console.error("Unexpected error in payment transactions route:", error)
    return NextResponse.json(
      { success: false, message: "An unexpected error occurred", error: error.message },
      { status: 500 },
    )
  }
}
