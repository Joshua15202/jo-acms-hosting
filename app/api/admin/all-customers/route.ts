import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

// Force dynamic rendering and disable caching
export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET() {
  try {
    console.log("=== Admin: Fetching ALL customers (comprehensive) ===")

    // First, get the total count of all users
    const { count: totalUsersCount, error: countError } = await supabaseAdmin
      .from("tbl_users")
      .select("*", { count: "exact", head: true })

    if (countError) {
      console.error("Error getting total users count:", countError)
    }

    console.log(`Total users in database: ${totalUsersCount || 0}`)

    // Fetch ALL users from the database (no limit)
    const { data: allUsers, error } = await supabaseAdmin
      .from("tbl_users")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching all users:", error)
      return NextResponse.json(
        {
          success: false,
          message: "Failed to fetch all customers",
          error: error.message,
        },
        { status: 500 },
      )
    }

    console.log(`Fetched ${allUsers?.length || 0} users from database`)

    // Filter for valid customers (users with valid email addresses)
    const validCustomers = (allUsers || []).filter((user) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      return user.email && emailRegex.test(user.email)
    })

    console.log(`Filtered to ${validCustomers.length} valid customers with proper email addresses`)

    // Log some specific Gmail addresses for debugging
    const gmailCustomers = validCustomers.filter((customer) => customer.email.toLowerCase().includes("@gmail.com"))
    console.log(`Found ${gmailCustomers.length} Gmail customers`)

    // Log first few Gmail addresses for verification
    if (gmailCustomers.length > 0) {
      console.log(
        "Sample Gmail addresses found:",
        gmailCustomers.slice(0, 5).map((c) => c.email),
      )
    }

    const response = NextResponse.json({
      success: true,
      customers: validCustomers,
      totalCustomers: validCustomers.length,
      totalUsersInDb: totalUsersCount || 0,
      gmailCustomers: gmailCustomers.length,
      message: `Successfully fetched ${validCustomers.length} valid customers out of ${totalUsersCount || 0} total users`,
    })

    // Add cache-control headers
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate")
    response.headers.set("Pragma", "no-cache")
    response.headers.set("Expires", "0")

    return response
  } catch (error) {
    console.error("Unexpected error in all-customers route:", error)
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
