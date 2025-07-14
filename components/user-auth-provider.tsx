"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"

// Define User type directly in this file to avoid import issues
type User = {
  id: string
  name: string
  email: string
  role: string
  phone?: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (formData: FormData) => Promise<{ success: boolean; message: string }>
  logout: () => Promise<{ success: boolean; message: string }>
  register: (formData: FormData) => Promise<{ success: boolean; message: string; user?: User }>
  setUser: (user: User | null) => void
  refreshSession: () => Promise<boolean>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function UserAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in
    const checkAuth = async () => {
      try {
        console.log("Checking authentication status...")
        const response = await fetch("/api/auth/me", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include", // Include cookies
        })

        console.log("Auth check response status:", response.status)

        if (response.status === 401) {
          console.log("User not authenticated (401)")
          setUser(null)
          return
        }

        if (!response.ok) {
          console.log("Auth check failed with status:", response.status)
          setUser(null)
          return
        }

        const text = await response.text()
        console.log("Raw response:", text.substring(0, 200))

        let data
        try {
          data = JSON.parse(text)
        } catch (parseError) {
          console.error("Failed to parse auth response as JSON:", parseError)
          console.error("Response text:", text)
          setUser(null)
          return
        }

        console.log("Auth check response:", data)

        if (data.success && data.user) {
          setUser(data.user)
          console.log("User authenticated:", data.user.email, "Phone:", data.user.phone)
        } else {
          console.log("User not authenticated")
          setUser(null)
        }
      } catch (error) {
        console.error("Auth check error:", error)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = async (formData: FormData) => {
    try {
      console.log("Attempting login...")
      const response = await fetch("/api/auth/login", {
        method: "POST",
        body: formData,
        credentials: "include", // Include cookies
      })

      console.log("Login response status:", response.status)

      if (!response.ok) {
        console.log("Login failed with status:", response.status)
        return { success: false, message: "Login request failed" }
      }

      const text = await response.text()
      console.log("Raw login response:", text.substring(0, 200))

      let data
      try {
        data = JSON.parse(text)
      } catch (parseError) {
        console.error("Failed to parse login response as JSON:", parseError)
        console.error("Response text:", text)
        return { success: false, message: "Invalid response from server" }
      }

      if (data.success && data.user) {
        setUser(data.user)
        console.log("Login successful:", data.user.email, "Phone:", data.user.phone)
      }

      return data
    } catch (error) {
      console.error("Login error:", error)
      return { success: false, message: "An error occurred during login" }
    }
  }

  const logout = async () => {
    try {
      console.log("Logging out...")
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Include cookies
      })

      console.log("Logout response status:", response.status)

      if (!response.ok) {
        console.log("Logout failed with status:", response.status)
        return { success: false, message: "Logout request failed" }
      }

      const text = await response.text()
      console.log("Raw logout response:", text.substring(0, 200))

      let data
      try {
        data = JSON.parse(text)
      } catch (parseError) {
        console.error("Failed to parse logout response as JSON:", parseError)
        console.error("Response text:", text)
        return { success: false, message: "Invalid response from server" }
      }

      console.log("Logout response:", data)

      if (data.success) {
        setUser(null)
        // Force page reload to clear any cached data
        window.location.href = "/"
      }

      return data
    } catch (error) {
      console.error("Logout error:", error)
      return { success: false, message: "An error occurred during logout" }
    }
  }

  const register = async (formData: FormData) => {
    try {
      console.log("Attempting registration...")
      const response = await fetch("/api/auth/register", {
        method: "POST",
        body: formData,
        credentials: "include", // Include cookies
      })

      console.log("Registration response status:", response.status)

      if (!response.ok) {
        console.log("Registration failed with status:", response.status)
        return { success: false, message: "Registration request failed" }
      }

      const text = await response.text()
      console.log("Raw registration response:", text.substring(0, 200))

      let data
      try {
        data = JSON.parse(text)
      } catch (parseError) {
        console.error("Failed to parse registration response as JSON:", parseError)
        console.error("Response text:", text)
        return { success: false, message: "Invalid response from server" }
      }

      if (data.success && data.user) {
        setUser(data.user)
        console.log("Registration successful:", data.user.email, "Phone:", data.user.phone)
      }

      return data
    } catch (error) {
      console.error("Registration error:", error)
      return { success: false, message: "An error occurred during registration" }
    }
  }

  const refreshSession = async () => {
    try {
      console.log("Refreshing session...")
      const response = await fetch("/api/auth/me", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Include cookies
      })

      console.log("Session refresh response status:", response.status)

      if (response.status === 401) {
        console.log("Session refresh failed - user not authenticated")
        setUser(null)
        return false
      }

      if (response.ok) {
        const data = await response.json()
        if (data.success && data.user) {
          setUser(data.user)
          console.log("Session refreshed successfully")
          return true
        }
      }

      console.log("Session refresh failed")
      setUser(null)
      return false
    } catch (error) {
      console.error("Session refresh error:", error)
      setUser(null)
      return false
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register, setUser, refreshSession }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within a UserAuthProvider")
  }
  return context
}
