import { redirect } from "next/navigation"
import { getCurrentUser } from "@/app/actions/auth-actions"
import ProfileClient from "@/components/profile-client"

export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
  console.log("=== PROFILE PAGE START ===")

  try {
    const user = await getCurrentUser()

    console.log("=== PROFILE PAGE DEBUG ===")
    console.log("User data:", user)

    if (!user) {
      console.log("No user found, redirecting to login")
      redirect("/login")
    }

    console.log("Rendering profile for user:", user.email)
    console.log("User object structure:", JSON.stringify(user, null, 2))

    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto py-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
            <p className="text-gray-600">Manage your account information</p>
          </div>
          <ProfileClient user={user} />
        </div>
      </div>
    )
  } catch (error) {
    console.log("Error in profile page:", error instanceof Error ? error.message : String(error))
    redirect("/login")
  }
}
