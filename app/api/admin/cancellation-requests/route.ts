import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

// Force dynamic rendering - prevent any caching
export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET(request: NextRequest) {
  try {
    console.log("[v0] Fetching cancellation requests from tbl_cancellation_requests")

    // Fetch cancellation requests from the correct table
    const { data: cancellationRequests, error } = await supabaseAdmin
      .from("tbl_cancellation_requests")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("[v0] Error fetching cancellation requests:", error)
      return NextResponse.json({ success: false, error: "Failed to fetch cancellation requests" }, { status: 500 })
    }

    console.log("[v0] Found cancellation requests:", cancellationRequests?.length || 0)

    // Get appointment and user details for each cancellation request
    const requestsWithDetails = await Promise.all(
      (cancellationRequests || []).map(async (request) => {
        // Fetch appointment details
        const { data: appointment } = await supabaseAdmin
          .from("tbl_comprehensive_appointments")
          .select("*")
          .eq("id", request.appointment_id)
          .single()

        // Fetch user details
        let user = null
        if (request.user_id) {
          const { data: userData } = await supabaseAdmin
            .from("tbl_users")
            .select("first_name, last_name, email, phone, username")
            .eq("id", request.user_id)
            .single()
          user = userData
        }

        return {
          id: request.id,
          appointment_id: request.appointment_id,
          user_id: request.user_id,
          reason: request.reason || "No reason provided",
          status: request.status,
          attachment_url: request.attachment_url,
          admin_feedback: request.admin_feedback,
          created_at: request.created_at,
          updated_at: request.updated_at,
          appointment: appointment
            ? {
                id: appointment.id,
                event_type: appointment.event_type,
                event_date: appointment.event_date,
                event_time: appointment.event_time,
                total_package_amount: appointment.total_package_amount,
                payment_status: appointment.payment_status,
                status: appointment.status,
                guests: appointment.guest_count,
                venue: appointment.venue_address,
              }
            : null,
          user: user || {
            first_name: appointment?.contact_first_name || "Unknown",
            last_name: appointment?.contact_last_name || "Customer",
            email: appointment?.contact_email || "N/A",
            phone: appointment?.contact_phone || "N/A",
            username: appointment?.contact_email || "N/A",
          },
        }
      }),
    )

    console.log("[v0] Returning", requestsWithDetails.length, "cancellation requests")

    return NextResponse.json({
      success: true,
      data: requestsWithDetails,
    })
  } catch (error) {
    console.error("[v0] Error in cancellation requests:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
