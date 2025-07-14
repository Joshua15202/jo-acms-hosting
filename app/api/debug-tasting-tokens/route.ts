import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    console.log("🔍 Fetching all tasting records...")

    const { data: tastings, error } = await supabaseAdmin
      .from("tbl_food_tastings")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("❌ Error fetching tastings:", error)
      return NextResponse.json({ success: false, error })
    }

    console.log("✅ Found tastings:", tastings?.length || 0)

    // Also check the appointments
    const { data: appointments, error: appointmentsError } = await supabaseAdmin
      .from("tbl_comprehensive_appointments")
      .select("id, status, contact_email, event_date, created_at")
      .order("created_at", { ascending: false })

    if (appointmentsError) {
      console.error("❌ Error fetching appointments:", appointmentsError)
    }

    return NextResponse.json({
      success: true,
      tastings: tastings || [],
      appointments: appointments || [],
      totalTastings: tastings?.length || 0,
      totalAppointments: appointments?.length || 0,
    })
  } catch (error) {
    console.error("❌ Error in debug tasting tokens:", error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
    })
  }
}
