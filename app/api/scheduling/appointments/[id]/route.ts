import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { supabaseAdmin } from "@/lib/supabase"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: appointmentId } = await params

    // Get user from session
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get("session_token")?.value

    if (!sessionToken) {
      return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 })
    }

    // Get user from session
    const { data: session } = await supabaseAdmin
      .from("tbl_user_sessions")
      .select("user_id")
      .eq("session_token", sessionToken)
      .single()

    if (!session) {
      return NextResponse.json({ success: false, error: "Invalid session" }, { status: 401 })
    }

    // Get appointment
    const { data: appointment, error } = await supabaseAdmin
      .from("tbl_comprehensive_appointments")
      .select("*")
      .eq("id", appointmentId)
      .eq("user_id", session.user_id)
      .single()

    if (error || !appointment) {
      return NextResponse.json({ success: false, error: "Appointment not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, appointment })
  } catch (error) {
    console.error("Error fetching appointment:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
