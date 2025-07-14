"use client"

import type React from "react"

import { useState, useEffect, createContext, useContext } from "react"
import { useRouter } from "next/navigation"

type AdminAuthContextType = {
  isAuthenticated: boolean
  setIsAuthenticated: (value: boolean) => void
  user: { username: string; role: string } | null
  setUser: (user: { username: string; role: string } | null) => void
  logout: () => void
}

const AdminAuthContext = createContext<AdminAuthContextType | null>(null)

export const AdminAuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<{ username: string; role: string } | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Check authentication on mount
    try {
      const storedAuth = localStorage.getItem("adminAuthenticated")
      const storedUser = localStorage.getItem("adminUser")

      if (storedAuth === "true" && storedUser) {
        setIsAuthenticated(true)
        setUser(JSON.parse(storedUser))
      }
    } catch (error) {
      console.error("Auth initialization error:", error)
    } finally {
      setIsInitialized(true)
    }
  }, [])

  const logout = () => {
    localStorage.removeItem("adminAuthenticated")
    localStorage.removeItem("adminUser")
    setIsAuthenticated(false)
    setUser(null)
    router.push("/admin/login")
  }

  return (
    <AdminAuthContext.Provider
      value={{
        isAuthenticated,
        setIsAuthenticated,
        user,
        setUser,
        logout,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  )
}

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext)
  if (!context) {
    throw new Error("useAdminAuth must be used within a AdminAuthProvider")
  }
  return context
}
