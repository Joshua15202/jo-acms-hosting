import { NextResponse } from "next/server"
import type { NextRequest } from "next/request"
import { supabaseAdmin } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    const { sessionToken, userId } = await request.json()

    if (!sessionToken || !userId) {
      return NextResponse.json({ success: false, error: "Missing session token or user ID" }, { status: 400 })
    }

    // Verify the session token (basic validation)
    const tokenParts = sessionToken.split("_")
    if (tokenParts.length < 3) {
      return NextResponse.json({ success: false, error: "Invalid session token format" }, { status: 400 })
    }

    // Look up the user
    const { data: user, error } = await supabaseAdmin
      .from("tbl_users")
      .select("id, email, first_name, last_name, full_name, role, is_verified")
      .eq("id", userId)
      .single()

    if (error || !user) {
      console.error("User lookup error:", error)
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 })
    }

    // Create a new session
    const newSessionId = user.id // Use user ID as session ID
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7) // 7 days from now

    // Insert or update session in database
    const { error: sessionError } = await supabaseAdmin.from("tbl_sessions").upsert({
      id: newSessionId,
      user_id: user.id,
      expires_at: expiresAt.toISOString(),
      created_at: new Date().toISOString(),
    })

    if (sessionError) {
      console.error("Session creation error:", sessionError)
      return NextResponse.json({ success: false, error: "Failed to create session" }, { status: 500 })
    }

    // Set session cookie
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        fullName: user.full_name,
        role: user.role,
        isVerified: user.is_verified,
      },
    })

    response.cookies.set("session-id", newSessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    })

    return response
  } catch (error) {
    console.error("Auto-login error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
