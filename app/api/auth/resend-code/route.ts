import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"
import { sendEmail, generateVerificationEmailHTML } from "@/lib/email"

// Generate a 6-digit verification code
function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function POST(request: Request) {
  try {
    console.log("=== Resend verification code ===")

    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ success: false, message: "Email is required" }, { status: 400 })
    }

    // Check if pending registration exists
    const { data: pendingReg, error: pendingError } = await supabaseAdmin
      .from("tbl_pending_registrations")
      .select("*")
      .eq("email", email)
      .single()

    if (pendingError || !pendingReg) {
      console.error("Pending registration not found:", pendingError)
      return NextResponse.json(
        {
          success: false,
          message: "No pending registration found. Please register again.",
        },
        { status: 404 },
      )
    }

    // Generate new verification code
    const verificationCode = generateVerificationCode()
    const expirationDate = new Date(Date.now() + 5 * 60 * 1000) // 5 minutes from now
    const expirationISO = expirationDate.toISOString()

    console.log("Generated new verification code:", verificationCode)
    console.log("New expiration:", expirationISO)

    // Update pending registration with new code
    const { error: updateError } = await supabaseAdmin
      .from("tbl_pending_registrations")
      .update({
        verification_code: verificationCode,
        verification_expires: expirationISO,
      })
      .eq("email", email)

    if (updateError) {
      console.error("Error updating pending registration:", updateError)
      return NextResponse.json(
        {
          success: false,
          message: "Failed to update verification code",
        },
        { status: 500 },
      )
    }

    // Send new verification email
    try {
      console.log("Sending new verification email...")

      const emailHTML = generateVerificationEmailHTML(pendingReg.first_name, verificationCode)

      const emailResult = await sendEmail({
        to: email,
        subject: "Verify Your Account - Jo Pacheco Wedding & Event",
        html: emailHTML,
      })

      console.log("Email result:", emailResult)

      if (!emailResult.success) {
        console.error("Failed to send verification email:", emailResult.error)
      }
    } catch (emailError) {
      console.error("Email sending error:", emailError)
    }

    return NextResponse.json({
      success: true,
      message: "New verification code sent to your email",
      verificationCode: verificationCode, // Show code for testing - remove in production
      expiresAt: expirationISO,
    })
  } catch (error) {
    console.error("Resend code error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "An error occurred while resending verification code",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
