import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

interface BookingPattern {
  date: string
  count: number
  dayOfWeek: number
  weekOfMonth: number
  month: number
  year: number
}

interface MonthlyForecast {
  month: number
  monthName: string
  confidence: number
  reason: string
  expectedBookings: number
  peakIndicator: "high" | "medium" | "low"
}

export async function GET(request: NextRequest) {
  try {
    // Disable caching
    const headers = {
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    }

    console.log("Analyzing booking patterns from real appointment data...")

    // Fetch historical booking data from the last 12 months
    const oneYearAgo = new Date()
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)
    const oneYearAgoString = oneYearAgo.toISOString().split("T")[0]

    console.log(`Fetching appointments from ${oneYearAgoString} onwards...`)

    // Try to fetch from comprehensive appointments table first
    let appointments: any[] = []
    let dataSource = "comprehensive"

    const { data: comprehensiveAppointments, error: comprehensiveError } = await supabase
      .from("tbl_comprehensive_appointments")
      .select("event_date, created_at, status, guest_count, event_type")
      .gte("event_date", oneYearAgoString)
      .not("status", "eq", "cancelled")
      .order("event_date", { ascending: true })

    if (comprehensiveError) {
      console.log("Comprehensive appointments table error:", comprehensiveError.message)

      // Try regular appointments table
      const { data: regularAppointments, error: regularError } = await supabase
        .from("tbl_appointments")
        .select("event_date, created_at, status, guest_count, event_type")
        .gte("event_date", oneYearAgoString)
        .not("status", "eq", "cancelled")
        .order("event_date", { ascending: true })

      if (regularError) {
        console.log("Regular appointments table error:", regularError.message)

        // If both tables fail, return demo data but indicate it's not real
        console.log("Using demo data as fallback...")
        return NextResponse.json(
          {
            success: true,
            data: getDemoMonthlyData(),
            isDemo: true,
            message: "Using demo data - no real appointment data found in database",
          },
          { headers },
        )
      } else {
        appointments = regularAppointments || []
        dataSource = "regular"
      }
    } else {
      appointments = comprehensiveAppointments || []
    }

    console.log(`Found ${appointments.length} appointments from ${dataSource} appointments table`)

    // If no real data found, use demo data
    if (appointments.length === 0) {
      console.log("No appointment data found, using demo data...")
      return NextResponse.json(
        {
          success: true,
          data: getDemoMonthlyData(),
          isDemo: true,
          message: "No historical appointment data found - showing demo monthly analysis",
        },
        { headers },
      )
    }

    // Process the real appointment data for monthly analysis
    const processedData = processMonthlyAppointmentData(appointments)

    return NextResponse.json(
      {
        success: true,
        data: {
          ...processedData,
          dataSource,
          isDemo: false,
          message: `Monthly analysis based on ${appointments.length} real appointments from ${dataSource} table`,
        },
      },
      { headers },
    )
  } catch (error) {
    console.error("Error analyzing booking patterns:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to analyze booking patterns",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

function processMonthlyAppointmentData(appointments: any[]) {
  console.log("Processing real appointment data for monthly analysis...")

  // Group appointments by month
  const monthlyBookings: { [key: number]: number } = {}
  const quarterlyBookings: { [key: string]: number } = {}

  appointments.forEach((apt) => {
    const date = new Date(apt.event_date)
    const month = date.getMonth() + 1
    const quarter = Math.ceil(month / 3)

    // Monthly grouping
    monthlyBookings[month] = (monthlyBookings[month] || 0) + 1

    // Quarterly grouping
    quarterlyBookings[`Q${quarter}`] = (quarterlyBookings[`Q${quarter}`] || 0) + 1
  })

  console.log("Monthly bookings:", monthlyBookings)

  // Analyze monthly patterns
  const analysis = analyzeMonthlyPatterns(monthlyBookings, quarterlyBookings)

  // Generate monthly forecasts
  const forecasts = generateMonthlyForecasts(monthlyBookings, analysis)

  return {
    totalAppointments: appointments.length,
    monthlyBookings,
    quarterlyBookings,
    analysis,
    forecasts,
    lastUpdated: new Date().toISOString(),
  }
}

function analyzeMonthlyPatterns(monthlyBookings: any, quarterlyBookings: any) {
  const monthNames = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

  // Find peak month
  const peakMonth = Object.entries(monthlyBookings).reduce(
    (best: any, [month, count]: [string, any]) =>
      !best || count > best.count ? { month: Number.parseInt(month), count } : best,
    null,
  )

  // Find peak quarter
  const peakQuarter = Object.entries(quarterlyBookings).reduce(
    (best: any, [quarter, count]: [string, any]) => (!best || count > best.count ? { quarter, count } : best),
    null,
  )

  // Find top 5 months (most event appointed months)
  const topMonths = Object.entries(monthlyBookings)
    .sort(([, a]: [string, any], [, b]: [string, any]) => b - a)
    .slice(0, 5)
    .map(([month, count]) => ({ month: Number.parseInt(month), count }))

  // Generate insights
  const insights = []

  if (peakMonth) {
    insights.push(`${monthNames[peakMonth.month]} is your busiest month with ${peakMonth.count} total appointments`)
  }

  if (peakQuarter) {
    insights.push(`${peakQuarter.quarter} shows the highest quarterly activity with ${peakQuarter.count} appointments`)
  }

  // Wedding season analysis (May through October)
  const weddingMonths = [5, 6, 7, 8, 9, 10]
  const weddingSeasonBookings = weddingMonths.reduce((sum, month) => sum + (monthlyBookings[month] || 0), 0)
  if (weddingSeasonBookings > 0) {
    insights.push(`Wedding season (May-October) accounts for ${weddingSeasonBookings} appointments`)
  }

  // Holiday season analysis (November, December, January)
  const holidayMonths = [11, 12, 1]
  const holidaySeasonBookings = holidayMonths.reduce((sum, month) => sum + (monthlyBookings[month] || 0), 0)
  if (holidaySeasonBookings > 0) {
    insights.push(`Holiday season shows ${holidaySeasonBookings} total bookings`)
  }

  // Top months insight
  if (topMonths.length > 0) {
    const topMonthNames = topMonths.map((m) => monthNames[m.month]).join(", ")
    insights.push(`Your most event-appointed months are: ${topMonthNames}`)
  }

  return {
    peakMonth,
    peakQuarter,
    topMonths,
    insights,
    weddingSeasonBookings,
    holidaySeasonBookings,
  }
}

function generateMonthlyForecasts(monthlyBookings: any, analysis: any): MonthlyForecast[] {
  const forecasts: MonthlyForecast[] = []
  const monthNames = [
    "",
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

  // Get current month
  const currentMonth = new Date().getMonth() + 1

  // Forecast next 6 months
  for (let i = 1; i <= 6; i++) {
    const targetMonth = ((currentMonth + i - 1) % 12) + 1
    const monthBookings = monthlyBookings[targetMonth] || 0

    if (monthBookings > 0) {
      // We have historical data for this month
      let confidence = 85
      let peakIndicator: "high" | "medium" | "low" = "medium"

      // Determine if this is a peak month
      if (analysis.peakMonth && targetMonth === analysis.peakMonth.month) {
        confidence = 95
        peakIndicator = "high"
      } else if (analysis.topMonths.some((m: any) => m.month === targetMonth)) {
        confidence = 80
        peakIndicator = "medium"
      } else {
        confidence = 65
        peakIndicator = "low"
      }

      forecasts.push({
        month: targetMonth,
        monthName: monthNames[targetMonth],
        confidence,
        reason: `Based on historical data, ${monthNames[targetMonth]} typically sees ${monthBookings} appointments. ${targetMonth === analysis.peakMonth?.month ? "This is your peak month!" : "This follows your typical monthly pattern."}`,
        expectedBookings: monthBookings,
        peakIndicator,
      })
    } else {
      // No historical data, use overall average
      const totalBookings = Object.values(monthlyBookings).reduce((sum: number, count: any) => sum + count, 0)
      const averageBookings = Math.round(totalBookings / Object.keys(monthlyBookings).length) || 1

      forecasts.push({
        month: targetMonth,
        monthName: monthNames[targetMonth],
        confidence: 40,
        reason: `No historical data for ${monthNames[targetMonth]}. Estimated based on your overall monthly average of ${averageBookings} appointments.`,
        expectedBookings: Math.max(1, averageBookings),
        peakIndicator: "low",
      })
    }
  }

  return forecasts.sort((a, b) => b.confidence - a.confidence)
}

function getDemoMonthlyData() {
  return {
    totalAppointments: 45,
    monthlyBookings: {
      12: 15, // December - Peak month
      6: 12, // June
      3: 8, // March
      9: 4, // September
      10: 6, // October
    },
    quarterlyBookings: {
      Q4: 21, // Oct, Nov, Dec
      Q2: 12, // Apr, May, June
      Q1: 8, // Jan, Feb, Mar
      Q3: 4, // July, Aug, Sept
    },
    analysis: {
      peakMonth: { month: 12, count: 15 },
      peakQuarter: { quarter: "Q4", count: 21 },
      topMonths: [
        { month: 12, count: 15 },
        { month: 6, count: 12 },
        { month: 3, count: 8 },
        { month: 10, count: 6 },
        { month: 9, count: 4 },
      ],
      insights: [
        "December is your busiest month with 15 total appointments",
        "Q4 shows the highest quarterly activity with 21 appointments",
        "Wedding season (May-October) accounts for 22 appointments",
        "Holiday season shows 15 total bookings",
        "Your most event-appointed months are: Dec, Jun, Mar, Oct, Sep",
      ],
      weddingSeasonBookings: 22,
      holidaySeasonBookings: 15,
    },
    forecasts: [
      {
        month: 12,
        monthName: "December",
        confidence: 95,
        reason: "Based on historical data, December typically sees 15 appointments. This is your peak month!",
        expectedBookings: 15,
        peakIndicator: "high",
      },
      {
        month: 6,
        monthName: "June",
        confidence: 85,
        reason:
          "Based on historical data, June typically sees 12 appointments. This follows your typical monthly pattern.",
        expectedBookings: 12,
        peakIndicator: "medium",
      },
      {
        month: 3,
        monthName: "March",
        confidence: 80,
        reason:
          "Based on historical data, March typically sees 8 appointments. This follows your typical monthly pattern.",
        expectedBookings: 8,
        peakIndicator: "medium",
      },
      {
        month: 10,
        monthName: "October",
        confidence: 65,
        reason:
          "Based on historical data, October typically sees 6 appointments. This follows your typical monthly pattern.",
        expectedBookings: 6,
        peakIndicator: "low",
      },
    ],
    lastUpdated: new Date().toISOString(),
  }
}
