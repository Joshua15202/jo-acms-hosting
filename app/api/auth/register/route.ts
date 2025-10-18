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
    const addressLine1 = formData.get("addressLine1") as string
    const addressLine2 = formData.get("addressLine2") as string
    const city = formData.get("city") as string
    const province = formData.get("province") as string
    const postalCode = formData.get("postalCode") as string
    const agreedToTerms = formData.get("agreedToTerms") as string

    console.log("Registration attempt for:", {
      firstName,
      lastName,
      email,
      hasPhone: !!phone,
      hasPassword: !!password,
      hasAddress: !!addressLine1,
      city,
      province,
      agreedToTerms,
    })

    if (
      !firstName ||
      !lastName ||
      !email ||
      !password ||
      !phone ||
      !addressLine1 ||
      !city ||
      !province ||
      !postalCode
    ) {
      console.log("Missing required fields")
      return NextResponse.json({ success: false, message: "All required fields must be filled" }, { status: 400 })
    }

    if (agreedToTerms !== "true") {
      return NextResponse.json(
        { success: false, message: "You must agree to the terms and conditions" },
        { status: 400 },
      )
    }

    // Check if user already exists in main users table (already verified)
    const { data: existingUser, error: checkUserError } = await supabaseAdmin
      .from("tbl_users")
      .select("id, email")
      .eq("email", email)
      .maybeSingle()

    if (checkUserError && checkUserError.code !== "PGRST116") {
      console.error("Error checking existing user:", checkUserError)
      return NextResponse.json({ success: false, message: "Database error occurred" }, { status: 500 })
    }

    if (existingUser) {
      return NextResponse.json(
        { success: false, message: "This email is already registered and verified" },
        { status: 409 },
      )
    }

    // Check if pending registration exists
    const { data: existingPending } = await supabaseAdmin
      .from("tbl_pending_registrations")
      .select("id, email, verification_expires")
      .eq("email", email)
      .maybeSingle()

    // If pending registration exists and is NOT expired, redirect to verification
    if (existingPending) {
      const now = new Date()
      const expiresAt = new Date(existingPending.verification_expires)

      if (expiresAt > now) {
        console.log("Pending registration exists and not expired - redirecting to verification")
        return NextResponse.json({
          success: false,
          message: "You already have a pending registration. Please verify your email.",
          requiresVerification: true,
          email: email,
        })
      } else {
        // Expired, delete it to allow new registration
        console.log("Deleting expired pending registration for:", email)
        await supabaseAdmin.from("tbl_pending_registrations").delete().eq("email", email)
      }
    }

    // Hash the password using the existing auth utilities
    console.log("Hashing password...")
    const hashedPassword = await hashPassword(password)

    // Generate verification code
    const verificationCode = generateVerificationCode()

    // Create expiration time (5 minutes from now)
    const expirationDate = new Date(Date.now() + 5 * 60 * 1000)
    const expirationISO = expirationDate.toISOString()

    console.log("Generated verification code:", verificationCode)
    console.log("Code expires at (UTC):", expirationISO)

    // Store in pending registrations table
    console.log("Storing pending registration...")
    const { data: pendingReg, error: insertError } = await supabaseAdmin
      .from("tbl_pending_registrations")
      .insert({
        first_name: firstName,
        last_name: lastName,
        email: email,
        phone: phone,
        password_hash: hashedPassword,
        address_line1: addressLine1,
        address_line2: addressLine2 || null,
        city: city,
        province: province,
        postal_code: postalCode,
        country: "Philippines",
        verification_code: verificationCode,
        verification_expires: expirationISO,
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
          message: "Failed to create pending registration",
          error: insertError.message,
        },
        { status: 500 },
      )
    }

    if (!pendingReg) {
      console.error("No pending registration returned from insert")
      return NextResponse.json(
        { success: false, message: "Failed to create pending registration - no data returned" },
        { status: 500 },
      )
    }

    console.log("Pending registration created successfully:", pendingReg.id)

    // Send verification email
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
      }
    } catch (emailError) {
      console.error("Email sending error:", emailError)
    }

    console.log("Registration initiated - waiting for verification")

    return NextResponse.json({
      success: true,
      message: "Registration initiated. Please check your email for verification code.",
      requiresVerification: true,
      email: email,
      verificationCode: verificationCode, // Show code for testing - remove in production
      expiresAt: expirationISO,
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
