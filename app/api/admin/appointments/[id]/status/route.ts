import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { status, notes } = await request.json()

    console.log(`=== Admin: Updating appointment ${id} status to ${status} ===`)

    // Validate status
    const validStatuses = [
      "pending",
      "confirmed",
      "cancelled",
      "completed",
      "PENDING_TASTING_CONFIRMATION",
      "TASTING_CONFIRMED",
      "TASTING_COMPLETED",
      "TASTING_RESCHEDULE_REQUESTED",
    ]

    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid status value",
        },
        { status: 400 },
      )
    }

    // Update appointment status
    const { data, error } = await supabaseAdmin
      .from("tbl_comprehensive_appointments")
      .update({
        status,
        admin_notes: notes || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select(`
        *,
        tbl_users (
          id,
          full_name,
          email,
          phone
        )
      `)
      .single()

    if (error) {
      console.error("Error updating appointment status:", error)
      return NextResponse.json(
        {
          success: false,
          message: "Failed to update appointment status",
          error: error.message,
        },
        { status: 500 },
      )
    }

    console.log(`Successfully updated appointment ${id} status to ${status}`)

    return NextResponse.json({
      success: true,
      message: "Appointment status updated successfully",
      appointment: data,
    })
  } catch (error) {
    console.error("Unexpected error updating appointment status:", error)
    return NextResponse.json(
      {
        success: false,
        message: "An unexpected error occurred",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
