"use client"

import { useState, useEffect } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Loader2, CalendarX, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface BlockedDate {
  id: number
  blocked_date: string
  reason: string
  blocked_by: number | null
  created_at: string
}

export default function CalendarControlPage() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([])
  const [loading, setLoading] = useState(true)
  const [blocking, setBlocking] = useState(false)
  const [reason, setReason] = useState("")
  const [showDialog, setShowDialog] = useState(false)
  const { toast } = useToast()

  // Fetch blocked dates
  useEffect(() => {
    fetchBlockedDates()
  }, [])

  const fetchBlockedDates = async () => {
    try {
      const response = await fetch("/api/admin/blocked-dates")
      if (!response.ok) throw new Error("Failed to fetch blocked dates")
      const data = await response.json()
      setBlockedDates(data.blockedDates || [])
    } catch (error) {
      console.error("Error fetching blocked dates:", error)
      toast({
        title: "Error",
        description: "Failed to load blocked dates",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return
    setSelectedDate(date)

    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")
    const dateStr = `${year}-${month}-${day}`

    const isBlocked = blockedDates.some((bd) => bd.blocked_date === dateStr)

    if (isBlocked) {
      // If already blocked, show option to unblock
      const blockedDate = blockedDates.find((bd) => bd.blocked_date === dateStr)
      if (blockedDate) {
        handleUnblockDate(blockedDate.id)
      }
    } else {
      // Show dialog to block the date
      setReason("")
      setShowDialog(true)
    }
  }

  const handleBlockDate = async () => {
    if (!selectedDate) return

    setBlocking(true)
    const year = selectedDate.getFullYear()
    const month = String(selectedDate.getMonth() + 1).padStart(2, "0")
    const day = String(selectedDate.getDate()).padStart(2, "0")
    const dateStr = `${year}-${month}-${day}`

    try {
      const response = await fetch("/api/admin/blocked-dates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          blocked_date: dateStr,
          reason: reason || "Business break/holiday",
        }),
      })

      if (!response.ok) throw new Error("Failed to block date")

      toast({
        title: "Date Blocked",
        description: `${selectedDate.toLocaleDateString()} has been blocked successfully`,
      })

      setShowDialog(false)
      setReason("")
      fetchBlockedDates()
    } catch (error) {
      console.error("Error blocking date:", error)
      toast({
        title: "Error",
        description: "Failed to block date",
        variant: "destructive",
      })
    } finally {
      setBlocking(false)
    }
  }

  const handleUnblockDate = async (id: number) => {
    try {
      const response = await fetch(`/api/admin/blocked-dates/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to unblock date")

      toast({
        title: "Date Unblocked",
        description: "The date has been unblocked successfully",
      })

      fetchBlockedDates()
    } catch (error) {
      console.error("Error unblocking date:", error)
      toast({
        title: "Error",
        description: "Failed to unblock date",
        variant: "destructive",
      })
    }
  }

  // Convert blocked dates to Date objects for the calendar
  const blockedDateObjects = blockedDates.map((bd) => new Date(bd.blocked_date + "T00:00:00"))

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Smart Scheduling Calendar Control</h1>
        <p className="text-muted-foreground mt-2">
          Block dates when your business is closed for holidays or breaks. Blocked dates will be unavailable for
          customer bookings.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Calendar */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarX className="h-5 w-5" />
              Select Dates to Block
            </CardTitle>
            <CardDescription>
              Click on a date to block or unblock it. Blocked dates are highlighted in red.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
              modifiers={{
                blocked: blockedDateObjects,
              }}
              modifiersStyles={{
                blocked: {
                  backgroundColor: "#fee2e2",
                  color: "#dc2626",
                  fontWeight: "bold",
                },
              }}
              className="rounded-md border"
            />
          </CardContent>
        </Card>

        {/* Blocked Dates List */}
        <Card>
          <CardHeader>
            <CardTitle>Blocked Dates ({blockedDates.length})</CardTitle>
            <CardDescription>Currently blocked dates that customers cannot book</CardDescription>
          </CardHeader>
          <CardContent>
            {blockedDates.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No dates are currently blocked</p>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto">
                {blockedDates
                  .sort((a, b) => new Date(a.blocked_date).getTime() - new Date(b.blocked_date).getTime())
                  .map((blockedDate) => (
                    <div
                      key={blockedDate.id}
                      className="flex items-start justify-between p-3 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="destructive">
                            {new Date(blockedDate.blocked_date + "T00:00:00").toLocaleDateString("en-US", {
                              weekday: "short",
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </Badge>
                        </div>
                        {blockedDate.reason && (
                          <p className="text-sm text-muted-foreground mt-1">{blockedDate.reason}</p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleUnblockDate(blockedDate.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Block Date Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Block Date</DialogTitle>
            <DialogDescription>Block {selectedDate?.toLocaleDateString()} from customer bookings</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reason">Reason (optional)</Label>
              <Textarea
                id="reason"
                placeholder="e.g., Holiday break, Business closed, Staff vacation..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)} disabled={blocking}>
              Cancel
            </Button>
            <Button onClick={handleBlockDate} disabled={blocking}>
              {blocking && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Block Date
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
