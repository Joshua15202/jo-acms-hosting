import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export async function POST(request: Request) {
  try {
    console.log("=== Check pending registration ===")

    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ success: false, message: "Email is required" }, { status: 400 })
    }

    // Check if pending registration exists
    const { data: pendingReg } = await supabaseAdmin
      .from("tbl_pending_registrations")
      .select("email, verification_expires, first_name")
      .eq("email", email)
      .maybeSingle()

    if (!pendingReg) {
      return NextResponse.json({
        success: true,
        hasPending: false,
      })
    }

    // Check if pending registration is expired
    const now = new Date()
    const expiresAt = new Date(pendingReg.verification_expires)

    if (expiresAt <= now) {
      // Expired - delete it
      console.log("Deleting expired pending registration")
      await supabaseAdmin.from("tbl_pending_registrations").delete().eq("email", email)

      return NextResponse.json({
        success: true,
        hasPending: false,
        expired: true,
      })
    }

    // Not expired - has pending registration
    return NextResponse.json({
      success: true,
      hasPending: true,
      email: pendingReg.email,
      firstName: pendingReg.first_name,
      expiresAt: pendingReg.verification_expires,
    })
  } catch (error) {
    console.error("Check pending error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "An error occurred",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
