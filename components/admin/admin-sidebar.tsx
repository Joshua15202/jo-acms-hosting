"use client"

import Link from "next/link"
import { usePathname } from 'next/navigation'
import { cn } from "@/lib/utils"
import { Calendar, Users, CreditCard, BarChart3, Settings, ChefHat, Package, TrendingUp, CalendarX, XCircle } from 'lucide-react'

const sidebarItems = [
  {
    title: "Dashboard",
    href: "/admin/test-page",
    icon: BarChart3,
  },
  {
    title: "Appointments",
    href: "/admin/appointments",
    icon: Calendar,
  },
  {
    title: "Cancellation Requests",
    href: "/admin/cancellation-requests",
    icon: XCircle,
  },
  {
    title: "Calendar Control",
    href: "/admin/calendar-control",
    icon: CalendarX,
  },
  {
    title: "Customers",
    href: "/admin/customers",
    icon: Users,
  },
  {
    title: "Payments",
    href: "/admin/payments",
    icon: CreditCard,
  },
  {
    title: "Event Ingredients Overview",
    href: "/admin/event-ingredients",
    icon: ChefHat,
  },
  {
    title: "Inventory",
    href: "/admin/inventory",
    icon: Package,
  },
  {
    title: "Equipment Inventory",
    href: "/admin/equipment-inventory",
    icon: Package,
  },
  {
    title: "Forecasting",
    href: "/admin/forecasting",
    icon: TrendingUp,
  },
]

export default function AdminSidebar() {
  const pathname = usePathname()

  return (
    <div className="flex h-full w-64 flex-col bg-gray-900">
      <div className="flex h-16 items-center justify-center border-b border-gray-800">
        <h1 className="text-xl font-bold text-white">Admin Panel</h1>
      </div>
      <nav className="flex-1 space-y-1 px-2 py-4">
        {sidebarItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors",
                isActive ? "bg-gray-800 text-white" : "text-gray-300 hover:bg-gray-700 hover:text-white",
              )}
            >
              <item.icon
                className={cn(
                  "mr-3 h-5 w-5 flex-shrink-0",
                  isActive ? "text-white" : "text-gray-400 group-hover:text-white",
                )}
              />
              {item.title}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
