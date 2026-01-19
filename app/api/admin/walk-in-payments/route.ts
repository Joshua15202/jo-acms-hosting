import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ success: false, message: "Admin client not available" }, { status: 500 })
    }

    const { data: appointments, error } = await supabaseAdmin
      .from("tbl_comprehensive_appointments")
      .select("*")
      .eq("booking_source", "admin")
      .in("status", ["TASTING_CONFIRMED", "pending"]) // Include both statuses
      .in("payment_status", ["unpaid", "partially_paid"]) // Include partially paid for remaining balance
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching walk-in payments:", error)
      return NextResponse.json({ success: false, message: "Failed to fetch walk-in payments", error }, { status: 500 })
    }

    return NextResponse.json(
      {
        success: true,
        appointments: appointments || [],
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      },
    )
  } catch (error: any) {
    console.error("Error in walk-in payments API:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
        error: error.message,
      },
      { status: 500 },
    )
  }
}
