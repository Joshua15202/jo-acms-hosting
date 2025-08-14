import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"
import { cookies } from "next/headers"
import { verifyToken, hashPassword } from "@/lib/auth-utils"

export async function POST() {
  try {
    console.log("=== MANUAL USER CREATION API CALLED ===")

    const cookieStore = await cookies()
    const sessionToken =
      cookieStore.get("session-id")?.value ||
      cookieStore.get("user-session")?.value ||
      cookieStore.get("auth-token")?.value

    if (!sessionToken) {
      return NextResponse.json({ success: false, error: "No session token found" }, { status: 401 })
    }

    let tokenData: any
    try {
      tokenData = await verifyToken(sessionToken)
      console.log("Token data:", tokenData)
    } catch (error) {
      console.error("Token verification failed:", error)
      return NextResponse.json({ success: false, error: "Token verification failed" }, { status: 401 })
    }

    const userId = tokenData.userId
    const email = tokenData.email || `${userId}@temp.com` // Fallback email if none provided
    const firstName = tokenData.firstName || tokenData.first_name || "User"
    const lastName = tokenData.lastName || tokenData.last_name || userId.slice(0, 8)

    console.log("Creating user with:", { userId, email, firstName, lastName })

    // Check if user already exists
    const { data: existingUser, error: checkError } = await supabaseAdmin
      .from("tbl_users")
      .select("*")
      .eq("id", userId)
      .single()

    if (existingUser) {
      console.log("User already exists:", existingUser.email)
      return NextResponse.json({
        success: true,
        message: "User already exists",
        user: existingUser,
        alreadyExists: true,
      })
    }

    // Create a temporary password hash
    const tempPassword = `temp_${userId.slice(0, 8)}`
    const passwordHash = await hashPassword(tempPassword)

    // Create the user with only the columns that exist in the table
    const userData = {
      id: userId,
      email: email,
      first_name: firstName,
      last_name: lastName,
      phone: null,
      password_hash: passwordHash,
      role: "user" as const,
      is_verified: true,
      verification_code: null,
      verification_expires: null,
    }

    console.log("Inserting user data:", { ...userData, password_hash: "[HIDDEN]" })

    const { data: newUser, error: createError } = await supabaseAdmin
      .from("tbl_users")
      .insert(userData)
      .select()
      .single()

    if (createError) {
      console.error("Error creating user:", createError)
      return NextResponse.json(
        {
          success: false,
          error: "Failed to create user",
          details: createError.message,
          code: createError.code,
        },
        { status: 500 },
      )
    }

    console.log("User created successfully:", newUser)

    return NextResponse.json({
      success: true,
      message: "User created successfully",
      user: newUser,
      tempPassword: tempPassword,
    })
  } catch (error: any) {
    console.error("Unexpected error in manual user creation:", error)
    return NextResponse.json(
      { success: false, message: "An unexpected error occurred", error: error.message },
      { status: 500 },
    )
  }
}
