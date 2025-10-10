import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"
import { v4 as uuidv4 } from "uuid"

export async function POST(request: Request) {
  try {
    console.log("=== Verification attempt ===")

    const { email, code } = await request.json()

    console.log("Email:", email)
    console.log("Code:", code)

    if (!email || !code) {
      return NextResponse.json({ success: false, message: "Email and verification code are required" }, { status: 400 })
    }

    // Look for pending registration
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

    console.log("Pending registration found:", {
      id: pendingReg.id,
      email: pendingReg.email,
      has_code: !!pendingReg.verification_code,
      code_expires: pendingReg.verification_expires,
    })

    // Check if code matches FIRST
    if (pendingReg.verification_code !== code) {
      console.log("Code mismatch")
      return NextResponse.json({ success: false, message: "Invalid verification code" }, { status: 400 })
    }

    // Check if code is expired
    const now = new Date()
    const expiresAt = new Date(pendingReg.verification_expires)

    console.log("Code expiration check:", {
      expires_at_utc: expiresAt.toISOString(),
      now_utc: now.toISOString(),
      is_expired: now > expiresAt,
      time_diff_seconds: Math.round((expiresAt.getTime() - now.getTime()) / 1000),
    })

    if (now > expiresAt) {
      console.log("Verification code expired")
      return NextResponse.json(
        {
          success: false,
          message: "Verification code has expired. Please request a new code.",
          expired: true,
        },
        { status: 400 },
      )
    }

    console.log("Code verified successfully! Creating user account...")

    // Create the actual user account in tbl_users
    const { data: newUser, error: createUserError } = await supabaseAdmin
      .from("tbl_users")
      .insert({
        first_name: pendingReg.first_name,
        last_name: pendingReg.last_name,
        email: pendingReg.email,
        phone: pendingReg.phone,
        password_hash: pendingReg.password_hash,
        address_line1: pendingReg.address_line1,
        address_line2: pendingReg.address_line2,
        city: pendingReg.city,
        province: pendingReg.province,
        postal_code: pendingReg.postal_code,
        country: pendingReg.country,
        role: "user",
        is_verified: true,
        verification_code: null,
        verification_expires: null,
      })
      .select()
      .single()

    if (createUserError) {
      console.error("Error creating user:", createUserError)
      return NextResponse.json(
        {
          success: false,
          message: "Failed to create user account",
          error: createUserError.message,
        },
        { status: 500 },
      )
    }

    console.log("User account created successfully:", newUser.id)

    // Delete the pending registration
    await supabaseAdmin.from("tbl_pending_registrations").delete().eq("id", pendingReg.id)
    console.log("Pending registration deleted")

    // Create session for automatic login
    const sessionId = uuidv4()
    const sessionExpiresAt = new Date()
    sessionExpiresAt.setDate(sessionExpiresAt.getDate() + 7)

    const { error: sessionError } = await supabaseAdmin.from("tbl_sessions").insert({
      id: sessionId,
      user_id: newUser.id,
      expires_at: sessionExpiresAt.toISOString(),
    })

    if (sessionError) {
      console.error("Error creating session:", sessionError)
    }

    console.log("Verification completed successfully!")

    const response = NextResponse.json({
      success: true,
      message: "Email verified successfully! Your account has been created.",
      user: {
        id: newUser.id,
        name: `${newUser.first_name} ${newUser.last_name}`,
        email: newUser.email,
        role: newUser.role,
        phone: newUser.phone || "",
        is_verified: true,
      },
    })

    // Set session cookie for automatic login
    if (!sessionError) {
      response.cookies.set({
        name: "session-id",
        value: sessionId,
        httpOnly: true,
        path: "/",
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7,
      })
    }

    return response
  } catch (error) {
    console.error("Verification error:", error)
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
