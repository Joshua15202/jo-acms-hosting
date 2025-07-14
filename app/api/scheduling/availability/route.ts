import { type NextRequest, NextResponse } from "next/server"
import { SchedulingService } from "@/lib/scheduling-service"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get("date")

    if (!date) {
      return NextResponse.json({ error: "Date is required" }, { status: 400 })
    }

    // Get available slots, but ensure all 4 time slots are always returned
    const availableSlots = await SchedulingService.getAvailableTimeSlots(date)

    return NextResponse.json({
      success: true,
      availableSlots,
      date,
    })
  } catch (error) {
    console.error("Availability check error:", error)
    return NextResponse.json({ error: "Failed to check availability" }, { status: 500 })
  }
}
