import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export async function GET() {
  try {
    console.log("Testing Supabase connection...")

    // Test basic connection
    const { data: testData, error: testError } = await supabaseAdmin
      .from("tbl_comprehensive_appointments")
      .select("booking_source")
      .limit(5)

    if (testError) {
      console.error("Supabase connection error:", testError)
      return NextResponse.json({
        success: false,
        error: "Supabase connection failed",
        details: testError.message,
      })
    }

    // Get existing booking_source values
    const { data: existingValues, error: valuesError } = await supabaseAdmin
      .from("tbl_comprehensive_appointments")
      .select("booking_source")
      .not("booking_source", "is", null)
      .limit(10)

    if (valuesError) {
      console.error("Error getting existing values:", valuesError)
    }

    // Test table structure
    const { data: tableInfo, error: tableError } = await supabaseAdmin
      .rpc("get_table_info", { table_name: "tbl_comprehensive_appointments" })
      .single()

    return NextResponse.json({
      success: true,
      connection: "Working",
      existingBookingSources: existingValues?.map((row) => row.booking_source) || [],
      uniqueBookingSources: [...new Set(existingValues?.map((row) => row.booking_source) || [])],
      tableInfo: tableInfo || "Could not get table info",
      message: "Supabase connection successful",
    })
  } catch (error: any) {
    console.error("Error testing Supabase connection:", error)
    return NextResponse.json({
      success: false,
      error: "Connection test failed",
      details: error.message,
    })
  }
}
