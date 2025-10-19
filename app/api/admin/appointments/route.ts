import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export async function GET() {
  try {
    // Disable caching
    const headers = {
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    }

    console.log("=== Fetching appointments with menu items ===")

    const { data: appointments, error } = await supabaseAdmin
      .from("tbl_comprehensive_appointments")
      .select(`
        id,
        user_id,
        event_type,
        event_date,
        event_time,
        guest_count,
        venue_address,
        budget_min,
        budget_max,
        special_requests,
        status,
        admin_notes,
        created_at,
        updated_at,
        celebrant_gender,
        menu_items,
        tbl_users (
          id,
          full_name,
          email,
          phone
        )
      `)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching appointments:", error)
      return NextResponse.json(
        {
          success: false,
          message: "Failed to fetch appointments",
          error: error.message,
        },
        { status: 500, headers },
      )
    }

    console.log(`Fetched ${appointments?.length || 0} appointments`)

    // Log menu items for debugging
    if (appointments && appointments.length > 0) {
      console.log("Sample appointment data:", JSON.stringify(appointments[0], null, 2))

      appointments.forEach((apt, index) => {
        if (apt.menu_items) {
          console.log(`Appointment ${index} (${apt.id}) has menu_items:`, typeof apt.menu_items, apt.menu_items)
        } else {
          console.log(`Appointment ${index} (${apt.id}) has NO menu_items`)
        }
      })
    }

    return NextResponse.json(
      {
        success: true,
        appointments: appointments || [],
      },
      { headers },
    )
  } catch (error) {
    console.error("Unexpected error in appointments route:", error)
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
