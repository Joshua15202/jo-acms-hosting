export const dynamic = "force-dynamic"
export const revalidate = 0

import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { supabaseAdmin } from "@/lib/supabase"

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const { status, notes } = await request.json()

    console.log(`=== Admin: Updating appointment ${id} status to ${status} ===`)

    // Check admin authentication
    const cookieStore = await cookies()
    const adminAuthenticated = cookieStore.get("adminAuthenticated")?.value
    const adminUserCookie = cookieStore.get("adminUser")?.value

    console.log("Admin auth check:", {
      adminAuthenticated,
      hasAdminUser: !!adminUserCookie,
    })

    if (adminAuthenticated !== "true" || !adminUserCookie) {
      console.log("Unauthorized: Admin not authenticated")
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized - Admin authentication required",
        },
        {
          status: 401,
          headers: {
            "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
            Pragma: "no-cache",
            Expires: "0",
          },
        },
      )
    }

    const adminUser = JSON.parse(adminUserCookie)
    console.log("Admin user:", adminUser.username)

    // Validate status
    const validStatuses = [
      "pending",
      "confirmed",
      "cancelled",
      "completed",
      "rescheduled",
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
        {
          status: 400,
          headers: {
            "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
            Pragma: "no-cache",
            Expires: "0",
          },
        },
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
      .single()

    if (error) {
      console.error("Error updating appointment status:", error)
      return NextResponse.json(
        {
          success: false,
          message: "Failed to update appointment status",
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

    console.log(`Successfully updated appointment ${id} status to ${status}`)

    const statusTitles: { [key: string]: string } = {
      pending: "Appointment Pending",
      confirmed: "Appointment Confirmed",
      cancelled: "Appointment Cancelled",
      completed: "Appointment Completed",
      rescheduled: "Appointment Rescheduled",
      PENDING_TASTING_CONFIRMATION: "Tasting Session Pending",
      TASTING_CONFIRMED: "Tasting Session Confirmed",
      TASTING_COMPLETED: "Tasting Session Completed",
      TASTING_RESCHEDULE_REQUESTED: "Reschedule Request Received",
    }

    const statusMessages: { [key: string]: string } = {
      pending: "Your appointment is now pending review",
      confirmed: "Your appointment has been confirmed! 🎉",
      cancelled: "Your appointment has been cancelled",
      completed: "Your appointment has been marked as completed. Thank you!",
      rescheduled: "Your appointment has been successfully rescheduled to a new date and time",
      PENDING_TASTING_CONFIRMATION: "Your tasting session is pending confirmation",
      TASTING_CONFIRMED: "Your tasting session has been confirmed!",
      TASTING_COMPLETED: "Your tasting session has been completed",
      TASTING_RESCHEDULE_REQUESTED: "Your tasting session reschedule request is being processed",
    }

    const notificationTitle = statusTitles[status] || "Appointment Status Updated"
    const notificationMessage = statusMessages[status] || `Your appointment status has been updated to ${status}`

    console.log("[v0] Creating notification for user:", data.user_id)
    console.log("[v0] Notification details:", { title: notificationTitle, message: notificationMessage })

    try {
      const { data: notificationData, error: notificationError } = await supabaseAdmin
        .from("tbl_notifications")
        .insert({
          user_id: data.user_id,
          appointment_id: id,
          title: notificationTitle,
          type: "status_update",
          message: notificationMessage,
          is_read: false,
          created_at: new Date().toISOString(),
        })
        .select()

      if (notificationError) {
        console.error("[v0] Error creating notification:", notificationError)
        console.error("[v0] Error details:", JSON.stringify(notificationError, null, 2))
      } else {
        console.log("[v0] Successfully created notification:", notificationData)
      }
    } catch (notifError) {
      console.error("[v0] Unexpected error creating notification:", notifError)
    }

    return NextResponse.json(
      {
        success: true,
        message: "Appointment status updated successfully",
        appointment: data,
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
    console.error("Unexpected error updating appointment status:", error)
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
