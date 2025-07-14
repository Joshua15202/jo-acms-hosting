import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export async function POST() {
  try {
    console.log("Creating test payment transaction...")

    // First, let's check if we have any users and appointments
    const { data: users } = await supabaseAdmin.from("tbl_users").select("*").limit(1)
    const { data: appointments } = await supabaseAdmin.from("tbl_comprehensive_appointments").select("*").limit(1)

    if (!users || users.length === 0) {
      return NextResponse.json({ success: false, message: "No users found in database" })
    }

    if (!appointments || appointments.length === 0) {
      return NextResponse.json({ success: false, message: "No appointments found in database" })
    }

    const testUser = users[0]
    const testAppointment = appointments[0]

    // Create a test payment transaction
    const { data: transaction, error } = await supabaseAdmin
      .from("tbl_payment_transactions")
      .insert({
        appointment_id: testAppointment.id,
        user_id: testUser.id,
        amount: 5000.0,
        payment_type: "down_payment",
        payment_method: "gcash",
        reference_number: "TEST123456789",
        notes: "Test payment for debugging",
        proof_image_url: "/placeholder.svg?height=400&width=600&text=Test+Payment+Proof",
        status: "pending_verification",
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating test payment:", error)
      return NextResponse.json({ success: false, error: error.message })
    }

    return NextResponse.json({
      success: true,
      message: "Test payment created successfully",
      transaction,
    })
  } catch (error) {
    console.error("Error in create test payment:", error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    })
  }
}
