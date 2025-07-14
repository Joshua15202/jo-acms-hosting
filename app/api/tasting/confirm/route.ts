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

        // If no action specified, redirect to success page
        if (!action) {
          return NextResponse.redirect(new URL("/tasting-confirmed?already=true", request.url))
        }

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

      // If this is a direct API call (with action), return JSON
      if (action) {
        return NextResponse.json({
          success: true,
          message: "Your tasting appointment has been confirmed successfully!",
          appointment: { ...tasting, status: "confirmed", confirmed_at: now },
        })
      }

      // Otherwise redirect to success page
      return NextResponse.redirect(new URL("/tasting-confirmed", request.url))
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
