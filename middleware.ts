import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Paths that require authentication
const protectedPaths = ["/profile", "/my-appointments", "/book-appointment"]

// Paths that require admin authentication
const adminProtectedPaths = [
  "/admin/dashboard",
  "/admin/inventory",
  "/admin/forecasting",
  "/admin/appointments",
  "/admin/payments",
]

// Paths that require assistant authentication
const assistantProtectedPaths = [
  "/assistant/dashboard",
  "/assistant/appointments",
  "/assistant/billing",
  "/assistant/inventory",
  "/assistant/services",
  "/assistant/notifications",
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  console.log("=== MIDDLEWARE DEBUG ===")
  console.log("Checking path:", pathname)
  console.log("Cookies:", request.cookies.getAll())

  // Skip middleware for admin login and root admin page
  if (pathname === "/admin/login" || pathname === "/admin") {
    return NextResponse.next()
  }

  // Check if the path is protected
  const isProtectedPath = protectedPaths.some((path) => pathname.startsWith(path))
  const isAdminProtectedPath = adminProtectedPaths.some((path) => pathname.startsWith(path))
  const isAssistantProtectedPath = assistantProtectedPaths.some((path) => pathname.startsWith(path))

  if (!isProtectedPath && !isAdminProtectedPath && !isAssistantProtectedPath) {
    console.log("Path not protected, allowing access")
    return NextResponse.next()
  }

  // For admin paths, check admin authentication differently
  if (isAdminProtectedPath) {
    // We can't access localStorage in middleware, so we'll let the client-side handle admin auth
    return NextResponse.next()
  }

  const sessionId = request.cookies.get("session-id")?.value
  console.log("Session ID found:", sessionId ? "Yes" : "No")
  console.log("Session ID value:", sessionId)

  if (!sessionId) {
    console.log("No session found, redirecting to login")
    // Redirect to login page based on the protected path type
    if (isAssistantProtectedPath) {
      return NextResponse.redirect(new URL("/assistant/login", request.url))
    } else {
      return NextResponse.redirect(new URL(`/login?redirect=${pathname}`, request.url))
    }
  }

  console.log("Session found, allowing access")
  return NextResponse.next()
}

export const config = {
  matcher: ["/profile", "/my-appointments", "/book-appointment", "/admin/:path*", "/assistant/:path*"],
}
