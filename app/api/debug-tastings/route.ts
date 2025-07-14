import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const email = searchParams.get("email")

  try {
    console.log("🔍 Debugging tastings table...")

    // Check if tbl_food_tastings table exists and get all records
    const { data: tastings, error: tastingsError } = await supabaseAdmin.from("tbl_food_tastings").select("*").limit(10)

    console.log("📊 Tastings table query result:", { tastings, tastingsError })

    // Also check if there are any records for the specific email
    let userTastings = null
    if (email) {
      const { data: userTastingsData, error: userTastingsError } = await supabaseAdmin
        .from("tbl_food_tastings")
        .select("*")
        .eq("email", email)

      userTastings = { data: userTastingsData, error: userTastingsError }
      console.log(`📧 Tastings for ${email}:`, userTastings)
    }

    // Check recent appointments to see if tastings should have been created
    const { data: recentAppointments, error: appointmentsError } = await supabaseAdmin
      .from("tbl_comprehensive_appointments")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(5)

    console.log("📅 Recent appointments:", { recentAppointments, appointmentsError })

    return NextResponse.json({
      success: true,
      debug: {
        tastings: {
          data: tastings,
          error: tastingsError,
          count: tastings?.length || 0,
        },
        userTastings: email ? userTastings : null,
        recentAppointments: {
          data: recentAppointments,
          error: appointmentsError,
          count: recentAppointments?.length || 0,
        },
      },
    })
  } catch (error) {
    console.error("❌ Error debugging tastings:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to debug tastings",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
