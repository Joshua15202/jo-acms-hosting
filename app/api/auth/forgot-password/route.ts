import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"
import { sendEmail, generatePasswordResetEmailHTML } from "@/lib/email"

export async function POST(request: Request) {
  try {
    console.log("=== FORGOT PASSWORD API CALLED ===")

    const body = await request.json()
    const { email } = body

    console.log("Password reset request for email:", email)

    if (!email) {
      return NextResponse.json({ success: false, message: "Email is required" }, { status: 400 })
    }

    // Check if user exists
    const { data: user, error: userError } = await supabaseAdmin
      .from("tbl_users")
      .select("id, first_name, last_name, full_name, email")
      .eq("email", email.toLowerCase().trim())
      .single()

    if (userError || !user) {
      console.log("User not found for email:", email)
      // Don't reveal if email exists or not for security
      return NextResponse.json({
        success: true,
        message: "If an account with that email exists, we've sent a password reset code.",
      })
    }

    console.log("=== RESET CODE GENERATION ===")

    // Generate 6-digit reset code
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString()
    console.log("Generated reset code:", resetCode)

    // Set expiration to 30 minutes from now
    const now = new Date()
    const expirationTime = new Date(now.getTime() + 30 * 60 * 1000)

    console.log("Current time:", now.toISOString())
    console.log("Expiration time:", expirationTime.toISOString())

    // Update user with reset code and expiration
    const { error: updateError } = await supabaseAdmin
      .from("tbl_users")
      .update({
        password_reset_code: resetCode,
        password_reset_expires: expirationTime.toISOString(),
      })
      .eq("id", user.id)

    if (updateError) {
      console.error("Failed to update user with reset code:", updateError)
      return NextResponse.json({ success: false, message: "Failed to generate reset code" }, { status: 500 })
    }

    console.log("Reset code saved to database successfully")

    // Send email
    try {
      const emailHTML = generatePasswordResetEmailHTML(user.full_name || user.first_name || "User", resetCode)

      await sendEmail({
        to: user.email,
        subject: "Password Reset Code - Jo Pacheco Catering",
        html: emailHTML,
      })

      console.log("Password reset email sent successfully")

      return NextResponse.json({
        success: true,
        message: "Password reset code sent to your email",
      })
    } catch (emailError) {
      console.error("Failed to send email:", emailError)
      return NextResponse.json({ success: false, message: "Failed to send reset email" }, { status: 500 })
    }
  } catch (error) {
    console.error("Forgot password API error:", error)
    return NextResponse.json({ success: false, message: "An unexpected error occurred" }, { status: 500 })
  }
}
