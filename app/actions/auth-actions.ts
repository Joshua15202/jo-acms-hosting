"use server"

import { cookies } from "next/headers"
import { v4 as uuidv4 } from "uuid"
import { supabaseAdmin } from "@/lib/supabase"
import { hashPassword, verifyPassword } from "@/lib/auth-utils"

// Define user type for better type safety
export type User = {
  id: string
  name: string
  email: string
  role: string
  phone?: string
}

// Register a new user
export async function registerUser(formData: FormData) {
  const fullName = formData.get("fullName") as string
  const email = formData.get("email") as string
  const phone = formData.get("phone") as string
  const password = formData.get("password") as string

  if (!fullName || !email || !password) {
    return { success: false, message: "Missing required fields" }
  }

  try {
    // Check if user already exists
    const { data: existingUsers, error: checkError } = await supabaseAdmin
      .from("tbl_users")
      .select("*")
      .eq("email", email)

    if (checkError) {
      console.error("Error checking existing user:", checkError)
      return { success: false, message: "Database error occurred" }
    }

    if (existingUsers && existingUsers.length > 0) {
      return { success: false, message: "User already exists with this email" }
    }

    // Hash password
    const hashedPassword = await hashPassword(password)
    const userId = uuidv4()

    // Create user
    const { error: insertError } = await supabaseAdmin.from("tbl_users").insert({
      id: userId,
      full_name: fullName,
      email: email,
      phone: phone || "",
      password_hash: hashedPassword,
      role: "user",
      created_at: new Date().toISOString(),
    })

    if (insertError) {
      console.error("Error creating user:", insertError)
      return { success: false, message: "Failed to create user account" }
    }

    // Create session
    const sessionId = uuidv4()
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7) // 7 days from now

    const { error: sessionError } = await supabaseAdmin.from("tbl_sessions").insert({
      id: sessionId,
      user_id: userId,
      expires_at: expiresAt.toISOString(),
    })

    if (sessionError) {
      console.error("Error creating session:", sessionError)
      return { success: false, message: "Failed to create session" }
    }

    // Set session cookie
    const cookieStore = await cookies()
    cookieStore.set("session-id", sessionId, {
      httpOnly: true,
      expires: expiresAt,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    })

    console.log("Registration successful, session created:", sessionId)

    return {
      success: true,
      message: "Registration successful",
      user: {
        id: userId,
        name: fullName,
        email: email,
        role: "user",
        phone: phone || "",
      },
    }
  } catch (error) {
    console.error("Registration error:", error)
    return { success: false, message: "An error occurred during registration" }
  }
}

// Login a user
export async function loginUser(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!email || !password) {
    return { success: false, message: "Email and password are required" }
  }

  try {
    // Get user
    const { data: users, error: userError } = await supabaseAdmin.from("tbl_users").select("*").eq("email", email)

    if (userError) {
      console.error("Error fetching user:", userError)
      return { success: false, message: "Database error occurred" }
    }

    if (!users || users.length === 0) {
      return { success: false, message: "Invalid email or password" }
    }

    const user = users[0]

    // Verify password
    const passwordValid = await verifyPassword(password, user.password_hash)

    if (!passwordValid) {
      return { success: false, message: "Invalid email or password" }
    }

    // Create session
    const sessionId = uuidv4()
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7) // 7 days from now

    const { error: sessionError } = await supabaseAdmin.from("tbl_sessions").insert({
      id: sessionId,
      user_id: user.id,
      expires_at: expiresAt.toISOString(),
    })

    if (sessionError) {
      console.error("Error creating session:", sessionError)
      return { success: false, message: "Failed to create session" }
    }

    // Set session cookie
    const cookieStore = await cookies()
    cookieStore.set("session-id", sessionId, {
      httpOnly: true,
      expires: expiresAt,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    })

    console.log("Login successful, session created:", sessionId)

    return {
      success: true,
      message: "Login successful",
      user: {
        id: user.id,
        name: user.full_name,
        email: user.email,
        role: user.role,
        phone: user.phone || "",
      },
    }
  } catch (error) {
    console.error("Login error:", error)
    return { success: false, message: "An error occurred during login" }
  }
}

// Logout a user
export async function logoutUser() {
  try {
    const cookieStore = await cookies()
    const sessionId = cookieStore.get("session-id")?.value

    console.log("Logout attempt, session ID:", sessionId)

    if (sessionId) {
      // Delete session from database
      const { error } = await supabaseAdmin.from("tbl_sessions").delete().eq("id", sessionId)

      if (error) {
        console.error("Error deleting session:", error)
      }

      // Delete cookie
      cookieStore.set("session-id", "", {
        expires: new Date(0),
        path: "/",
      })

      console.log("Session deleted successfully")
    }

    return { success: true, message: "Logged out successfully" }
  } catch (error) {
    console.error("Logout error:", error)
    return { success: false, message: "An error occurred during logout" }
  }
}

// Clear expired session (Server Action)
export async function clearExpiredSession() {
  try {
    const cookieStore = await cookies()
    const sessionId = cookieStore.get("session-id")?.value

    if (sessionId) {
      // Delete expired session from database
      await supabaseAdmin.from("tbl_sessions").delete().eq("id", sessionId)

      // Clear cookie
      cookieStore.set("session-id", "", {
        expires: new Date(0),
        path: "/",
      })
    }

    return { success: true }
  } catch (error) {
    console.error("Error clearing expired session:", error)
    return { success: false }
  }
}

// Get the current user (read-only, no cookie modification)
export async function getCurrentUser() {
  try {
    const cookieStore = await cookies()
    const sessionId = cookieStore.get("session-id")?.value

    console.log("Getting current user, session ID:", sessionId)

    if (!sessionId) {
      console.log("No session ID found")
      return null
    }

    // Get session with user
    const { data: sessions, error } = await supabaseAdmin
      .from("tbl_sessions")
      .select(`
        *,
        tbl_users (id, full_name, email, role, phone)
      `)
      .eq("id", sessionId)
      .gt("expires_at", new Date().toISOString())

    if (error) {
      console.error("Error fetching session:", error)
      return null
    }

    if (!sessions || sessions.length === 0) {
      console.log("No valid session found - session may be expired")
      return null
    }

    const session = sessions[0]
    const user = session.tbl_users

    if (!user) {
      console.log("No user found for session")
      return null
    }

    console.log("User found:", user.email, "Phone:", user.phone)

    return {
      id: user.id,
      name: user.full_name,
      email: user.email,
      role: user.role,
      phone: user.phone || "",
    }
  } catch (error) {
    console.error("Error getting current user:", error)
    return null
  }
}
