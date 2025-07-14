"use client"

import type React from "react"
import { AdminAuthProvider } from "@/components/admin/admin-auth-provider"

export function AdminLayoutClient({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return <AdminAuthProvider>{children}</AdminAuthProvider>
}
