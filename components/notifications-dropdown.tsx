"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Bell, X } from "lucide-react"
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

interface Notification {
  id: string
  title: string
  message: string
  type: string
  is_read: boolean
  created_at: string
}

interface NotificationsDropdownProps {
  userId: string
}

export function NotificationsDropdown({ userId }: NotificationsDropdownProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)

  const fetchNotifications = async () => {
    try {
      const response = await fetch("/api/notifications", {
        headers: {
          "x-user-id": userId,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setNotifications(data.notifications)
        setUnreadCount(data.unreadCount)
      }
    } catch (error) {
      console.error("Error fetching notifications:", error)
    }
  }

  useEffect(() => {
    if (userId) {
      fetchNotifications()
      // Poll for new notifications every 30 seconds
      const interval = setInterval(fetchNotifications, 30000)
      return () => clearInterval(interval)
    }
  }, [userId])

  const markAsRead = async (notificationId?: string) => {
    try {
      await fetch("/api/notifications/mark-read", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": userId,
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
    e.stopPropagation() // Prevent dropdown item click
    try {
      const response = await fetch("/api/notifications/delete", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": userId,
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
      const response = await fetch("/api/notifications/delete", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": userId,
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

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.is_read) {
      markAsRead(notification.id)
    }
  }

  const markAllAsRead = () => {
    markAsRead()
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
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
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
        <ScrollArea className="h-[400px]">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">No notifications yet</div>
          ) : (
            notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className="flex flex-col items-start p-4 cursor-pointer"
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex w-full items-start justify-between gap-2">
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${!notification.is_read ? "font-semibold" : ""}`}>
                      {notification.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">{notification.message}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {!notification.is_read && <div className="h-2 w-2 rounded-full bg-blue-500" />}
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
