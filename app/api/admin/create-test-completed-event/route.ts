import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { randomUUID } from "crypto"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { eventType, guestCount, totalPackageAmount, eventDate } = body

    console.log("Creating test completed event with data:", body)

    // Generate proper UUIDs
    const appointmentId = randomUUID()
    const userId = randomUUID()

    // First, create a test user if needed
    const { data: existingUser, error: userCheckError } = await supabase
      .from("tbl_users")
      .select("id")
      .eq("email", "test@example.com")
      .single()

    let testUserId = existingUser?.id

    if (!testUserId) {
      console.log("Creating test user...")
      const { data: newUser, error: userCreateError } = await supabase
        .from("tbl_users")
        .insert({
          id: userId,
          email: "test@example.com",
          first_name: "Test",
          last_name: "Customer",
          phone: "+1234567890",
          password_hash: "test_hash",
          role: "user",
          is_verified: true,
        })
        .select("id")
        .single()

      if (userCreateError) {
        console.error("Error creating test user:", userCreateError)
        throw userCreateError
      }

      testUserId = userId
      console.log("Test user created with ID:", testUserId)
    } else {
      console.log("Using existing test user:", testUserId)
    }

    // Create the completed appointment with all required fields
    const appointmentData = {
      id: appointmentId,
      user_id: testUserId,
      contact_first_name: "Test",
      contact_last_name: "Customer",
      contact_email: "test@example.com",
      contact_phone: "+1234567890",
      event_type: eventType || "Wedding",
      event_date: eventDate || new Date().toISOString().split("T")[0],
      event_time: "6:00 PM",
      time_slot: "6:00 PM",
      guest_count: guestCount || 50,
      venue_address: "Test Venue Address",
      budget_min: totalPackageAmount || 75000,
      budget_max: totalPackageAmount || 75000,
      total_package_amount: totalPackageAmount || 75000,
      service_fee: 0,
      down_payment_amount: 0,
      status: "completed",
      booking_source: "test",
      payment_status: "paid",
      special_requests: "Test completed event for revenue verification",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    console.log("Inserting appointment data:", appointmentData)

    const { data: appointment, error: appointmentError } = await supabase
      .from("tbl_comprehensive_appointments")
      .insert(appointmentData)
      .select()
      .single()

    if (appointmentError) {
      console.error("Error creating appointment:", appointmentError)
      throw appointmentError
    }

    console.log("Test completed event created successfully:", appointment)

    return NextResponse.json({
      success: true,
      message: "Test completed event created successfully",
      eventId: appointmentId,
      userId: testUserId,
      eventType: eventType || "Wedding",
      guestCount: guestCount || 50,
      totalPackageAmount: totalPackageAmount || 75000,
      eventDate: eventDate || new Date().toISOString().split("T")[0],
      appointmentData: appointment,
    })
  } catch (error) {
    console.error("Error in create test completed event API:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create test completed event",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
