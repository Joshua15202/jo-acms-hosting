import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const tastingToken = searchParams.get("token")
  const action = searchParams.get("action")

  console.log("🔍 Tasting confirmation request:", { tastingToken, action })

  if (!tastingToken) {
    return NextResponse.json(
      {
        success: false,
        error: "Missing confirmation token",
      },
      { status: 400 },
    )
  }

  try {
    // Get the tasting record from tbl_food_tastings
    console.log("Looking for tasting with token:", tastingToken)

    const { data: tasting, error: tastingError } = await supabaseAdmin
      .from("tbl_food_tastings")
      .select("*")
      .eq("tasting_token", tastingToken)
      .single()

    if (tastingError || !tasting) {
      console.error("❌ Tasting not found:", tastingError)

      // If no action specified, redirect to error page
      if (!action) {
        return NextResponse.redirect(new URL("/error?message=Tasting appointment not found", request.url))
      }

      return NextResponse.json(
        {
          success: false,
          error: "Tasting appointment not found",
        },
        { status: 404 },
      )
    }

    console.log("✅ Found tasting:", tasting)

    // Handle different actions
    if (action === "confirm") {
      // Check if already confirmed
      if (tasting.status === "confirmed") {
        console.log("ℹ️ Tasting already confirmed")

        if (tasting.appointment_id) {
          const { data: appointment } = await supabaseAdmin
            .from("tbl_comprehensive_appointments")
            .select("status")
            .eq("id", tasting.appointment_id)
            .single()

          console.log("[v0] Current appointment status:", appointment?.status)

          // If appointment is still PENDING_TASTING_CONFIRMATION, update it
          if (appointment?.status === "PENDING_TASTING_CONFIRMATION") {
            console.log("[v0] Appointment status needs updating, attempting update...")
            const now = new Date().toISOString()

            const { error: appointmentUpdateError } = await supabaseAdmin
              .from("tbl_comprehensive_appointments")
              .update({
                status: "TASTING_CONFIRMED",
                updated_at: now,
              })
              .eq("id", tasting.appointment_id)

            if (appointmentUpdateError) {
              console.error("[v0] ❌ Failed to update appointment status:", appointmentUpdateError)
              console.error("[v0] Error code:", appointmentUpdateError.code)
              console.error("[v0] Error message:", appointmentUpdateError.message)
              console.error("[v0] Error details:", appointmentUpdateError.details)
            } else {
              console.log("[v0] ✅ Appointment status updated to TASTING_CONFIRMED")
            }
          }
        }

        // Always redirect to confirmation page with already confirmed status
        return NextResponse.redirect(
          new URL(`/tasting/confirm?token=${tastingToken}&status=already_confirmed`, request.url),
        )
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
            status: "TASTING_CONFIRMED",
            updated_at: now,
          })
          .eq("id", tasting.appointment_id)

        if (appointmentUpdateError) {
          console.error("[v0] ❌ Failed to update appointment status to TASTING_CONFIRMED")
          console.error("[v0] Error code:", appointmentUpdateError.code)
          console.error("[v0] Error message:", appointmentUpdateError.message)
          console.error("[v0] Error details:", appointmentUpdateError.details)
          console.error("[v0] Error hint:", appointmentUpdateError.hint)
        } else {
          console.log("✅ Appointment status updated to TASTING_CONFIRMED")
        }
      } else {
        console.warn("⚠️ No appointment_id found in tasting record")
      }

      console.log("✅ Tasting confirmation completed")

      // Always redirect to the confirmation page with success status
      // This ensures users see a proper UI instead of JSON
      return NextResponse.redirect(
        new URL(`/tasting/confirm?token=${tastingToken}&status=confirmed`, request.url),
      )
    } else if (action === "reschedule") {
      console.log("📅 Reschedule requested")
      return NextResponse.redirect(new URL(`/tasting-reschedule?token=${tastingToken}`, request.url))
    } else {
      // No action specified - redirect to confirmation page
      return NextResponse.redirect(new URL(`/tasting/confirm?token=${tastingToken}`, request.url))
    }
  } catch (error) {
    console.error("❌ Error in tasting confirmation:", error)

    if (!action) {
      return NextResponse.redirect(
        new URL("/error?message=An error occurred while processing your request", request.url),
      )
    }

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

// Add POST method for direct API calls
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { tastingToken } = body

    if (!tastingToken) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing confirmation token",
        },
        { status: 400 },
      )
    }

    // Create a new URL with the token and action
    const confirmUrl = new URL(request.url)
    confirmUrl.searchParams.set("token", tastingToken)
    confirmUrl.searchParams.set("action", "confirm")

    // Call the GET method with the constructed URL
    const confirmRequest = new Request(confirmUrl.toString(), {
      method: "GET",
    })

    return await GET(confirmRequest)
  } catch (error) {
    console.error("❌ Error in POST tasting confirmation:", error)
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
