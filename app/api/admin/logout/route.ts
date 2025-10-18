export const dynamic = "force-dynamic"
export const revalidate = 0

import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function POST() {
  try {
    const cookieStore = await cookies()

    // Delete admin authentication cookies
    cookieStore.delete("adminAuthenticated")
    cookieStore.delete("adminUser")

    return NextResponse.json({
      success: true,
      message: "Logged out successfully",
    })
  } catch (error) {
    console.error("Logout error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "An error occurred during logout",
      },
      { status: 500 },
    )
  }
}
