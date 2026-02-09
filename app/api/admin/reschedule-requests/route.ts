import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"
import { cookies } from "next/headers"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const cookieStore = await cookies()
    const adminAuthenticated = cookieStore.get("adminAuthenticated")?.value

    if (adminAuthenticated !== "true") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const { data: requests, error } = await supabaseAdmin
      .from("tbl_reschedule_requests")
      .select(
        `
        *,
        appointment:tbl_comprehensive_appointments (
          id,
          event_type,
          guest_count,
          venue_address,
          total_package_amount,
          payment_status,
          status,
          contact_full_name,
          contact_email,
          contact_phone
        )
      `,
      )
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching reschedule requests:", error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: requests })
  } catch (error) {
    console.error("Error in GET /api/admin/reschedule-requests:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
