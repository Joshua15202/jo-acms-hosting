import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    // Fetch all cancellation requests with appointment and user details
    const { data: requests, error } = await supabaseAdmin
      .from("tbl_cancellation_requests")
      .select(`
        *,
        appointment:tbl_comprehensive_appointments(
          id,
          event_type,
          event_date,
          total_package_amount,
          payment_status,
          status
        )
      `)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching cancellation requests:", error)
      return NextResponse.json({ success: false, error: "Failed to fetch cancellation requests" }, { status: 500 })
    }

    // Get user details for each request
    const requestsWithUsers = await Promise.all(
      requests.map(async (request) => {
        const { data: user } = await supabaseAdmin
          .from("tbl_users")
          .select("first_name, last_name, email, phone")
          .eq("id", request.user_id)
          .single()

        return {
          ...request,
          user,
        }
      }),
    )

    return NextResponse.json({
      success: true,
      data: requestsWithUsers,
    })
  } catch (error) {
    console.error("Error in cancellation requests:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
