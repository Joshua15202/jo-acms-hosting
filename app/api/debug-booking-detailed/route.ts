import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { supabaseAdmin } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  console.log("=== DEBUG BOOKING API ===")

  try {
    // Step 1: Check authentication
    console.log("Step 1: Checking authentication...")
    const cookieStore = await cookies()
    const sessionId = cookieStore.get("session-id")?.value

    console.log("Session ID:", sessionId ? "Present" : "Missing")

    if (!sessionId) {
      return NextResponse.json({
        step: 1,
        success: false,
        error: "No session ID found",
        sessionId: null,
      })
    }

    // Step 2: Get session from database
    console.log("Step 2: Getting session from database...")
    const { data: session, error: sessionError } = await supabaseAdmin
      .from("tbl_sessions")
      .select(`
        *,
        tbl_users (id, email, first_name, last_name, full_name, role, is_verified, phone)
      `)
      .eq("id", sessionId)
      .gt("expires_at", new Date().toISOString())
      .single()

    console.log("Session query result:", { session: !!session, error: sessionError?.message })

    if (sessionError || !session) {
      return NextResponse.json({
        step: 2,
        success: false,
        error: "Session lookup failed",
        sessionError: sessionError?.message,
        hasSession: !!session,
      })
    }

    const user = session.tbl_users
    if (!user) {
      return NextResponse.json({
        step: 2,
        success: false,
        error: "User not found in session",
        session: session,
        user: null,
      })
    }

    // Step 3: Parse request data
    console.log("Step 3: Parsing request data...")
    let requestData
    try {
      requestData = await request.json()
      console.log("Request data keys:", Object.keys(requestData))
    } catch (parseError) {
      return NextResponse.json({
        step: 3,
        success: false,
        error: "Failed to parse request JSON",
        parseError: parseError.message,
      })
    }

    // Step 4: Test Supabase connection
    console.log("Step 4: Testing Supabase connection...")
    const { data: testConnection, error: connectionError } = await supabaseAdmin
      .from("tbl_comprehensive_appointments")
      .select("id")
      .limit(1)

    if (connectionError) {
      return NextResponse.json({
        step: 4,
        success: false,
        error: "Supabase connection failed",
        connectionError: connectionError.message,
      })
    }

    // Step 5: Check existing booking_source values
    console.log("Step 5: Checking existing booking_source values...")
    const { data: existingBookingSources, error: bookingSourceError } = await supabaseAdmin
      .from("tbl_comprehensive_appointments")
      .select("booking_source")
      .not("booking_source", "is", null)
      .limit(5)

    // Step 6: Try a simple insert test
    console.log("Step 6: Testing simple insert...")
    const testInsertData = {
      user_id: user.id,
      contact_first_name: "Test",
      contact_last_name: "User",
      contact_email: user.email,
      contact_phone: "1234567890",
      event_date: "2024-12-31",
      event_time: "10:00 AM",
      time_slot: "10:00 AM",
      event_type: "birthday",
      guest_count: 50,
      venue_address: "Test Venue",
      status: "PENDING_TASTING_CONFIRMATION",
      budget_min: 10000,
      budget_max: 10000,
    }

    // Try without booking_source first
    const { data: testInsert, error: insertError } = await supabaseAdmin
      .from("tbl_comprehensive_appointments")
      .insert(testInsertData)
      .select()
      .single()

    let insertResult = null
    let insertErrorMessage = null

    if (insertError) {
      insertErrorMessage = insertError.message
      console.log("Insert failed:", insertError.message)

      // Try with a booking_source
      if (existingBookingSources && existingBookingSources.length > 0) {
        const testWithBookingSource = {
          ...testInsertData,
          booking_source: existingBookingSources[0].booking_source,
        }

        const { data: testInsert2, error: insertError2 } = await supabaseAdmin
          .from("tbl_comprehensive_appointments")
          .insert(testWithBookingSource)
          .select()
          .single()

        if (!insertError2) {
          insertResult = testInsert2
          // Clean up test record
          await supabaseAdmin.from("tbl_comprehensive_appointments").delete().eq("id", testInsert2.id)
        } else {
          insertErrorMessage = insertError2.message
        }
      }
    } else {
      insertResult = testInsert
      // Clean up test record
      await supabaseAdmin.from("tbl_comprehensive_appointments").delete().eq("id", testInsert.id)
    }

    return NextResponse.json({
      success: true,
      debug: {
        step1_auth: { sessionId: !!sessionId },
        step2_session: {
          hasSession: !!session,
          hasUser: !!user,
          userEmail: user?.email,
          sessionError: sessionError?.message,
        },
        step3_request: {
          hasRequestData: !!requestData,
          requestDataKeys: requestData ? Object.keys(requestData) : [],
        },
        step4_connection: {
          connected: !connectionError,
          connectionError: connectionError?.message,
        },
        step5_booking_sources: {
          existingValues: existingBookingSources?.map((row) => row.booking_source) || [],
          bookingSourceError: bookingSourceError?.message,
        },
        step6_insert_test: {
          insertWorked: !!insertResult,
          insertError: insertErrorMessage,
          testRecordId: insertResult?.id,
        },
      },
    })
  } catch (error: any) {
    console.error("Debug endpoint error:", error)
    return NextResponse.json({
      success: false,
      error: "Debug endpoint failed",
      details: error.message,
      stack: error.stack,
    })
  }
}
