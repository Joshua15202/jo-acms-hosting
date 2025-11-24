"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Bell, X, Calendar, DollarSign } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { formatDistanceToNow } from "date-fns"

interface AdminNotification {
  id: string
  title: string
  message: string
  type: "new_appointment" | "payment_submitted" | "alert"
  is_read: boolean
  created_at: string
  appointment_id?: string
  payment_transaction_id?: string
}

interface AdminNotificationsDropdownProps {
  adminUsername: string
}

export function AdminNotificationsDropdown({ adminUsername }: AdminNotificationsDropdownProps) {
  const [notifications, setNotifications] = useState<AdminNotification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)

  const fetchNotifications = async () => {
    try {
      const response = await fetch("/api/admin/notifications", {
        headers: {
          "x-admin-username": adminUsername,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setNotifications(data.notifications)
        setUnreadCount(data.unreadCount)
      }
    } catch (error) {
      console.error("Error fetching admin notifications:", error)
    }
  }

  useEffect(() => {
    if (adminUsername) {
      fetchNotifications()
      // Poll for new notifications every 30 seconds
      const interval = setInterval(fetchNotifications, 30000)
      return () => clearInterval(interval)
    }
  }, [adminUsername])

  const markAsRead = async (notificationId?: string) => {
    try {
      await fetch("/api/admin/notifications/mark-read", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-username": adminUsername,
        },
        body: JSON.stringify({ notificationId }),
      })

      // Refresh notifications
      fetchNotifications()
    } catch (error) {
      console.error("Error marking notification as read:", error)
    }
  }

  const deleteNotification = async (notificationId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      const response = await fetch("/api/admin/notifications/delete", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "x-admin-username": adminUsername,
        },
        body: JSON.stringify({ notificationId }),
      })

      if (response.ok) {
        fetchNotifications()
      }
    } catch (error) {
      console.error("Error deleting notification:", error)
    }
  }

  const deleteAllNotifications = async () => {
    try {
      const response = await fetch("/api/admin/notifications/delete", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "x-admin-username": adminUsername,
        },
        body: JSON.stringify({}),
      })

      if (response.ok) {
        fetchNotifications()
      }
    } catch (error) {
      console.error("Error deleting all notifications:", error)
    }
  }

  const handleNotificationClick = (notification: AdminNotification) => {
    if (!notification.is_read) {
      markAsRead(notification.id)
    }
  }

  const markAllAsRead = () => {
    markAsRead()
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "new_appointment":
        return <Calendar className="h-4 w-4 text-blue-600" />
      case "payment_submitted":
        return <DollarSign className="h-4 w-4 text-green-600" />
      default:
        return <Bell className="h-4 w-4 text-gray-600" />
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "new_appointment":
        return "bg-blue-50"
      case "payment_submitted":
        return "bg-green-50"
      default:
        return "bg-gray-50"
    }
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-96">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Admin Notifications</span>
          <div className="flex gap-2">
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" className="h-auto p-0 text-xs" onClick={markAllAsRead}>
                Mark all as read
              </Button>
            )}
            {notifications.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 text-xs text-destructive hover:text-destructive"
                onClick={deleteAllNotifications}
              >
                Delete all
              </Button>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <ScrollArea className="h-[500px]">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">No notifications yet</div>
          ) : (
            notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className={`flex flex-col items-start p-4 cursor-pointer ${getNotificationColor(notification.type)} hover:${getNotificationColor(notification.type)}/80`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex w-full items-start justify-between gap-2">
                  <div className="flex items-start gap-2 flex-1">
                    {getNotificationIcon(notification.type)}
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${!notification.is_read ? "font-semibold" : ""}`}>
                        {notification.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1 whitespace-pre-line">{notification.message}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {!notification.is_read && <div className="h-2 w-2 rounded-full bg-rose-600" />}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 hover:bg-destructive/10"
                      onClick={(e) => deleteNotification(notification.id, e)}
                    >
                      <X className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                    </Button>
                  </div>
                </div>
              </DropdownMenuItem>
            ))
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
