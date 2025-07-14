import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function GET() {
  try {
    const cookieStore = await cookies()
    const sessionId = cookieStore.get("session-id")?.value
    const adminAuth = cookieStore.get("admin-authenticated")?.value

    console.log("=== Admin Auth Debug ===")
    console.log("Session ID from cookies:", sessionId)
    console.log("Admin auth from cookies:", adminAuth)
    console.log("All cookies:", cookieStore.getAll())

    // Check localStorage values (these won't be available server-side, but let's see what we have)
    return NextResponse.json({
      success: true,
      sessionId,
      adminAuth,
      allCookies: cookieStore.getAll(),
      message: "Check browser localStorage for adminAuthenticated and adminUser",
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message,
    })
  }
}
