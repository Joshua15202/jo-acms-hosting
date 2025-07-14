import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export async function GET() {
  try {
    console.log("=== Admin: Fetching all appointments ===")

    // Fetch all appointments with user information
    const { data: appointments, error } = await supabaseAdmin
      .from("tbl_comprehensive_appointments")
      .select(`
        *,
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
        { status: 500 },
      )
    }

    console.log(`Found ${appointments?.length || 0} appointments`)
    console.log("Sample appointment:", appointments?.[0])

    return NextResponse.json({
      success: true,
      appointments: appointments || [],
      count: appointments?.length || 0,
    })
  } catch (error) {
    console.error("Unexpected error in admin appointments route:", error)
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
