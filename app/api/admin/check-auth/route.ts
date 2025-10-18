export const dynamic = "force-dynamic"
export const revalidate = 0

import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function GET() {
  try {
    const cookieStore = await cookies()

    const adminAuthenticated = cookieStore.get("adminAuthenticated")
    const adminUser = cookieStore.get("adminUser")

    console.log("=== Admin Auth Check ===")
    console.log("adminAuthenticated cookie:", adminAuthenticated?.value)
    console.log("adminUser cookie:", adminUser?.value)

    return NextResponse.json({
      authenticated: adminAuthenticated?.value === "true",
      hasUserCookie: !!adminUser,
      user: adminUser ? JSON.parse(adminUser.value) : null,
      allCookies: cookieStore.getAll().map((c) => ({
        name: c.name,
        hasValue: !!c.value,
      })),
    })
  } catch (error) {
    console.error("Auth check error:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
