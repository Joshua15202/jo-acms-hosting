"use server"

import { query } from "@/lib/db"
import { getCurrentUser } from "./auth-actions"
import { revalidatePath } from "next/cache"

export async function updateProfile(formData: FormData) {
  try {
    const currentUser = await getCurrentUser()

    if (!currentUser) {
      return { success: false, message: "Not authenticated" }
    }

    const name = formData.get("name") as string
    const email = formData.get("email") as string
    const phone = formData.get("phone") as string
    const address = formData.get("address") as string
    const bio = formData.get("bio") as string

    // Validate required fields
    if (!name || !email) {
      return { success: false, message: "Name and email are required" }
    }

    // Check if email is already taken by another user
    const existingUsers = await query("SELECT id FROM tbl_users WHERE email = ? AND id != ?", [email, currentUser.id])

    // Handle different return types from query function
    const hasExistingUser = Array.isArray(existingUsers) ? existingUsers.length > 0 : !!existingUsers

    if (hasExistingUser) {
      return { success: false, message: "Email is already taken" }
    }

    // Update user profile - using your existing table name 'tbl_users'
    await query(
      `UPDATE tbl_users 
       SET full_name = ?, email = ?, phone = ?, address = ?, bio = ?
       WHERE id = ?`,
      [name, email, phone || null, address || null, bio || null, currentUser.id],
    )

    // Revalidate the profile page
    revalidatePath("/profile")

    return { success: true, message: "Profile updated successfully" }
  } catch (error) {
    console.error("Profile update error:", error)
    return { success: false, message: "An error occurred while updating profile" }
  }
}

export async function getUserProfile(userId: string) {
  try {
    const users = await query(
      "SELECT id, full_name as name, email, phone, address, bio, role, created_at FROM tbl_users WHERE id = ?",
      [userId],
    )

    // Handle different return types from query function
    if (Array.isArray(users) && users.length > 0) {
      return users[0]
    } else if (users && !Array.isArray(users)) {
      return users
    }

    return null
  } catch (error) {
    console.error("Get user profile error:", error)
    return null
  }
}
