import { NextResponse } from "next/server"
import { logoutUser } from "@/app/actions/auth-actions"

export async function POST() {
  try {
    console.log("=== /api/auth/logout called ===")
    const result = await logoutUser()
    console.log("Logout result:", result)
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error in /api/auth/logout:", error)
    return NextResponse.json({ success: false, message: "An error occurred during logout" }, { status: 500 })
  }
}
