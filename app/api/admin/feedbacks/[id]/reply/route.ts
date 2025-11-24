import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"
import { cookies } from "next/headers"
import { createAdminNotification } from "@/lib/admin-notifications"

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    console.log("[v0] Reply API - testimonial ID:", id)

    const cookieStore = await cookies()
    const sessionId = cookieStore.get("session-id")?.value
    const adminUserCookie = cookieStore.get("adminUser")?.value
    const adminAuthenticated = cookieStore.get("adminAuthenticated")?.value

    console.log("[v0] Reply API - auth check:", {
      sessionId: !!sessionId,
      adminUserCookie: !!adminUserCookie,
      adminAuthenticated,
    })

    if (adminAuthenticated !== "true" || !adminUserCookie) {
      console.log("[v0] Reply API - Unauthorized")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const adminUser = JSON.parse(adminUserCookie)
    const { reply } = await request.json()

    console.log("[v0] Reply API - reply text length:", reply?.length)

    if (!reply || reply.trim() === "") {
      return NextResponse.json({ error: "Reply cannot be empty" }, { status: 400 })
    }

    // Get the testimonial details
    const { data: testimonial, error: fetchError } = await supabaseAdmin
      .from("tbl_testimonials")
      .select(`
        *,
        tbl_comprehensive_appointments (
          contact_email,
          contact_full_name
        )
      `)
      .eq("id", id)
      .single()

    console.log("[v0] Reply API - testimonial found:", !!testimonial, "error:", fetchError?.message)

    if (fetchError || !testimonial) {
      return NextResponse.json({ error: "Testimonial not found" }, { status: 404 })
    }

    // Update testimonial with admin reply
    const updateData = {
      admin_reply: reply,
      admin_reply_at: new Date().toISOString(),
      replied_by: adminUser.username,
    }

    console.log("[v0] Reply API - updating with:", updateData)

    const { error: updateError } = await supabaseAdmin.from("tbl_testimonials").update(updateData).eq("id", id)

    if (updateError) {
      console.error("[v0] Reply API - Error updating testimonial:", updateError)
      return NextResponse.json({ error: "Failed to post reply: " + updateError.message }, { status: 500 })
    }

    console.log("[v0] Reply API - Update successful")

    // Create notification for the user
    const contactEmail = testimonial.tbl_comprehensive_appointments?.contact_email

    if (contactEmail && testimonial.user_id) {
      const { data: userData } = await supabaseAdmin.from("tbl_users").select("id").eq("email", contactEmail).single()

      if (userData) {
        await supabaseAdmin.from("tbl_notifications").insert({
          user_id: userData.id,
          appointment_id: testimonial.appointment_id,
          title: "Admin replied to your feedback",
          message: `Jo-ACMS Admin has responded to your feedback:\n\n"${reply}"`,
          type: "feedback_reply",
          is_read: false,
        })
        console.log("[v0] Reply API - User notification created")
      }
    }

    // Create admin notification for record
    await createAdminNotification({
      appointmentId: testimonial.appointment_id,
      title: "Feedback reply posted",
      message: `You replied to ${testimonial.tbl_comprehensive_appointments?.contact_full_name || "a customer"}'s feedback.`,
      type: "alert",
    })

    console.log("[v0] Reply API - Admin notification created")

    return NextResponse.json({ success: true, message: "Reply posted successfully" })
  } catch (error) {
    console.error("[v0] Reply API - Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
