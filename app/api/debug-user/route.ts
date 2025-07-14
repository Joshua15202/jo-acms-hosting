import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"
import { cookies } from "next/headers"

export async function GET() {
  try {
    const cookieStore = await cookies()
    const sessionId = cookieStore.get("session-id")?.value

    if (!sessionId) {
      return NextResponse.json({ error: "No session ID found" }, { status: 401 })
    }

    console.log("Checking user with session ID:", sessionId)

    // Check if user exists in database with this session ID as user_id
    const { data: user, error } = await supabaseAdmin.from("tbl_users").select("*").eq("id", sessionId).single()

    if (error) {
      console.log("User lookup error:", error)
      return NextResponse.json({
        sessionId,
        userFound: false,
        error: error.message,
        suggestion: "User might not exist in database with this ID",
      })
    }

    return NextResponse.json({
      sessionId,
      userFound: true,
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        created_at: user.created_at,
      },
    })
  } catch (error) {
    console.error("Debug user error:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
