import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"
import { sendEmail, generateVerificationEmailHTML } from "@/lib/email"

// Generate a 6-digit verification code
function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function POST(request: Request) {
  try {
    console.log("=== RESEND CODE API CALLED ===")

    const { email } = await request.json()

    console.log("Resend request for email:", email)

    if (!email) {
      return NextResponse.json({ success: false, message: "Email is required" }, { status: 400 })
    }

    // Find user by email
    const { data: user, error: userError } = await supabaseAdmin
      .from("tbl_users")
      .select("*")
      .eq("email", email)
      .single()

    if (userError || !user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 })
    }

    // Check if already verified
    if (user.is_verified) {
      return NextResponse.json({ success: false, message: "Account is already verified" }, { status: 400 })
    }

    // Generate new verification code
    const verificationCode = generateVerificationCode()
    const verificationExpires = new Date()
    verificationExpires.setMinutes(verificationExpires.getMinutes() + 30)

    console.log("Generated new code:", verificationCode)

    // Update user with new code
    const { error: updateError } = await supabaseAdmin
      .from("tbl_users")
      .update({
        verification_code: verificationCode,
        verification_expires: verificationExpires.toISOString(),
      })
      .eq("id", user.id)

    if (updateError) {
      console.error("Update error:", updateError)
      return NextResponse.json({ success: false, message: "Failed to generate new code" }, { status: 500 })
    }

    // Send new verification email
    try {
      const emailHTML = generateVerificationEmailHTML(user.first_name, verificationCode)

      const emailResult = await sendEmail({
        to: email,
        subject: "New Verification Code - Jo Pacheco Wedding & Event",
        html: emailHTML,
      })

      if (!emailResult.success) {
        console.error("Failed to send email:", emailResult.error)
        return NextResponse.json({ success: false, message: "Failed to send verification email" }, { status: 500 })
      }
    } catch (emailError) {
      console.error("Email error:", emailError)
      return NextResponse.json({ success: false, message: "Failed to send verification email" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "New verification code sent successfully",
      verificationCode: verificationCode, // For testing - remove in production
    })
  } catch (error) {
    console.error("=== RESEND ERROR ===")
    console.error("Error:", error instanceof Error ? error.message : String(error))

    return NextResponse.json(
      {
        success: false,
        message: "An error occurred while resending code",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
