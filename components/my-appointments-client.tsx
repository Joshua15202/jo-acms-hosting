"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, Users, MapPin, Utensils, Edit, X, CreditCard, RefreshCw } from "lucide-react"
import { format } from "date-fns"
import { useAuth } from "@/components/user-auth-provider"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

interface Appointment {
  id: string
  event_type: string
  event_date: string
  event_time: string
  guest_count: number
  venue_address: string
  theme?: string
  color_motif?: string
  celebrant_name?: string
  celebrant_age?: number
  celebrant_gender?: string
  groom_name?: string
  bride_name?: string
  main_courses?: string[] | string
  pasta?: string[] | string
  dessert?: string[] | string
  beverage?: string[] | string
  // Add the new column names from the database
  pasta_selection?: string[] | string
  dessert_selection?: string[] | string
  beverage_selection?: string[] | string
  additional_event_info?: string
  special_requests?: string
  status:
    | "PENDING_TASTING_CONFIRMATION"
    | "TASTING_CONFIRMED"
    | "TASTING_COMPLETED"
    | "confirmed"
    | "cancelled"
    | "completed"
  created_at: string
  budget_min?: number
  budget_max?: number
  total_package_amount?: number
  down_payment_amount?: number
  total_amount?: number
  deposit_amount?: number
  payment_status?: "unpaid" | "deposit_paid" | "fully_paid"
  updated_at?: string
  admin_notes?: string
}

export default function MyAppointmentsClient() {
  const { user } = useAuth()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Reschedule dialog state
  const [rescheduleDialogOpen, setRescheduleDialogOpen] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [newDate, setNewDate] = useState<Date>()
  const [newTimeSlot, setNewTimeSlot] = useState<string>("")
  const [rescheduleLoading, setRescheduleLoading] = useState(false)

  // Cancel dialog state
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [cancelReason, setCancelReason] = useState("")
  const [cancelLoading, setCancelLoading] = useState(false)

  const timeSlots = [
    "6:00 AM",
    "7:00 AM",
    "8:00 AM",
    "9:00 AM",
    "10:00 AM",
    "11:00 AM",
    "12:00 PM",
    "1:00 PM",
    "2:00 PM",
    "3:00 PM",
    "4:00 PM",
    "5:00 PM",
    "6:00 PM",
    "7:00 PM",
    "8:00 PM",
    "9:00 PM",
    "10:00 PM",
  ]

  const fetchAppointments = async (showRefreshIndicator = false) => {
    if (!user?.id) {
      console.log("No user ID available for fetching appointments")
      setLoading(false)
      return
    }

    if (showRefreshIndicator) {
      setRefreshing(true)
    }

    try {
      console.log("Fetching appointments for user:", user.id)
      console.log("User object:", user)

      const response = await fetch("/api/scheduling/appointments", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        // Add cache busting to ensure fresh data
        cache: "no-cache",
      })

      console.log("API response status:", response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("API response error:", response.status, errorText)
        throw new Error(`Failed to fetch appointments: ${response.status} - ${errorText}`)
      }

      const data = await response.json()
      console.log("Appointments API response:", data)

      if (data.success) {
        console.log("Successfully fetched appointments:", data.appointments?.length || 0)
        setAppointments(data.appointments || [])
        setError(null)
      } else {
        console.error("API returned error:", data.error)
        throw new Error(data.error || "Failed to fetch appointments")
      }
    } catch (err) {
      console.error("Error fetching appointments:", err)
      setError(err instanceof Error ? err.message : "Failed to load appointments")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchAppointments()
  }, [user?.id])

  const handleRefresh = () => {
    fetchAppointments(true)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "TASTING_CONFIRMED":
        return "bg-green-100 text-green-800 border-green-200"
      case "PENDING_TASTING_CONFIRMATION":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "confirmed":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200"
      case "completed":
        return "bg-purple-100 text-purple-800 border-purple-200"
      case "TASTING_COMPLETED":
        return "bg-teal-100 text-teal-800 border-teal-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "PENDING_TASTING_CONFIRMATION":
        return "Pending Tasting"
      case "TASTING_CONFIRMED":
        return "Tasting Confirmed"
      case "confirmed":
        return "Confirmed"
      case "cancelled":
        return "Cancelled"
      case "completed":
        return "Completed"
      case "TASTING_COMPLETED":
        return "Tasting Completed"
      default:
        return status.charAt(0).toUpperCase() + status.slice(1)
    }
  }

  const formatEventDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "EEEE, MMMM d, yyyy")
    } catch {
      return dateString
    }
  }

  const formatCreatedDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM d, yyyy 'at' h:mm a")
    } catch {
      return dateString
    }
  }

  const formatUpdatedDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM d, yyyy 'at' h:mm a")
    } catch {
      return dateString
    }
  }

  // Helper function to safely render arrays or strings - Updated to handle both old and new column names
  const renderMenuItems = (items: string[] | string | undefined, itemName: string) => {
    if (!items) return null

    let itemsArray: string[] = []

    if (typeof items === "string") {
      try {
        // Try to parse as JSON first (in case it's a JSON string)
        const parsed = JSON.parse(items)
        if (Array.isArray(parsed)) {
          itemsArray = parsed.map((item) => (typeof item === "object" ? item.name || String(item) : String(item)))
        } else {
          // Handle comma-separated strings
          itemsArray = items
            .split(",")
            .map((item) => item.trim())
            .filter((item) => item.length > 0)
        }
      } catch {
        // If JSON parsing fails, treat as comma-separated string
        itemsArray = items
          .split(",")
          .map((item) => item.trim())
          .filter((item) => item.length > 0)
      }
    } else if (Array.isArray(items)) {
      // Handle arrays - make sure all items are strings
      itemsArray = items
        .map((item) => {
          if (typeof item === "object" && item !== null) {
            // If it's an object, try to extract meaningful text
            if ("name" in item) return String(item.name)
            if ("category" in item) return String(item.category)
            return JSON.stringify(item)
          }
          return String(item)
        })
        .filter((item) => item.length > 0)
    }

    if (itemsArray.length === 0) return null

    return (
      <div className="mb-3">
        <p className="font-medium text-sm text-gray-500 mb-2">{itemName}</p>
        <div className="space-y-1">
          {itemsArray.map((item, index) => (
            <div key={index} className="flex items-center gap-2 text-sm text-gray-900">
              <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const handleReschedule = (appointment: Appointment) => {
    setSelectedAppointment(appointment)
    setNewDate(new Date(appointment.event_date))
    setNewTimeSlot(appointment.event_time)
    setRescheduleDialogOpen(true)
  }

  const handleCancel = (appointment: Appointment) => {
    setSelectedAppointment(appointment)
    setCancelReason("")
    setCancelDialogOpen(true)
  }

  const submitReschedule = async () => {
    if (!selectedAppointment || !newDate || !newTimeSlot) return

    setRescheduleLoading(true)
    try {
      const response = await fetch(`/api/scheduling/appointments/${selectedAppointment.id}/reschedule`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          new_date: newDate.toISOString().split("T")[0],
          new_time: newTimeSlot,
        }),
      })

      if (response.ok) {
        // Refresh appointments to show updated data
        await fetchAppointments()
        setRescheduleDialogOpen(false)
      } else {
        throw new Error("Failed to reschedule appointment")
      }
    } catch (error) {
      console.error("Error rescheduling appointment:", error)
      alert("Failed to reschedule appointment. Please try again.")
    } finally {
      setRescheduleLoading(false)
    }
  }

  const submitCancel = async () => {
    if (!selectedAppointment) return

    // For pending appointments, no reason required
    if (selectedAppointment.status === "PENDING_TASTING_CONFIRMATION" || cancelReason.trim()) {
      setCancelLoading(true)
      try {
        const response = await fetch(`/api/scheduling/appointments/${selectedAppointment.id}/cancel`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            reason: cancelReason || "User requested cancellation",
          }),
        })

        if (response.ok) {
          // Refresh appointments to show updated data
          await fetchAppointments()
          setCancelDialogOpen(false)
        } else {
          throw new Error("Failed to cancel appointment")
        }
      } catch (error) {
        console.error("Error cancelling appointment:", error)
        alert("Failed to cancel appointment. Please try again.")
      } finally {
        setCancelLoading(false)
      }
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-10 px-4 md:px-6">
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rose-600"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto py-10 px-4 md:px-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">My Appointments</h1>
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <p className="text-red-600">Error: {error}</p>
            <p className="text-sm text-gray-500 mt-2">
              Please try refreshing the page or contact support if the issue persists.
            </p>
            <Button onClick={handleRefresh} className="mt-4 bg-transparent" variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10 px-4 md:px-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">My Appointments</h1>
          <p className="text-gray-600">View and manage your catering appointments</p>
        </div>
        <Button onClick={handleRefresh} variant="outline" disabled={refreshing}>
          <RefreshCw className={cn("h-4 w-4 mr-2", refreshing && "animate-spin")} />
          {refreshing ? "Refreshing..." : "Refresh"}
        </Button>
      </div>

      {appointments.length === 0 ? (
        <div className="text-center py-12">
          <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No appointments yet</h3>
          <p className="text-gray-500 mb-6">You haven't booked any appointments with us yet.</p>
          <a
            href="/book-appointment"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-rose-600 hover:bg-rose-700"
          >
            Book Your First Appointment
          </a>
        </div>
      ) : (
        <div className="space-y-8">
          {appointments.map((appointment) => {
            // Check for menu items in both old and new column names
            const mainCourses = appointment.main_courses
            const pasta = appointment.pasta || appointment.pasta_selection
            const dessert = appointment.dessert || appointment.dessert_selection
            const beverage = appointment.beverage || appointment.beverage_selection

            return (
              <Card key={appointment.id} className="overflow-hidden shadow-lg">
                <CardHeader className="border-b bg-white">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl capitalize text-gray-900">{appointment.event_type} Event</CardTitle>
                    <Badge className={getStatusColor(appointment.status)}>{getStatusLabel(appointment.status)}</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>Booked on {formatCreatedDate(appointment.created_at)}</span>
                    {appointment.updated_at && appointment.updated_at !== appointment.created_at && (
                      <span className="text-blue-600">Updated {formatUpdatedDate(appointment.updated_at)}</span>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid gap-8 lg:grid-cols-2">
                    {/* Left Column - Event Details */}
                    <div className="space-y-6">
                      {/* Event Information */}
                      <div className="border rounded-lg p-4">
                        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          Event Details
                        </h4>

                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <div>
                              <p className="font-medium text-sm text-gray-500">Event Date</p>
                              <p className="text-gray-900">{formatEventDate(appointment.event_date)}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <div>
                              <p className="font-medium text-sm text-gray-500">Time Slot</p>
                              <p className="text-gray-900">{appointment.event_time}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <Users className="h-4 w-4 text-gray-400" />
                            <div>
                              <p className="font-medium text-sm text-gray-500">Guest Count</p>
                              <p className="text-gray-900">{appointment.guest_count} guests</p>
                            </div>
                          </div>

                          <div className="flex items-start gap-3">
                            <MapPin className="h-4 w-4 text-gray-400 mt-1" />
                            <div>
                              <p className="font-medium text-sm text-gray-500">Venue</p>
                              <p className="text-gray-900">{appointment.venue_address}</p>
                            </div>
                          </div>

                          {appointment.theme && (
                            <div className="flex items-center gap-3">
                              <div className="h-3 w-3 bg-gray-300 rounded-full" />
                              <div>
                                <p className="font-medium text-sm text-gray-500">Theme</p>
                                <p className="text-gray-900">{appointment.theme}</p>
                              </div>
                            </div>
                          )}

                          {appointment.color_motif && (
                            <div className="flex items-center gap-3">
                              <div className="h-3 w-3 bg-gray-300 rounded-full" />
                              <div>
                                <p className="font-medium text-sm text-gray-500">Color Motif</p>
                                <p className="text-gray-900">{appointment.color_motif}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Celebrant/Couple Information */}
                      {(appointment.celebrant_name || appointment.groom_name || appointment.bride_name) && (
                        <div className="border rounded-lg p-4">
                          <h5 className="text-lg font-semibold text-gray-900 mb-4">
                            {appointment.event_type === "wedding" ? "Couple Information" : "Celebrant Information"}
                          </h5>
                          {appointment.event_type === "wedding" ? (
                            <div className="space-y-3">
                              {appointment.groom_name && (
                                <div>
                                  <p className="font-medium text-sm text-gray-500">Groom</p>
                                  <p className="text-gray-900">{appointment.groom_name}</p>
                                </div>
                              )}
                              {appointment.bride_name && (
                                <div>
                                  <p className="font-medium text-sm text-gray-500">Bride</p>
                                  <p className="text-gray-900">{appointment.bride_name}</p>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="space-y-3">
                              <div>
                                <p className="font-medium text-sm text-gray-500">Name</p>
                                <p className="text-gray-900">{appointment.celebrant_name}</p>
                              </div>
                              {appointment.celebrant_age && (
                                <div>
                                  <p className="font-medium text-sm text-gray-500">Age</p>
                                  <p className="text-gray-900">{appointment.celebrant_age} years old</p>
                                </div>
                              )}
                              {appointment.celebrant_gender && (
                                <div>
                                  <p className="font-medium text-sm text-gray-500">Gender</p>
                                  <p className="text-gray-900 capitalize">{appointment.celebrant_gender}</p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Right Column - Menu & Package */}
                    <div className="space-y-6">
                      {/* Menu Information */}
                      <div className="border rounded-lg p-4">
                        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                          <Utensils className="h-4 w-4" />
                          Menu Selection
                        </h4>

                        <div className="space-y-4">
                          {renderMenuItems(mainCourses, "Main Courses")}
                          {renderMenuItems(pasta, "Pasta")}
                          {renderMenuItems(dessert, "Dessert")}
                          {renderMenuItems(beverage, "Beverages")}

                          {/* Show message if no menu items are selected */}
                          {!mainCourses && !pasta && !dessert && !beverage && (
                            <div className="text-center py-6">
                              <Utensils className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                              <p className="text-gray-500 text-sm">No menu items selected yet</p>
                              <p className="text-gray-400 text-xs mt-1">Menu will be finalized during tasting</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Package Information */}
                      <div className="border rounded-lg p-4">
                        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                          <CreditCard className="h-4 w-4" />
                          Package Information
                        </h4>

                        <div className="space-y-3">
                          {/* Total Package Amount */}
                          {(appointment.total_package_amount || appointment.total_amount || appointment.budget_min) && (
                            <div className="flex justify-between items-center py-2 border-b border-gray-100">
                              <span className="text-sm text-gray-500">Total Package Amount</span>
                              <span className="font-semibold text-gray-900">
                                ₱
                                {(
                                  appointment.total_package_amount ||
                                  appointment.total_amount ||
                                  appointment.budget_min ||
                                  0
                                ).toLocaleString()}
                              </span>
                            </div>
                          )}

                          {/* Down Payment */}
                          {(appointment.down_payment_amount ||
                            appointment.deposit_amount ||
                            (appointment.total_package_amount &&
                              Math.round(appointment.total_package_amount * 0.5))) && (
                            <div className="flex justify-between items-center py-2 border-b border-gray-100">
                              <span className="text-sm text-gray-500">Down Payment (50%)</span>
                              <span className="font-medium text-gray-900">
                                ₱
                                {(
                                  appointment.down_payment_amount ||
                                  appointment.deposit_amount ||
                                  (appointment.total_package_amount
                                    ? Math.round(appointment.total_package_amount * 0.5)
                                    : 0)
                                ).toLocaleString()}
                              </span>
                            </div>
                          )}

                          {/* Payment Status */}
                          <div className="flex justify-between items-center py-2">
                            <span className="text-sm text-gray-500">Payment Status</span>
                            <div className="flex items-center gap-2">
                              <div
                                className={`w-2 h-2 rounded-full ${
                                  appointment.payment_status === "unpaid"
                                    ? "bg-red-400"
                                    : appointment.payment_status === "deposit_paid"
                                      ? "bg-yellow-400"
                                      : appointment.payment_status === "fully_paid"
                                        ? "bg-green-400"
                                        : "bg-gray-400"
                                }`}
                              />
                              <span className="text-sm font-medium text-gray-900">
                                {appointment.status === "TASTING_COMPLETED" && appointment.payment_status === "unpaid"
                                  ? "Ready for Payment"
                                  : appointment.payment_status === "deposit_paid"
                                    ? "Down Payment Received"
                                    : appointment.payment_status === "fully_paid"
                                      ? "Fully Paid"
                                      : "Awaiting Tasting"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Additional Information */}
                  {(appointment.additional_event_info || appointment.special_requests || appointment.admin_notes) && (
                    <div className="mt-8 border rounded-lg p-4">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h4>
                      <div className="grid gap-4 md:grid-cols-2">
                        {appointment.additional_event_info && (
                          <div>
                            <p className="font-medium text-sm text-gray-500 mb-2">Event Information</p>
                            <p className="text-gray-900 text-sm">{appointment.additional_event_info}</p>
                          </div>
                        )}
                        {appointment.special_requests && (
                          <div>
                            <p className="font-medium text-sm text-gray-500 mb-2">Special Requests</p>
                            <p className="text-gray-900 text-sm">{appointment.special_requests}</p>
                          </div>
                        )}
                        {appointment.admin_notes && (
                          <div className="md:col-span-2">
                            <p className="font-medium text-sm text-gray-500 mb-2">Admin Notes</p>
                            <div className="text-gray-900 text-sm whitespace-pre-line bg-gray-50 p-3 rounded">
                              {appointment.admin_notes}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="mt-8 flex gap-3 pt-6 border-t">
                    {appointment.status === "TASTING_COMPLETED" && appointment.payment_status === "unpaid" ? (
                      <Button asChild className="flex-1 bg-green-600 hover:bg-green-700 text-white">
                        <a href="/payment" className="flex items-center justify-center gap-2">
                          <CreditCard className="h-4 w-4 mr-2" />
                          Proceed to Payment
                        </a>
                      </Button>
                    ) : appointment.status !== "cancelled" && appointment.status !== "completed" ? (
                      <>
                        <Button
                          variant="outline"
                          onClick={() => handleReschedule(appointment)}
                          className="flex-1 border-gray-300 hover:bg-gray-50"
                          disabled={appointment.status === "TASTING_COMPLETED"}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          {appointment.status === "TASTING_COMPLETED" ? "Locked" : "Reschedule"}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => handleCancel(appointment)}
                          className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
                          disabled={appointment.status === "TASTING_COMPLETED"}
                        >
                          <X className="h-4 w-4 mr-2" />
                          {appointment.status === "TASTING_COMPLETED" ? "Locked" : "Cancel"}
                        </Button>
                      </>
                    ) : null}
                  </div>

                  {/* Status Messages */}
                  {appointment.status === "TASTING_COMPLETED" && appointment.payment_status === "unpaid" && (
                    <div className="mt-6 p-4 border border-gray-200 rounded-lg">
                      <p className="font-medium text-gray-900">Tasting Complete - Ready for Payment!</p>
                      <p className="text-gray-600 text-sm mt-1">
                        Your tasting session is complete! Please proceed to payment to finalize your booking.
                      </p>
                    </div>
                  )}
                  {appointment.payment_status === "deposit_paid" && appointment.status !== "confirmed" && (
                    <div className="mt-6 p-4 border border-gray-200 rounded-lg">
                      <p className="font-medium text-gray-900">Payment Under Review</p>
                      <p className="text-gray-600 text-sm mt-1">
                        Your down payment is being verified by our team. We'll notify you once it's confirmed.
                      </p>
                    </div>
                  )}
                  {appointment.payment_status === "fully_paid" && appointment.status !== "confirmed" && (
                    <div className="mt-6 p-4 border border-gray-200 rounded-lg">
                      <p className="font-medium text-gray-900">Payment Under Review</p>
                      <p className="text-gray-600 text-sm mt-1">
                        Your full payment is being verified by our team. We'll notify you once it's confirmed.
                      </p>
                    </div>
                  )}
                  {appointment.status === "confirmed" && (
                    <div className="mt-6 p-4 border border-gray-200 rounded-lg">
                      <p className="font-medium text-gray-900">Booking Confirmed!</p>
                      <p className="text-gray-600 text-sm mt-1">
                        Your payment has been verified and your event is locked in. We're excited to be part of your
                        special day!
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Reschedule Dialog */}
      <Dialog open={rescheduleDialogOpen} onOpenChange={setRescheduleDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reschedule Appointment</DialogTitle>
            <DialogDescription>Select a new date and time for your appointment.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="newDate">New Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn("w-full justify-start text-left font-normal", !newDate && "text-muted-foreground")}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {newDate ? format(newDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarComponent
                    mode="single"
                    selected={newDate}
                    onSelect={setNewDate}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="grid gap-2">
              <label htmlFor="newTimeSlot">New Time Slot</label>
              <Select value={newTimeSlot} onValueChange={setNewTimeSlot}>
                <SelectTrigger>
                  <SelectValue placeholder="Select time slot" />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map((slot) => (
                    <SelectItem key={slot} value={slot}>
                      {slot}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRescheduleDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={submitReschedule}
              disabled={!newDate || !newTimeSlot || rescheduleLoading}
              className="bg-rose-600 hover:bg-rose-700"
            >
              {rescheduleLoading ? "Rescheduling..." : "Confirm Reschedule"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Dialog */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Cancel Appointment</DialogTitle>
            <DialogDescription>
              {selectedAppointment?.status === "PENDING_TASTING_CONFIRMATION"
                ? "Are you sure you want to cancel this appointment? This action cannot be undone."
                : "Please provide a reason for cancelling this confirmed appointment."}
            </DialogDescription>
          </DialogHeader>
          {selectedAppointment?.status === "TASTING_CONFIRMED" && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <label htmlFor="cancelReason">Reason for Cancellation</label>
                <Textarea
                  id="cancelReason"
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Please provide a reason for cancelling your confirmed appointment"
                  rows={3}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelDialogOpen(false)}>
              Go Back
            </Button>
            <Button
              onClick={submitCancel}
              variant="destructive"
              disabled={cancelLoading || (selectedAppointment?.status === "TASTING_CONFIRMED" && !cancelReason.trim())}
            >
              {cancelLoading ? "Cancelling..." : "Cancel Appointment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
