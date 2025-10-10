import { NextResponse } from "next/server"
import { verifyPassword } from "@/lib/auth-utils"
import { supabaseAdmin } from "@/lib/supabase"
import { v4 as uuidv4 } from "uuid"

export async function POST(request: Request) {
  try {
    console.log("=== Login attempt ===")

    const formData = await request.formData()
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    console.log("Login request for email:", email)

    if (!email || !password) {
      return NextResponse.json({ success: false, message: "Email and password are required" }, { status: 400 })
    }

    // Check if there's a pending registration (not verified yet)
    const { data: pendingReg } = await supabaseAdmin
      .from("tbl_pending_registrations")
      .select("email, verification_expires, password_hash")
      .eq("email", email)
      .maybeSingle()

    if (pendingReg) {
      // Check if pending registration is expired
      const now = new Date()
      const expiresAt = new Date(pendingReg.verification_expires)

      if (expiresAt > now) {
        // Pending registration exists and not expired
        // Verify password before redirecting to verification
        const isValidPassword = await verifyPassword(password, pendingReg.password_hash)

        if (!isValidPassword) {
          console.log("Invalid password for pending registration")
          return NextResponse.json({ success: false, message: "Invalid email or password" }, { status: 401 })
        }

        console.log("User has pending registration - redirecting to verification")
        return NextResponse.json(
          {
            success: false,
            message:
              "Your account is not verified yet. Please check your email for the verification code and complete registration.",
            requiresVerification: true,
            email: email,
          },
          { status: 403 },
        )
      } else {
        // Pending registration expired - delete it
        console.log("Deleting expired pending registration")
        await supabaseAdmin.from("tbl_pending_registrations").delete().eq("email", email)

        return NextResponse.json(
          {
            success: false,
            message: "Your verification code has expired. Please register again.",
          },
          { status: 401 },
        )
      }
    }

    // Find user in main users table
    const { data: user, error: userError } = await supabaseAdmin
      .from("tbl_users")
      .select("*")
      .eq("email", email)
      .maybeSingle()

    if (userError && userError.code !== "PGRST116") {
      console.error("Database error:", userError)
      return NextResponse.json({ success: false, message: "Database error occurred" }, { status: 500 })
    }

    if (!user) {
      console.log("User not found in database")
      return NextResponse.json({ success: false, message: "Invalid email or password" }, { status: 401 })
    }

    console.log("User found:", {
      id: user.id,
      email: user.email,
      is_verified: user.is_verified,
      role: user.role,
    })

    // Additional check - should not be needed if flow is correct
    if (!user.is_verified) {
      console.log("User exists but not verified - data inconsistency")
      return NextResponse.json(
        {
          success: false,
          message: "Your account is not verified. Please contact support.",
          requiresVerification: true,
        },
        { status: 403 },
      )
    }

    // Verify password
    const isPasswordValid = await verifyPassword(password, user.password_hash)

    if (!isPasswordValid) {
      console.log("Invalid password")
      return NextResponse.json({ success: false, message: "Invalid email or password" }, { status: 401 })
    }

    console.log("Password verified successfully")

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
      message: "Login successful",
      user: {
        id: user.id,
        name: `${user.first_name} ${user.last_name}`,
        email: user.email,
        role: user.role,
        phone: user.phone || "",
        is_verified: user.is_verified,
      },
    })

    // Set the session cookie
    response.cookies.set({
      name: "session-id",
      value: sessionId,
      httpOnly: true,
      path: "/",
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    return response
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "An error occurred during login",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
