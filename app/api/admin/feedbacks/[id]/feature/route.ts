import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { supabaseAdmin } from "@/lib/supabase"

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const cookieStore = await cookies()
    const adminUserCookie = cookieStore.get("adminUser")?.value
    const adminAuthenticated = cookieStore.get("adminAuthenticated")?.value

    console.log("[v0] Feature toggle API - auth check:", {
      adminUserCookie: !!adminUserCookie,
      adminAuthenticated,
    })

    if (adminAuthenticated !== "true" || !adminUserCookie) {
      console.log("[v0] Feature toggle API - Unauthorized")
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { featured } = body

    console.log("[v0] Feature toggle API - updating testimonial:", id, "to featured:", featured)

    // Update testimonial featured status
    const { error: updateError } = await supabaseAdmin
      .from("tbl_testimonials")
      .update({ featured_on_homepage: featured })
      .eq("id", id)

    if (updateError) {
      console.error("[v0] Feature toggle API - Error updating:", updateError)
      return NextResponse.json({ success: false, error: "Failed to update featured status" }, { status: 500 })
    }

    console.log("[v0] Feature toggle API - Update successful")
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Feature toggle API - Error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
