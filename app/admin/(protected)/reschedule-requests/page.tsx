"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Calendar, User, CheckCircle, XCircle, ArrowRight } from "lucide-react"

interface RescheduleRequest {
  id: string
  appointment_id: string
  user_id: string
  current_event_date: string
  current_event_time: string
  new_event_date: string
  new_event_time: string
  reason: string | null
  attachment_url: string | null
  penalty_applied: boolean
  penalty_amount: number
  new_total_amount: number
  status: "pending" | "approved" | "rejected"
  admin_feedback: string | null
  created_at: string
  updated_at: string
  appointment: {
    id: string
    event_type: string
    guest_count: number
    venue_address: string
    total_package_amount: number
    payment_status: string
    status: string
    contact_full_name: string
    contact_email: string
    contact_phone: string
  }
}

export default function RescheduleRequestsPage() {
  const [requests, setRequests] = useState<RescheduleRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRequest, setSelectedRequest] = useState<RescheduleRequest | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [adminFeedback, setAdminFeedback] = useState("")
  const [processing, setProcessing] = useState(false)
  const [actionType, setActionType] = useState<"approve" | "reject">("approve")

  useEffect(() => {
    fetchRequests()

    // Auto-refresh every 30 seconds to check for new requests
    const interval = setInterval(() => {
      fetchRequests()
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  const fetchRequests = async () => {
    try {
      // Add timestamp to force cache busting in production
      const timestamp = new Date().getTime()
      const response = await fetch(`/api/admin/reschedule-requests?t=${timestamp}`, {
        cache: "no-store",
        credentials: "include",
      })
      const data = await response.json()

      if (data.success) {
        setRequests(data.data)
      }
    } catch (error) {
      console.error("Error fetching reschedule requests:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAction = async () => {
    if (!selectedRequest) return

    setProcessing(true)
    try {
      const response = await fetch(`/api/admin/reschedule-requests/${selectedRequest.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          action: actionType,
          adminFeedback: adminFeedback.trim() || null,
        }),
      })

      const data = await response.json()

      if (data.success) {
        alert(`Reschedule request ${actionType === "approve" ? "approved" : "rejected"} successfully`)
        await fetchRequests()
        setDialogOpen(false)
        setAdminFeedback("")
      } else {
        alert(data.error || "Failed to process request")
      }
    } catch (error) {
      console.error("Error processing reschedule request:", error)
      alert("Failed to process request")
    } finally {
      setProcessing(false)
    }
  }

  const openDialog = (request: RescheduleRequest, action: "approve" | "reject") => {
    setSelectedRequest(request)
    setActionType(action)
    setAdminFeedback("")
    setDialogOpen(true)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
            Pending
          </Badge>
        )
      case "approved":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800">
            Approved
          </Badge>
        )
      case "rejected":
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800">
            Rejected
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (loading) {
    return <div className="container mx-auto py-8 px-4">Loading reschedule requests...</div>
  }

  const pendingRequests = requests.filter((r) => r.status === "pending")
  const processedRequests = requests.filter((r) => r.status !== "pending")

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Reschedule Requests</h1>
        <p className="text-muted-foreground">Review and manage customer reschedule requests</p>
      </div>

      {pendingRequests.length === 0 && processedRequests.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">No reschedule requests found.</CardContent>
        </Card>
      ) : (
        <>
          {pendingRequests.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Pending Requests</h2>
              <div className="grid gap-4">
                {pendingRequests.map((request) => (
                  <Card key={request.id} className="border-l-4 border-l-yellow-500">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  {request.appointment.contact_full_name}
                </CardTitle>
                <CardDescription>
                  {request.appointment.contact_email} • {request.appointment.contact_phone}
                </CardDescription>
                        </div>
                        {getStatusBadge(request.status)}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Event Type</p>
                          <p className="font-medium">{request.appointment.event_type}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Guest Count</p>
                          <p className="font-medium">{request.appointment.guest_count} guests</p>
                        </div>
                      </div>

                      {/* Date Change Display */}
                      <div className="bg-muted p-4 rounded-lg">
                        <p className="text-sm font-medium text-muted-foreground mb-3">Reschedule Details</p>
                        <div className="flex items-center gap-3">
                          <div className="flex-1">
                            <p className="text-xs text-muted-foreground mb-1">Current Date</p>
                            <p className="font-medium flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {new Date(request.current_event_date).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}{" "}
                              at {request.current_event_time}
                            </p>
                          </div>
                          <ArrowRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                          <div className="flex-1">
                            <p className="text-xs text-muted-foreground mb-1">Requested Date</p>
                            <p className="font-medium flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {new Date(request.new_event_date).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}{" "}
                              at {request.new_event_time}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Penalty Information */}
                      {request.penalty_applied && (
                        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                          <p className="text-sm font-medium text-yellow-900 mb-2">Penalty Notice</p>
                          <div className="text-sm text-yellow-800 space-y-1">
                            <p>10% Penalty: ₱{request.penalty_amount.toLocaleString()}</p>
                            <p>Original Amount: ₱{request.appointment.total_package_amount.toLocaleString()}</p>
                            <p className="font-semibold">New Total: ₱{request.new_total_amount.toLocaleString()}</p>
                          </div>
                        </div>
                      )}

                      {request.reason && (
                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-2">Reason</p>
                          <div className="bg-muted p-3 rounded-md">
                            <p className="text-sm whitespace-pre-wrap">{request.reason}</p>
                          </div>
                        </div>
                      )}

                      {request.attachment_url && (
                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-2">Attachment</p>
                          <a
                            href={request.attachment_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 hover:underline"
                          >
                            <svg
                              className="h-4 w-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                              />
                            </svg>
                            View Attachment
                          </a>
                        </div>
                      )}

                      <div className="flex gap-2 pt-4">
                        <Button
                          onClick={() => openDialog(request, "approve")}
                          className="flex-1 bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Approve
                        </Button>
                        <Button onClick={() => openDialog(request, "reject")} variant="destructive" className="flex-1">
                          <XCircle className="h-4 w-4 mr-2" />
                          Reject
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {processedRequests.length > 0 && (
            <div>
              <h2 className="text-2xl font-semibold mb-4">Processed Requests</h2>
              <div className="grid gap-4">
                {processedRequests.map((request) => (
                  <Card
                    key={request.id}
                    className={`border-l-4 ${request.status === "approved" ? "border-l-green-500" : "border-l-red-500"}`}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  {request.appointment.contact_full_name}
                </CardTitle>
                <CardDescription>{request.appointment.contact_email}</CardDescription>
              </div>
                        {getStatusBadge(request.status)}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Event Type</p>
                          <p className="font-medium">{request.appointment.event_type}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Processed Date</p>
                          <p className="font-medium">
                            {new Date(request.updated_at).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 text-sm">
                        <span>
                          {new Date(request.current_event_date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}{" "}
                          at {request.current_event_time}
                        </span>
                        <ArrowRight className="h-4 w-4" />
                        <span>
                          {new Date(request.new_event_date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}{" "}
                          at {request.new_event_time}
                        </span>
                      </div>

                      {request.admin_feedback && (
                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-2">Admin Feedback</p>
                          <div className="bg-muted p-3 rounded-md">
                            <p className="text-sm whitespace-pre-wrap">{request.admin_feedback}</p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === "approve" ? "Approve Reschedule Request" : "Reject Reschedule Request"}
            </DialogTitle>
            <DialogDescription>
              {actionType === "approve"
                ? "The appointment will be rescheduled and the customer will be notified."
                : "The reschedule request will be rejected. The appointment will remain at the current date."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="adminFeedback">Feedback (Optional)</Label>
              <Textarea
                id="adminFeedback"
                value={adminFeedback}
                onChange={(e) => setAdminFeedback(e.target.value)}
                placeholder="Optional feedback for the customer..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAction}
              disabled={processing}
              variant={actionType === "approve" ? "default" : "destructive"}
            >
              {processing ? "Processing..." : actionType === "approve" ? "Approve" : "Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
