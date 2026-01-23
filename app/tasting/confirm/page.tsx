"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, Calendar, Clock, AlertCircle, Loader2 } from "lucide-react"

function TastingConfirmContent() {
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<"loading" | "success" | "error" | "already_confirmed">("loading")
  const [message, setMessage] = useState("")
  const [appointmentDetails, setAppointmentDetails] = useState<any>(null)

  useEffect(() => {
    const processConfirmation = async () => {
      const token = searchParams.get("token")
      const urlStatus = searchParams.get("status")

      console.log("[v0] Processing confirmation:", { token, urlStatus })

      if (!token) {
        setStatus("error")
        setMessage("Invalid confirmation link. Please check your email for the correct link.")
        return
      }

      // If status is already provided in URL (from redirect), use it directly
      if (urlStatus === "confirmed") {
        console.log("[v0] Status confirmed from URL parameter")
        setStatus("success")
        setMessage("Your tasting appointment has been confirmed successfully!")
        await fetchTastingDetails(token)
        return
      }

      if (urlStatus === "already_confirmed") {
        console.log("[v0] Status already_confirmed from URL parameter")
        setStatus("already_confirmed")
        setMessage("This tasting appointment has already been confirmed.")
        await fetchTastingDetails(token)
        return
      }

      // If no status in URL, this is likely a direct page load from an old email
      // Redirect to the API endpoint which will process and redirect back with status
      console.log("[v0] No status in URL, redirecting to API for confirmation")
      setStatus("loading")
      setMessage("Redirecting to confirmation...")
      window.location.href = `/api/tasting/confirm?token=${token}&action=confirm`
      return // Stop execution since we're redirecting
    }

    const fetchTastingDetails = async (token: string) => {
      try {
        console.log("[v0] Fetching tasting details for token:", token)
        const response = await fetch(`/api/tasting/details?token=${token}`)
        if (response.ok) {
          const data = await response.json()
          console.log("[v0] Tasting details received:", data)
          setAppointmentDetails(data.tasting)
          
          // If we don't have a status yet, set it based on the tasting status
          if (status === "loading" && data.tasting) {
            if (data.tasting.status === "confirmed") {
              setStatus("success")
              setMessage("Your tasting appointment has been confirmed successfully!")
            } else {
              setStatus("error")
              setMessage("This tasting appointment is not yet confirmed.")
            }
          }
        } else {
          console.error("[v0] Failed to fetch tasting details, status:", response.status)
          if (status === "loading") {
            setStatus("error")
            setMessage("Unable to load appointment details. Please contact us for assistance.")
          }
        }
      } catch (error) {
        console.error("[v0] Error fetching tasting details:", error)
        if (status === "loading") {
          setStatus("error")
          setMessage("Unable to load appointment details. Please contact us for assistance.")
        }
      }
    }

    processConfirmation()
  }, [searchParams])

  const getStatusIcon = () => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
      case "already_confirmed":
        return <CheckCircle className="h-16 w-16 text-blue-500 mx-auto mb-4" />
      case "error":
        return <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
      default:
        return <Loader2 className="h-16 w-16 text-rose-600 mx-auto mb-4 animate-spin" />
    }
  }

  const getStatusColor = () => {
    switch (status) {
      case "success":
        return "text-green-600"
      case "already_confirmed":
        return "text-blue-600"
      case "error":
        return "text-red-600"
      default:
        return "text-gray-600"
    }
  }

  const getStatusTitle = () => {
    switch (status) {
      case "loading":
        return "Processing your confirmation..."
      case "success":
        return "Tasting Confirmed!"
      case "already_confirmed":
        return "Already Confirmed"
      case "error":
        return "Confirmation Failed"
      default:
        return "Processing..."
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-900">Food Tasting Confirmation</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          {getStatusIcon()}

          <div>
            <h3 className={`text-lg font-semibold mb-2 ${getStatusColor()}`}>{getStatusTitle()}</h3>
            <p className="text-gray-600 text-sm">{message}</p>
          </div>

          {appointmentDetails && (
            <div className="bg-gray-50 rounded-lg p-4 text-left">
              <h4 className="font-semibold text-gray-900 mb-3">Appointment Details</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span>Event: {appointmentDetails.event_type || "Not specified"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span>
                    Event Date:{" "}
                    {appointmentDetails.event_date
                      ? new Date(appointmentDetails.event_date).toLocaleDateString()
                      : "Not specified"}
                  </span>
                </div>
                {appointmentDetails.proposed_date && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-rose-500" />
                    <span>Tasting Date: {new Date(appointmentDetails.proposed_date).toLocaleDateString()}</span>
                  </div>
                )}
                {appointmentDetails.proposed_time && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-rose-500" />
                    <span>Tasting Time: {appointmentDetails.proposed_time}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="space-y-3">
            {(status === "success" || status === "already_confirmed") && (
              <Button
                onClick={() => (window.location.href = "/my-appointments")}
                className="w-full bg-rose-600 hover:bg-rose-700"
              >
                View My Appointments
              </Button>
            )}

            <Button variant="outline" onClick={() => (window.location.href = "/")} className="w-full">
              Back to Home
            </Button>

            {status === "error" && (
              <div className="text-xs text-gray-500 mt-4">
                <p>Need help? Contact us:</p>
                <p>📞 (044) 308 3396</p>
                <p>📱 0917-8543221</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function TastingConfirmPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-gray-900">Food Tasting Confirmation</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-6">
              <Loader2 className="h-16 w-16 text-rose-600 mx-auto mb-4 animate-spin" />
              <div>
                <h3 className="text-lg font-semibold mb-2 text-gray-600">Processing your confirmation...</h3>
                <p className="text-gray-600 text-sm">Please wait while we confirm your tasting appointment.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      }
    >
      <TastingConfirmContent />
    </Suspense>
  )
}
