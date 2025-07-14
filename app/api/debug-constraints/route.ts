import { NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET() {
  try {
    console.log("Checking database constraints...")

    // Check table structure and constraints
    const tableInfo = await query(`
      SHOW CREATE TABLE tbl_comprehensive_appointments
    `)

    // Check existing booking_source values
    const existingValues = await query(`
      SELECT DISTINCT booking_source 
      FROM tbl_comprehensive_appointments 
      WHERE booking_source IS NOT NULL
    `)

    // Check if there are any check constraints
    const constraints = await query(`
      SELECT 
        CONSTRAINT_NAME,
        CHECK_CLAUSE
      FROM INFORMATION_SCHEMA.CHECK_CONSTRAINTS 
      WHERE CONSTRAINT_SCHEMA = DATABASE()
      AND TABLE_NAME = 'tbl_comprehensive_appointments'
    `)

    return NextResponse.json({
      success: true,
      tableStructure: tableInfo,
      existingBookingSources: existingValues,
      constraints: constraints,
      message: "Constraint information retrieved",
    })
  } catch (error: any) {
    console.error("Error in debug-constraints:", error)
    return NextResponse.json({
      success: false,
      error: "Internal server error",
      details: error.message,
    })
  }
}
