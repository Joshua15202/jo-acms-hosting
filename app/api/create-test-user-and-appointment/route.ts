import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"
import { v4 as uuidv4 } from "uuid"
import { hashPassword } from "@/lib/auth-utils"
import { cookies } from "next/headers"

export async function POST(request: Request) {
  try {
    console.log("=== CREATING TEST USER AND APPOINTMENT ===")

    // Create a test user with the correct column names
    const testUserId = uuidv4()
    const testEmail = `testuser${Date.now()}@example.com`
    const hashedPassword = await hashPassword("testpassword123")

    console.log("Creating test user:", { testUserId, testEmail })

    // Create user without full_name since it's a generated column
    const { data: newUser, error: userError } = await supabaseAdmin
      .from("tbl_users")
      .insert({
        id: testUserId,
        first_name: "Test",
        last_name: "User",
        email: testEmail,
        phone: "09123456789",
        password_hash: hashedPassword,
        role: "user",
        is_verified: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (userError) {
      console.error("Error creating test user:", userError)
      return NextResponse.json({ success: false, error: userError.message }, { status: 500 })
    }

    console.log("Test user created successfully:", newUser)

    // Create a test appointment that should show in payment center
    const testAppointmentId = uuidv4()

    console.log("Creating test appointment:", { testAppointmentId, testUserId })

    // Get the current date and time for proper scheduling
    const eventDate = new Date()
    eventDate.setDate(eventDate.getDate() + 30) // 30 days from now
    const eventDateStr = eventDate.toISOString().split("T")[0] // YYYY-MM-DD format

    const { data: newAppointment, error: appointmentError } = await supabaseAdmin
      .from("tbl_comprehensive_appointments")
      .insert({
        id: testAppointmentId,
        user_id: testUserId,
        contact_first_name: "Test",
        contact_last_name: "User",
        contact_full_name: "Test User",
        contact_email: testEmail,
        contact_phone: "09123456789",
        event_date: eventDateStr,
        event_time: "18:00",
        time_slot: "18:00-22:00", // Required field
        event_type: "wedding",
        guest_count: 100,
        venue_address: "Test Venue Address, Test City",
        pasta_selection: "Creamy Carbonara",
        beverage_selection: "Fresh Lemonade",
        dessert_selection: "Chocolate Cake",
        special_requests: "This is a test appointment created for debugging purposes.",
        theme: "Elegant Garden",
        color_motif: "Gold and White",
        status: "TASTING_COMPLETED", // This should make it show in payment center
        booking_source: "website",
        payment_status: "unpaid", // This should make it show in payment center
        pending_payment_type: "remaining_balance", // What type of payment is pending
        total_package_amount: 50000.0,
        down_payment_amount: 25000.0,
        remaining_balance: 25000.0,
        service_fee: 0.0,
        is_rush_order: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (appointmentError) {
      console.error("Error creating test appointment:", appointmentError)
      return NextResponse.json({ success: false, error: appointmentError.message }, { status: 500 })
    }

    console.log("Test appointment created successfully:", newAppointment)

    // Create a session for this test user
    const sessionId = uuidv4()
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7) // 7 days from now

    console.log("Creating test session:", { sessionId, testUserId })

    const { data: newSession, error: sessionError } = await supabaseAdmin
      .from("tbl_sessions")
      .insert({
        id: sessionId,
        user_id: testUserId,
        expires_at: expiresAt.toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (sessionError) {
      console.error("Error creating test session:", sessionError)
      return NextResponse.json({ success: false, error: sessionError.message }, { status: 500 })
    }

    console.log("Test session created successfully:", newSession)

    // Set the session cookie so the user is automatically logged in
    const cookieStore = await cookies()
    cookieStore.set("session-id", sessionId, {
      httpOnly: true,
      expires: expiresAt,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    })

    console.log("Session cookie set successfully")

    // Also create a second appointment that's already paid (for payment history testing)
    const testAppointmentId2 = uuidv4()
    const testTransactionId = uuidv4()

    console.log("Creating second test appointment for payment history...")

    const eventDate2 = new Date()
    eventDate2.setDate(eventDate2.getDate() + 45) // 45 days from now
    const eventDateStr2 = eventDate2.toISOString().split("T")[0]

    const { data: newAppointment2, error: appointmentError2 } = await supabaseAdmin
      .from("tbl_comprehensive_appointments")
      .insert({
        id: testAppointmentId2,
        user_id: testUserId,
        contact_first_name: "Test",
        contact_last_name: "User",
        contact_full_name: "Test User",
        contact_email: testEmail,
        contact_phone: "09123456789",
        event_date: eventDateStr2,
        event_time: "14:00",
        time_slot: "14:00-18:00", // Required field
        event_type: "birthday",
        guest_count: 50,
        venue_address: "Test Birthday Venue, Test City",
        pasta_selection: "Spaghetti Bolognese",
        beverage_selection: "Fruit Punch",
        dessert_selection: "Birthday Cake",
        special_requests: "This is a second test appointment for payment history testing.",
        theme: "Colorful Birthday",
        color_motif: "Rainbow",
        status: "confirmed",
        booking_source: "website",
        payment_status: "partially_paid",
        pending_payment_type: "remaining_balance",
        total_package_amount: 30000.0,
        down_payment_amount: 15000.0,
        remaining_balance: 15000.0,
        service_fee: 0.0,
        is_rush_order: false,
        created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
        updated_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      })
      .select()
      .single()

    if (!appointmentError2) {
      // Create a payment transaction for this appointment
      const { data: newTransaction, error: transactionError } = await supabaseAdmin
        .from("tbl_payment_transactions")
        .insert({
          id: testTransactionId,
          appointment_id: testAppointmentId2,
          amount: 15000.0,
          payment_type: "down_payment",
          payment_method: "gcash",
          reference_number: "GCASH123456789",
          notes: "Test down payment for birthday party",
          status: "verified",
          created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(), // 6 days ago
          updated_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
        })
        .select()
        .single()

      if (transactionError) {
        console.error("Error creating test transaction:", transactionError)
      } else {
        console.log("Test transaction created successfully:", newTransaction)
      }
    } else {
      console.error("Error creating second test appointment:", appointmentError2)
    }

    return NextResponse.json({
      success: true,
      message: "Test user and appointments created successfully! The page will refresh automatically.",
      data: {
        user: {
          id: testUserId,
          email: testEmail,
          name: "Test User",
        },
        appointments: [
          {
            id: testAppointmentId,
            event_type: "wedding",
            status: "TASTING_COMPLETED",
            payment_status: "unpaid",
            total_amount: 50000,
            down_payment: 25000,
            remaining_balance: 25000,
          },
          {
            id: testAppointmentId2,
            event_type: "birthday",
            status: "confirmed",
            payment_status: "partially_paid",
            total_amount: 30000,
            down_payment: 15000,
            remaining_balance: 15000,
          },
        ],
        session: {
          id: sessionId,
          expires_at: expiresAt.toISOString(),
        },
        transaction: testTransactionId
          ? {
              id: testTransactionId,
              amount: 15000,
              status: "verified",
            }
          : null,
      },
    })
  } catch (error: any) {
    console.error("Unexpected error creating test data:", error)
    return NextResponse.json(
      {
        success: false,
        message: "An unexpected error occurred",
        error: error.message,
        stack: error.stack,
      },
      { status: 500 },
    )
  }
}
