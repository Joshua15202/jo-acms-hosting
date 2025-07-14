"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Menu, User } from "lucide-react"
import { useAuth } from "@/components/user-auth-provider"

export default function Navbar() {
  const { user, logout } = useAuth()
  const isAuthenticated = !!user

  const handleLogout = async () => {
    await logout()
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="md:hidden">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <nav className="grid gap-6 text-lg font-medium">
                <Link href="/" className="hover:text-rose-600 transition-colors">
                  Home
                </Link>
                <Link href="/about" className="hover:text-rose-600 transition-colors">
                  About
                </Link>
                <Link href="/services" className="hover:text-rose-600 transition-colors">
                  Services
                </Link>
                <Link href="/book-appointment" className="hover:text-rose-600 transition-colors">
                  Book Appointment
                </Link>
                <Link href="/contact" className="hover:text-rose-600 transition-colors">
                  Contact Us
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold">Jo-ACMS</span>
          </Link>
        </div>
        <nav className="hidden md:flex gap-6 text-sm font-medium">
          <Link href="/" className="hover:text-rose-600 transition-colors">
            Home
          </Link>
          <Link href="/about" className="hover:text-rose-600 transition-colors">
            About
          </Link>
          <Link href="/services" className="hover:text-rose-600 transition-colors">
            Services
          </Link>
          <Link href="/book-appointment" className="hover:text-rose-600 transition-colors">
            Book Appointment
          </Link>
          <Link href="/contact" className="hover:text-rose-600 transition-colors">
            Contact Us
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium hidden sm:inline-block">{user?.name || "User"}</span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <User className="h-5 w-5" />
                    <span className="sr-only">User menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <div className="flex flex-col px-3 py-2 border-b sm:hidden">
                    <span className="font-medium">{user?.name || "User"}</span>
                    <span className="text-xs text-gray-500">{user?.email}</span>
                  </div>
                  <DropdownMenuItem>
                    <Link href="/profile" className="w-full">
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link href="/my-appointments" className="w-full">
                      My Appointments
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link href="/payment" className="w-full">
                      Payment
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost">Login</Button>
              </Link>
              <Link href="/register">
                <Button className="bg-rose-600 hover:bg-rose-700">Register</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
