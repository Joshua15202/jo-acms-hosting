"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Package, Calendar, Bell, CheckCircle, Clock, X } from "lucide-react"

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([
    {
      id: "notif-001",
      type: "inventory",
      title: "Low Stock Alert",
      message: "Beef is running low. Current stock: 5kg",
      timestamp: "2023-12-01 09:15 AM",
      status: "unread",
      priority: "high",
      icon: Package,
    },
    {
      id: "notif-002",
      type: "inventory",
      title: "Out of Stock Alert",
      message: "Pasta is out of stock. Please reorder immediately.",
      timestamp: "2023-12-01 08:30 AM",
      status: "unread",
      priority: "critical",
      icon: Package,
    },
    {
      id: "notif-003",
      type: "appointment",
      title: "New Appointment",
      message: "Maria Santos booked a Wedding Consultation for Dec 15, 10:00 AM",
      timestamp: "2023-11-30 03:45 PM",
      status: "read",
      priority: "normal",
      icon: Calendar,
    },
    {
      id: "notif-004",
      type: "inventory",
      title: "Low Stock Alert",
      message: "Table Cloths are running low. Current stock: 10pcs",
      timestamp: "2023-11-30 02:20 PM",
      status: "read",
      priority: "high",
      icon: Package,
    },
    {
      id: "notif-005",
      type: "system",
      title: "Backup Completed",
      message: "Database backup completed successfully.",
      timestamp: "2023-11-30 01:00 AM",
      status: "read",
      priority: "normal",
      icon: Bell,
    },
  ])

  const markAsRead = (id: string) => {
    setNotifications(
      notifications.map((notification) =>
        notification.id === id ? { ...notification, status: "read" } : notification,
      ),
    )
  }

  const markAllAsRead = () => {
    setNotifications(
      notifications.map((notification) => ({
        ...notification,
        status: "read",
      })),
    )
  }

  const deleteNotification = (id: string) => {
    setNotifications(notifications.filter((notification) => notification.id !== id))
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "critical":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Critical</Badge>
      case "high":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">High</Badge>
      case "normal":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Normal</Badge>
      default:
        return <Badge>{priority}</Badge>
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "inventory":
        return <Package className="h-5 w-5" />
      case "appointment":
        return <Calendar className="h-5 w-5" />
      case "system":
        return <Bell className="h-5 w-5" />
      default:
        return <Bell className="h-5 w-5" />
    }
  }

  const unreadCount = notifications.filter((notification) => notification.status === "unread").length
  const inventoryNotifications = notifications.filter((notification) => notification.type === "inventory")
  const appointmentNotifications = notifications.filter((notification) => notification.type === "appointment")
  const systemNotifications = notifications.filter((notification) => notification.type === "system")
  const unreadNotifications = notifications.filter((notification) => notification.status === "unread")

  const renderNotificationList = (notificationList) => {
    return notificationList.length > 0 ? (
      notificationList.map((notification) => (
        <Card
          key={notification.id}
          className={`overflow-hidden ${notification.status === "unread" ? "border-l-4 border-l-rose-500" : ""}`}
        >
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div
                  className={`mt-1 rounded-full p-2 ${
                    notification.priority === "critical"
                      ? "bg-red-100 text-red-600"
                      : notification.priority === "high"
                        ? "bg-yellow-100 text-yellow-600"
                        : "bg-blue-100 text-blue-600"
                  }`}
                >
                  <notification.icon className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{notification.title}</h3>
                    {getPriorityBadge(notification.priority)}
                    {notification.status === "unread" && <span className="h-2 w-2 rounded-full bg-rose-500"></span>}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{notification.message}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Clock className="h-3 w-3 text-gray-400" />
                    <span className="text-xs text-gray-400">{notification.timestamp}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                {notification.status === "unread" && (
                  <Button variant="ghost" size="sm" onClick={() => markAsRead(notification.id)} className="h-8 w-8 p-0">
                    <CheckCircle className="h-4 w-4" />
                    <span className="sr-only">Mark as read</span>
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteNotification(notification.id)}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Delete</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))
    ) : (
      <Card>
        <CardContent className="p-6 text-center">
          <Bell className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium">No notifications</h3>
          <p className="text-sm text-gray-500">You're all caught up!</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
          <p className="text-gray-500">Stay updated with system alerts and notifications</p>
        </div>
        <Button variant="outline" onClick={markAllAsRead} disabled={unreadCount === 0}>
          Mark All as Read
        </Button>
      </div>

      <div className="flex items-center justify-between">
        <Tabs defaultValue="all" className="w-full">
          <div className="flex justify-between items-center">
            <TabsList>
              <TabsTrigger value="all">
                All
                <span className="ml-2 bg-gray-100 text-gray-800 px-2 py-0.5 rounded-full text-xs">
                  {notifications.length}
                </span>
              </TabsTrigger>
              <TabsTrigger value="unread">
                Unread
                <span className="ml-2 bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full text-xs">{unreadCount}</span>
              </TabsTrigger>
              <TabsTrigger value="inventory">Inventory</TabsTrigger>
              <TabsTrigger value="appointments">Appointments</TabsTrigger>
              <TabsTrigger value="system">System</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="all" className="mt-6 space-y-4">
            {renderNotificationList(notifications)}
          </TabsContent>

          <TabsContent value="unread" className="mt-6 space-y-4">
            {renderNotificationList(unreadNotifications)}
          </TabsContent>

          <TabsContent value="inventory" className="mt-6 space-y-4">
            {renderNotificationList(inventoryNotifications)}
          </TabsContent>

          <TabsContent value="appointments" className="mt-6 space-y-4">
            {renderNotificationList(appointmentNotifications)}
          </TabsContent>

          <TabsContent value="system" className="mt-6 space-y-4">
            {renderNotificationList(systemNotifications)}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
