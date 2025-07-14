import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const sessionId = cookieStore.get("session-id")?.value

    console.log("Debug session - Raw session ID:", sessionId)
    console.log("Debug session - Session length:", sessionId?.length)
    console.log("Debug session - Contains dots:", sessionId?.includes("."))

    if (sessionId) {
      // Try to parse different formats
      const parts = sessionId.split("_")
      console.log("Debug session - Split by underscore:", parts)

      // Check if it looks like a number
      const isNumeric = /^\d+$/.test(sessionId)
      console.log("Debug session - Is numeric:", isNumeric)

      // Check if it looks like a UUID
      const isUUID = /^[a-f0-9-]{36}$/i.test(sessionId)
      console.log("Debug session - Is UUID:", isUUID)
    }

    return NextResponse.json({
      sessionId: sessionId,
      length: sessionId?.length,
      containsDots: sessionId?.includes("."),
      parts: sessionId?.split("_"),
      isNumeric: sessionId ? /^\d+$/.test(sessionId) : false,
      isUUID: sessionId ? /^[a-f0-9-]{36}$/i.test(sessionId) : false,
    })
  } catch (error) {
    console.error("Debug session error:", error)
    return NextResponse.json({ error: "Failed to debug session" }, { status: 500 })
  }
}
