"use client"

import { Star, MessageSquarePlus, Loader2, X, ChevronLeft, ChevronRight } from "lucide-react"
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

const supabase = createBrowserClient()

interface Testimonial {
  id: string
  name: string
  event: string
  rating: number
  message: string
  created_at: string
  admin_reply?: string
  admin_reply_at?: string
  media_urls?: string[] | null
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
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxImages, setLightboxImages] = useState<string[]>([])
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  // Form state
  const [selectedAppointment, setSelectedAppointment] = useState("")
  const [rating, setRating] = useState(5)
  const [message, setMessage] = useState("")

  const { toast } = useToast()

  const openLightbox = (images: string[], index: number) => {
    setLightboxImages(images)
    setCurrentImageIndex(index)
    setLightboxOpen(true)
  }

  const closeLightbox = () => {
    setLightboxOpen(false)
    setLightboxImages([])
    setCurrentImageIndex(0)
  }

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % lightboxImages.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + lightboxImages.length) % lightboxImages.length)
  }

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
      console.log("[v0] Testimonials fetched:", data.data)
      console.log("[v0] First testimonial media_urls:", data.data?.[0]?.media_urls)
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

        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 py-12 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {loading ? (
            // Loading skeletons
            Array(8)
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

                  {/* Media gallery */}
                  {testimonial.media_urls && testimonial.media_urls.length > 0 && (
                    <div className="grid grid-cols-2 gap-2 mt-3">
                      {testimonial.media_urls.slice(0, 4).map((url, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => openLightbox(testimonial.media_urls || [], idx)}
                          className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 cursor-pointer hover:opacity-90 transition-opacity"
                        >
                          {url.includes(".mp4") || url.includes(".mov") ? (
                            <video src={url} className="w-full h-full object-cover pointer-events-none" />
                          ) : (
                            <img
                              src={url || "/placeholder.svg"}
                              alt="Feedback media"
                              className="w-full h-full object-cover"
                            />
                          )}
                          {idx === 3 && testimonial.media_urls.length > 4 && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-semibold">
                              +{testimonial.media_urls.length - 4}
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
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

      {/* Lightbox Modal */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
          onClick={closeLightbox}
        >
          <button
            type="button"
            onClick={closeLightbox}
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
          >
            <X className="h-8 w-8" />
          </button>

          {lightboxImages.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  prevImage()
                }}
                className="absolute left-4 text-white hover:text-gray-300 transition-colors"
              >
                <ChevronLeft className="h-12 w-12" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  nextImage()
                }}
                className="absolute right-4 text-white hover:text-gray-300 transition-colors"
              >
                <ChevronRight className="h-12 w-12" />
              </button>
            </>
          )}

          <div className="max-w-6xl max-h-[90vh] w-full h-full flex items-center justify-center p-4">
            {lightboxImages[currentImageIndex]?.includes(".mp4") ||
            lightboxImages[currentImageIndex]?.includes(".mov") ? (
              <video
                src={lightboxImages[currentImageIndex]}
                controls
                className="max-w-full max-h-full rounded-lg"
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <img
                src={lightboxImages[currentImageIndex] || "/placeholder.svg"}
                alt="Feedback media"
                className="max-w-full max-h-full rounded-lg object-contain"
                onClick={(e) => e.stopPropagation()}
              />
            )}
          </div>

          {lightboxImages.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm">
              {currentImageIndex + 1} / {lightboxImages.length}
            </div>
          )}
        </div>
      )}
    </section>
  )
}
