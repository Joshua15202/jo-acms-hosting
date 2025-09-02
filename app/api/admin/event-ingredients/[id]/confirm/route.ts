import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const appointmentId = params.id

    console.log(`=== Confirming ingredients for appointment ${appointmentId} ===`)

    // First, get the appointment details
    const { data: appointment, error: fetchError } = await supabaseAdmin
      .from("tbl_comprehensive_appointments")
      .select("*")
      .eq("id", appointmentId)
      .single()

    if (fetchError || !appointment) {
      console.error("Error fetching appointment:", fetchError)
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 })
    }

    // Check if already confirmed
    if (appointment.admin_notes && appointment.admin_notes.includes("INGREDIENTS_CONFIRMED")) {
      return NextResponse.json({ error: "Ingredients already confirmed for this event" }, { status: 400 })
    }

    // Update admin_notes to mark ingredients as confirmed
    const currentNotes = appointment.admin_notes || ""
    const updatedNotes = currentNotes
      ? `${currentNotes}\n\nINGREDIENTS_CONFIRMED: ${new Date().toISOString()}`
      : `INGREDIENTS_CONFIRMED: ${new Date().toISOString()}`

    const { error: updateError } = await supabaseAdmin
      .from("tbl_comprehensive_appointments")
      .update({
        admin_notes: updatedNotes,
        updated_at: new Date().toISOString(),
      })
      .eq("id", appointmentId)

    if (updateError) {
      console.error("Error updating appointment:", updateError)
      return NextResponse.json({ error: "Failed to confirm ingredients" }, { status: 500 })
    }

    // Optionally, create a record in the event ingredients table for tracking
    try {
      const mainCourses = appointment.main_courses || []
      const mainCourseItems = Array.isArray(mainCourses) ? mainCourses : []

      await supabaseAdmin.from("tbl_event_ingredients").insert({
        appointment_id: appointmentId,
        event_date: appointment.event_date,
        customer_name: `${appointment.contact_first_name} ${appointment.contact_last_name}`,
        guest_count: appointment.guest_count,
        main_course_items: mainCourseItems,
        total_weight_kg: 0, // Will be calculated if needed
        status: "confirmed",
        confirmed_at: new Date().toISOString(),
        confirmed_by: "admin", // Could be dynamic based on session
      })
    } catch (insertError) {
      console.warn("Could not create event ingredients record:", insertError)
      // Don't fail the main operation if this fails
    }

    console.log(`Successfully confirmed ingredients for appointment ${appointmentId}`)

    return NextResponse.json({
      success: true,
      message: "Ingredients confirmed successfully",
      appointment_id: appointmentId,
    })
  } catch (error) {
    console.error("Error in confirm ingredients API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
