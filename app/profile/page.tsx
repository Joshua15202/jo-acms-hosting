import { redirect } from "next/navigation"
import { getCurrentUser } from "@/app/actions/auth-actions"
import ProfileClient from "@/components/profile-client"

export default async function ProfilePage() {
  console.log("Profile page - checking authentication")

  const user = await getCurrentUser()

  console.log("Profile page - user:", user ? "User found" : "No user found")

  if (!user) {
    console.log("Profile page - redirecting to login")
    redirect("/login")
  }

  return <ProfileClient user={user} />
}
