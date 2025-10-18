import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"
import { cookies } from "next/headers"
import crypto from "crypto"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, code } = body

    console.log("=== VERIFICATION REQUEST ===")
    console.log("Email:", email)
    console.log("Code:", code)

    if (!email || !code) {
      return NextResponse.json({ success: false, message: "Email and verification code are required" }, { status: 400 })
    }

    // Get pending registration
    const { data: pending, error: pendingError } = await supabaseAdmin
      .from("tbl_pending_registrations")
      .select("*")
      .eq("email", email)
      .single()

    const now = new Date()

    if (pendingError || !pending) {
      console.log("No pending registration found:", pendingError)
      return NextResponse.json({ success: false, message: "No pending registration found" }, { status: 404 })
    }

    console.log("Found pending registration")

    // Check if expired
    const verificationExpiresAt = new Date(pending.verification_expires)

    if (verificationExpiresAt < now) {
      console.log("Verification code has expired")
      return NextResponse.json({ success: false, message: "Verification code has expired" }, { status: 400 })
    }

    // Verify code
    if (pending.verification_code !== code) {
      console.log("Invalid verification code")
      return NextResponse.json({ success: false, message: "Invalid verification code" }, { status: 400 })
    }

    console.log("Code verified! Creating user account...")

    // Create user account - DON'T include full_name since it's a generated column
    const { data: newUser, error: userError } = await supabaseAdmin
      .from("tbl_users")
      .insert({
        first_name: pending.first_name,
        last_name: pending.last_name,
        email: pending.email,
        phone: pending.phone,
        password_hash: pending.password_hash,
        address_line1: pending.address_line1,
        address_line2: pending.address_line2,
        city: pending.city,
        province: pending.province,
        postal_code: pending.postal_code,
        country: pending.country || "Philippines",
        role: "user",
        is_verified: true,
      })
      .select()
      .single()

    if (userError) {
      console.error("User creation error:", userError)
      return NextResponse.json({ success: false, message: "Failed to create user account" }, { status: 500 })
    }

    console.log("User created successfully:", newUser.id)
    console.log("User full name:", newUser.full_name)

    // Delete pending registration
    await supabaseAdmin.from("tbl_pending_registrations").delete().eq("email", email)
    console.log("Pending registration deleted")

    // Create session
    const sessionId = crypto.randomUUID()
    const sessionExpiresAt = new Date()
    sessionExpiresAt.setDate(sessionExpiresAt.getDate() + 7) // 7 days

    const { error: sessionError } = await supabaseAdmin.from("tbl_sessions").insert({
      id: sessionId,
      user_id: newUser.id,
      expires_at: sessionExpiresAt.toISOString(),
    })

    if (sessionError) {
      console.error("Session creation error:", sessionError)
      return NextResponse.json({ success: false, message: "Failed to create session" }, { status: 500 })
    }

    console.log("Session created successfully")

    // Set session cookie
    const cookieStore = await cookies()
    const isProduction = process.env.NODE_ENV === "production"

    cookieStore.set("session-id", sessionId, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    })

    console.log("Cookie set successfully")
    console.log("=== VERIFICATION COMPLETE ===")

    // Return complete user data
    return NextResponse.json({
      success: true,
      message: "Email verified successfully",
      user: {
        id: newUser.id,
        name: newUser.full_name, // This will be auto-generated from first_name + last_name
        firstName: newUser.first_name,
        lastName: newUser.last_name,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
      },
    })
  } catch (error) {
    console.error("Verification error:", error)
    return NextResponse.json({ success: false, message: "An error occurred during verification" }, { status: 500 })
  }
}
