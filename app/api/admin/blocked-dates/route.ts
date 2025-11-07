import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export async function GET() {
  try {
    const { data: blockedDates, error } = await supabaseAdmin
      .from("tbl_blocked_dates")
      .select("*")
      .order("blocked_date", { ascending: true })

    if (error) {
      console.error("Error fetching blocked dates:", error)
      return NextResponse.json({ error: "Failed to fetch blocked dates" }, { status: 500 })
    }

    return NextResponse.json({ blockedDates })
  } catch (error) {
    console.error("Error in GET /api/admin/blocked-dates:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { blocked_date, reason } = body

    if (!blocked_date) {
      return NextResponse.json({ error: "blocked_date is required" }, { status: 400 })
    }

    // Get admin user info (optional - you can remove this if not needed)
    const { data: adminDbUser } = await supabaseAdmin
      .from("tbl_users")
      .select("id")
      .eq("username", "admin")
      .maybeSingle()

    const { data: blockedDate, error } = await supabaseAdmin
      .from("tbl_blocked_dates")
      .insert({
        blocked_date,
        reason: reason || null,
        blocked_by: adminDbUser?.id || null,
      })
      .select()
      .single()

    if (error) {
      console.error("Error blocking date:", error)
      return NextResponse.json({ error: "Failed to block date" }, { status: 500 })
    }

    return NextResponse.json({ blockedDate })
  } catch (error) {
    console.error("Error in POST /api/admin/blocked-dates:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
