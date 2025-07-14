import { NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET() {
  try {
    console.log("Checking existing booking_source values...")

    // Check existing values in the table
    const existingValues = await query(`
      SELECT DISTINCT booking_source, COUNT(*) as count
      FROM tbl_comprehensive_appointments 
      WHERE booking_source IS NOT NULL
      GROUP BY booking_source
      ORDER BY count DESC
    `)

    // Try to insert a test record to see what constraint error we get
    try {
      await query(`
        INSERT INTO tbl_comprehensive_appointments (
          user_id, contact_first_name, contact_last_name, contact_email, 
          contact_phone, event_date, event_time, event_type, guest_count,
          venue_address, status, booking_source, created_at
        ) VALUES (
          'test-user-id', 'Test', 'User', 'test@test.com', 
          '1234567890', '2024-12-31', 'lunch', 'birthday', 10,
          'Test Address', 'PENDING_TASTING_CONFIRMATION', 'test_source', NOW()
        )
      `)
    } catch (testError: any) {
      console.log("Test insert error (expected):", testError.message)

      // Clean up the test record if it somehow got inserted
      try {
        await query(`DELETE FROM tbl_comprehensive_appointments WHERE contact_email = 'test@test.com'`)
      } catch (cleanupError) {
        // Ignore cleanup errors
      }

      return NextResponse.json({
        success: true,
        existingValues,
        constraintError: testError.message,
        message: "Existing booking sources retrieved with constraint info",
      })
    }

    return NextResponse.json({
      success: true,
      existingValues,
      message: "No constraint found - test insert succeeded",
    })
  } catch (error: any) {
    console.error("Error checking booking sources:", error)
    return NextResponse.json({
      success: false,
      error: "Internal server error",
      details: error.message,
    })
  }
}
