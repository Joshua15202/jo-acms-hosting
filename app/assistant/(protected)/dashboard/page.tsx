"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAssistantAuth } from "@/components/assistant/assistant-auth-provider"
import { Calendar, CreditCard, Package, Users, Bell, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function AssistantDashboardPage() {
  const { user } = useAssistantAuth()

  // Mock data for dashboard
  const stats = [
    {
      title: "Today's Appointments",
      value: "5",
      description: "2 pending, 3 confirmed",
      icon: Calendar,
      link: "/assistant/appointments",
    },
    {
      title: "Pending Payments",
      value: "₱15,240",
      description: "3 invoices pending",
      icon: CreditCard,
      link: "/assistant/billing",
    },
    {
      title: "Low Stock Items",
      value: "8",
      description: "Items need reordering",
      icon: Package,
      link: "/assistant/inventory",
    },
    {
      title: "Available Services",
      value: "12",
      description: "All services active",
      icon: Users,
      link: "/assistant/services",
    },
  ]

  // Mock notifications
  const notifications = [
    {
      id: 1,
      title: "Low Stock Alert",
      description: "Chicken stock is running low (5 kg remaining)",
      type: "warning",
    },
    {
      id: 2,
      title: "New Appointment",
      description: "New walk-in appointment scheduled for today at 3:00 PM",
      type: "info",
    },
    {
      id: 3,
      title: "Payment Received",
      description: "Payment of ₱8,500 received for Invoice #1234",
      type: "success",
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Assistant Dashboard</h1>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">Welcome back, {user?.name || "Assistant"}</span>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
              <Button variant="link" className="px-0 mt-2" asChild>
                <Link href={stat.link}>View details</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Recent Notifications</CardTitle>
            <CardDescription>Your most recent alerts and notifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {notifications.map((notification) => (
              <Alert key={notification.id} variant={notification.type === "warning" ? "destructive" : "default"}>
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>{notification.title}</AlertTitle>
                <AlertDescription>{notification.description}</AlertDescription>
              </Alert>
            ))}
            <Button variant="outline" className="w-full" asChild>
              <Link href="/assistant/notifications">
                <Bell className="mr-2 h-4 w-4" />
                View all notifications
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Frequently used assistant actions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button className="w-full justify-start" asChild>
              <Link href="/assistant/appointments">
                <Calendar className="mr-2 h-4 w-4" />
                New Walk-in Appointment
              </Link>
            </Button>
            <Button className="w-full justify-start" asChild>
              <Link href="/assistant/billing">
                <CreditCard className="mr-2 h-4 w-4" />
                Create New Invoice
              </Link>
            </Button>
            <Button className="w-full justify-start" asChild>
              <Link href="/assistant/inventory">
                <Package className="mr-2 h-4 w-4" />
                Check Inventory
              </Link>
            </Button>
            <Button className="w-full justify-start" asChild>
              <Link href="/assistant/services">
                <Users className="mr-2 h-4 w-4" />
                Manage Services
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
