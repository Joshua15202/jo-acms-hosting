import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"
import { cookies } from "next/headers"
import { verifyToken } from "@/lib/auth-utils"

export async function POST() {
  try {
    console.log("=== CREATE TEST PAYMENT TRANSACTION API CALLED ===")

    const cookieStore = await cookies()
    const sessionToken =
      cookieStore.get("session-id")?.value ||
      cookieStore.get("user-session")?.value ||
      cookieStore.get("auth-token")?.value

    if (!sessionToken) {
      return NextResponse.json({ success: false, error: "No session token found" }, { status: 401 })
    }

    let tokenData: any
    try {
      tokenData = await verifyToken(sessionToken)
      console.log("Token data:", tokenData)
    } catch (error) {
      console.error("Token verification failed:", error)
      return NextResponse.json({ success: false, error: "Token verification failed" }, { status: 401 })
    }

    const userId = tokenData.userId

    // Check if user exists
    const { data: user, error: userError } = await supabaseAdmin.from("tbl_users").select("*").eq("id", userId).single()

    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 })
    }

    console.log("Creating test data for user:", user.email)

    // Create first test appointment (completed with payment)
    const appointment1Data = {
      user_id: userId,
      contact_first_name: "Test",
      contact_last_name: "User",
      contact_email: user.email,
      contact_phone: "09123456789",
      event_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // 7 days from now
      event_time: "14:00:00",
      time_slot: "2:00 PM - 4:00 PM",
      event_type: "debut",
      guest_count: 50,
      venue_address: "Test Venue Address, City",
      selected_menu: JSON.stringify([
        "Grilled Salmon with Herbs",
        "Beef Tenderloin",
        "Vegetarian Pasta",
        "Chocolate Cake",
      ]),
      beverage_selection: "Premium Wine Package",
      special_requests: "Test appointment with verified payment",
      status: "confirmed",
      booking_source: "website",
      payment_status: "partially_paid",
      pending_payment_type: "remaining_balance",
      theme: "Elegant Garden",
      total_package_amount: 75000.0,
      down_payment_amount: 37500.0,
      remaining_balance: 37500.0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    const { data: appointment1, error: appointment1Error } = await supabaseAdmin
      .from("tbl_comprehensive_appointments")
      .insert(appointment1Data)
      .select()
      .single()

    if (appointment1Error) {
      console.error("Error creating first appointment:", appointment1Error)
      return NextResponse.json(
        {
          success: false,
          error: "Failed to create first appointment",
          details: appointment1Error.message,
        },
        { status: 500 },
      )
    }

    // Create verified payment transaction for first appointment
    const transaction1Data = {
      user_id: userId,
      appointment_id: appointment1.id,
      amount: 37500.0,
      payment_method: "bank_transfer",
      reference_number: `TEST_${Date.now()}_1`,
      proof_image_url: "https://example.com/test-receipt.jpg",
      status: "verified",
      payment_type: "down_payment",
      appointment_payment_status: "partially_paid",
      notes: "Test down payment - verified",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    const { data: transaction1, error: transaction1Error } = await supabaseAdmin
      .from("tbl_payment_transactions")
      .insert(transaction1Data)
      .select()
      .single()

    if (transaction1Error) {
      console.error("Error creating first transaction:", transaction1Error)
      return NextResponse.json(
        {
          success: false,
          error: "Failed to create first transaction",
          details: transaction1Error.message,
        },
        { status: 500 },
      )
    }

    // Create second test appointment (unpaid)
    const appointment2Data = {
      user_id: userId,
      contact_first_name: "Test",
      contact_last_name: "User",
      contact_email: user.email,
      contact_phone: "09123456789",
      event_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // 14 days from now
      event_time: "16:00:00",
      time_slot: "4:00 PM - 6:00 PM",
      event_type: "wedding",
      guest_count: 75,
      venue_address: "Test Venue Address 2, City",
      selected_menu: JSON.stringify(["Chicken Cordon Bleu", "Fish Fillet", "Vegetable Stir Fry", "Tiramisu"]),
      beverage_selection: "Standard Wine Package",
      special_requests: "Test appointment - needs payment",
      status: "TASTING_COMPLETED",
      booking_source: "website",
      payment_status: "unpaid",
      theme: "Modern Minimalist",
      total_package_amount: 90000.0,
      down_payment_amount: 45000.0,
      remaining_balance: 90000.0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    const { data: appointment2, error: appointment2Error } = await supabaseAdmin
      .from("tbl_comprehensive_appointments")
      .insert(appointment2Data)
      .select()
      .single()

    if (appointment2Error) {
      console.error("Error creating second appointment:", appointment2Error)
      return NextResponse.json(
        {
          success: false,
          error: "Failed to create second appointment",
          details: appointment2Error.message,
        },
        { status: 500 },
      )
    }

    console.log("Test data created successfully")

    return NextResponse.json({
      success: true,
      message: "Test payment data created successfully",
      data: {
        user: {
          id: user.id,
          email: user.email,
          full_name: user.full_name,
        },
        appointments: [
          {
            id: appointment1.id,
            status: appointment1.status,
            payment_status: appointment1.payment_status,
            total_package_amount: appointment1.total_package_amount,
            down_payment_amount: appointment1.down_payment_amount,
          },
          {
            id: appointment2.id,
            status: appointment2.status,
            payment_status: appointment2.payment_status,
            total_package_amount: appointment2.total_package_amount,
            down_payment_amount: appointment2.down_payment_amount,
          },
        ],
        transactions: [
          {
            id: transaction1.id,
            amount: transaction1.amount,
            status: transaction1.status,
            payment_type: transaction1.payment_type,
            reference_number: transaction1.reference_number,
          },
        ],
      },
    })
  } catch (error: any) {
    console.error("Unexpected error in create test payment transaction:", error)
    return NextResponse.json(
      { success: false, message: "An unexpected error occurred", error: error.message },
      { status: 500 },
    )
  }
}
