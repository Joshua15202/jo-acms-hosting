"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { MessageSquare, Star, Calendar, User, Send, CheckCircle } from "lucide-react"
import { format } from "date-fns"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface Testimonial {
  id: string
  rating: number
  message: string
  created_at: string
  admin_reply: string | null
  admin_reply_at: string | null
  replied_by: string | null
  tbl_comprehensive_appointments: {
    event_name: string
    contact_email: string
    contact_name: string
  }
}

export default function AdminFeedbacksPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)
  const [replyDialogOpen, setReplyDialogOpen] = useState(false)
  const [selectedTestimonial, setSelectedTestimonial] = useState<Testimonial | null>(null)
  const [replyText, setReplyText] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const { toast } = useToast()

  const fetchTestimonials = async () => {
    try {
      const response = await fetch("/api/admin/feedbacks")
      if (response.ok) {
        const data = await response.json()
        setTestimonials(data.testimonials)
      }
    } catch (error) {
      console.error("Error fetching testimonials:", error)
      toast({
        title: "Error",
        description: "Failed to load feedbacks",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTestimonials()
  }, [])

  const handleReplyClick = (testimonial: Testimonial) => {
    setSelectedTestimonial(testimonial)
    setReplyText(testimonial.admin_reply || "")
    setReplyDialogOpen(true)
  }

  const handleSubmitReply = async () => {
    if (!selectedTestimonial || !replyText.trim()) {
      toast({
        title: "Error",
        description: "Please enter a reply",
        variant: "destructive",
      })
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch(`/api/admin/feedbacks/${selectedTestimonial.id}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reply: replyText }),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Reply posted successfully",
        })
        setReplyDialogOpen(false)
        setReplyText("")
        fetchTestimonials()
      } else {
        throw new Error("Failed to post reply")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to post reply",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
          />
        ))}
      </div>
    )
  }

  const stats = {
    total: testimonials.length,
    replied: testimonials.filter((t) => t.admin_reply).length,
    pending: testimonials.filter((t) => !t.admin_reply).length,
    avgRating:
      testimonials.length > 0
        ? (testimonials.reduce((sum, t) => sum + t.rating, 0) / testimonials.length).toFixed(1)
        : "0.0",
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading feedbacks...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Customer Feedbacks</h1>
        <p className="text-muted-foreground mt-1">View and respond to customer testimonials and reviews</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Feedbacks</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Replies</CardTitle>
            <MessageSquare className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">{stats.pending}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Replied</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{stats.replied}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgRating}</div>
          </CardContent>
        </Card>
      </div>

      {/* Feedbacks List */}
      <div className="space-y-4">
        {testimonials.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium">No feedbacks yet</p>
              <p className="text-sm text-muted-foreground">Customer feedbacks will appear here</p>
            </CardContent>
          </Card>
        ) : (
          testimonials.map((testimonial) => (
            <Card key={testimonial.id} className={testimonial.admin_reply ? "" : "border-orange-200"}>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="font-semibold">
                            {testimonial.tbl_comprehensive_appointments.contact_name}
                          </span>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {testimonial.tbl_comprehensive_appointments.contact_email}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(testimonial.created_at), "MMM dd, yyyy")}
                        </div>
                        <div className="flex items-center gap-1">
                          {renderStars(testimonial.rating)}
                          <span className="ml-1 font-medium">({testimonial.rating}/5)</span>
                        </div>
                      </div>
                    </div>
                    {testimonial.admin_reply ? (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" />
                        Replied
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="border-orange-500 text-orange-500">
                        Pending Reply
                      </Badge>
                    )}
                  </div>

                  {/* Event Info */}
                  <div className="bg-muted/50 rounded-lg p-3">
                    <p className="text-sm text-muted-foreground">Event:</p>
                    <p className="font-medium">{testimonial.tbl_comprehensive_appointments.event_name}</p>
                  </div>

                  {/* Customer Feedback */}
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Customer Feedback:</p>
                    <p className="text-sm leading-relaxed">{testimonial.message}</p>
                  </div>

                  {/* Admin Reply */}
                  {testimonial.admin_reply && (
                    <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-semibold text-primary">Admin Response:</p>
                        <p className="text-xs text-muted-foreground">
                          by {testimonial.replied_by} • {format(new Date(testimonial.admin_reply_at!), "MMM dd, yyyy")}
                        </p>
                      </div>
                      <p className="text-sm leading-relaxed">{testimonial.admin_reply}</p>
                    </div>
                  )}

                  {/* Reply Button */}
                  <div className="pt-2">
                    <Button
                      onClick={() => handleReplyClick(testimonial)}
                      variant={testimonial.admin_reply ? "outline" : "default"}
                      size="sm"
                      className="gap-2"
                    >
                      <Send className="h-4 w-4" />
                      {testimonial.admin_reply ? "Edit Reply" : "Reply to Customer"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Reply Dialog */}
      <Dialog open={replyDialogOpen} onOpenChange={setReplyDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Reply to Customer Feedback</DialogTitle>
            <DialogDescription>
              {selectedTestimonial && (
                <>
                  Replying to {selectedTestimonial.tbl_comprehensive_appointments.contact_name}'s feedback
                  <div className="flex items-center gap-2 mt-2">
                    {renderStars(selectedTestimonial.rating)}
                    <span className="text-sm">({selectedTestimonial.rating}/5)</span>
                  </div>
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          {selectedTestimonial && (
            <div className="space-y-4">
              <div className="bg-muted rounded-lg p-3">
                <p className="text-sm font-medium mb-1">Customer's Feedback:</p>
                <p className="text-sm text-muted-foreground italic">"{selectedTestimonial.message}"</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Your Reply:</label>
                <Textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Write a thoughtful reply to the customer..."
                  className="min-h-[150px]"
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setReplyDialogOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button onClick={handleSubmitReply} disabled={submitting}>
              {submitting ? "Posting..." : "Post Reply"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
