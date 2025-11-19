"use client"

import { LogOut, Bell } from 'lucide-react'
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useRouter } from 'next/navigation'
import { AdminNotificationsDropdown } from "@/components/admin/admin-notifications-dropdown"

type AdminNavbarProps = {
  user?: { username: string; role: string } | null
}

export default function AdminNavbar({ user }: AdminNavbarProps) {
  const router = useRouter()

  const handleLogout = async () => {
    try {
      // Call logout API to clear cookies
      await fetch("/api/admin/logout", {
        method: "POST",
      })

      // Clear localStorage
      localStorage.removeItem("adminAuthenticated")
      localStorage.removeItem("adminUser")

      // Redirect to login
      router.push("/admin/login")
    } catch (error) {
      console.error("Logout error:", error)
      // Still clear localStorage and redirect even if API fails
      localStorage.removeItem("adminAuthenticated")
      localStorage.removeItem("adminUser")
      router.push("/admin/login")
    }
  }

  return (
    <header className="h-16 border-b bg-white px-6 flex items-center justify-between">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Jo-ACMS Admin Dashboard</h1>
      </div>

      <div className="flex items-center space-x-4">
        {user && <AdminNotificationsDropdown adminUsername={user.username} />}
        
        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center space-x-2">
                <div className="h-8 w-8 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 font-medium">
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium">{user.username}</p>
                  <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  )
}
