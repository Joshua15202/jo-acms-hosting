import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export async function GET() {
  try {
    console.log("=== Admin: Fetching customers with accurate spending data ===")

    // Fetch all users from the database
    const { data: users, error: usersError } = await supabaseAdmin
      .from("tbl_users")
      .select("*")
      .order("created_at", { ascending: false })

    if (usersError) {
      console.error("Error fetching users:", usersError)
      return NextResponse.json(
        {
          success: false,
          message: "Failed to fetch customers",
          error: usersError.message,
        },
        { status: 500 },
      )
    }

    console.log(`Found ${users?.length || 0} total users`)

    // Filter for valid customers (users with valid email addresses)
    const validCustomers = (users || []).filter((user) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      return user.email && emailRegex.test(user.email)
    })

    console.log(`Filtered to ${validCustomers.length} valid customers`)

    // Fetch payment data for all customers
    const { data: payments, error: paymentsError } = await supabaseAdmin
      .from("tbl_payment_transactions")
      .select(`
        user_id,
        amount,
        status,
        appointment_payment_status,
        created_at
      `)
      .in("status", ["verified", "completed"])
      .in("appointment_payment_status", ["fully_paid", "paid"])

    if (paymentsError) {
      console.error("Error fetching payments:", paymentsError)
      // Continue without payment data rather than failing completely
    }

    console.log(`Found ${payments?.length || 0} verified payments`)

    // Fetch appointment data for counting
    const { data: appointments, error: appointmentsError } = await supabaseAdmin.from("tbl_appointments").select(`
        user_id,
        status,
        created_at
      `)

    if (appointmentsError) {
      console.error("Error fetching appointments:", appointmentsError)
      // Continue without appointment data
    }

    console.log(`Found ${appointments?.length || 0} appointments`)

    // Calculate spending and appointment counts for each customer
    const customersWithSpending = validCustomers.map((customer) => {
      // Calculate total spent from verified payments
      const customerPayments = (payments || []).filter((payment) => payment.user_id === customer.id)

      const totalSpent = customerPayments.reduce((sum, payment) => {
        return sum + (Number.parseFloat(payment.amount) || 0)
      }, 0)

      // Count appointments
      const customerAppointments = (appointments || []).filter((appointment) => appointment.user_id === customer.id)

      const totalAppointments = customerAppointments.length
      const completedAppointments = customerAppointments.filter(
        (appointment) => appointment.status === "completed",
      ).length

      // Determine customer status based on recent activity
      const hasRecentPayment = customerPayments.some((payment) => {
        const paymentDate = new Date(payment.created_at)
        const sixMonthsAgo = new Date()
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
        return paymentDate >= sixMonthsAgo
      })

      const hasRecentAppointment = customerAppointments.some((appointment) => {
        const appointmentDate = new Date(appointment.created_at)
        const threeMonthsAgo = new Date()
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3)
        return appointmentDate >= threeMonthsAgo
      })

      const status = hasRecentPayment || hasRecentAppointment ? "active" : "inactive"

      // Find last login (use last payment or appointment as proxy)
      const lastActivity = [...customerPayments, ...customerAppointments]
        .map((item) => new Date(item.created_at))
        .sort((a, b) => b.getTime() - a.getTime())[0]

      return {
        ...customer,
        totalSpent: Math.round(totalSpent), // Round to nearest peso
        totalAppointments,
        completedAppointments,
        status: status as "active" | "inactive",
        lastLogin: lastActivity ? lastActivity.toISOString() : null,
        paymentCount: customerPayments.length,
      }
    })

    // Calculate overall stats
    const totalCustomers = customersWithSpending.length
    const activeCustomers = customersWithSpending.filter((c) => c.status === "active").length

    // Calculate new customers this month
    const thisMonth = new Date()
    thisMonth.setDate(1)
    thisMonth.setHours(0, 0, 0, 0)
    const newThisMonth = customersWithSpending.filter((customer) => new Date(customer.created_at) >= thisMonth).length

    // Calculate total revenue from all verified payments
    const totalRevenue = customersWithSpending.reduce((sum, customer) => {
      return sum + customer.totalSpent
    }, 0)

    console.log(`Calculated stats:`, {
      totalCustomers,
      activeCustomers,
      newThisMonth,
      totalRevenue,
    })

    return NextResponse.json({
      success: true,
      customers: customersWithSpending,
      totalCustomers,
      stats: {
        totalCustomers,
        activeCustomers,
        newThisMonth,
        totalRevenue,
      },
    })
  } catch (error) {
    console.error("Unexpected error in customers route:", error)
    return NextResponse.json(
      {
        success: false,
        message: "An unexpected error occurred",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
