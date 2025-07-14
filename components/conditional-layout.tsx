"use client"

import type React from "react"

import { usePathname } from "next/navigation"
import { ThemeProvider } from "@/components/theme-provider"
import { UserAuthProvider } from "@/components/user-auth-provider"
import { CustomToastProvider } from "@/components/custom-toast"
import { Toaster } from "@/components/ui/toaster"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import ChatbotComponent from "@/components/ai-chatbot"

export function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAdminRoute = pathname?.startsWith("/admin")

  if (isAdminRoute) {
    // Admin routes get minimal layout
    return (
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
        <div className="min-h-screen bg-gray-50">{children}</div>
      </ThemeProvider>
    )
  }

  // Customer routes get full layout
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
      <CustomToastProvider>
        <UserAuthProvider>
          <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
          <Toaster />
          <ChatbotComponent />
        </UserAuthProvider>
      </CustomToastProvider>
    </ThemeProvider>
  )
}
