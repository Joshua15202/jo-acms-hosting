import { type NextRequest, NextResponse } from "next/server"
import { SchedulingService } from "@/lib/scheduling-service"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get("date")
    const eventType = searchParams.get("eventType")

    if (!date || !eventType) {
      return NextResponse.json({ error: "Date and event type are required" }, { status: 400 })
    }

    const recommendedSlots = await SchedulingService.getRecommendedTimeSlots(date, eventType)
    const availableSlots = await SchedulingService.getAvailableTimeSlots(date)

    // Filter recommendations to only include available slots
    const availableRecommendations = recommendedSlots.filter((slot) =>
      availableSlots.some((available) => available.time_slot === slot),
    )

    return NextResponse.json({
      success: true,
      recommendedSlots: availableRecommendations,
      allAvailable: availableSlots.map((slot) => slot.time_slot),
    })
  } catch (error) {
    console.error("Recommendations error:", error)
    return NextResponse.json({ error: "Failed to get recommendations" }, { status: 500 })
  }
}
