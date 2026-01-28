import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get("period") || "monthly"
    const year = Number.parseInt(searchParams.get("year") || String(new Date().getFullYear()))
    const month = Number.parseInt(searchParams.get("month") || String(new Date().getMonth() + 1))

    console.log("Fetching revenue analytics data...", { period, year, month })

    // Build date range based on period
    let startDate: string
    let endDate: string

    if (period === "yearly") {
      // For yearly view, get all months in the selected year
      startDate = `${year}-01-01`
      endDate = `${year}-12-31`
    } else {
      // For monthly view, just show that specific month
      const monthStr = String(month).padStart(2, "0")
      startDate = `${year}-${monthStr}-01`
      const lastDay = new Date(year, month, 0).getDate()
      endDate = `${year}-${monthStr}-${lastDay}`
    }

    console.log("Date range:", { startDate, endDate })

    // Query for appointments that are fully paid (this counts as completed revenue)
    const { data: appointments, error } = await supabase
      .from("tbl_comprehensive_appointments")
      .select(`
        id,
        event_type,
        event_date,
        guest_count,
        total_package_amount,
        payment_status,
        status,
        created_at
      `)
      .eq("payment_status", "fully_paid")
      .gte("event_date", startDate)
      .lte("event_date", endDate)
      .order("event_date", { ascending: true })
    
    console.log("[v0] Query params:", { payment_status: "fully_paid", startDate, endDate })

    if (error) {
      console.error("Error fetching appointments:", error)
      throw error
    }

    console.log(`[v0] Found ${appointments?.length || 0} fully paid appointments for ${period} view (${startDate} to ${endDate})`)
    
    if (appointments && appointments.length > 0) {
      console.log("[v0] Sample appointment:", appointments[0])
      console.log("[v0] Event types found:", appointments.map(a => a.event_type).filter((v, i, a) => a.indexOf(v) === i))
    }

    // Initialize data structures
    const monthlyDataMap = new Map<string, { revenue: number; events: number }>()
    const eventTypeMap = new Map<string, number>()

    // For monthly view, only show the selected month
    // For yearly view, show all 12 months of the selected year
    if (period === "monthly") {
      // Initialize just the selected month
      const monthName = new Date(year, month - 1, 1).toLocaleDateString("en-US", { month: "short", year: "numeric" })
      monthlyDataMap.set(monthName, { revenue: 0, events: 0 })
    } else {
      // Initialize all 12 months for yearly view
      for (let m = 0; m < 12; m++) {
        const monthName = new Date(year, m, 1).toLocaleDateString("en-US", { month: "short", year: "numeric" })
        monthlyDataMap.set(monthName, { revenue: 0, events: 0 })
      }
    }

    // Process appointments and populate the data
    appointments?.forEach((appointment) => {
      const date = new Date(appointment.event_date)
      const monthName = date.toLocaleDateString("en-US", { month: "short", year: "numeric" })

      // Update monthly data (only if the month is in our map)
      const existing = monthlyDataMap.get(monthName)
      if (existing) {
        existing.revenue += Number.parseFloat(appointment.total_package_amount || "0")
        existing.events += 1
      }

      // Update event type count
      const eventType = appointment.event_type || "Other"
      eventTypeMap.set(eventType, (eventTypeMap.get(eventType) || 0) + 1)
    })

    // Convert to arrays (maintains chronological order)
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

    console.log("[v0] Revenue analytics response:", {
      period,
      year,
      month,
      monthlyDataPoints: monthlyData.length,
      monthlyData: monthlyData,
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
