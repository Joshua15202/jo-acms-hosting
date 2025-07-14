import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export async function GET() {
  try {
    console.log("=== Debug All Users ===")

    // Get all users from the database
    const { data: users, error } = await supabaseAdmin
      .from("tbl_users")
      .select("id, email, full_name, created_at")
      .order("created_at", { ascending: false })
      .limit(10)

    if (error) {
      console.error("Error fetching users:", error)
      return NextResponse.json({
        error: error.message,
        users: null,
      })
    }

    console.log("Found users:", users?.length || 0)

    return NextResponse.json({
      totalUsers: users?.length || 0,
      users: users || [],
      message: "These are the users in your database",
    })
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : "Unknown error",
      users: null,
    })
  }
}
