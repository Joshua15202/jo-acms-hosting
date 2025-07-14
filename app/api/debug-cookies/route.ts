import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function GET() {
  try {
    const cookieStore = await cookies()

    // Get all cookies
    const allCookies = cookieStore.getAll()

    // Get specific cookies
    const adminAuth = cookieStore.get("admin-authenticated")
    const adminUser = cookieStore.get("admin-user")
    const sessionId = cookieStore.get("session-id")

    return NextResponse.json({
      success: true,
      allCookies: allCookies,
      adminAuthenticated: adminAuth?.value,
      adminUser: adminUser?.value,
      sessionId: sessionId?.value,
      cookieCount: allCookies.length,
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    })
  }
}
