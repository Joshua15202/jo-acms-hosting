import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function GET() {
  try {
    console.log("=== Fetching ALL Registered Customers ===")
    console.log("Supabase URL:", supabaseUrl ? "Set" : "Not set")
    console.log("Service Key:", supabaseServiceKey ? "Set" : "Not set")

    // Get ALL users from tbl_users with valid email addresses (no limit)
    const { data: customers, error } = await supabase
      .from("tbl_users")
      .select("id, email, full_name, phone, created_at, updated_at")
      .not("email", "is", null)
      .neq("email", "")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Supabase error:", error)
      return NextResponse.json({
        success: false,
        error: error.message,
        customers: [],
        totalCustomers: 0,
      })
    }

    console.log(`Raw customers from database: ${customers?.length || 0}`)

    // Filter for valid email formats (basic validation)
    const validCustomers =
      customers?.filter((customer) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        const isValid = customer.email && emailRegex.test(customer.email)
        if (!isValid) {
          console.log(`Invalid email found: ${customer.email}`)
        }
        return isValid
      }) || []

    console.log(`Found ${validCustomers.length} customers with valid emails`)

    // Log some sample emails for debugging
    const sampleEmails = validCustomers.slice(0, 5).map((c) => c.email)
    console.log("Sample valid emails:", sampleEmails)

    return NextResponse.json({
      success: true,
      totalCustomers: validCustomers.length,
      customers: validCustomers,
      message: "Successfully fetched all registered customers",
    })
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      customers: [],
      totalCustomers: 0,
    })
  }
}
