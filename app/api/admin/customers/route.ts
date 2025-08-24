import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export async function GET() {
  try {
    console.log("=== Admin: Fetching customers ===")

    // Fetch all users from the database
    const { data: users, error } = await supabaseAdmin
      .from("tbl_users")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching users:", error)
      return NextResponse.json(
        {
          success: false,
          message: "Failed to fetch customers",
          error: error.message,
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

    return NextResponse.json({
      success: true,
      customers: validCustomers,
      totalCustomers: validCustomers.length,
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
