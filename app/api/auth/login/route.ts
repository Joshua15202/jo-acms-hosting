import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"
import { verifyPassword } from "@/lib/auth-utils"
import { cookies } from "next/headers"

export async function POST(request: Request) {
  try {
    console.log("=== LOGIN API CALLED ===")

    const body = await request.json()
    const { email, password } = body

    console.log("Login attempt for email:", email)

    if (!email || !password) {
      console.log("Missing email or password")
      return NextResponse.json({ success: false, message: "Email and password are required" }, { status: 400 })
    }

    // Get user from database
    const { data: user, error: userError } = await supabaseAdmin
      .from("tbl_users")
      .select("*")
      .eq("email", email.toLowerCase().trim())
      .single()

    if (userError || !user) {
      console.log("User not found:", userError)
      return NextResponse.json({ success: false, message: "Invalid email or password" }, { status: 401 })
    }

    console.log("User found:", user.email, "Role:", user.role)

    // Verify password
    const isValidPassword = await verifyPassword(password, user.password_hash)
    if (!isValidPassword) {
      console.log("Invalid password")
      return NextResponse.json({ success: false, message: "Invalid email or password" }, { status: 401 })
    }

    console.log("Password verified successfully")

    // Create session
    const sessionId = crypto.randomUUID()
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    const { error: sessionError } = await supabaseAdmin.from("tbl_sessions").insert({
      id: sessionId,
      user_id: user.id,
      expires_at: expiresAt.toISOString(),
      created_at: new Date().toISOString(),
    })

    if (sessionError) {
      console.error("Failed to create session:", sessionError)
      return NextResponse.json({ success: false, message: "Failed to create session" }, { status: 500 })
    }

    console.log("Session created successfully:", sessionId)

    // Set cookie
    const cookieStore = await cookies()
    cookieStore.set("session-id", sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60, // 24 hours
      path: "/",
    })

    console.log("Cookie set successfully")

    // Return user data (without password)
    const userData = {
      id: user.id,
      name: user.full_name,
      email: user.email,
      role: user.role,
      phone: user.phone,
    }

    console.log("Login successful for user:", userData.email)

    return NextResponse.json({
      success: true,
      message: "Login successful",
      user: userData,
    })
  } catch (error) {
    console.error("Login API error:", error)
    return NextResponse.json({ success: false, message: "An unexpected error occurred" }, { status: 500 })
  }
}
