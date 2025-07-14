"use client"

import type React from "react"

import { AssistantAuthProvider } from "@/components/assistant/assistant-auth-provider"
import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function ProtectedAssistantLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()

  // This is a simple check to ensure we're in the browser
  useEffect(() => {
    const assistantData = localStorage.getItem("assistant-auth")
    if (!assistantData) {
      router.push("/assistant/login")
    }
  }, [router])

  return <AssistantAuthProvider>{children}</AssistantAuthProvider>
}
