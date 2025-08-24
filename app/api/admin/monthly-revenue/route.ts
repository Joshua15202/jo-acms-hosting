import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export async function GET() {
  try {
    console.log("=== Monthly Revenue API ===")

    // Get current month date range
    const now = new Date()
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)

    // Get previous month date range for comparison
    const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59)

    console.log("Current month range:", currentMonthStart.toISOString(), "to", currentMonthEnd.toISOString())
    console.log("Previous month range:", previousMonthStart.toISOString(), "to", previousMonthEnd.toISOString())

    // Fetch completed appointments with payment data for current month
    const { data: currentMonthAppointments, error: currentError } = await supabaseAdmin
      .from("tbl_appointments")
      .select(`
        id,
        event_date,
        event_type,
        guest_count,
        status,
        payment_status,
        total_package_amount,
        total_amount,
        created_at,
        updated_at,
        tbl_users!inner(
          id,
          full_name,
          email
        )
      `)
      .eq("status", "completed")
      .eq("payment_status", "fully_paid")
      .gte("event_date", currentMonthStart.toISOString())
      .lte("event_date", currentMonthEnd.toISOString())
      .order("event_date", { ascending: false })

    if (currentError) {
      console.error("Error fetching current month appointments:", currentError)
      return NextResponse.json(
        {
          success: false,
          error: "Failed to fetch current month revenue data",
          details: currentError.message,
        },
        { status: 500 },
      )
    }

    // Fetch completed appointments for previous month
    const { data: previousMonthAppointments, error: previousError } = await supabaseAdmin
      .from("tbl_appointments")
      .select("total_package_amount, total_amount")
      .eq("status", "completed")
      .eq("payment_status", "fully_paid")
      .gte("event_date", previousMonthStart.toISOString())
      .lte("event_date", previousMonthEnd.toISOString())

    if (previousError) {
      console.error("Error fetching previous month appointments:", previousError)
    }

    // Calculate current month revenue
    const currentMonthRevenue = (currentMonthAppointments || []).reduce((total, appointment) => {
      const amount = appointment.total_package_amount || appointment.total_amount || 0
      return total + amount
    }, 0)

    // Calculate previous month revenue
    const previousMonthRevenue = (previousMonthAppointments || []).reduce((total, appointment) => {
      const amount = appointment.total_package_amount || appointment.total_amount || 0
      return total + amount
    }, 0)

    // Calculate percentage change
    let percentageChange = 0
    if (previousMonthRevenue > 0) {
      percentageChange = ((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100
    } else if (currentMonthRevenue > 0) {
      percentageChange = 100 // If no previous revenue but current revenue exists
    }

    // Format the detailed breakdown
    const revenueBreakdown = (currentMonthAppointments || []).map((appointment) => ({
      id: appointment.id,
      customerName: appointment.tbl_users?.full_name || "Unknown Customer",
      customerEmail: appointment.tbl_users?.email || "",
      eventType: appointment.event_type,
      eventDate: appointment.event_date,
      guestCount: appointment.guest_count,
      revenue: appointment.total_package_amount || appointment.total_amount || 0,
      completedDate: appointment.updated_at,
    }))

    const response = {
      success: true,
      currentMonth: {
        month: now.toLocaleDateString("en-US", { month: "long", year: "numeric" }),
        revenue: currentMonthRevenue,
        completedEvents: currentMonthAppointments?.length || 0,
      },
      previousMonth: {
        month: new Date(now.getFullYear(), now.getMonth() - 1).toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
        }),
        revenue: previousMonthRevenue,
        completedEvents: previousMonthAppointments?.length || 0,
      },
      comparison: {
        percentageChange: Math.round(percentageChange * 100) / 100,
        isIncrease: percentageChange > 0,
        isDecrease: percentageChange < 0,
      },
      breakdown: revenueBreakdown,
    }

    console.log("Monthly revenue response:", {
      currentRevenue: currentMonthRevenue,
      previousRevenue: previousMonthRevenue,
      percentageChange,
      eventsCount: currentMonthAppointments?.length || 0,
    })

    return NextResponse.json(response)
  } catch (error) {
    console.error("Unexpected error in monthly revenue API:", error)
    return NextResponse.json(
      {
        success: false,
        error: "An unexpected error occurred",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
