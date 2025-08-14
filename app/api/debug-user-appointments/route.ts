import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"
import { cookies } from "next/headers"
import { verifyToken } from "@/lib/auth-utils"

export async function GET(request: Request) {
  try {
    console.log("=== DEBUG USER APPOINTMENTS API CALLED ===")

    const cookieStore = await cookies()

    // Try multiple session cookie names
    const sessionToken =
      cookieStore.get("session-id")?.value ||
      cookieStore.get("user-session")?.value ||
      cookieStore.get("auth-token")?.value

    console.log("Available cookies:", {
      "session-id": cookieStore.get("session-id")?.value ? "exists" : "missing",
      "user-session": cookieStore.get("user-session")?.value ? "exists" : "missing",
      "auth-token": cookieStore.get("auth-token")?.value ? "exists" : "missing",
    })

    if (!sessionToken) {
      console.log("No session token found in any cookie")
      return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 })
    }

    console.log("Found session token:", sessionToken.substring(0, 20) + "...")

    let userId: string
    try {
      const tokenData = await verifyToken(sessionToken)
      userId = tokenData.userId
      console.log("User ID from token:", userId)
    } catch (error) {
      console.error("Token verification failed:", error)
      return NextResponse.json({ success: false, error: "Invalid session" }, { status: 401 })
    }

    // Check if user exists - use select with limit to avoid multiple results error
    console.log("=== CHECKING USER EXISTENCE ===")
    const { data: users, error: userError } = await supabaseAdmin
      .from("tbl_users")
      .select("id, email, full_name, first_name, last_name")
      .eq("id", userId)
      .limit(5) // Get up to 5 to see if there are duplicates

    console.log("User lookup result:", { users, error: userError, count: users?.length })

    if (userError) {
      console.error("User query error:", userError)
      return NextResponse.json(
        {
          success: false,
          error: "Database error",
          debug: {
            userId,
            userExists: false,
            userError: userError.message,
            queryError: userError,
          },
        },
        { status: 500 },
      )
    }

    if (!users || users.length === 0) {
      console.error("No users found with ID:", userId)
      return NextResponse.json(
        {
          success: false,
          error: "User not found",
          debug: {
            userId,
            userExists: false,
            userCount: 0,
          },
        },
        { status: 404 },
      )
    }

    const user = users[0] // Take the first user
    const hasDuplicates = users.length > 1

    if (hasDuplicates) {
      console.warn(`Found ${users.length} users with same ID:`, userId)
    }

    // Get all appointments for this user
    console.log("=== FETCHING ALL USER APPOINTMENTS ===")
    const { data: appointments, error: appointmentsError } = await supabaseAdmin
      .from("tbl_comprehensive_appointments")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    console.log("Appointments query result:", {
      data: appointments,
      error: appointmentsError,
      count: appointments?.length || 0,
    })

    // Get all payment transactions for this user
    console.log("=== FETCHING ALL USER TRANSACTIONS ===")
    const { data: transactions, error: transactionsError } = await supabaseAdmin
      .from("tbl_payment_transactions")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    console.log("Transactions query result:", {
      data: transactions,
      error: transactionsError,
      count: transactions?.length || 0,
    })

    // Count appointments by status
    const appointmentsByStatus =
      appointments?.reduce((acc: any[], apt) => {
        const existing = acc.find((item) => item.status === apt.status)
        if (existing) {
          existing.count++
        } else {
          acc.push({ status: apt.status, count: 1 })
        }
        return acc
      }, []) || []

    // Count appointments by payment status
    const appointmentsByPaymentStatus =
      appointments?.reduce((acc: any[], apt) => {
        const existing = acc.find((item) => item.paymentStatus === apt.payment_status)
        if (existing) {
          existing.count++
        } else {
          acc.push({ paymentStatus: apt.payment_status, count: 1 })
        }
        return acc
      }, []) || []

    // Count appointments ready for payment
    const appointmentsReadyForPayment =
      appointments?.filter((apt) => {
        const isStatusReady = apt.status === "TASTING_COMPLETED" || apt.status === "confirmed"
        const needsPayment = apt.payment_status !== "fully_paid" && apt.payment_status !== "refunded"
        return isStatusReady && needsPayment
      }).length || 0

    // Get recent appointments (last 5)
    const recentAppointments = appointments?.slice(0, 5) || []

    // Count transactions by status
    const transactionsByStatus =
      transactions?.reduce((acc: any[], txn) => {
        const existing = acc.find((item) => item.status === txn.status)
        if (existing) {
          existing.count++
        } else {
          acc.push({ status: txn.status, count: 1 })
        }
        return acc
      }, []) || []

    return NextResponse.json({
      success: true,
      debug: {
        userId,
        userExists: true,
        userEmail: user.email,
        userFullName: user.full_name || `${user.first_name || ""} ${user.last_name || ""}`.trim(),
        hasDuplicateUsers: hasDuplicates,
        duplicateUserCount: users.length,
        totalAppointments: appointments?.length || 0,
        totalTransactions: transactions?.length || 0,
        appointmentsReadyForPayment,
        appointmentsByStatus,
        appointmentsByPaymentStatus,
        transactionsByStatus,
        recentAppointments: recentAppointments.map((apt) => ({
          id: apt.id,
          event_type: apt.event_type,
          status: apt.status,
          payment_status: apt.payment_status,
          event_date: apt.event_date,
          created_at: apt.created_at,
          updated_at: apt.updated_at,
        })),
        recentTransactions:
          transactions?.slice(0, 5).map((txn) => ({
            id: txn.id,
            appointment_id: txn.appointment_id,
            amount: txn.amount,
            payment_type: txn.payment_type,
            status: txn.status,
            created_at: txn.created_at,
          })) || [],
      },
    })
  } catch (error: any) {
    console.error("Unexpected error in debug user appointments route:", error)
    return NextResponse.json(
      {
        success: false,
        message: "An unexpected error occurred",
        error: error.message,
        debug: {
          userId: "unknown",
          userExists: false,
          error: error.message,
        },
      },
      { status: 500 },
    )
  }
}
