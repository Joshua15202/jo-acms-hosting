import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const appointmentId = params.id
    const body = await request.json()

    console.log("=== Updating Appointment ===")
    console.log("Appointment ID:", appointmentId)
    console.log("Update data:", body)

    // First, fetch the appointment to check payment status
    const { data: appointment, error: fetchError } = await supabaseAdmin
      .from("tbl_comprehensive_appointments")
      .select("payment_status, user_id, selected_menu")
      .eq("id", appointmentId)
      .single()

    if (fetchError || !appointment) {
      console.error("Appointment not found:", fetchError)
      return NextResponse.json({ success: false, error: "Appointment not found" }, { status: 404 })
    }

    console.log("Current appointment:", appointment)

    // Check if appointment is unpaid
    if (appointment.payment_status !== "unpaid") {
      console.error("Appointment is already paid, cannot edit")
      return NextResponse.json(
        { success: false, error: "Cannot edit appointments that have been paid" },
        { status: 403 },
      )
    }

    const updateData: any = {}

    if (body.venue_address) updateData.venue_address = body.venue_address
    if (body.guest_count) updateData.guest_count = body.guest_count
    if (body.main_courses) updateData.main_courses = body.main_courses
    if (body.pasta_selection) updateData.pasta_selection = body.pasta_selection
    if (body.dessert_selection) updateData.dessert_selection = body.dessert_selection
    if (body.beverage_selection) updateData.beverage_selection = body.beverage_selection
    if (body.theme !== undefined) updateData.theme = body.theme
    if (body.color_motif !== undefined) updateData.color_motif = body.color_motif
    if (body.special_requests !== undefined) updateData.special_requests = body.special_requests
    if (body.additional_event_info !== undefined) updateData.additional_event_info = body.additional_event_info

    if (body.total_package_amount !== undefined) {
      updateData.total_package_amount = body.total_package_amount
      updateData.total_amount = body.total_package_amount
    }
    if (body.down_payment_amount !== undefined) {
      updateData.down_payment_amount = body.down_payment_amount
      updateData.deposit_amount = body.down_payment_amount
    }

    // Build the selected_menu structure that the admin view expects
    const currentSelectedMenu = appointment.selected_menu || {}
    const newSelectedMenu: any = { ...currentSelectedMenu }

    // Update main_courses if provided
    if (body.selectedMenuIds && Array.isArray(body.selectedMenuIds)) {
      // Fetch the actual menu item names from IDs
      const { data: menuItems, error: menuError } = await supabaseAdmin
        .from("tbl_menu_items")
        .select("id, name")
        .in("id", body.selectedMenuIds)

      if (!menuError && menuItems) {
        newSelectedMenu.main_courses = menuItems.map((item) => ({
          id: item.id,
          name: item.name,
        }))
      }
    }

    // Update pasta, dessert, beverage if provided
    if (body.pasta_selection) {
      newSelectedMenu.pasta = Array.isArray(body.pasta_selection)
        ? body.pasta_selection.join(", ")
        : body.pasta_selection
    }
    if (body.dessert_selection) {
      newSelectedMenu.dessert = Array.isArray(body.dessert_selection)
        ? body.dessert_selection.join(", ")
        : body.dessert_selection
    }
    if (body.beverage_selection) {
      newSelectedMenu.beverage = Array.isArray(body.beverage_selection)
        ? body.beverage_selection.join(", ")
        : body.beverage_selection
    }

    updateData.selected_menu = newSelectedMenu

    console.log("Updated selected_menu:", newSelectedMenu)

    // Update the appointment
    const { data: updatedAppointment, error: updateError } = await supabaseAdmin
      .from("tbl_comprehensive_appointments")
      .update(updateData)
      .eq("id", appointmentId)
      .select()
      .single()

    if (updateError) {
      console.error("Error updating appointment:", updateError)
      return NextResponse.json({ success: false, error: "Failed to update appointment" }, { status: 500 })
    }

    console.log("Appointment updated successfully:", updatedAppointment)

    return NextResponse.json({
      success: true,
      message: "Appointment updated successfully",
      appointment: updatedAppointment,
    })
  } catch (error) {
    console.error("Error in update appointment API:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
