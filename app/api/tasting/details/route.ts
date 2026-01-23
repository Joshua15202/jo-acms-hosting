import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get("token")

  if (!token) {
    return NextResponse.json(
      {
        success: false,
        error: "Missing token",
      },
      { status: 400 },
    )
  }

  try {
    // Get the tasting record with related appointment data from tbl_food_tastings
    const { data: tasting, error: tastingError } = await supabaseAdmin
      .from("tbl_food_tastings")
      .select(`
        *,
        tbl_comprehensive_appointments (
          id,
          event_type,
          guest_count,
          event_date,
          event_time,
          venue_address,
          special_requests,
          contact_first_name,
          contact_last_name,
          contact_email,
          contact_phone,
          status
        )
      `)
      .eq("tasting_token", token)
      .single()

    if (tastingError || !tasting) {
      console.error("❌ Tasting not found:", tastingError)
      return NextResponse.json(
        {
          success: false,
          error: "Tasting appointment not found",
        },
        { status: 404 },
      )
    }

    return NextResponse.json({
      success: true,
      tasting,
    })
  } catch (error) {
    console.error("❌ Error fetching tasting details:", error)
    return NextResponse.json(
      {
        success: false,
        error: "An error occurred while fetching tasting details",
      },
      { status: 500 },
    )
  }
}
