import { supabaseAdmin } from "@/lib/supabase"

interface CreateAdminNotificationParams {
  appointmentId?: string
  paymentTransactionId?: string
  title: string
  message: string
  type: "new_appointment" | "payment_submitted" | "alert" | "feedback" // alert type now includes feedback notifications
}

export async function createAdminNotification(params: CreateAdminNotificationParams) {
  const { appointmentId, paymentTransactionId, title, message, type } = params

  try {
    // Get all admin users (you can filter by role if needed)
    // For now, we'll notify the primary admin "admin"
    const adminUsername = "admin"

    const { error } = await supabaseAdmin.from("tbl_admin_notifications").insert({
      admin_username: adminUsername,
      appointment_id: appointmentId,
      payment_transaction_id: paymentTransactionId,
      title,
      message,
      type,
      is_read: false,
    })

    if (error) {
      console.error("Error creating admin notification:", error)
      return { success: false, error }
    }

    return { success: true }
  } catch (error) {
    console.error("Error in createAdminNotification:", error)
    return { success: false, error }
  }
}
