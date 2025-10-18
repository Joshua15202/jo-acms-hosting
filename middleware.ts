import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  console.log("=== MIDDLEWARE ===")
  console.log("Path:", pathname)
  console.log(
    "All cookies:",
    request.cookies.getAll().map((c) => ({ name: c.name, value: c.value.substring(0, 20) })),
  )

  // Public paths that don't require authentication
  const publicPaths = [
    "/",
    "/about",
    "/services",
    "/contact",
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
    "/privacy",
    "/terms",
    "/tasting/confirm",
  ]

  // Allow public paths
  if (publicPaths.some((path) => pathname === path || pathname.startsWith(path))) {
    console.log("Public path, allowing access")
    return NextResponse.next()
  }

  // Allow API routes (they handle their own auth)
  if (pathname.startsWith("/api/")) {
    console.log("API route, allowing access")
    return NextResponse.next()
  }

  // Allow static files
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname.includes(".") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next()
  }

  // Admin routes
  if (pathname.startsWith("/admin")) {
    if (pathname === "/admin" || pathname === "/admin/login") {
      return NextResponse.next()
    }
    // Let admin auth provider handle admin authentication
    return NextResponse.next()
  }

  // Assistant routes
  if (pathname.startsWith("/assistant")) {
    if (pathname === "/assistant" || pathname === "/assistant/login") {
      return NextResponse.next()
    }
    // Let assistant auth provider handle assistant authentication
    return NextResponse.next()
  }

  // Protected customer routes
  const protectedPaths = ["/book-appointment", "/my-appointments", "/profile", "/payment"]

  const isProtected = protectedPaths.some((path) => pathname.startsWith(path))

  if (!isProtected) {
    console.log("Not a protected path, allowing access")
    return NextResponse.next()
  }

  console.log("Protected path detected")

  // Get session cookie
  const sessionId = request.cookies.get("session-id")?.value

  console.log("Session ID from cookie:", sessionId ? `${sessionId.substring(0, 20)}...` : "NONE")

  if (!sessionId) {
    console.log("No session cookie found, redirecting to login")
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("redirect", pathname)
    return NextResponse.redirect(loginUrl)
  }

  try {
    // Verify session exists in database and is not expired
    const { data: session, error: sessionError } = await supabaseAdmin
      .from("tbl_sessions")
      .select("user_id, expires_at")
      .eq("id", sessionId)
      .maybeSingle()

    if (sessionError) {
      console.error("Session lookup error:", sessionError)
      const loginUrl = new URL("/login", request.url)
      loginUrl.searchParams.set("redirect", pathname)
      const response = NextResponse.redirect(loginUrl)
      response.cookies.delete("session-id")
      return response
    }

    if (!session) {
      console.log("Session not found in database")
      const loginUrl = new URL("/login", request.url)
      loginUrl.searchParams.set("redirect", pathname)
      const response = NextResponse.redirect(loginUrl)
      response.cookies.delete("session-id")
      return response
    }

    // Check if session is expired
    const expiresAt = new Date(session.expires_at)
    const now = new Date()

    if (expiresAt <= now) {
      console.log("Session expired")
      await supabaseAdmin.from("tbl_sessions").delete().eq("id", sessionId)
      const loginUrl = new URL("/login", request.url)
      loginUrl.searchParams.set("redirect", pathname)
      const response = NextResponse.redirect(loginUrl)
      response.cookies.delete("session-id")
      return response
    }

    console.log("Session valid for user:", session.user_id)

    // Session is valid, allow access and refresh cookie
    const response = NextResponse.next()

    const isProduction = process.env.NODE_ENV === "production"

    response.cookies.set("session-id", sessionId, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    })

    console.log("Session refreshed, allowing access")

    return response
  } catch (error) {
    console.error("Middleware error:", error)
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("redirect", pathname)
    const response = NextResponse.redirect(loginUrl)
    response.cookies.delete("session-id")
    return response
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
