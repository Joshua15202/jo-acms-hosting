"use client"
import { Button } from "@/components/ui/button"
import { useAssistantAuth } from "./assistant-auth-provider"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Calendar, CreditCard, Home, Package, Bell, LogOut, Users } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator,
  SidebarTrigger,
  SidebarProvider,
} from "@/components/ui/sidebar"

export function AssistantSidebar() {
  const { user, logout } = useAssistantAuth()
  const pathname = usePathname()

  const isActive = (path: string) => {
    return pathname === path || pathname?.startsWith(`${path}/`)
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="py-4">
          <div className="flex items-center px-2">
            <div className="flex flex-col space-y-1 px-2">
              <h2 className="text-lg font-semibold">Jo-AIMS</h2>
              <p className="text-xs text-muted-foreground">Assistant Portal</p>
            </div>
          </div>
        </SidebarHeader>
        <SidebarSeparator />
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={isActive("/assistant/dashboard")}>
                <Link href="/assistant/dashboard">
                  <Home className="h-5 w-5" />
                  <span>Dashboard</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={isActive("/assistant/appointments")}>
                <Link href="/assistant/appointments">
                  <Calendar className="h-5 w-5" />
                  <span>Walk-in Appointments</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={isActive("/assistant/billing")}>
                <Link href="/assistant/billing">
                  <CreditCard className="h-5 w-5" />
                  <span>Billing</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={isActive("/assistant/services")}>
                <Link href="/assistant/services">
                  <Users className="h-5 w-5" />
                  <span>Services</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={isActive("/assistant/inventory")}>
                <Link href="/assistant/inventory">
                  <Package className="h-5 w-5" />
                  <span>Inventory</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={isActive("/assistant/notifications")}>
                <Link href="/assistant/notifications">
                  <Bell className="h-5 w-5" />
                  <span>Notifications</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
        <SidebarSeparator />
        <SidebarFooter>
          <div className="px-3 py-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-sm font-medium">{user?.name?.charAt(0) || "A"}</span>
                </div>
                <div>
                  <p className="text-sm font-medium">{user?.name || "Assistant"}</p>
                  <p className="text-xs text-muted-foreground">{user?.role || "assistant"}</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={logout}>
                <LogOut className="h-5 w-5" />
                <span className="sr-only">Log out</span>
              </Button>
            </div>
          </div>
        </SidebarFooter>
        <SidebarTrigger />
      </Sidebar>
    </SidebarProvider>
  )
}
