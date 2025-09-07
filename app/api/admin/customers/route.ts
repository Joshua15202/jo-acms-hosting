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

    // Fetch ALL payment transactions (not just verified ones for now)
    const { data: allPayments, error: paymentsError } = await supabaseAdmin.from("tbl_payment_transactions").select(`
        user_id,
        amount,
        status,
        appointment_payment_status,
        created_at
      `)

    if (paymentsError) {
      console.error("Error fetching payments:", paymentsError)
    }

    console.log(`Found ${allPayments?.length || 0} total payment transactions`)

    // Fetch ALL appointments (from both tables)
    const { data: appointments, error: appointmentsError } = await supabaseAdmin.from("tbl_appointments").select(`
        user_id,
        status,
        created_at
      `)

    const { data: comprehensiveAppointments, error: comprehensiveError } = await supabaseAdmin
      .from("tbl_comprehensive_appointments")
      .select(`
        user_id,
        status,
        payment_status,
        created_at
      `)

    if (appointmentsError) {
      console.error("Error fetching appointments:", appointmentsError)
    }
    if (comprehensiveError) {
      console.error("Error fetching comprehensive appointments:", comprehensiveError)
    }

    // Combine all appointments
    const allAppointments = [...(appointments || []), ...(comprehensiveAppointments || [])]

    console.log(`Found ${allAppointments.length} total appointments`)

    // Debug: Check for specific user
    const debugUserId = validCustomers.find((u) => u.email === "blacksights99@gmail.com")?.id
    if (debugUserId) {
      console.log(`Debug user ID: ${debugUserId}`)
      const userPayments = (allPayments || []).filter((p) => p.user_id === debugUserId)
      const userAppointments = allAppointments.filter((a) => a.user_id === debugUserId)
      console.log(`Debug user payments: ${userPayments.length}`, userPayments)
      console.log(`Debug user appointments: ${userAppointments.length}`, userAppointments)
    }

    // Calculate spending and appointment counts for each customer
    const customersWithSpending = validCustomers.map((customer) => {
      // Calculate total spent from verified payments
      const customerPayments = (allPayments || []).filter((payment) => payment.user_id === customer.id)

      // Only count verified payments for spending
      const verifiedPayments = customerPayments.filter((p) => p.status === "verified")

      const totalSpent = verifiedPayments.reduce((sum, payment) => {
        return sum + (Number.parseFloat(payment.amount) || 0)
      }, 0)

      // Count appointments
      const customerAppointments = allAppointments.filter((appointment) => appointment.user_id === customer.id)

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

      // Find last activity (use last payment or appointment as proxy)
      const lastActivity = [...customerPayments, ...customerAppointments]
        .map((item) => new Date(item.created_at))
        .sort((a, b) => b.getTime() - a.getTime())[0]

      // Debug logging for specific user
      if (customer.email === "blacksights99@gmail.com") {
        console.log(`=== DEBUG FOR ${customer.email} ===`)
        console.log(`Customer ID: ${customer.id}`)
        console.log(`Total payments found: ${customerPayments.length}`)
        console.log(`Verified payments: ${verifiedPayments.length}`)
        console.log(`Total spent: ${totalSpent}`)
        console.log(`Total appointments: ${totalAppointments}`)
        console.log(`Completed appointments: ${completedAppointments}`)
        console.log(`Status: ${status}`)
        console.log(`Last activity: ${lastActivity}`)
        console.log(
          `Payment details:`,
          customerPayments.map((p) => ({
            id: p.user_id,
            amount: p.amount,
            status: p.status,
          })),
        )
        console.log(
          `Appointment details:`,
          customerAppointments.map((a) => ({
            user_id: a.user_id,
            status: a.status,
            created_at: a.created_at,
          })),
        )
      }

      return {
        ...customer,
        totalSpent: Math.round(totalSpent), // Round to nearest peso
        totalAppointments,
        completedAppointments,
        status: status as "active" | "inactive",
        lastLogin: lastActivity ? lastActivity.toISOString() : null,
        paymentCount: verifiedPayments.length, // Only count verified payments
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

    // Debug: Log the specific customer we're looking for
    const debugCustomer = customersWithSpending.find((c) => c.email === "blacksights99@gmail.com")
    if (debugCustomer) {
      console.log(`=== FINAL DEBUG CUSTOMER DATA ===`)
      console.log(JSON.stringify(debugCustomer, null, 2))
    }

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
      debug: {
        totalUsersInDb: users?.length || 0,
        validCustomers: validCustomers.length,
        totalPayments: allPayments?.length || 0,
        totalAppointments: allAppointments.length,
        debugCustomerFound: !!debugCustomer,
        debugCustomerData: debugCustomer
          ? {
              id: debugCustomer.id,
              email: debugCustomer.email,
              totalSpent: debugCustomer.totalSpent,
              totalAppointments: debugCustomer.totalAppointments,
              paymentCount: debugCustomer.paymentCount,
              status: debugCustomer.status,
            }
          : null,
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
