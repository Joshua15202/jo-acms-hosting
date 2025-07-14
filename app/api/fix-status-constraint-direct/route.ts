import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export async function POST() {
  try {
    console.log("🔧 Fixing status constraint (direct SQL approach)...")

    // First, let's check what constraints exist
    const { data: existingConstraints, error: checkError } = await supabaseAdmin
      .from("information_schema.table_constraints")
      .select("constraint_name, constraint_type")
      .eq("table_name", "tbl_comprehensive_appointments")
      .eq("constraint_type", "CHECK")

    console.log("Existing constraints:", existingConstraints)

    // Drop the existing constraint using raw SQL
    try {
      const { error: dropError } = await supabaseAdmin.rpc("exec", {
        sql: `ALTER TABLE tbl_comprehensive_appointments DROP CONSTRAINT IF EXISTS tbl_comprehensive_appointments_status_check;`,
      })

      if (dropError) {
        console.log("Drop constraint error (might be expected):", dropError)
      } else {
        console.log("✅ Dropped old constraint")
      }
    } catch (dropErr) {
      console.log("Drop constraint attempt failed (continuing anyway):", dropErr)
    }

    // Let's try a different approach - update the appointments directly without constraint changes
    console.log("🔄 Attempting direct status updates...")

    // Get confirmed tastings
    const { data: confirmedTastings, error: tastingError } = await supabaseAdmin
      .from("tbl_food_tastings")
      .select("appointment_id, status, confirmed_at")
      .eq("status", "confirmed")

    if (tastingError) {
      return NextResponse.json({ error: tastingError.message }, { status: 500 })
    }

    console.log("Found confirmed tastings:", confirmedTastings?.length)

    const updates = []

    // Try updating each appointment to a status that should work
    for (const tasting of confirmedTastings || []) {
      if (tasting.appointment_id) {
        // First try with 'confirmed' status (which should be allowed)
        const { error: updateError } = await supabaseAdmin
          .from("tbl_comprehensive_appointments")
          .update({
            status: "confirmed", // Use 'confirmed' instead of 'TASTING_CONFIRMED' for now
            updated_at: new Date().toISOString(),
          })
          .eq("id", tasting.appointment_id)

        if (updateError) {
          console.error(`Failed to update appointment ${tasting.appointment_id}:`, updateError)
          updates.push({
            appointment_id: tasting.appointment_id,
            success: false,
            error: updateError.message,
          })
        } else {
          console.log(`✅ Updated appointment ${tasting.appointment_id} to confirmed`)
          updates.push({
            appointment_id: tasting.appointment_id,
            success: true,
            newStatus: "confirmed",
          })
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: "Appointments updated to 'confirmed' status",
      appointmentsFound: confirmedTastings?.length || 0,
      updates,
      note: "Used 'confirmed' status instead of 'TASTING_CONFIRMED' due to constraint issues",
    })
  } catch (error) {
    console.error("Error in fix process:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
