"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Calendar,
  Package,
  BarChart,
  Settings,
  Users,
  ShoppingCart,
  TrendingUp,
  CreditCard,
  LogOut,
} from "lucide-react"
import { Button } from "@/components/ui/button"

type AdminSidebarProps = {
  user?: { username: string; role: string } | null
}

export default function AdminSidebar({ user }: AdminSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

  if (!user) {
    return null
  }

  const navigation = [
    { name: "Dashboard", href: "/admin/test-page", icon: LayoutDashboard },
    { name: "Appointments", href: "/admin/appointments", icon: Calendar },
    { name: "Payments", href: "/admin/payments", icon: CreditCard },
    { name: "Inventory", href: "/admin/inventory", icon: Package },
    { name: "Forecasting", href: "/admin/forecasting", icon: TrendingUp },
    { name: "Orders", href: "/admin/orders", icon: ShoppingCart },
    { name: "Analytics", href: "/admin/analytics", icon: BarChart },
    { name: "Customers", href: "/admin/customers", icon: Users },
    { name: "Settings", href: "/admin/settings", icon: Settings },
  ]

  const handleLogout = () => {
    localStorage.removeItem("adminAuthenticated")
    localStorage.removeItem("adminUser")
    router.push("/admin/login")
  }

  return (
    <div className="flex h-full w-64 flex-col border-r bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-2 border-b px-6 py-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-600 text-white">
          <Package className="h-4 w-4" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-gray-900">Jo-ACMS</span>
          <span className="text-xs text-gray-500">Admin Panel</span>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex flex-1 flex-col overflow-y-auto">
        <nav className="flex-1 space-y-1 px-3 py-4">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-3 mb-3">Navigation</div>
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
                pathname === item.href
                  ? "bg-rose-50 text-rose-600"
                  : "text-gray-700 hover:bg-gray-50 hover:text-gray-900",
              )}
            >
              <item.icon
                className={cn(
                  "mr-3 h-5 w-5 flex-shrink-0",
                  pathname === item.href ? "text-rose-600" : "text-gray-400 group-hover:text-gray-500",
                )}
              />
              {item.name}
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="border-t p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-100 text-rose-600 text-sm font-medium">
              {user.username.charAt(0).toUpperCase()}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-900">{user.username}</span>
              <span className="text-xs text-gray-500 capitalize">{user.role}</span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="w-full justify-start gap-2 text-gray-700 hover:text-gray-900"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>
    </div>
  )
}
