import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET() {
  try {
    console.log("Fetching revenue analytics data...")

    // Get all completed appointments from the last 12 months
    const twelveMonthsAgo = new Date()
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12)

    const { data: appointments, error } = await supabase
      .from("tbl_comprehensive_appointments")
      .select(`
        id,
        event_type,
        event_date,
        guest_count,
        total_package_amount,
        created_at
      `)
      .eq("status", "completed")
      .gte("event_date", twelveMonthsAgo.toISOString().split("T")[0])
      .order("event_date", { ascending: true })

    if (error) {
      console.error("Error fetching appointments:", error)
      throw error
    }

    console.log(`Found ${appointments?.length || 0} completed appointments in the last 12 months`)

    // Group by month
    const monthlyDataMap = new Map<string, { revenue: number; events: number }>()
    const eventTypeMap = new Map<string, number>()

    appointments?.forEach((appointment) => {
      const date = new Date(appointment.event_date)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
      const monthName = date.toLocaleDateString("en-US", { month: "short", year: "numeric" })

      // Update monthly data
      const existing = monthlyDataMap.get(monthName) || { revenue: 0, events: 0 }
      existing.revenue += Number.parseFloat(appointment.total_package_amount || "0")
      existing.events += 1
      monthlyDataMap.set(monthName, existing)

      // Update event type count
      const eventType = appointment.event_type || "Other"
      eventTypeMap.set(eventType, (eventTypeMap.get(eventType) || 0) + 1)
    })

    // Convert to arrays
    const monthlyData = Array.from(monthlyDataMap.entries()).map(([month, data]) => ({
      month,
      revenue: Math.round(data.revenue),
      events: data.events,
    }))

    const totalEvents = appointments?.length || 0
    const eventTypeData = Array.from(eventTypeMap.entries())
      .map(([name, count]) => ({
        name,
        count,
        percentage: Math.round((count / totalEvents) * 100),
      }))
      .sort((a, b) => b.count - a.count)

    // Find peak months
    const peakMonths = Array.from(monthlyDataMap.entries())
      .map(([month, data]) => ({
        month,
        events: data.events,
        revenue: Math.round(data.revenue),
        topEventType: eventTypeData.length > 0 ? eventTypeData[0].name : "N/A",
      }))
      .sort((a, b) => b.events - a.events)
      .slice(0, 3)

    const response = {
      success: true,
      monthlyData,
      eventTypeData,
      peakMonths,
    }

    console.log("Revenue analytics response:", {
      monthlyDataPoints: monthlyData.length,
      eventTypes: eventTypeData.length,
      peakMonthsCount: peakMonths.length,
    })

    return NextResponse.json(response, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    })
  } catch (error) {
    console.error("Error in revenue analytics API:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch revenue analytics",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
