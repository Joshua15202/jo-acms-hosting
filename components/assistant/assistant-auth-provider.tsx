"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"

type AssistantUser = {
  username: string
  role: string
  name: string
  authenticated: boolean
}

type AssistantAuthContextType = {
  user: AssistantUser | null
  loading: boolean
  logout: () => void
}

const AssistantAuthContext = createContext<AssistantAuthContextType | null>(null)

export function useAssistantAuth() {
  const context = useContext(AssistantAuthContext)
  if (!context) {
    throw new Error("useAssistantAuth must be used within an AssistantAuthProvider")
  }
  return context
}

export function AssistantAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AssistantUser | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = () => {
      const assistantData = localStorage.getItem("assistant-auth")
      if (assistantData) {
        try {
          const userData = JSON.parse(assistantData) as AssistantUser
          if (userData.authenticated) {
            setUser(userData)
          } else {
            router.push("/assistant/login")
          }
        } catch (error) {
          console.error("Error parsing assistant auth data:", error)
          router.push("/assistant/login")
        }
      } else {
        router.push("/assistant/login")
      }
      setLoading(false)
    }

    checkAuth()
  }, [router])

  const logout = () => {
    localStorage.removeItem("assistant-auth")
    setUser(null)
    router.push("/assistant/login")
  }

  return <AssistantAuthContext.Provider value={{ user, loading, logout }}>{children}</AssistantAuthContext.Provider>
}
