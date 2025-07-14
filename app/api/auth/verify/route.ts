import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"
import { v4 as uuidv4 } from "uuid"

export async function POST(request: Request) {
  try {
    console.log("=== VERIFY API CALLED ===")

    const { email, code } = await request.json()

    console.log("Verification request:", { email, code })

    if (!email || !code) {
      return NextResponse.json({ success: false, message: "Email and verification code are required" }, { status: 400 })
    }

    console.log("Looking up user...")

    // Find user by email
    const { data: user, error: userError } = await supabaseAdmin
      .from("tbl_users")
      .select("*")
      .eq("email", email)
      .single()

    if (userError || !user) {
      console.log("User not found:", userError)
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 })
    }

    console.log("=== USER DATA ===")
    console.log("User ID:", user.id)
    console.log("User email:", user.email)
    console.log("Is verified:", user.is_verified)
    console.log("Stored code:", user.verification_code)
    console.log("Provided code:", code)
    console.log("Code match:", user.verification_code === code)
    console.log("Raw expiration from DB:", user.verification_expires)

    // Check if already verified
    if (user.is_verified) {
      return NextResponse.json({ success: false, message: "Account is already verified" }, { status: 400 })
    }

    // Check verification code
    if (user.verification_code !== code) {
      return NextResponse.json({ success: false, message: "Invalid verification code" }, { status: 400 })
    }

    // Check if code has expired
    const now = new Date()
    const expirationDate = new Date(user.verification_expires)

    console.log("=== TIME COMPARISON ===")
    console.log("Current UTC time:", now.toISOString())
    console.log("Expiration UTC time:", expirationDate.toISOString())
    console.log("Time difference (minutes):", (now.getTime() - expirationDate.getTime()) / (1000 * 60))
    console.log("Is expired?", now > expirationDate)

    if (now > expirationDate) {
      console.log("Code has expired")
      return NextResponse.json(
        {
          success: false,
          message: `Verification code has expired. Please request a new code.`,
        },
        { status: 400 },
      )
    }

    console.log("Code is valid, updating user...")

    // Update user as verified
    const { error: updateError } = await supabaseAdmin
      .from("tbl_users")
      .update({
        is_verified: true,
        verification_code: null,
        verification_expires: null,
      })
      .eq("id", user.id)

    if (updateError) {
      console.error("Update error:", updateError)
      return NextResponse.json({ success: false, message: "Failed to verify account" }, { status: 500 })
    }

    console.log("User verified successfully, creating session...")

    // Create session
    const sessionId = uuidv4()
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7) // 7 days from now

    const { error: sessionError } = await supabaseAdmin.from("tbl_sessions").insert({
      id: sessionId,
      user_id: user.id,
      expires_at: expiresAt.toISOString(),
    })

    if (sessionError) {
      console.error("Error creating session:", sessionError)
      return NextResponse.json({ success: false, message: "Failed to create session" }, { status: 500 })
    }

    console.log("Session created successfully")

    const response = NextResponse.json({
      success: true,
      message: "Account verified successfully",
      user: {
        id: user.id,
        name: user.full_name,
        email: user.email,
        role: user.role,
        phone: user.phone || "",
        is_verified: true,
      },
    })

    // Set the session cookie for automatic login
    response.cookies.set({
      name: "session-id",
      value: sessionId,
      httpOnly: true,
      path: "/",
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    console.log("Verification completed successfully")
    return response
  } catch (error) {
    console.error("=== VERIFICATION ERROR ===")
    console.error("Error type:", error?.constructor?.name)
    console.error("Error message:", error instanceof Error ? error.message : String(error))
    console.error("Error stack:", error instanceof Error ? error.stack : "No stack trace")

    return NextResponse.json(
      {
        success: false,
        message: "An error occurred during verification",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
