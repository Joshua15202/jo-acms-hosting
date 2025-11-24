"use client"

import { Star, MessageSquarePlus, Loader2 } from "lucide-react"
import { useEffect, useState } from "react"
import { createBrowserClient } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface Testimonial {
  id: string
  name: string
  event: string
  rating: number
  message: string
  created_at: string
  admin_reply?: string
  admin_reply_at?: string
}

interface EligibleAppointment {
  id: string
  event_type: string
  event_date: string
}

export default function TestimonialsSection() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [eligibleAppointments, setEligibleAppointments] = useState<EligibleAppointment[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Form state
  const [selectedAppointment, setSelectedAppointment] = useState("")
  const [rating, setRating] = useState(5)
  const [message, setMessage] = useState("")

  const { toast } = useToast()

  // Create browser client for client-side auth operations
  const supabase = createBrowserClient()

  // Fetch initial data and setup realtime subscription
  useEffect(() => {
    fetchTestimonials()
    checkUser()

    // Subscribe to realtime changes
    const channel = supabase
      .channel("public:tbl_testimonials")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "tbl_testimonials" }, (payload) => {
        // Refresh data when new testimonial comes in
        fetchTestimonials()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  // Check user eligibility when user state changes
  useEffect(() => {
    if (user) {
      fetchEligibleAppointments(user.id)
    }
  }, [user])

  const checkUser = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession()
    setUser(session?.user || null)
  }

  const fetchTestimonials = async () => {
    try {
      const response = await fetch("/api/testimonials")
      if (!response.ok) {
        console.error("Failed to fetch testimonials:", response.statusText)
        // Fall back to empty array if API fails
        setTestimonials([])
        setLoading(false)
        return
      }
      const data = await response.json()
      if (data.success) {
        setTestimonials(data.data)
      } else {
        setTestimonials([])
      }
    } catch (error) {
      console.error("Error fetching testimonials:", error)
      setTestimonials([])
    } finally {
      setLoading(false)
    }
  }

  const fetchEligibleAppointments = async (userId: string) => {
    try {
      const response = await fetch(`/api/user/eligible-reviews?userId=${userId}`)
      if (!response.ok) {
        console.error("Failed to fetch eligible appointments:", response.statusText)
        setEligibleAppointments([])
        return
      }
      const data = await response.json()
      if (data.success) {
        setEligibleAppointments(data.data)
      } else {
        setEligibleAppointments([])
      }
    } catch (error) {
      console.error("Error fetching eligible appointments:", error)
      setEligibleAppointments([])
    }
  }

  const handleSubmit = async () => {
    if (!selectedAppointment || !message.trim()) {
      toast({
        title: "Missing fields",
        description: "Please select an event and write a message.",
        variant: "destructive",
      })
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch("/api/testimonials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          appointmentId: selectedAppointment,
          rating,
          message,
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Thank you!",
          description: "Your review has been submitted successfully.",
        })
        setIsDialogOpen(false)
        setMessage("")
        setSelectedAppointment("")
        setRating(5)
        // Refresh eligible appointments (remove the one just reviewed)
        fetchEligibleAppointments(user.id)
        // Refresh testimonials list immediately
        fetchTestimonials()
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to submit review",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-white">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">What Our Clients Say</h2>
            <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Don't just take our word for it. Here's what our clients have to say about our services.
            </p>
          </div>

          {/* Review Button for Eligible Users */}
          {user && eligibleAppointments.length > 0 && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="mt-4 bg-rose-600 hover:bg-rose-700">
                  <MessageSquarePlus className="mr-2 h-4 w-4" />
                  Write a Review
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Share Your Experience</DialogTitle>
                  <DialogDescription>
                    Rate your experience with our catering service for your completed event.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="event">Select Event</Label>
                    <Select value={selectedAppointment} onValueChange={setSelectedAppointment}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an event to review" />
                      </SelectTrigger>
                      <SelectContent>
                        {eligibleAppointments.map((appt) => (
                          <SelectItem key={appt.id} value={appt.id}>
                            {appt.event_type} - {new Date(appt.event_date).toLocaleDateString()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label>Rating</Label>
                    <div className="flex space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          className="focus:outline-none transition-transform hover:scale-110"
                        >
                          <Star
                            className={`h-8 w-8 ${
                              star <= rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="message">Your Review</Label>
                    <Textarea
                      id="message"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Tell us about your experience..."
                      rows={4}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={submitting}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={submitting || !selectedAppointment || !message.trim()}
                    className="bg-rose-600 hover:bg-rose-700"
                  >
                    {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Submit Review
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>

        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            // Loading skeletons
            Array(3)
              .fill(0)
              .map((_, i) => (
                <div
                  key={i}
                  className="flex flex-col space-y-4 rounded-lg border p-6 shadow-sm h-48 animate-pulse bg-gray-50"
                >
                  <div className="h-4 w-1/3 bg-gray-200 rounded"></div>
                  <div className="h-20 w-full bg-gray-200 rounded"></div>
                  <div className="h-10 w-1/2 bg-gray-200 rounded"></div>
                </div>
              ))
          ) : testimonials.length > 0 ? (
            testimonials.map((testimonial) => (
              <div
                key={testimonial.id}
                className="flex flex-col justify-between space-y-4 rounded-lg border p-6 shadow-sm hover:shadow-md transition-shadow bg-white"
              >
                <div className="space-y-2">
                  <div className="flex items-center">
                    {Array(5)
                      .fill(0)
                      .map((_, i) => (
                        <Star
                          key={i}
                          className={`h-5 w-5 ${i < testimonial.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
                        />
                      ))}
                  </div>
                  <p className="text-gray-500 italic">"{testimonial.message}"</p>
                </div>

                <div className="flex items-center space-x-4 pt-4 border-t">
                  <Avatar className="h-10 w-10 border">
                    <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${testimonial.name}`} />
                    <AvatarFallback>{testimonial.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-bold text-gray-900">{testimonial.name}</p>
                    <p className="text-xs text-rose-600 font-medium">{testimonial.event}</p>
                    <p className="text-[10px] text-gray-400">{new Date(testimonial.created_at).toLocaleDateString()}</p>
                  </div>
                </div>

                {testimonial.admin_reply && (
                  <div className="mt-4 p-3 bg-rose-50 border-l-4 border-rose-600 rounded">
                    <p className="text-sm font-semibold text-rose-900 mb-1">Jo-ACMS Response:</p>
                    <p className="text-sm text-gray-700 italic">"{testimonial.admin_reply}"</p>
                    {testimonial.admin_reply_at && (
                      <p className="text-[10px] text-gray-400 mt-1">
                        {new Date(testimonial.admin_reply_at).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12 text-gray-500">
              <p>No reviews yet. Be the first to share your experience!</p>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
