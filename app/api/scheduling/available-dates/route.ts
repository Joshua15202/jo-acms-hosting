import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    console.log("=== GETTING AVAILABLE DATES ===")

    // Set no-cache headers
    const headers = {
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
      Pragma: "no-cache",
      Expires: "0",
    }

    const today = new Date()
    const sixMonthsLater = new Date()
    sixMonthsLater.setMonth(today.getMonth() + 6)

    const availableDates: string[] = []
    const unavailableDates: string[] = []

    // Add 7 days to current date for preparation period
    const minimumBookingDate = new Date(today)
    minimumBookingDate.setDate(minimumBookingDate.getDate() + 7)

    const currentDate = new Date(minimumBookingDate)

    console.log(
      "Checking dates from",
      minimumBookingDate.toISOString().split("T")[0],
      "to",
      sixMonthsLater.toISOString().split("T")[0],
    )

    while (currentDate <= sixMonthsLater) {
      const dateString = currentDate.toISOString().split("T")[0]

      // Check how many appointments exist for this date with active statuses
      const { count, error } = await supabaseAdmin
        .from("tbl_comprehensive_appointments")
        .select("id", { count: "exact", head: true })
        .eq("event_date", dateString)
        .in("status", [
          "pending",
          "confirmed",
          "PENDING_TASTING_CONFIRMATION",
          "TASTING_CONFIRMED",
          "TASTING_COMPLETED",
        ])

      if (error) {
        console.error("Error checking date:", dateString, error)
      } else {
        const appointmentCount = count || 0
        if (appointmentCount >= 4) {
          unavailableDates.push(dateString)
          console.log(`Date ${dateString} is FULLY BOOKED (${appointmentCount}/4)`)
        } else {
          availableDates.push(dateString)
        }
      }

      currentDate.setDate(currentDate.getDate() + 1)
    }

    console.log(`Total available dates: ${availableDates.length}`)
    console.log(`Total unavailable dates: ${unavailableDates.length}`)

    return NextResponse.json(
      {
        success: true,
        availableDates,
        unavailableDates,
        totalDaysChecked: Math.ceil((sixMonthsLater.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)),
        timestamp: new Date().toISOString(),
      },
      { headers },
    )
  } catch (error) {
    console.error("Available dates check error:", error)
    return NextResponse.json({ error: "Failed to get available dates" }, { status: 500 })
  }
}
