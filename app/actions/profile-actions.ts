"use server"

import { revalidatePath } from "next/cache"
import { supabaseAdmin } from "@/lib/supabase"

export type UpdateProfileData = {
  firstName: string
  lastName: string
  phone: string
  addressLine1: string
  addressLine2: string
  city: string
  province: string
  postalCode: string
}

export async function updateProfile(userId: string, data: UpdateProfileData) {
  try {
    console.log("Updating profile for user:", userId)
    console.log("Update data:", data)

    const { error } = await supabaseAdmin
      .from("tbl_users")
      .update({
        first_name: data.firstName,
        last_name: data.lastName,
        phone: data.phone,
        address_line1: data.addressLine1,
        address_line2: data.addressLine2,
        city: data.city,
        province: data.province,
        postal_code: data.postalCode,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)

    if (error) {
      console.error("Error updating profile:", error)
      return { success: false, message: error.message }
    }

    console.log("Profile updated successfully")

    // Revalidate the profile page to show updated data
    revalidatePath("/profile")

    return { success: true, message: "Profile updated successfully" }
  } catch (error: any) {
    console.error("Update profile error:", error)
    return { success: false, message: error.message || "An error occurred while updating profile" }
  }
}
