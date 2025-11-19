"use client"

import { useEffect } from "react"
import { useRouter } from 'next/navigation'

export default function AdminHomePage() {
  const router = useRouter()

  useEffect(() => {
    // Check if admin is authenticated
    const isAuthenticated = localStorage.getItem("adminAuthenticated")

    if (isAuthenticated === "true") {
      router.push("/admin/test-page")
    } else {
      router.push("/admin/login")
    }
  }, [router])

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-rose-600 mb-4">Jo-ACMS Admin</h1>
        <p className="text-gray-600">Redirecting...</p>
      </div>
    </div>
  )
}
