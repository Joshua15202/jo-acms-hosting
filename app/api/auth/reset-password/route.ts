import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"
import { hashPassword } from "@/lib/auth-utils"

export async function POST(request: Request) {
  try {
    console.log("=== RESET PASSWORD API CALLED ===")

    const body = await request.json()
    const { email, resetCode, newPassword } = body

    console.log("Reset password request for email:", email)
    console.log("Reset code provided:", resetCode)

    // Validate input
    if (!email || !resetCode || !newPassword) {
      console.log("Missing required fields")
      return NextResponse.json(
        { success: false, message: "Email, reset code, and new password are required" },
        { status: 400 },
      )
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { success: false, message: "Password must be at least 6 characters long" },
        { status: 400 },
      )
    }

    // Get user with reset code
    const { data: user, error: userError } = await supabaseAdmin
      .from("tbl_users")
      .select("id, email, password_reset_code, password_reset_expires")
      .eq("email", email.toLowerCase().trim())
      .single()

    if (userError || !user) {
      console.log("User not found:", userError)
      return NextResponse.json({ success: false, message: "Invalid email or reset code" }, { status: 400 })
    }

    console.log("User found, checking reset code...")

    // Check if reset code matches
    if (user.password_reset_code !== resetCode) {
      console.log("Reset code mismatch")
      return NextResponse.json({ success: false, message: "Invalid reset code" }, { status: 400 })
    }

    // Check if reset code has expired
    if (!user.password_reset_expires) {
      console.log("No expiration time found")
      return NextResponse.json({ success: false, message: "Invalid or expired reset code" }, { status: 400 })
    }

    const now = new Date()
    const expiresAt = new Date(user.password_reset_expires)

    console.log("Current time:", now.toISOString())
    console.log("Expiration time:", expiresAt.toISOString())
    console.log("Is expired:", now > expiresAt)

    if (now > expiresAt) {
      console.log("Reset code has expired")
      return NextResponse.json(
        { success: false, message: "Reset code has expired. Please request a new one." },
        { status: 400 },
      )
    }

    console.log("Reset code is valid, updating password...")

    // Hash new password
    const hashedPassword = await hashPassword(newPassword)

    // Update password and clear reset code
    const { error: updateError } = await supabaseAdmin
      .from("tbl_users")
      .update({
        password_hash: hashedPassword,
        password_reset_code: null,
        password_reset_expires: null,
      })
      .eq("id", user.id)

    if (updateError) {
      console.error("Failed to update password:", updateError)
      return NextResponse.json({ success: false, message: "Failed to update password" }, { status: 500 })
    }

    console.log("Password updated successfully")

    return NextResponse.json({
      success: true,
      message: "Password reset successfully",
    })
  } catch (error) {
    console.error("Reset password API error:", error)
    return NextResponse.json({ success: false, message: "An unexpected error occurred" }, { status: 500 })
  }
}
