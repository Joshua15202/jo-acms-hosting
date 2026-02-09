"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  Calendar,
  Users,
  CreditCard,
  BarChart3,
  ChefHat,
  Package,
  TrendingUp,
  CalendarX,
  XCircle,
  MessageSquare,
  UserPlus,
  Database,
  X,
  CalendarClock,
} from "lucide-react"

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
    title: "Add Walk-Ins",
    href: "/admin/add-walk-ins",
    icon: UserPlus,
  },
  {
    title: "Cancellation Requests",
    href: "/admin/cancellation-requests",
    icon: XCircle,
  },
  {
    title: "Reschedule Requests",
    href: "/admin/reschedule-requests",
    icon: CalendarClock,
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
    title: "Menu Management",
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
  {
    title: "Feedbacks",
    href: "/admin/feedbacks",
    icon: MessageSquare,
  },
  {
    title: "Backup & Restore",
    href: "/admin/backup-restore",
    icon: Database,
  },
]

interface AdminSidebarProps {
  user?: { username: string; role: string } | null
  isOpen?: boolean
  onClose?: () => void
}

export default function AdminSidebar({ user, isOpen = false, onClose }: AdminSidebarProps) {
  const pathname = usePathname()

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden" 
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <div 
        className={cn(
          "flex h-full w-64 flex-col border-r bg-white transition-transform duration-300 ease-in-out",
          "lg:translate-x-0 lg:static lg:z-auto",
          "fixed inset-y-0 left-0 z-50",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center justify-between border-b px-4">
          <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
          {/* Close button for mobile */}
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-md hover:bg-gray-100"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>
        <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
          {sidebarItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                  isActive ? "bg-primary/10 text-primary" : "text-gray-700 hover:bg-gray-100 hover:text-gray-900",
                )}
              >
                <item.icon
                  className={cn(
                    "mr-3 h-5 w-5 flex-shrink-0",
                    isActive ? "text-primary" : "text-gray-500 group-hover:text-gray-700",
                  )}
                />
                {item.title}
              </Link>
            )
          })}
        </nav>
      </div>
    </>
  )
}
