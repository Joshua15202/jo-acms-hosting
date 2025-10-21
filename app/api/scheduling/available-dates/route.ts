import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET(request: NextRequest) {
  try {
    console.log("=== FETCHING AVAILABLE DATES ===")

    // Set no-cache headers
    const headers = {
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
      Pragma: "no-cache",
      Expires: "0",
    }

    const today = new Date()
    const sixMonthsLater = new Date()
    sixMonthsLater.setMonth(today.getMonth() + 6)

    const startDate = today.toISOString().split("T")[0]
    const endDate = sixMonthsLater.toISOString().split("T")[0]

    console.log("Date range:", startDate, "to", endDate)

    // Get all appointments in the next 6 months with active statuses
    const { data: appointments, error } = await supabaseAdmin
      .from("tbl_comprehensive_appointments")
      .select("event_date, status")
      .gte("event_date", startDate)
      .lte("event_date", endDate)
      .in("status", ["pending", "confirmed", "PENDING_TASTING_CONFIRMATION", "TASTING_CONFIRMED", "TASTING_COMPLETED"])

    if (error) {
      console.error("Error fetching appointments:", error)
      throw error
    }

    console.log("Total appointments found:", appointments?.length || 0)

    // Count appointments per date
    const dateAppointmentCounts = new Map<string, number>()

    appointments?.forEach((apt) => {
      const currentCount = dateAppointmentCounts.get(apt.event_date) || 0
      dateAppointmentCounts.set(apt.event_date, currentCount + 1)
    })

    console.log("Date appointment counts:", Array.from(dateAppointmentCounts.entries()))

    // Find dates with 4 or more appointments (fully booked)
    const unavailableDates: string[] = []
    const availableDates: string[] = []

    // Generate all dates in the range
    const currentDate = new Date(today)
    while (currentDate <= sixMonthsLater) {
      const dateStr = currentDate.toISOString().split("T")[0]
      const appointmentCount = dateAppointmentCounts.get(dateStr) || 0

      if (appointmentCount >= 4) {
        unavailableDates.push(dateStr)
        console.log(`Date ${dateStr} is UNAVAILABLE with ${appointmentCount} appointments`)
      } else {
        availableDates.push(dateStr)
      }

      currentDate.setDate(currentDate.getDate() + 1)
    }

    console.log("Total available dates:", availableDates.length)
    console.log("Total unavailable dates:", unavailableDates.length)
    console.log("Unavailable dates list:", unavailableDates)

    return NextResponse.json(
      {
        success: true,
        availableDates,
        unavailableDates,
        timestamp: new Date().toISOString(),
      },
      { headers },
    )
  } catch (error) {
    console.error("Available dates fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch available dates" }, { status: 500 })
  }
}
