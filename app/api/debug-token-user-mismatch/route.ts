import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"
import { cookies } from "next/headers"
import { verifyToken } from "@/lib/auth-utils"

export async function GET() {
  try {
    console.log("=== DEBUG TOKEN USER MISMATCH ===")

    const cookieStore = await cookies()
    const sessionToken =
      cookieStore.get("session-id")?.value ||
      cookieStore.get("user-session")?.value ||
      cookieStore.get("auth-token")?.value

    console.log("Session token found:", !!sessionToken)
    console.log("Session token (first 20 chars):", sessionToken?.substring(0, 20))

    if (!sessionToken) {
      return NextResponse.json({ success: false, error: "No session token found" }, { status: 401 })
    }

    let tokenData: any
    try {
      tokenData = await verifyToken(sessionToken)
      console.log("Token verification result:", tokenData)
    } catch (error) {
      console.error("Token verification failed:", error)
      return NextResponse.json({ success: false, error: "Token verification failed" }, { status: 401 })
    }

    const userIdFromToken = tokenData.userId
    console.log("User ID from token:", userIdFromToken)

    // Check if this user exists in the database
    const { data: userFromToken, error: userFromTokenError } = await supabaseAdmin
      .from("tbl_users")
      .select("*")
      .eq("id", userIdFromToken)
      .single()

    console.log("User from token exists:", !!userFromToken)
    if (userFromToken) {
      console.log("User from token details:", {
        id: userFromToken.id,
        email: userFromToken.email,
        first_name: userFromToken.first_name,
        last_name: userFromToken.last_name,
      })
    }

    // Get all users to see what's available
    const { data: allUsers, error: allUsersError } = await supabaseAdmin
      .from("tbl_users")
      .select("id, email, first_name, last_name")
      .limit(10)

    console.log("All users in system:", allUsers?.length || 0)

    // Get all appointments to see which user IDs they belong to
    const { data: allAppointments, error: allAppointmentsError } = await supabaseAdmin
      .from("tbl_comprehensive_appointments")
      .select("id, user_id, contact_email, event_type, payment_status")
      .limit(10)

    console.log("All appointments in system:", allAppointments?.length || 0)

    // Get all transactions to see which user IDs they belong to
    const { data: allTransactions, error: allTransactionsError } = await supabaseAdmin
      .from("tbl_payment_transactions")
      .select("id, user_id, amount, status, payment_type")
      .limit(10)

    console.log("All transactions in system:", allTransactions?.length || 0)

    return NextResponse.json({
      success: true,
      debug: {
        tokenData,
        userIdFromToken,
        userFromTokenExists: !!userFromToken,
        userFromTokenDetails: userFromToken
          ? {
              id: userFromToken.id,
              email: userFromToken.email,
              first_name: userFromToken.first_name,
              last_name: userFromToken.last_name,
            }
          : null,
        allUsers: allUsers?.map((u) => ({
          id: u.id,
          email: u.email,
          name: `${u.first_name} ${u.last_name}`,
        })),
        allAppointments: allAppointments?.map((a) => ({
          id: a.id.substring(0, 8),
          user_id: a.user_id,
          contact_email: a.contact_email,
          event_type: a.event_type,
          payment_status: a.payment_status,
        })),
        allTransactions: allTransactions?.map((t) => ({
          id: t.id.substring(0, 8),
          user_id: t.user_id,
          amount: t.amount,
          status: t.status,
          payment_type: t.payment_type,
        })),
        userFromTokenError: userFromTokenError?.message,
        allUsersError: allUsersError?.message,
        allAppointmentsError: allAppointmentsError?.message,
        allTransactionsError: allTransactionsError?.message,
      },
    })
  } catch (error: any) {
    console.error("Unexpected error in debug token user mismatch:", error)
    return NextResponse.json(
      { success: false, message: "An unexpected error occurred", error: error.message },
      { status: 500 },
    )
  }
}
