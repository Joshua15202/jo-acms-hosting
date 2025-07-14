import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Jo-AIMS Admin Dashboard",
  description: "Administrative dashboard for Jo-AIMS catering management system",
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
