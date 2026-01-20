import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

// Force dynamic rendering - prevent any caching
export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET(request: NextRequest) {
  try {
    // Fetch cancelled appointments with user details
    const { data: cancelledAppointments, error } = await supabaseAdmin
      .from("tbl_comprehensive_appointments")
      .select(`
        id,
        user_id,
        event_type,
        event_date,
        event_time,
        total_package_amount,
        payment_status,
        status,
        admin_notes,
        created_at,
        updated_at,
        guest_count,
        venue_address,
        contact_first_name,
        contact_last_name,
        contact_email,
        contact_phone
      `)
      .eq("status", "cancelled")
      .order("updated_at", { ascending: false })

    if (error) {
      console.error("Error fetching cancelled appointments:", error)
      return NextResponse.json({ success: false, error: "Failed to fetch cancelled appointments" }, { status: 500 })
    }

    // Get user details for each cancelled appointment (skip walk-ins which don't have user_id)
    const requestsWithUsers = await Promise.all(
      cancelledAppointments.map(async (appointment) => {
        let user = null
        
        // If appointment has user_id, fetch user details
        if (appointment.user_id) {
          const { data: userData } = await supabaseAdmin
            .from("tbl_users")
            .select("first_name, last_name, email, phone, username")
            .eq("id", appointment.user_id)
            .single()
          user = userData
        }

        // Extract cancellation reason from admin_notes
        const reasonMatch = appointment.admin_notes?.match(/Reason: (.+?)(?:\n|$)/)
        const reason = reasonMatch ? reasonMatch[1] : "No reason provided"

        // Check if cancellation has been reviewed by checking for admin feedback in admin_notes
        const hasAdminReview = appointment.admin_notes?.includes("Admin feedback:") || appointment.admin_notes?.includes("approved") || appointment.admin_notes?.includes("rejected")
        const requestStatus = hasAdminReview ? "approved" : "pending"

        return {
          id: appointment.id,
          appointment_id: appointment.id,
          user_id: appointment.user_id,
          reason,
          status: requestStatus,
          attachment_url: null,
          admin_feedback: null,
          created_at: appointment.created_at,
          updated_at: appointment.updated_at,
          appointment: {
            id: appointment.id,
            event_type: appointment.event_type,
            event_date: appointment.event_date,
            event_time: appointment.event_time,
            total_package_amount: appointment.total_package_amount,
            payment_status: appointment.payment_status,
            status: appointment.status,
            guests: appointment.guest_count,
            venue: appointment.venue,
          },
          user: user || {
            first_name: appointment.contact_first_name || "Walk-In",
            last_name: appointment.contact_last_name || "Customer",
            email: appointment.contact_email || "N/A",
            phone: appointment.contact_phone || "N/A",
          },
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
