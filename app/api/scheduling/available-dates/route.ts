import { type NextRequest, NextResponse } from "next/server"
import { SchedulingService } from "@/lib/scheduling-service"
import { supabaseAdmin } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    console.log("API GET /api/scheduling/available-dates: Getting available dates")

    // Get available dates for the next 6 months
    const availableDates = await SchedulingService.getAvailableDates()

    // Get unavailable dates (dates that are fully booked - 4/4 appointments)
    const today = new Date()
    const sixMonthsLater = new Date()
    sixMonthsLater.setMonth(today.getMonth() + 6)

    const unavailableDates: string[] = []
    const currentDate = new Date(today)

    console.log(
      "Checking dates from",
      today.toISOString().split("T")[0],
      "to",
      sixMonthsLater.toISOString().split("T")[0],
    )

    while (currentDate <= sixMonthsLater) {
      const dateString = currentDate.toISOString().split("T")[0]

      // Check if this date has 4 or more appointments
      const { count, error } = await supabaseAdmin
        .from("tbl_comprehensive_appointments")
        .select("id", { count: "exact", head: true })
        .eq("event_date", dateString)
        .in("status", ["pending", "confirmed"])

      if (error) {
        console.error("Error checking date availability:", error)
      } else if ((count || 0) >= 4) {
        unavailableDates.push(dateString)
        console.log(`Date ${dateString} is fully booked with ${count} appointments`)
      }

      currentDate.setDate(currentDate.getDate() + 1)
    }

    console.log(`Found ${availableDates.length} available dates and ${unavailableDates.length} unavailable dates`)

    return NextResponse.json({
      success: true,
      availableDates,
      unavailableDates,
      totalDaysChecked: Math.ceil((sixMonthsLater.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)),
    })
  } catch (error) {
    console.error("Available dates check error:", error)
    return NextResponse.json({ error: "Failed to get available dates" }, { status: 500 })
  }
}
