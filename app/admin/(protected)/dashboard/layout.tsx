"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { AdminAuthProvider } from "@/components/admin/admin-auth-provider"
import AdminSidebar from "@/components/admin/admin-sidebar"
import AdminNavbar from "@/components/admin/admin-navbar"

function ProtectedContent({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<{ username: string; role: string } | null>(null)

  useEffect(() => {
    const checkAuth = () => {
      try {
        const adminAuthenticated = localStorage.getItem("adminAuthenticated")
        const adminUser = localStorage.getItem("adminUser")

        if (adminAuthenticated === "true" && adminUser) {
          setIsAuthenticated(true)
          setUser(JSON.parse(adminUser))
        } else {
          router.push("/admin/login")
        }
      } catch (error) {
        console.error("Auth check error:", error)
        router.push("/admin/login")
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [router])

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-rose-600" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar user={user} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <AdminNavbar user={user} />
        <main className="flex-1 overflow-y-auto bg-white">{children}</main>
      </div>
    </div>
  )
}

export default function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AdminAuthProvider>
      <ProtectedContent>{children}</ProtectedContent>
    </AdminAuthProvider>
  )
}
