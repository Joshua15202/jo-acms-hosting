import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"
import { cookies } from "next/headers"
import { verifyToken, hashPassword } from "@/lib/auth-utils"

export async function GET() {
  try {
    console.log("=== USER EXISTENCE DEBUG API CALLED ===")

    const cookieStore = await cookies()
    const sessionToken =
      cookieStore.get("session-id")?.value ||
      cookieStore.get("user-session")?.value ||
      cookieStore.get("auth-token")?.value

    if (!sessionToken) {
      return NextResponse.json({ success: false, error: "No session token found" })
    }

    let tokenData: any
    try {
      tokenData = await verifyToken(sessionToken)
      console.log("Token data:", tokenData)
    } catch (error) {
      console.error("Token verification failed:", error)
      return NextResponse.json({ success: false, error: "Token verification failed" })
    }

    const userId = tokenData.userId
    const email = tokenData.email || `${userId}@temp.com`

    // Check if user exists in tbl_users
    const { data: userInUsers, error: usersError } = await supabaseAdmin
      .from("tbl_users")
      .select("*")
      .eq("id", userId)
      .single()

    console.log("User exists in tbl_users:", !!userInUsers)

    // Check if user exists in auth.users (Supabase auth table)
    const { data: userInAuth, error: authError } = await supabaseAdmin.auth.admin.getUserById(userId)
    console.log("User exists in auth.users:", !!userInAuth?.user)

    // Get all users for debugging
    const { data: allUsers, error: allUsersError } = await supabaseAdmin
      .from("tbl_users")
      .select("id, email, first_name, last_name")
      .limit(5)

    console.log("Sample users in database:", allUsers)

    // Attempt to create user if they don't exist
    let userCreationResult = null
    if (!userInUsers) {
      console.log("User doesn't exist, attempting to create...")

      const firstName = tokenData.firstName || tokenData.first_name || "User"
      const lastName = tokenData.lastName || tokenData.last_name || userId.slice(0, 8)

      // Create a temporary password hash
      const tempPassword = `temp_${userId.slice(0, 8)}`
      const passwordHash = await hashPassword(tempPassword)

      try {
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

        const { data: newUser, error: createError } = await supabaseAdmin
          .from("tbl_users")
          .insert(userData)
          .select()
          .single()

        if (createError) {
          console.error("Error creating user:", createError)
          userCreationResult = {
            success: false,
            error: createError.message,
            code: createError.code,
          }
        } else {
          console.log("User created successfully:", newUser)
          userCreationResult = {
            success: true,
            user: newUser,
            tempPassword: tempPassword,
          }
        }
      } catch (error: any) {
        console.error("Exception creating user:", error)
        userCreationResult = {
          success: false,
          error: error.message,
        }
      }
    }

    return NextResponse.json({
      success: true,
      debug: {
        userId,
        email,
        tokenData: {
          userId: tokenData.userId,
          email: tokenData.email,
          firstName: tokenData.firstName || tokenData.first_name,
          lastName: tokenData.lastName || tokenData.last_name,
        },
        userExistsInUsers: !!userInUsers,
        userExistsInAuth: !!userInAuth?.user,
        userInUsers: userInUsers ? { ...userInUsers, password_hash: "[HIDDEN]" } : null,
        userInAuth: userInAuth?.user
          ? {
              id: userInAuth.user.id,
              email: userInAuth.user.email,
              created_at: userInAuth.user.created_at,
            }
          : null,
        allUsers: allUsers || [],
        userCreationResult,
        errors: {
          usersError: usersError?.message,
          authError: authError?.message,
          allUsersError: allUsersError?.message,
        },
      },
    })
  } catch (error: any) {
    console.error("Unexpected error in user existence debug:", error)
    return NextResponse.json(
      { success: false, message: "An unexpected error occurred", error: error.message },
      { status: 500 },
    )
  }
}
