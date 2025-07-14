import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json()

    console.log("Admin login attempt:", username)

    // Check admin credentials
    if (username === "admin" && password === "admin123") {
      console.log("Admin credentials valid")

      const response = NextResponse.json({
        success: true,
        message: "Admin login successful",
        user: {
          username: "admin",
          role: "admin",
        },
      })

      // Set admin authentication cookies
      response.cookies.set({
        name: "admin-authenticated",
        value: "true",
        httpOnly: true,
        path: "/",
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      })

      response.cookies.set({
        name: "admin-user",
        value: JSON.stringify({ username: "admin", role: "admin" }),
        httpOnly: true,
        path: "/",
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      })

      return response
    } else {
      return NextResponse.json({ success: false, message: "Invalid credentials" }, { status: 401 })
    }
  } catch (error) {
    console.error("Admin login error:", error)
    return NextResponse.json({ success: false, message: "Login failed" }, { status: 500 })
  }
}
