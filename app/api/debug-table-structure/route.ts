import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export async function GET() {
  try {
    // Get table structure information
    const { data, error } = await supabaseAdmin
      .from("information_schema.columns")
      .select("column_name, data_type, is_nullable")
      .eq("table_name", "tbl_comprehensive_appointments")
      .order("ordinal_position")

    if (error) {
      return NextResponse.json({
        success: false,
        error: "Failed to get table structure",
        details: error.message,
      })
    }

    // Also try to get a sample record to see what columns actually exist
    const { data: sampleRecord, error: sampleError } = await supabaseAdmin
      .from("tbl_comprehensive_appointments")
      .select("*")
      .limit(1)
      .single()

    return NextResponse.json({
      success: true,
      tableStructure: data,
      sampleRecord: sampleRecord || "No records found",
      sampleError: sampleError?.message || null,
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: "Unexpected error",
      details: error.message,
    })
  }
}
