import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { supabaseAdmin } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  console.log("=== DEBUG FULL BOOKING: START ===")

  try {
    // Step 1: Check authentication
    console.log("Step 1: Checking authentication...")
    const cookieStore = await cookies()
    const sessionId = cookieStore.get("session-id")?.value

    if (!sessionId) {
      return NextResponse.json({ success: false, error: "No session ID", step: 1 })
    }

    // Step 2: Get session and user
    console.log("Step 2: Getting session and user...")
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
      return NextResponse.json({
        success: false,
        error: "Session error",
        details: sessionError?.message,
        step: 2,
      })
    }

    const user = session.tbl_users
    if (!user) {
      return NextResponse.json({ success: false, error: "No user found", step: 2 })
    }

    // Step 3: Parse request data
    console.log("Step 3: Parsing request data...")
    const rawData = await request.json()

    // Step 4: Test pricing calculation
    console.log("Step 4: Testing pricing calculation...")
    let pricingBreakdown
    try {
      const { calculatePackagePricing } = await import("@/lib/pricing-calculator")
      const menuSelections = {
        mainCourses: rawData.mainCourses || [],
        pasta: rawData.pasta || "",
        dessert: rawData.dessert || "",
        beverage: rawData.beverage || "",
      }
      pricingBreakdown = await calculatePackagePricing(Number(rawData.guestCount), menuSelections)
    } catch (pricingError) {
      return NextResponse.json({
        success: false,
        error: "Pricing calculation failed",
        details: pricingError.message,
        step: 4,
      })
    }

    // Step 5: Prepare appointment data
    console.log("Step 5: Preparing appointment data...")
    const transformedMainCourses = (rawData.mainCourses || []).map((courseName: string) => ({
      name: courseName,
      category: "main_course",
    }))

    const selectedMenu = {
      main_courses: transformedMainCourses,
      pasta: rawData.pasta || "",
      dessert: rawData.dessert || "",
      beverage: rawData.beverage || "",
    }

    const appointmentData = {
      user_id: user.id,
      contact_first_name: rawData.firstName,
      contact_last_name: rawData.lastName,
      contact_email: rawData.email,
      contact_phone: rawData.phone,
      event_date: rawData.eventDate,
      event_time: rawData.eventTime,
      time_slot: rawData.eventTime,
      event_type: rawData.eventType,
      guest_count: Number(rawData.guestCount),
      venue_address: rawData.venue,
      theme: rawData.theme || null,
      color_motif: rawData.colorMotif || null,
      celebrant_name: rawData.celebrantName || null,
      celebrant_age: rawData.celebrantAge && !isNaN(Number(rawData.celebrantAge)) ? Number(rawData.celebrantAge) : null,
      celebrant_gender: rawData.celebrantGender || null,
      debutante_name: rawData.eventType === "debut" ? rawData.celebrantName : null,
      debutante_gender: rawData.debutanteGender || null,
      groom_name: rawData.groomName || null,
      bride_name: rawData.brideName || null,
      additional_event_info: rawData.additionalEventInfo || null,
      main_courses: transformedMainCourses,
      pasta_selection: rawData.pasta || null,
      beverage_selection: rawData.beverage || null,
      dessert_selection: rawData.dessert || null,
      selected_menu: selectedMenu,
      special_requests: rawData.additionalRequests || null,
      status: "PENDING_TASTING_CONFIRMATION",
      booking_source: "debug_test",
      budget_min: pricingBreakdown.totalAmount,
      budget_max: pricingBreakdown.totalAmount,
    }

    // Step 6: Check table structure
    console.log("Step 6: Checking table structure...")
    const { data: tableInfo, error: tableError } = await supabaseAdmin
      .from("tbl_comprehensive_appointments")
      .select("*")
      .limit(1)

    if (tableError) {
      return NextResponse.json({
        success: false,
        error: "Table structure check failed",
        details: tableError.message,
        step: 6,
      })
    }

    // Step 7: Try to insert appointment (DRY RUN - we'll delete it after)
    console.log("Step 7: Testing appointment insertion...")
    const { data: appointment, error: insertError } = await supabaseAdmin
      .from("tbl_comprehensive_appointments")
      .insert(appointmentData)
      .select()
      .single()

    if (insertError) {
      return NextResponse.json({
        success: false,
        error: "Appointment insertion failed",
        details: insertError.message,
        appointmentData: appointmentData,
        step: 7,
      })
    }

    // Step 8: Clean up - delete the test appointment
    console.log("Step 8: Cleaning up test appointment...")
    await supabaseAdmin.from("tbl_comprehensive_appointments").delete().eq("id", appointment.id)

    return NextResponse.json({
      success: true,
      message: "Full booking flow test completed successfully",
      user: user.email,
      pricingBreakdown,
      appointmentData,
      testAppointmentId: appointment.id,
      step: 8,
    })
  } catch (error: any) {
    console.error("Debug full booking error:", error)
    return NextResponse.json({
      success: false,
      error: "Unexpected error",
      details: error.message,
      stack: error.stack,
      step: "unknown",
    })
  }
}
