import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get("token")

  try {
    console.log("=== Debug Tasting Flow ===")

    // Check all tastings
    const { data: allTastings, error: tastingsError } = await supabaseAdmin
      .from("tbl_food_tastings")
      .select("*")
      .order("created_at", { ascending: false })

    console.log("All tastings:", allTastings)

    // Check all appointments
    const { data: allAppointments, error: appointmentsError } = await supabaseAdmin
      .from("tbl_comprehensive_appointments")
      .select("*")
      .order("created_at", { ascending: false })

    console.log("All appointments:", allAppointments)

    // If token provided, check specific tasting
    if (token) {
      const { data: specificTasting, error: specificError } = await supabaseAdmin
        .from("tbl_food_tastings")
        .select("*")
        .eq("tasting_token", token)
        .single()

      console.log("Specific tasting for token:", token, specificTasting)
    }

    return NextResponse.json({
      success: true,
      allTastings,
      allAppointments,
      specificTasting: token
        ? await supabaseAdmin.from("tbl_food_tastings").select("*").eq("tasting_token", token).single()
        : null,
    })
  } catch (error) {
    console.error("Debug error:", error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    })
  }
}
