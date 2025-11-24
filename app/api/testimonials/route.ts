import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createClient } from "@supabase/supabase-js"
import { createAdminNotification } from "@/lib/admin-notifications"

// Initialize Supabase Admin client for verification checks
const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET(request: NextRequest) {
  try {
    // Fetch testimonials with user details and appointment event type
    const { data: testimonials, error } = await supabaseAdmin
      .from("tbl_testimonials")
      .select(`
        id,
        rating,
        message,
        created_at,
        user_id,
        admin_reply,
        admin_reply_at,
        replied_by,
        appointment:tbl_comprehensive_appointments (
          event_type
        )
      `)
      .order("created_at", { ascending: false })
      .limit(20)

    if (error) {
      console.error("Error fetching testimonials:", error)
      if (error.code === "42P01") {
        console.log("[v0] Testimonials table does not exist yet, returning empty array")
        return NextResponse.json({ success: true, data: [] })
      }
      return NextResponse.json({ success: false, error: "Failed to fetch testimonials" }, { status: 500 })
    }

    const userIds = testimonials.map((t) => t.user_id).filter(Boolean)

    // Try to get from tbl_users first
    const { data: tblUsers } = await supabaseAdmin
      .from("tbl_users")
      .select("id, first_name, last_name, email")
      .in("id", userIds)

    // Get auth users for those not in tbl_users
    const {
      data: { users: authUsers },
    } = await supabaseAdmin.auth.admin.listUsers()

    const enrichedTestimonials = testimonials.map((t) => {
      // Try tbl_users first
      const user = tblUsers?.find((u) => u.id === t.user_id)
      let name = user ? `${user.first_name} ${user.last_name}` : null

      // Fallback to auth.users
      if (!name) {
        const authUser = authUsers?.find((u) => u.id === t.user_id)
        name = authUser?.user_metadata?.full_name || authUser?.email?.split("@")[0] || "Anonymous User"
      }

      return {
        ...t,
        name: name || "Anonymous",
        event: t.appointment?.event_type || "Event",
      }
    })

    return NextResponse.json({ success: true, data: enrichedTestimonials })
  } catch (error) {
    console.error("Error in GET testimonials:", error)
    return NextResponse.json({ success: true, data: [] })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, appointmentId, rating, message } = body

    console.log("[v0] Testimonial submission - userId:", userId, "appointmentId:", appointmentId)

    if (!userId || !appointmentId || !rating || !message) {
      console.log(
        "[v0] Missing fields - userId:",
        !!userId,
        "appointmentId:",
        !!appointmentId,
        "rating:",
        !!rating,
        "message:",
        !!message,
      )
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    const cookieStore = await cookies()
    const sessionId = cookieStore.get("session-id")?.value

    if (!sessionId) {
      return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 })
    }

    // Get session from database
    const { data: session, error: sessionError } = await supabaseAdmin
      .from("tbl_sessions")
      .select("user_id")
      .eq("id", sessionId)
      .single()

    if (sessionError || !session) {
      return NextResponse.json({ success: false, error: "Invalid session" }, { status: 401 })
    }

    // Get user from tbl_users
    const { data: user, error: userError } = await supabaseAdmin
      .from("tbl_users")
      .select("id, email, first_name, last_name")
      .eq("id", session.user_id)
      .single()

    console.log("[v0] User from session - found:", !!user, "email:", user?.email)

    if (userError || !user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 })
    }

    // Verify the userId from request matches the session user
    if (user.id !== userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 })
    }

    // Get appointment and verify ownership
    const { data: appointment, error: appointmentError } = await supabaseAdmin
      .from("tbl_comprehensive_appointments")
      .select("status, contact_email, id, event_type")
      .eq("id", appointmentId)
      .single()

    console.log(
      "[v0] Appointment lookup - found:",
      !!appointment,
      "status:",
      appointment?.status,
      "contact_email:",
      appointment?.contact_email,
      "user_email:",
      user.email,
    )

    if (appointmentError || !appointment) {
      return NextResponse.json({ success: false, error: "Appointment not found" }, { status: 404 })
    }

    // Verify user owns this appointment by email
    if (appointment.contact_email !== user.email) {
      console.log("[v0] Email mismatch - appointment:", appointment.contact_email, "user:", user.email)
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 })
    }

    // Check appointment is completed
    if (appointment.status !== "completed") {
      return NextResponse.json(
        { success: false, error: "Only completed appointments can be reviewed" },
        { status: 400 },
      )
    }

    // Check if review already exists
    const { data: existingReview } = await supabaseAdmin
      .from("tbl_testimonials")
      .select("id")
      .eq("appointment_id", appointmentId)
      .single()

    if (existingReview) {
      return NextResponse.json({ success: false, error: "You have already reviewed this appointment" }, { status: 400 })
    }

    // Insert testimonial
    const { error: insertError } = await supabaseAdmin.from("tbl_testimonials").insert({
      user_id: user.id,
      appointment_id: appointmentId,
      rating,
      message,
    })

    if (insertError) {
      console.error("[v0] Error inserting testimonial:", insertError)
      return NextResponse.json({ success: false, error: "Failed to submit review" }, { status: 500 })
    }

    await createAdminNotification({
      appointmentId,
      title: "New customer feedback received",
      message: `${user.first_name} ${user.last_name} left a ${rating}-star review for their ${appointment.event_type} event.`,
      type: "alert",
    })

    console.log("[v0] Testimonial submitted successfully")
    return NextResponse.json({ success: true, message: "Review submitted successfully" })
  } catch (error) {
    console.error("[v0] Error submitting testimonial:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
