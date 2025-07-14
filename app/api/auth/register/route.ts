import { NextResponse } from "next/server"
import { hashPassword } from "@/lib/auth-utils"
import { supabaseAdmin } from "@/lib/supabase"
import { sendEmail, generateVerificationEmailHTML } from "@/lib/email"

// Generate a 6-digit verification code
function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function POST(request: Request) {
  try {
    console.log("=== /api/auth/register called ===")

    const formData = await request.formData()

    // Get individual fields
    const firstName = formData.get("firstName") as string
    const lastName = formData.get("lastName") as string
    const email = formData.get("email") as string
    const phone = formData.get("phone") as string
    const password = formData.get("password") as string

    console.log("Registration attempt for:", {
      firstName,
      lastName,
      email,
      hasPhone: !!phone,
      hasPassword: !!password,
    })

    if (!firstName || !lastName || !email || !password) {
      console.log("Missing fields:", {
        hasFirstName: !!firstName,
        hasLastName: !!lastName,
        hasEmail: !!email,
        hasPassword: !!password,
      })
      return NextResponse.json({ success: false, message: "All fields are required" }, { status: 400 })
    }

    // Check if user already exists
    const { data: existingUser, error: checkError } = await supabaseAdmin
      .from("tbl_users")
      .select("id")
      .eq("email", email)
      .maybeSingle()

    console.log("Existing user check:", { exists: !!existingUser, error: checkError?.message })

    if (checkError && checkError.code !== "PGRST116") {
      console.error("Error checking existing user:", checkError)
      return NextResponse.json({ success: false, message: "Database error occurred" }, { status: 500 })
    }

    if (existingUser) {
      return NextResponse.json({ success: false, message: "User already exists with this email" }, { status: 409 })
    }

    // Hash the password
    console.log("Hashing password...")
    const hashedPassword = await hashPassword(password)

    // Generate verification code and expiration (30 minutes from now)
    const verificationCode = generateVerificationCode()
    const verificationExpires = new Date()
    verificationExpires.setMinutes(verificationExpires.getMinutes() + 30)

    console.log("Generated verification code:", verificationCode)
    console.log("Expiration time:", verificationExpires.toISOString())

    // Insert the new user - DON'T include full_name since it's generated
    console.log("Inserting new user...")
    const { data: newUser, error: insertError } = await supabaseAdmin
      .from("tbl_users")
      .insert({
        first_name: firstName,
        last_name: lastName,
        email: email,
        phone: phone || null,
        password_hash: hashedPassword,
        role: "user",
        is_verified: false,
        verification_code: verificationCode,
        verification_expires: verificationExpires.toISOString(),
      })
      .select()
      .single()

    if (insertError) {
      console.error("Insert error details:", {
        message: insertError.message,
        details: insertError.details,
        hint: insertError.hint,
        code: insertError.code,
      })
      return NextResponse.json(
        {
          success: false,
          message: "Failed to create user account",
          error: insertError.message,
          details: insertError.details,
        },
        { status: 500 },
      )
    }

    if (!newUser) {
      console.error("No user returned from insert")
      return NextResponse.json(
        { success: false, message: "Failed to create user account - no data returned" },
        { status: 500 },
      )
    }

    console.log("User created successfully:", newUser.id)

    // Send verification email using Nodemailer
    try {
      console.log("Sending verification email...")

      const emailHTML = generateVerificationEmailHTML(firstName, verificationCode)

      const emailResult = await sendEmail({
        to: email,
        subject: "Verify Your Account - Jo Pacheco Wedding & Event",
        html: emailHTML,
      })

      console.log("Email result:", emailResult)

      if (!emailResult.success) {
        console.error("Failed to send verification email:", emailResult.error)
        // Don't fail registration if email fails, but log it
      }
    } catch (emailError) {
      console.error("Email sending error:", emailError)
      // Don't fail registration if email fails
    }

    console.log("Registration successful - verification required")

    return NextResponse.json({
      success: true,
      message: "Registration successful. Please check your email for verification code.",
      requiresVerification: true,
      verificationCode: verificationCode, // Show code for testing - remove in production
      expiresAt: verificationExpires.toISOString(),
    })
  } catch (error) {
    console.error("Unexpected error in /api/auth/register:", error)
    return NextResponse.json(
      {
        success: false,
        message: "An unexpected error occurred during registration",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
