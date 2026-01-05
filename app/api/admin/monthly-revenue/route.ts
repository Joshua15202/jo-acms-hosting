import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const period = searchParams.get("period") || "monthly"
    const requestedMonth = searchParams.get("month")
    const requestedYear = searchParams.get("year")

    console.log("=== REVENUE API CALLED ===")
    console.log("Period:", period)
    console.log("Requested Month:", requestedMonth)
    console.log("Requested Year:", requestedYear)

    const targetDate = new Date()
    if (requestedYear) {
      targetDate.setFullYear(Number.parseInt(requestedYear))
    }
    if (requestedMonth) {
      targetDate.setMonth(Number.parseInt(requestedMonth) - 1)
    }

    let startDate: Date
    let endDate: Date
    let prevStartDate: Date
    let prevEndDate: Date
    let periodLabel: string

    if (period === "yearly") {
      startDate = new Date(targetDate.getFullYear(), 0, 1)
      endDate = new Date(targetDate.getFullYear(), 11, 31, 23, 59, 59, 999)
      prevStartDate = new Date(targetDate.getFullYear() - 1, 0, 1)
      prevEndDate = new Date(targetDate.getFullYear() - 1, 11, 31, 23, 59, 59, 999)
      periodLabel = targetDate.getFullYear().toString()
    } else {
      startDate = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1)
      endDate = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0, 23, 59, 59, 999)
      prevStartDate = new Date(targetDate.getFullYear(), targetDate.getMonth() - 1, 1)
      prevEndDate = new Date(targetDate.getFullYear(), targetDate.getMonth(), 0, 23, 59, 59, 999)
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
      periodLabel = monthNames[targetDate.getMonth()]
    }

    console.log("Date ranges:", {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      prevStartDate: prevStartDate.toISOString(),
      prevEndDate: prevEndDate.toISOString(),
    })

    const { data: currentEvents, error: currentError } = await supabase
      .from("tbl_comprehensive_appointments")
      .select(`
        id,
        event_type,
        event_date,
        guest_count,
        total_package_amount,
        status,
        created_at,
        updated_at,
        tbl_users!inner(
          id,
          full_name,
          email
        )
      `)
      .eq("status", "completed")
      .gte("event_date", startDate.toISOString().split("T")[0])
      .lte("event_date", endDate.toISOString().split("T")[0])
      .order("event_date", { ascending: false })

    if (currentError) {
      console.error("Error fetching current period events:", currentError)
      throw currentError
    }

    console.log("Current period completed events found:", currentEvents?.length || 0)

    const { data: previousEvents, error: previousError } = await supabase
      .from("tbl_comprehensive_appointments")
      .select("total_package_amount, status, event_date")
      .eq("status", "completed")
      .gte("event_date", prevStartDate.toISOString().split("T")[0])
      .lte("event_date", prevEndDate.toISOString().split("T")[0])

    if (previousError) {
      console.error("Error fetching previous period events:", previousError)
      throw previousError
    }

    console.log("Previous period completed events found:", previousEvents?.length || 0)

    // Calculate current period revenue
    const currentRevenue =
      currentEvents?.reduce((sum, event) => {
        const amount = Number.parseFloat(event.total_package_amount || "0")
        return sum + amount
      }, 0) || 0

    // Calculate previous period revenue
    const previousRevenue =
      previousEvents?.reduce((sum, event) => {
        const amount = Number.parseFloat(event.total_package_amount || "0")
        return sum + amount
      }, 0) || 0

    // Calculate percentage change
    let percentageChange = 0
    if (previousRevenue > 0) {
      percentageChange = ((currentRevenue - previousRevenue) / previousRevenue) * 100
    } else if (currentRevenue > 0) {
      percentageChange = 100
    } else if (previousRevenue > 0 && currentRevenue === 0) {
      percentageChange = -100
    }

    // Format revenue breakdown for display
    const revenueBreakdown =
      currentEvents?.map((event) => ({
        id: event.id,
        customerName: event.tbl_users?.full_name || "Unknown Customer",
        customerEmail: event.tbl_users?.email || "No email",
        eventType: event.event_type,
        eventDate: event.event_date,
        guestCount: event.guest_count || 0,
        amount: Number.parseFloat(event.total_package_amount || "0"),
        paymentStatus: "Fully Paid",
        completedAt: event.updated_at || event.created_at,
      })) || []

    const response = {
      success: true,
      data: {
        totalRevenue: currentRevenue,
        prevPeriodRevenue: previousRevenue,
        percentageChange: Math.round(percentageChange * 100) / 100,
        completedEvents: currentEvents?.length || 0,
        revenueBreakdown,
        month: targetDate.getMonth() + 1,
        year: targetDate.getFullYear(),
        monthName: periodLabel,
        period,
      },
      message: `${period === "yearly" ? "Yearly" : "Monthly"} revenue data fetched successfully`,
    }

    console.log("=== RESPONSE SUMMARY ===")
    console.log("Current period revenue:", currentRevenue)
    console.log("Previous period revenue:", previousRevenue)
    console.log("Percentage change:", response.data.percentageChange)
    console.log("Completed events count:", response.data.completedEvents)

    return NextResponse.json(response, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
        Pragma: "no-cache",
        Expires: "0",
        "Surrogate-Control": "no-store",
      },
    })
  } catch (error) {
    console.error("=== ERROR IN REVENUE API ===")
    console.error("Error details:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch revenue data",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
