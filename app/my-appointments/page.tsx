"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import MyAppointmentsClient from "@/components/my-appointments-client"
import { useAuth } from "@/components/user-auth-provider"

export default function MyAppointmentsPage() {
  const { user, loading } = useAuth()
  const isAuthenticated = !!user
  const router = useRouter()

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login?redirect=/my-appointments")
    }
  }, [isAuthenticated, loading, router])

  if (loading) {
    return (
      <div className="container mx-auto py-10 px-4 md:px-6">
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rose-600"></div>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null // Will redirect in useEffect
  }

  return <MyAppointmentsClient />
}
