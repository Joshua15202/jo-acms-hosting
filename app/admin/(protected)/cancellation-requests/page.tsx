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
import { Calendar, User, Download, CheckCircle, XCircle } from "lucide-react"

interface CancellationRequest {
  id: string
  appointment_id: string
  user_id: string
  reason: string
  attachment_url: string | null
  status: "pending" | "approved" | "rejected"
  admin_feedback: string | null
  created_at: string
  updated_at: string
  appointment: {
    id: string
    event_type: string
    event_date: string
    total_package_amount: number
    payment_status: string
    status: string
  }
  user: {
    first_name: string
    last_name: string
    email: string
    phone: string
  }
}

export default function CancellationRequestsPage() {
  const [requests, setRequests] = useState<CancellationRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRequest, setSelectedRequest] = useState<CancellationRequest | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [adminFeedback, setAdminFeedback] = useState("")
  const [processing, setProcessing] = useState(false)
  const [actionType, setActionType] = useState<"approve" | "reject">("approve")

  useEffect(() => {
    fetchRequests()
  }, [])

  const fetchRequests = async () => {
    try {
      const response = await fetch("/api/admin/cancellation-requests", {
        credentials: "include",
      })
      const data = await response.json()

      if (data.success) {
        setRequests(data.data)
      }
    } catch (error) {
      console.error("Error fetching cancellation requests:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAction = async () => {
    if (!selectedRequest) return

    setProcessing(true)
    try {
      const response = await fetch(`/api/admin/cancellation-requests/${selectedRequest.id}`, {
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
        alert(`Cancellation request ${actionType === "approve" ? "approved" : "rejected"} successfully`)
        await fetchRequests()
        setDialogOpen(false)
        setAdminFeedback("")
      } else {
        alert(data.error || "Failed to process request")
      }
    } catch (error) {
      console.error("Error processing cancellation request:", error)
      alert("Failed to process request")
    } finally {
      setProcessing(false)
    }
  }

  const openDialog = (request: CancellationRequest, action: "approve" | "reject") => {
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
    return <div className="container mx-auto py-8 px-4">Loading cancellation requests...</div>
  }

  const pendingRequests = requests.filter((r) => r.status === "pending")
  const processedRequests = requests.filter((r) => r.status !== "pending")

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Cancellation Requests</h1>
        <p className="text-muted-foreground">Review and manage customer cancellation requests</p>
      </div>

      {pendingRequests.length === 0 && processedRequests.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">No cancellation requests found.</CardContent>
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
                            {request.user.first_name} {request.user.last_name}
                          </CardTitle>
                          <CardDescription>
                            {request.user.email} • {request.user.phone}
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
                          <p className="text-sm font-medium text-muted-foreground">Event Date</p>
                          <p className="font-medium flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {new Date(request.appointment.event_date).toLocaleDateString("en-US", {
                              month: "long",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Package Amount</p>
                          <p className="font-medium">₱{request.appointment.total_package_amount.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Payment Status</p>
                          <Badge variant="outline">{request.appointment.payment_status}</Badge>
                        </div>
                      </div>

                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-2">Cancellation Reason</p>
                        <div className="bg-muted p-3 rounded-md">
                          <p className="text-sm whitespace-pre-wrap">{request.reason}</p>
                        </div>
                      </div>

                      {request.attachment_url && (
                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-2">Attachment</p>
                          <Button variant="outline" size="sm" asChild>
                            <a href={request.attachment_url} target="_blank" rel="noopener noreferrer">
                              <Download className="h-4 w-4 mr-2" />
                              View Attachment
                            </a>
                          </Button>
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
                            {request.user.first_name} {request.user.last_name}
                          </CardTitle>
                          <CardDescription>{request.user.email}</CardDescription>
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
              {actionType === "approve" ? "Approve Cancellation Request" : "Reject Cancellation Request"}
            </DialogTitle>
            <DialogDescription>
              {actionType === "approve"
                ? "The appointment will be cancelled and the customer will be notified."
                : "The cancellation request will be rejected. Please provide a reason."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="adminFeedback">
                Feedback {actionType === "reject" && <span className="text-red-500">*</span>}
              </Label>
              <Textarea
                id="adminFeedback"
                value={adminFeedback}
                onChange={(e) => setAdminFeedback(e.target.value)}
                placeholder={
                  actionType === "approve"
                    ? "Optional feedback for the customer..."
                    : "Provide a reason for rejecting this request..."
                }
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
              disabled={processing || (actionType === "reject" && !adminFeedback.trim())}
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
