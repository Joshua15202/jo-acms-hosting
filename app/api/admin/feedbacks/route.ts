import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"
import { cookies } from "next/headers"

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const adminAuthenticated = cookieStore.get("adminAuthenticated")?.value
    const adminUserCookie = cookieStore.get("adminUser")?.value

    console.log("[v0] Admin feedbacks - adminAuthenticated:", adminAuthenticated)

    if (adminAuthenticated !== "true" || !adminUserCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Changed event_name to event_type, contact_name to contact_full_name
    const { data: testimonials, error } = await supabaseAdmin
      .from("tbl_testimonials")
      .select(`
        *,
        tbl_comprehensive_appointments (
          event_type,
          event_date,
          contact_email,
          contact_full_name
        )
      `)
      .order("created_at", { ascending: false })

    console.log("[v0] Admin feedbacks - testimonials count:", testimonials?.length || 0)
    console.log("[v0] Admin feedbacks - error:", error)

    if (error) {
      console.error("Error fetching testimonials:", error)
      return NextResponse.json({ error: "Failed to fetch feedbacks" }, { status: 500 })
    }

    return NextResponse.json({ testimonials: testimonials || [] })
  } catch (error) {
    console.error("Error in admin feedbacks API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
