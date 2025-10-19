export const dynamic = "force-dynamic"
export const revalidate = 0

import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export async function GET() {
  try {
    console.log("=== Admin: Fetching all appointments ===")

    const { data: appointments, error } = await supabaseAdmin
      .from("tbl_comprehensive_appointments")
      .select(
        `
        *,
        tbl_users (
          id,
          full_name,
          email,
          phone
        )
      `,
      )
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching appointments:", error)
      return NextResponse.json(
        {
          success: false,
          message: "Failed to fetch appointments",
          error: error.message,
        },
        {
          status: 500,
          headers: {
            "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
            Pragma: "no-cache",
            Expires: "0",
          },
        },
      )
    }

    console.log(`Fetched ${appointments?.length || 0} appointments`)

    return NextResponse.json(
      {
        success: true,
        appointments: appointments || [],
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      },
    )
  } catch (error) {
    console.error("Unexpected error fetching appointments:", error)
    return NextResponse.json(
      {
        success: false,
        message: "An unexpected error occurred",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      },
    )
  }
}
