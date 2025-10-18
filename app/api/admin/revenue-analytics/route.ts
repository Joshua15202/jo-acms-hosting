import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET() {
  try {
    const now = new Date()
    const currentYear = now.getFullYear()

    // Fetch all completed events from the past 12 months
    const twelveMonthsAgo = new Date(currentYear, now.getMonth() - 11, 1)

    const { data: events, error } = await supabase
      .from("tbl_comprehensive_appointments")
      .select("*")
      .eq("status", "completed")
      .gte("event_date", twelveMonthsAgo.toISOString().split("T")[0])
      .order("event_date", { ascending: true })

    if (error) throw error

    // Process monthly data
    const monthlyMap = new Map<string, { revenue: number; events: number }>()
    const eventTypeMap = new Map<string, number>()
    const monthlyEventsMap = new Map<string, { events: number; revenue: number; types: Map<string, number> }>()

    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ]

    // Initialize last 12 months
    for (let i = 11; i >= 0; i--) {
      const date = new Date(currentYear, now.getMonth() - i, 1)
      const monthKey = `${monthNames[date.getMonth()]} ${date.getFullYear()}`
      monthlyMap.set(monthKey, { revenue: 0, events: 0 })
      monthlyEventsMap.set(monthKey, { events: 0, revenue: 0, types: new Map() })
    }

    // Process events
    events?.forEach((event) => {
      const eventDate = new Date(event.event_date)
      const monthKey = `${monthNames[eventDate.getMonth()]} ${eventDate.getFullYear()}`
      const revenue = Number.parseFloat(event.total_package_amount || "0")

      // Update monthly data
      const monthData = monthlyMap.get(monthKey)
      if (monthData) {
        monthData.revenue += revenue
        monthData.events += 1
      }

      // Update event type data
      const currentCount = eventTypeMap.get(event.event_type) || 0
      eventTypeMap.set(event.event_type, currentCount + 1)

      // Update monthly events data for peak analysis
      const monthEventData = monthlyEventsMap.get(monthKey)
      if (monthEventData) {
        monthEventData.events += 1
        monthEventData.revenue += revenue
        const typeCount = monthEventData.types.get(event.event_type) || 0
        monthEventData.types.set(event.event_type, typeCount + 1)
      }
    })

    // Format monthly data
    const monthlyData = Array.from(monthlyMap.entries()).map(([month, data]) => ({
      month: month.split(" ")[0].substring(0, 3), // Short month name
      revenue: data.revenue,
      events: data.events,
    }))

    // Format event type data
    const totalEvents = events?.length || 0
    const eventTypeData = Array.from(eventTypeMap.entries())
      .map(([name, count]) => ({
        name,
        count,
        percentage: totalEvents > 0 ? Math.round((count / totalEvents) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count)

    // Find peak months
    const peakMonths = Array.from(monthlyEventsMap.entries())
      .map(([month, data]) => {
        // Find top event type for this month
        let topEventType = "N/A"
        let maxCount = 0
        data.types.forEach((count, type) => {
          if (count > maxCount) {
            maxCount = count
            topEventType = type
          }
        })

        return {
          month,
          events: data.events,
          revenue: data.revenue,
          topEventType,
        }
      })
      .sort((a, b) => b.events - a.events)
      .slice(0, 5)

    return NextResponse.json({
      success: true,
      monthlyData,
      eventTypeData,
      peakMonths,
    })
  } catch (error) {
    console.error("Error fetching revenue analytics:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch revenue analytics",
      },
      { status: 500 },
    )
  }
}
