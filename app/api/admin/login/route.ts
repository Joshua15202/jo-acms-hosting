export const dynamic = "force-dynamic"
export const revalidate = 0

import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json()

    console.log("=== Admin Login Attempt ===")
    console.log("Username:", username)
    console.log("Environment:", process.env.NODE_ENV)
    console.log("Host:", request.headers.get("host"))

    // Simple authentication for demo purposes
    // In production, this should check against a database with hashed passwords
    if (username === "admin" && password === "admin123") {
      const adminUser = {
        username: "admin",
        role: "administrator",
      }

      // Set HTTP-only cookies for server-side authentication
      const cookieStore = await cookies()

      // Check if we're in production (HTTPS)
      const isProduction = process.env.NODE_ENV === "production"
      const isHTTPS = request.headers.get("x-forwarded-proto") === "https"

      console.log("Setting cookies with secure:", isProduction || isHTTPS)

      const cookieOptions = {
        httpOnly: true,
        secure: isProduction || isHTTPS,
        sameSite: "lax" as const,
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: "/",
      }

      cookieStore.set("adminAuthenticated", "true", cookieOptions)
      cookieStore.set("adminUser", JSON.stringify(adminUser), cookieOptions)

      console.log("Admin login successful, cookies set")

      return NextResponse.json({
        success: true,
        message: "Login successful",
        user: adminUser,
      })
    } else {
      console.log("Invalid credentials")
      return NextResponse.json(
        {
          success: false,
          message: "Invalid username or password",
        },
        { status: 401 },
      )
    }
  } catch (error) {
    console.error("Admin login error:", error)
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
