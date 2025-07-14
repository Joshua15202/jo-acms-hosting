import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { tastingToken } = body

    console.log("🔍 JSON Tasting confirmation request:", { tastingToken })

    if (!tastingToken) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing confirmation token",
        },
        { status: 400 },
      )
    }

    // Get the tasting record from tbl_food_tastings
    console.log("Looking for tasting with token:", tastingToken)

    const { data: tasting, error: tastingError } = await supabaseAdmin
      .from("tbl_food_tastings")
      .select("*")
      .eq("tasting_token", tastingToken)
      .single()

    if (tastingError || !tasting) {
      console.error("❌ Tasting not found:", tastingError)
      return NextResponse.json(
        {
          success: false,
          error: "Tasting appointment not found",
          details: tastingError,
        },
        { status: 404 },
      )
    }

    console.log("✅ Found tasting:", tasting)

    // Check if already confirmed
    if (tasting.status === "confirmed") {
      console.log("ℹ️ Tasting already confirmed")
      return NextResponse.json({
        success: true,
        alreadyConfirmed: true,
        message: "This tasting appointment has already been confirmed.",
        appointment: tasting,
      })
    }

    console.log("🔄 Confirming tasting...")

    const now = new Date().toISOString()

    // 1. Update the tasting record
    const { error: updateTastingError } = await supabaseAdmin
      .from("tbl_food_tastings")
      .update({
        status: "confirmed",
        confirmed_at: now,
        updated_at: now,
      })
      .eq("tasting_token", tastingToken)

    if (updateTastingError) {
      console.error("❌ Failed to update tasting:", updateTastingError)
      return NextResponse.json(
        {
          success: false,
          error: "Failed to confirm tasting",
          details: updateTastingError,
        },
        { status: 500 },
      )
    }

    console.log("✅ Tasting record updated")

    // 2. Update the main appointment status to "TASTING_CONFIRMED"
    if (tasting.appointment_id) {
      console.log("🔄 Updating appointment status for ID:", tasting.appointment_id)

      const { error: appointmentUpdateError } = await supabaseAdmin
        .from("tbl_comprehensive_appointments")
        .update({
          status: "TASTING_CONFIRMED", // Using "TASTING_CONFIRMED" instead of "confirmed"
          updated_at: now,
        })
        .eq("id", tasting.appointment_id)

      if (appointmentUpdateError) {
        console.error("❌ Failed to update appointment status:", appointmentUpdateError)
        console.error("Error details:", appointmentUpdateError)

        // If TASTING_CONFIRMED fails due to constraint, try "confirmed" as fallback
        console.log("🔄 Trying fallback status 'confirmed'...")
        const { error: fallbackError } = await supabaseAdmin
          .from("tbl_comprehensive_appointments")
          .update({
            status: "confirmed",
            updated_at: now,
          })
          .eq("id", tasting.appointment_id)

        if (fallbackError) {
          console.error("❌ Fallback also failed:", fallbackError)
          return NextResponse.json(
            {
              success: false,
              error: "Failed to update appointment status",
              details: fallbackError,
            },
            { status: 500 },
          )
        } else {
          console.log("✅ Appointment status updated to confirmed (fallback)")
        }
      } else {
        console.log("✅ Appointment status updated to TASTING_CONFIRMED")
      }
    } else {
      console.warn("⚠️ No appointment_id found in tasting record")
    }

    console.log("✅ Tasting confirmation completed")

    return NextResponse.json({
      success: true,
      message: "Your tasting appointment has been confirmed successfully!",
      appointment: { ...tasting, status: "confirmed", confirmed_at: now },
    })
  } catch (error) {
    console.error("❌ Error in JSON tasting confirmation:", error)
    return NextResponse.json(
      {
        success: false,
        error: "An error occurred while processing your request",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
