import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export async function POST() {
  try {
    console.log("🔧 Fixing status constraint...")

    // First, let's check the current constraint
    const { data: constraintCheck, error: constraintError } = await supabaseAdmin.rpc("exec_sql", {
      sql: `
        SELECT conname, pg_get_constraintdef(oid) as definition
        FROM pg_constraint 
        WHERE conname LIKE '%status_check%' 
        AND conrelid = 'tbl_comprehensive_appointments'::regclass;
      `,
    })

    console.log("Current constraint:", constraintCheck)

    // Drop the existing constraint
    const { error: dropError } = await supabaseAdmin.rpc("exec_sql", {
      sql: `
        ALTER TABLE tbl_comprehensive_appointments 
        DROP CONSTRAINT IF EXISTS tbl_comprehensive_appointments_status_check;
      `,
    })

    if (dropError) {
      console.error("Error dropping constraint:", dropError)
    } else {
      console.log("✅ Dropped old constraint")
    }

    // Add the new constraint with TASTING_CONFIRMED
    const { error: addError } = await supabaseAdmin.rpc("exec_sql", {
      sql: `
        ALTER TABLE tbl_comprehensive_appointments 
        ADD CONSTRAINT tbl_comprehensive_appointments_status_check 
        CHECK (status IN (
          'pending',
          'confirmed', 
          'cancelled', 
          'completed',
          'PENDING_TASTING_CONFIRMATION',
          'TASTING_CONFIRMED',
          'TASTING_SCHEDULED',
          'NEEDS_RESCHEDULE',
          'TASTING_RESCHEDULE_REQUESTED',
          'paid',
          'unpaid',
          'partially_paid'
        ));
      `,
    })

    if (addError) {
      console.error("Error adding new constraint:", addError)
      return NextResponse.json(
        {
          success: false,
          error: "Failed to add new constraint",
          details: addError,
        },
        { status: 500 },
      )
    }

    console.log("✅ Added new constraint with TASTING_CONFIRMED")

    // Now try to update the appointments again
    const { data: confirmedTastings, error: tastingError } = await supabaseAdmin
      .from("tbl_food_tastings")
      .select("appointment_id, status, confirmed_at")
      .eq("status", "confirmed")

    if (tastingError) {
      return NextResponse.json({ error: tastingError.message }, { status: 500 })
    }

    const updates = []

    // Update each corresponding appointment
    for (const tasting of confirmedTastings || []) {
      if (tasting.appointment_id) {
        const { error: updateError } = await supabaseAdmin
          .from("tbl_comprehensive_appointments")
          .update({
            status: "TASTING_CONFIRMED",
            updated_at: new Date().toISOString(),
          })
          .eq("id", tasting.appointment_id)

        if (updateError) {
          console.error(`Failed to update appointment ${tasting.appointment_id}:`, updateError)
          updates.push({ appointment_id: tasting.appointment_id, success: false, error: updateError.message })
        } else {
          console.log(`✅ Updated appointment ${tasting.appointment_id} to TASTING_CONFIRMED`)
          updates.push({ appointment_id: tasting.appointment_id, success: true })
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: "Status constraint fixed and appointments updated",
      updates,
    })
  } catch (error) {
    console.error("Error fixing status constraint:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
