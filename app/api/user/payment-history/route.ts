import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"
import { cookies } from "next/headers"
import { verifyToken } from "@/lib/auth-utils"

export async function GET(request: Request) {
  try {
    console.log("=== USER PAYMENT HISTORY API CALLED ===")

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

    // First, let's check what payment transactions exist for this user
    console.log("=== CHECKING PAYMENT TRANSACTIONS TABLE ===")

    // Try to get payment transactions directly first
    const { data: directTransactions, error: directError } = await supabaseAdmin
      .from("tbl_payment_transactions")
      .select("*")
      .eq("user_id", userId)

    console.log("Direct payment transactions query result:", {
      data: directTransactions,
      error: directError,
      count: directTransactions?.length || 0,
    })

    if (directError) {
      console.error("Error in direct payment transactions query:", directError)
    }

    // Now try to get transactions with appointment details
    console.log("=== FETCHING TRANSACTIONS WITH APPOINTMENT DETAILS ===")

    const { data: transactions, error } = await supabaseAdmin
      .from("tbl_payment_transactions")
      .select(`
        id,
        appointment_id,
        amount,
        payment_type,
        payment_method,
        reference_number,
        notes,
        status,
        created_at,
        updated_at,
        tbl_comprehensive_appointments!inner (
          id,
          event_type,
          event_date,
          event_time,
          guest_count,
          venue_address,
          total_package_amount,
          down_payment_amount,
          remaining_balance,
          payment_status,
          pasta_selection,
          beverage_selection,
          dessert_selection,
          selected_menu,
          theme,
          color_motif,
          contact_first_name,
          contact_last_name,
          contact_email,
          contact_phone,
          special_requests,
          created_at,
          updated_at
        )
      `)
      .eq("user_id", userId)
      .eq("status", "verified")
      .order("created_at", { ascending: false })

    console.log("Transactions with appointments query result:", {
      data: transactions,
      error: error,
      count: transactions?.length || 0,
    })

    if (error) {
      console.error("Error fetching payment history with appointments:", error)

      // Fallback: try without the join
      console.log("=== TRYING FALLBACK WITHOUT JOIN ===")
      const { data: fallbackTransactions, error: fallbackError } = await supabaseAdmin
        .from("tbl_payment_transactions")
        .select("*")
        .eq("user_id", userId)
        .eq("status", "verified")
        .order("created_at", { ascending: false })

      console.log("Fallback transactions:", {
        data: fallbackTransactions,
        error: fallbackError,
        count: fallbackTransactions?.length || 0,
      })

      if (fallbackError) {
        console.error("Fallback query also failed:", fallbackError)
        return NextResponse.json(
          { success: false, message: "Failed to fetch payment history", error: fallbackError.message },
          { status: 500 },
        )
      }

      // If fallback worked, get appointment details separately
      if (fallbackTransactions && fallbackTransactions.length > 0) {
        console.log("=== FETCHING APPOINTMENT DETAILS SEPARATELY ===")
        const appointmentIds = fallbackTransactions.map((t) => t.appointment_id)

        const { data: appointments, error: appointmentError } = await supabaseAdmin
          .from("tbl_comprehensive_appointments")
          .select("*")
          .in("id", appointmentIds)

        console.log("Separate appointments query:", {
          data: appointments,
          error: appointmentError,
          count: appointments?.length || 0,
        })

        if (!appointmentError && appointments) {
          // Combine the data
          const combinedTransactions = fallbackTransactions
            .map((transaction) => ({
              ...transaction,
              tbl_comprehensive_appointments: appointments.find((apt) => apt.id === transaction.appointment_id),
            }))
            .filter((t) => t.tbl_comprehensive_appointments) // Only include transactions with appointment data

          console.log("Combined transactions:", combinedTransactions.length)

          return NextResponse.json({
            success: true,
            transactions: combinedTransactions,
            count: combinedTransactions.length,
            debug: {
              userId,
              directTransactionsCount: directTransactions?.length || 0,
              fallbackTransactionsCount: fallbackTransactions?.length || 0,
              appointmentsCount: appointments?.length || 0,
              combinedCount: combinedTransactions.length,
            },
          })
        }
      }

      return NextResponse.json(
        { success: false, message: "Failed to fetch payment history", error: error.message },
        { status: 500 },
      )
    }

    console.log(`Found ${transactions?.length || 0} verified payment transactions for user ${userId}`)

    return NextResponse.json({
      success: true,
      transactions: transactions || [],
      count: transactions?.length || 0,
      debug: {
        userId,
        directTransactionsCount: directTransactions?.length || 0,
        joinedTransactionsCount: transactions?.length || 0,
      },
    })
  } catch (error: any) {
    console.error("Unexpected error in payment history route:", error)
    return NextResponse.json(
      { success: false, message: "An unexpected error occurred", error: error.message },
      { status: 500 },
    )
  }
}
