export const dynamic = "force-dynamic"
export const revalidate = 0

import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function POST() {
  try {
    const cookieStore = await cookies()

    // Clear admin authentication cookies
    cookieStore.delete("adminAuthenticated")
    cookieStore.delete("adminUser")

    console.log("Admin logout successful, cookies cleared")

    return NextResponse.json({
      success: true,
      message: "Logout successful",
    })
  } catch (error) {
    console.error("Admin logout error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "An error occurred during logout",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
