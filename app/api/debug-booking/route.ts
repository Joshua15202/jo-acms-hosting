import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { supabaseAdmin } from "@/lib/supabase"
import { calculatePackagePricing, type MenuSelections } from "@/lib/pricing-calculator"

export async function POST(request: NextRequest) {
  console.log("=== DEBUG BOOKING API ===")

  try {
    // Step 1: Check authentication
    console.log("1. Checking authentication...")
    const cookieStore = await cookies()
    const sessionId = cookieStore.get("session-id")?.value
    console.log("Session ID:", sessionId ? "Present" : "Missing")

    if (!sessionId) {
      return NextResponse.json({ error: "No session ID", step: 1 })
    }

    // Step 2: Get session
    console.log("2. Getting session...")
    const { data: session, error: sessionError } = await supabaseAdmin
      .from("tbl_sessions")
      .select(`
        *,
        tbl_users (id, email, first_name, last_name, full_name, role, is_verified, phone)
      `)
      .eq("id", sessionId)
      .gt("expires_at", new Date().toISOString())
      .single()

    if (sessionError || !session) {
      console.log("Session error:", sessionError)
      return NextResponse.json({ error: "Session error", details: sessionError, step: 2 })
    }

    const user = session.tbl_users
    console.log("User found:", user?.email)

    // Step 3: Parse request data
    console.log("3. Parsing request data...")
    const rawData = await request.json()
    console.log("Raw data keys:", Object.keys(rawData))
    console.log("Guest count:", rawData.guestCount)
    console.log("Main courses:", rawData.mainCourses)

    // Step 4: Test pricing calculation
    console.log("4. Testing pricing calculation...")
    try {
      const menuSelections: MenuSelections = {
        mainCourses: rawData.mainCourses || [],
        pasta: rawData.pasta || "",
        dessert: rawData.dessert || "",
        beverage: rawData.beverage || "",
      }

      console.log("Menu selections:", menuSelections)

      const pricingBreakdown = await calculatePackagePricing(Number(rawData.guestCount), menuSelections)
      console.log("Pricing breakdown:", pricingBreakdown)

      return NextResponse.json({
        success: true,
        user: user?.email,
        pricingBreakdown,
        menuSelections,
        step: 4,
      })
    } catch (pricingError) {
      console.error("Pricing calculation error:", pricingError)
      return NextResponse.json({
        error: "Pricing calculation failed",
        details: pricingError.message,
        stack: pricingError.stack,
        step: 4,
      })
    }
  } catch (error: any) {
    console.error("Debug booking error:", error)
    return NextResponse.json({
      error: "Debug failed",
      details: error.message,
      stack: error.stack,
      step: "unknown",
    })
  }
}
