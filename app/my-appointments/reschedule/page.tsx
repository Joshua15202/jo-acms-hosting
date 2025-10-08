"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Calendar, Clock, ArrowLeft, CheckCircle } from "lucide-react"
import SmartCalendar from "@/components/smart-calendar"
import { useAuth } from "@/components/user-auth-provider"
import { format, differenceInHours } from "date-fns"

interface Appointment {
  id: string
  event_type: string
  event_date: string
  event_time: string
  guest_count: number
  venue_address: string
  status: string
  total_package_amount?: number
}

export default function RescheduleAppointmentPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, loading: authLoading } = useAuth()
  const appointmentId = searchParams.get("id")

  const [appointment, setAppointment] = useState<Appointment | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<string>("")
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>("")
  const [rescheduleLoading, setRescheduleLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPenaltyWarning, setShowPenaltyWarning] = useState(false)
  const [rescheduleSuccess, setRescheduleSuccess] = useState(false)
  const [penaltyInfo, setPenaltyInfo] = useState<{
    applied: boolean
    amount: number
    newTotal: number
  } | null>(null)

  useEffect(() => {
    if (!authLoading) {
      console.log("Auth state:", { user: user?.email, loading: authLoading })
      if (!user) {
        console.log("No user found, redirecting to login")
        router.push("/login?redirect=/my-appointments")
        return
      }
      if (appointmentId) {
        fetchAppointment()
      }
    }
  }, [appointmentId, user, authLoading, router])

  useEffect(() => {
    if (appointment && selectedDate) {
      checkPenaltyWarning()
      validateYearRestriction()
    }
  }, [appointment, selectedDate])

  const checkCookies = async () => {
    try {
      const response = await fetch("/api/debug-reschedule-cookies", {
        credentials: "include",
      })
      const data = await response.json()
      console.log("Cookie debug info:", data)
      return data
    } catch (err) {
      console.error("Error checking cookies:", err)
      return null
    }
  }

  const fetchAppointment = async () => {
    try {
      const response = await fetch("/api/scheduling/appointments", {
        method: "GET",
        credentials: "include",
      })

      if (!response.ok) {
        if (response.status === 401) {
          console.log("Unauthorized, redirecting to login")
          router.push("/login?redirect=/my-appointments")
          return
        }
        throw new Error("Failed to fetch appointments")
      }

      const data = await response.json()
      if (data.success) {
        const apt = data.appointments.find((a: Appointment) => a.id === appointmentId)
        if (apt) {
          setAppointment(apt)
          setSelectedDate(apt.event_date)
          setSelectedTimeSlot(apt.event_time)
        } else {
          setError("Appointment not found")
        }
      }
    } catch (err) {
      console.error("Error fetching appointment:", err)
      setError("Failed to load appointment details")
    } finally {
      setLoading(false)
    }
  }

  const checkPenaltyWarning = () => {
    if (!appointment || !selectedDate) return

    const currentDate = new Date()
    const eventDate = new Date(appointment.event_date)
    const hoursUntilEvent = differenceInHours(eventDate, currentDate)

    setShowPenaltyWarning(hoursUntilEvent < 24 && hoursUntilEvent > 0)
  }

  const validateYearRestriction = () => {
    if (!appointment || !selectedDate) return

    const originalYear = new Date(appointment.event_date).getFullYear()
    const selectedYear = new Date(selectedDate).getFullYear()

    if (originalYear !== selectedYear) {
      setError(`You can only reschedule within the year ${originalYear}. Please select a date in ${originalYear}.`)
    } else {
      // Clear the error if the year is valid
      if (error?.includes("year")) {
        setError(null)
      }
    }
  }

  const handleDateTimeSelect = (date: string, timeSlot: string) => {
    setSelectedDate(date)
    setSelectedTimeSlot(timeSlot)

    // Clear non-year-related errors
    if (error && !error.includes("year")) {
      setError(null)
    }
  }

  const handleReschedule = async () => {
    console.log("=== RESCHEDULE CLIENT START ===")
    console.log("User:", user?.email)
    console.log("Appointment ID:", appointment?.id)
    console.log("Selected date:", selectedDate)
    console.log("Selected time:", selectedTimeSlot)

    // Check cookies first
    const cookieInfo = await checkCookies()
    console.log("Cookie check result:", cookieInfo)

    if (!appointment || !selectedDate || !selectedTimeSlot) {
      setError("Please select a date and time")
      return
    }

    if (selectedDate === appointment.event_date && selectedTimeSlot === appointment.event_time) {
      setError("Please select a different date or time")
      return
    }

    // Validate year restriction on client side
    const originalYear = new Date(appointment.event_date).getFullYear()
    const selectedYear = new Date(selectedDate).getFullYear()

    if (originalYear !== selectedYear) {
      setError(`You can only reschedule within the year ${originalYear}. Please select a date in ${originalYear}.`)
      return
    }

    setRescheduleLoading(true)
    setError(null)

    try {
      console.log("Sending PATCH request to:", `/api/scheduling/appointments/${appointment.id}/reschedule`)

      const response = await fetch(`/api/scheduling/appointments/${appointment.id}/reschedule`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          new_date: selectedDate,
          new_time: selectedTimeSlot,
        }),
      })

      console.log("Response status:", response.status)
      console.log("Response ok:", response.ok)

      const data = await response.json()
      console.log("Response data:", data)

      if (response.status === 401) {
        console.error("Authentication failed - 401 response")
        console.log("Error details:", data.error, data.details)
        setError(`Authentication failed: ${data.error}. ${data.details || ""}`)
        setTimeout(() => {
          router.push("/login?redirect=/my-appointments")
        }, 3000)
        return
      }

      if (!response.ok) {
        throw new Error(data.error || `Server error: ${response.status}`)
      }

      if (data.success) {
        console.log("Reschedule successful!")

        if (data.penalty_applied) {
          setPenaltyInfo({
            applied: true,
            amount: data.penalty_amount,
            newTotal: data.new_total,
          })
        }

        setRescheduleSuccess(true)

        setTimeout(() => {
          router.push("/my-appointments?reschedule=success")
        }, 3000)
      } else {
        throw new Error(data.error || "Failed to reschedule appointment")
      }
    } catch (err) {
      console.error("Error in reschedule:", err)
      setError(err instanceof Error ? err.message : "Failed to reschedule appointment")
    } finally {
      setRescheduleLoading(false)
      console.log("=== RESCHEDULE CLIENT END ===")
    }
  }

  if (authLoading || loading) {
    return (
      <div className="container mx-auto py-10 px-4 md:px-6">
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rose-600"></div>
        </div>
      </div>
    )
  }

  if (rescheduleSuccess) {
    return (
      <div className="container mx-auto py-10 px-4 md:px-6">
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <div className="rounded-full bg-green-100 p-6 mb-6">
            <CheckCircle className="h-16 w-16 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Reschedule Confirmed!</h1>
          <p className="text-gray-600 mb-4">Your appointment has been successfully rescheduled.</p>

          {selectedDate && selectedTimeSlot && (
            <Card className="max-w-md w-full mb-6">
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">New Date:</span>
                    <span className="font-medium">{format(new Date(selectedDate), "EEEE, MMMM d, yyyy")}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">New Time:</span>
                    <span className="font-medium">{selectedTimeSlot}</span>
                  </div>
                  {penaltyInfo?.applied && (
                    <>
                      <div className="border-t pt-3 mt-3">
                        <div className="flex items-center justify-between text-red-600">
                          <span className="text-sm">Penalty (10%):</span>
                          <span className="font-medium">₱{penaltyInfo.amount.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between font-semibold mt-2">
                          <span className="text-sm">New Total:</span>
                          <span>₱{penaltyInfo.newTotal.toLocaleString()}</span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          <p className="text-sm text-gray-500 mb-4">Redirecting to your appointments...</p>
          <Button onClick={() => router.push("/my-appointments")} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go to Appointments Now
          </Button>
        </div>
      </div>
    )
  }

  if (error && !appointment) {
    return (
      <div className="container mx-auto py-10 px-4 md:px-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={() => router.push("/my-appointments")} className="mt-4" variant="outline">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Appointments
        </Button>
      </div>
    )
  }

  if (!appointment) {
    return null
  }

  const penaltyAmount = appointment.total_package_amount ? Math.round(appointment.total_package_amount * 0.1) : 0
  const originalYear = new Date(appointment.event_date).getFullYear()

  return (
    <div className="container mx-auto py-10 px-4 md:px-6">
      <div className="mb-6">
        <Button onClick={() => router.push("/my-appointments")} variant="ghost" className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Appointments
        </Button>
        <h1 className="text-3xl font-bold mb-2">Reschedule Appointment</h1>
        <p className="text-gray-600">Select a new date and time for your {appointment.event_type} event</p>
      </div>

      <Alert className="mb-6 border-blue-200 bg-blue-50">
        <AlertCircle className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          <strong>Year Restriction:</strong> You can only reschedule to dates within the year {originalYear}.
          Rescheduling to a different year is not allowed.
        </AlertDescription>
      </Alert>

      <Alert className="mb-6 border-orange-200 bg-orange-50">
        <AlertCircle className="h-4 w-4 text-orange-600" />
        <AlertDescription className="text-orange-800">
          <strong>Penalty Notice:</strong> Reschedule requests made within 24 hours of your original event date are
          subject to a penalty of 10% of the total package amount (₱{penaltyAmount.toLocaleString()}).
        </AlertDescription>
      </Alert>

      {showPenaltyWarning && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Penalty Applies:</strong> Your original event is scheduled within the next 24 hours. A 10% penalty
            (₱{penaltyAmount.toLocaleString()}) will be applied to your package amount if you proceed with this
            reschedule.
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Current Appointment Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Current Date</p>
                <p className="font-medium">{format(new Date(appointment.event_date), "EEEE, MMMM d, yyyy")}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Current Time</p>
                <p className="font-medium">{appointment.event_time}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <SmartCalendar
        onDateTimeSelect={handleDateTimeSelect}
        selectedDate={selectedDate}
        selectedTimeSlot={selectedTimeSlot}
      />

      {selectedDate && selectedTimeSlot && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">New Appointment Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 mb-4">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm text-gray-500">New Date</p>
                  <p className="font-medium text-green-600">{format(new Date(selectedDate), "EEEE, MMMM d, yyyy")}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm text-gray-500">New Time</p>
                  <p className="font-medium text-green-600">{selectedTimeSlot}</p>
                </div>
              </div>
            </div>

            {showPenaltyWarning && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <p className="text-red-800 font-medium">⚠️ Penalty Will Be Applied</p>
                <p className="text-red-700 text-sm mt-1">
                  By proceeding, you acknowledge that a 10% penalty (₱{penaltyAmount.toLocaleString()}) will be added to
                  your package amount.
                </p>
              </div>
            )}

            <div className="flex gap-3">
              <Button
                onClick={handleReschedule}
                disabled={
                  rescheduleLoading ||
                  !selectedDate ||
                  !selectedTimeSlot ||
                  (selectedDate === appointment.event_date && selectedTimeSlot === appointment.event_time) ||
                  !!error
                }
                className="flex-1 bg-rose-600 hover:bg-rose-700"
              >
                {rescheduleLoading ? "Rescheduling..." : "Confirm Reschedule"}
              </Button>
              <Button onClick={() => router.push("/my-appointments")} variant="outline" className="flex-1">
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
