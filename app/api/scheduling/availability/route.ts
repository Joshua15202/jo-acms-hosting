import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get("date")

    if (!date) {
      return NextResponse.json({ error: "Date is required" }, { status: 400 })
    }

    console.log("=== CHECKING AVAILABILITY FOR DATE:", date, "===")

    // Set no-cache headers
    const headers = {
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
      Pragma: "no-cache",
      Expires: "0",
    }

    // Define all possible time slots
    const allTimeSlots = [
      "6:00 AM",
      "7:00 AM",
      "8:00 AM",
      "9:00 AM",
      "10:00 AM",
      "11:00 AM",
      "12:00 PM",
      "1:00 PM",
      "2:00 PM",
      "3:00 PM",
      "4:00 PM",
      "5:00 PM",
      "6:00 PM",
      "7:00 PM",
    ]

    // Get all appointments for this date with active statuses
    const { data: appointments, error: appointmentsError } = await supabaseAdmin
      .from("tbl_comprehensive_appointments")
      .select("event_time, status")
      .eq("event_date", date)
      .in("status", ["pending", "confirmed", "PENDING_TASTING_CONFIRMATION", "TASTING_CONFIRMED", "TASTING_COMPLETED"])

    if (appointmentsError) {
      console.error("Error fetching appointments:", appointmentsError)
      throw appointmentsError
    }

    console.log("Found appointments:", appointments)

    // Create a map of booked time slots
    const bookedTimeSlots = new Set(appointments?.map((apt) => apt.event_time) || [])

    console.log("Booked time slots:", Array.from(bookedTimeSlots))

    // Build the availability response
    const availableSlots = allTimeSlots.map((timeSlot) => {
      const isBooked = bookedTimeSlots.has(timeSlot)
      return {
        id: `${date}-${timeSlot}`,
        time_slot: timeSlot,
        max_capacity: 1,
        current_bookings: isBooked ? 1 : 0,
        is_available: !isBooked,
      }
    })

    console.log("Returning availability:", availableSlots)

    return NextResponse.json(
      {
        success: true,
        availableSlots,
        date,
        timestamp: new Date().toISOString(),
      },
      { headers },
    )
  } catch (error) {
    console.error("Availability check error:", error)
    return NextResponse.json({ error: "Failed to check availability" }, { status: 500 })
  }
}
