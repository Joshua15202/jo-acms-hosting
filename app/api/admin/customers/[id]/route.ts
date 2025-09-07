import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const customerId = params.id

    console.log(`=== Admin: Deleting customer ${customerId} ===`)

    // First, check if customer exists
    const { data: customer, error: fetchError } = await supabaseAdmin
      .from("tbl_users")
      .select("id, email, full_name")
      .eq("id", customerId)
      .single()

    if (fetchError || !customer) {
      console.error("Customer not found:", fetchError)
      return NextResponse.json(
        {
          success: false,
          message: "Customer not found",
        },
        { status: 404 },
      )
    }

    console.log(`Found customer: ${customer.full_name} (${customer.email})`)

    // Delete related data first (to maintain referential integrity)

    // Delete payment transactions
    const { error: paymentsError } = await supabaseAdmin
      .from("tbl_payment_transactions")
      .delete()
      .eq("user_id", customerId)

    if (paymentsError) {
      console.error("Error deleting payment transactions:", paymentsError)
      // Continue anyway - we'll still try to delete the user
    }

    // Delete appointments from comprehensive table
    const { error: comprehensiveAppointmentsError } = await supabaseAdmin
      .from("tbl_comprehensive_appointments")
      .delete()
      .eq("user_id", customerId)

    if (comprehensiveAppointmentsError) {
      console.error("Error deleting comprehensive appointments:", comprehensiveAppointmentsError)
      // Continue anyway
    }

    // Delete appointments from regular table
    const { error: appointmentsError } = await supabaseAdmin.from("tbl_appointments").delete().eq("user_id", customerId)

    if (appointmentsError) {
      console.error("Error deleting appointments:", appointmentsError)
      // Continue anyway
    }

    // Delete chat sessions
    const { error: chatSessionsError } = await supabaseAdmin
      .from("tbl_chat_sessions")
      .delete()
      .eq("user_id", customerId)

    if (chatSessionsError) {
      console.error("Error deleting chat sessions:", chatSessionsError)
      // Continue anyway
    }

    // Delete chat messages
    const { error: chatMessagesError } = await supabaseAdmin
      .from("tbl_chat_messages")
      .delete()
      .eq("user_id", customerId)

    if (chatMessagesError) {
      console.error("Error deleting chat messages:", chatMessagesError)
      // Continue anyway
    }

    // Finally, delete the user
    const { error: deleteError } = await supabaseAdmin.from("tbl_users").delete().eq("id", customerId)

    if (deleteError) {
      console.error("Error deleting user:", deleteError)
      return NextResponse.json(
        {
          success: false,
          message: "Failed to delete customer",
          error: deleteError.message,
        },
        { status: 500 },
      )
    }

    console.log(`Successfully deleted customer: ${customer.full_name}`)

    return NextResponse.json({
      success: true,
      message: `Customer ${customer.full_name} has been deleted successfully`,
      deletedCustomer: {
        id: customer.id,
        name: customer.full_name,
        email: customer.email,
      },
    })
  } catch (error) {
    console.error("Unexpected error deleting customer:", error)
    return NextResponse.json(
      {
        success: false,
        message: "An unexpected error occurred while deleting the customer",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
