import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const tastingToken = searchParams.get("token")

  console.log("🔍 Skip tasting request:", { tastingToken })

  if (!tastingToken) {
    return NextResponse.redirect(new URL("/error?message=Missing confirmation token", request.url))
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
      return NextResponse.redirect(new URL("/error?message=Tasting appointment not found", request.url))
    }

    console.log("✅ Found tasting:", tasting)

    // Check if already processed
    if (tasting.status === "skipped") {
      console.log("ℹ️ Tasting already skipped, redirecting to payment")
      return NextResponse.redirect(
        new URL(`/payment?appointmentId=${tasting.appointment_id}&skipped=true`, request.url),
      )
    }

    const now = new Date().toISOString()

    // 1. Update the tasting record to "skipped"
    console.log("🔄 Marking tasting as skipped...")
    const { error: updateTastingError } = await supabaseAdmin
      .from("tbl_food_tastings")
      .update({
        status: "skipped",
        updated_at: now,
      })
      .eq("tasting_token", tastingToken)

    if (updateTastingError) {
      console.error("❌ Failed to update tasting:", updateTastingError)
      return NextResponse.redirect(new URL("/error?message=Failed to process request", request.url))
    }

    console.log("✅ Tasting record marked as skipped")

    // 2. Update the main appointment status to "confirmed" (ready for payment)
    if (tasting.appointment_id) {
      console.log("🔄 Updating appointment status for ID:", tasting.appointment_id)

      const { error: appointmentUpdateError } = await supabaseAdmin
        .from("tbl_comprehensive_appointments")
        .update({
          status: "confirmed",
          updated_at: now,
        })
        .eq("id", tasting.appointment_id)

      if (appointmentUpdateError) {
        console.error("❌ Failed to update appointment status:", appointmentUpdateError)
        // Continue anyway, we can still redirect to payment
      } else {
        console.log("✅ Appointment status updated to confirmed")
      }

      // 3. Redirect to payment page
      console.log("✅ Redirecting to payment page")
      return NextResponse.redirect(
        new URL(`/payment?appointmentId=${tasting.appointment_id}&skipped=true`, request.url),
      )
    } else {
      console.warn("⚠️ No appointment_id found in tasting record")
      return NextResponse.redirect(new URL("/error?message=Invalid appointment data", request.url))
    }
  } catch (error) {
    console.error("❌ Error in skip tasting:", error)
    return NextResponse.redirect(new URL("/error?message=An error occurred while processing your request", request.url))
  }
}
