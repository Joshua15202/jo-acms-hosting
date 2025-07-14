import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export async function GET() {
  try {
    console.log("=== Admin: Fetching all payments ===")

    // Fetch appointments that have payment activity (including pending payments)
    const { data: appointments, error } = await supabaseAdmin
      .from("tbl_comprehensive_appointments")
      .select(`
        *,
        tbl_users (
          id,
          full_name,
          email,
          phone,
          first_name,
          last_name
        )
      `)
      .in("payment_status", ["pending_payment", "partially_paid", "fully_paid", "refunded"])
      .order("updated_at", { ascending: false })

    if (error) {
      console.error("Error fetching payments:", error)
      return NextResponse.json(
        {
          success: false,
          message: "Failed to fetch payments",
          error: error.message,
        },
        { status: 500 },
      )
    }

    console.log(`Found ${appointments?.length || 0} appointments with payment activity`)

    return NextResponse.json({
      success: true,
      payments: appointments || [],
      count: appointments?.length || 0,
    })
  } catch (error) {
    console.error("Unexpected error in admin payments route:", error)
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
