import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export default function AssistantPage() {
  // Check if user is authenticated by looking for auth cookie
  const authCookie = cookies().get("assistant-auth")

  // If authenticated, redirect to dashboard, otherwise to login
  if (authCookie) {
    redirect("/assistant/dashboard")
  } else {
    redirect("/assistant/login")
  }
}
