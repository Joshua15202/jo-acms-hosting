import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET(request: NextRequest) {
  try {
    console.log("Fetching monthly revenue data...")

    // Get current month and previous month dates
    const now = new Date()
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0)

    console.log("Date ranges:", {
      currentMonthStart: currentMonthStart.toISOString(),
      currentMonthEnd: currentMonthEnd.toISOString(),
      previousMonthStart: previousMonthStart.toISOString(),
      previousMonthEnd: previousMonthEnd.toISOString(),
    })

    // Fetch current month completed events from comprehensive appointments table
    const { data: currentMonthEvents, error: currentError } = await supabase
      .from("tbl_comprehensive_appointments")
      .select(`
        id,
        event_type,
        event_date,
        guest_count,
        total_package_amount,
        created_at,
        updated_at,
        tbl_users!inner(
          id,
          full_name,
          email
        )
      `)
      .eq("status", "completed")
      .gte("event_date", currentMonthStart.toISOString().split("T")[0])
      .lte("event_date", currentMonthEnd.toISOString().split("T")[0])
      .order("event_date", { ascending: false })

    if (currentError) {
      console.error("Error fetching current month events:", currentError)
      throw currentError
    }

    // Fetch previous month completed events
    const { data: previousMonthEvents, error: previousError } = await supabase
      .from("tbl_comprehensive_appointments")
      .select("total_package_amount")
      .eq("status", "completed")
      .gte("event_date", previousMonthStart.toISOString().split("T")[0])
      .lte("event_date", previousMonthEnd.toISOString().split("T")[0])

    if (previousError) {
      console.error("Error fetching previous month events:", previousError)
      throw previousError
    }

    console.log("Raw data:", {
      currentMonthEvents: currentMonthEvents?.length || 0,
      previousMonthEvents: previousMonthEvents?.length || 0,
    })

    // Calculate current month revenue
    const currentMonthRevenue =
      currentMonthEvents?.reduce((sum, event) => {
        const amount = Number.parseFloat(event.total_package_amount || "0")
        return sum + amount
      }, 0) || 0

    // Calculate previous month revenue
    const previousMonthRevenue =
      previousMonthEvents?.reduce((sum, event) => {
        const amount = Number.parseFloat(event.total_package_amount || "0")
        return sum + amount
      }, 0) || 0

    // Calculate percentage change
    let percentageChange = 0
    if (previousMonthRevenue > 0) {
      percentageChange = ((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100
    } else if (currentMonthRevenue > 0) {
      percentageChange = 100 // If no previous month data but current month has revenue
    }

    // Format revenue breakdown for display
    const revenueBreakdown =
      currentMonthEvents?.map((event) => ({
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

    const response = {
      success: true,
      data: {
        totalRevenue: currentMonthRevenue,
        prevMonthRevenue: previousMonthRevenue,
        percentageChange: Math.round(percentageChange * 100) / 100,
        completedEvents: currentMonthEvents?.length || 0,
        revenueBreakdown,
        month: now.getMonth() + 1,
        year: now.getFullYear(),
        monthName: monthNames[now.getMonth()],
      },
      message: "Monthly revenue data fetched successfully",
    }

    console.log("Response summary:", {
      currentRevenue: currentMonthRevenue,
      previousRevenue: previousMonthRevenue,
      percentageChange: response.data.percentageChange,
      completedEvents: response.data.completedEvents,
    })

    return NextResponse.json(response, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    })
  } catch (error) {
    console.error("Error in monthly revenue API:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch monthly revenue data",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
