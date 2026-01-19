import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

// Force dynamic rendering - prevent any caching
export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET(request: NextRequest) {
  try {
    console.log("[v0] Walk-in payments GET - Fetching appointments with filters:", {
      booking_source: "admin",
      status: ["TASTING_CONFIRMED", "PENDING_TASTING_CONFIRMATION", "pending"],
      payment_status: ["unpaid", "partially_paid"],
    })

    if (!supabaseAdmin) {
      console.error("[v0] Walk-in payments GET - Admin client not available")
      return NextResponse.json({ success: false, message: "Admin client not available" }, { status: 500 })
    }

    // First, get ALL walk-in appointments to see what we have
    const { data: allWalkIns, error: allError } = await supabaseAdmin
      .from("tbl_comprehensive_appointments")
      .select("id, booking_source, status, payment_status, contact_first_name, contact_last_name")
      .eq("booking_source", "admin")
      .limit(50)

    console.log("[v0] Walk-in payments GET - ALL walk-in appointments:", {
      count: allWalkIns?.length || 0,
      data: allWalkIns?.map(a => ({ id: a.id, status: a.status, payment_status: a.payment_status, name: `${a.contact_first_name} ${a.contact_last_name}` })),
    })

    const { data: appointments, error } = await supabaseAdmin
      .from("tbl_comprehensive_appointments")
      .select("*")
      .eq("booking_source", "admin")
      .in("status", ["TASTING_CONFIRMED", "PENDING_TASTING_CONFIRMATION", "TASTING_COMPLETED", "pending"]) // Include all tasting and payment-ready statuses
      .in("payment_status", ["unpaid", "partially_paid"]) // Include partially paid for remaining balance
      .order("created_at", { ascending: false })

    if (error) {
      console.error("[v0] Walk-in payments GET - Error fetching:", error)
      return NextResponse.json({ success: false, message: "Failed to fetch walk-in payments", error }, { status: 500 })
    }

    console.log("[v0] Walk-in payments GET - Filtered appointments:", {
      count: appointments?.length || 0,
      appointments: appointments?.map((a) => ({
        id: a.id,
        status: a.status,
        payment_status: a.payment_status,
        booking_source: a.booking_source,
        name: `${a.contact_first_name} ${a.contact_last_name}`,
      })),
    })

    return NextResponse.json(
      {
        success: true,
        appointments: appointments || [],
        _debug: {
          allWalkIns: allWalkIns?.map(a => ({ id: a.id, status: a.status, payment_status: a.payment_status, name: `${a.contact_first_name} ${a.contact_last_name}` })) || [],
          filteredCount: appointments?.length || 0,
          filterCriteria: {
            booking_source: "admin",
            status: ["TASTING_CONFIRMED", "PENDING_TASTING_CONFIRMATION", "TASTING_COMPLETED", "pending"],
            payment_status: ["unpaid", "partially_paid"],
          },
        },
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
