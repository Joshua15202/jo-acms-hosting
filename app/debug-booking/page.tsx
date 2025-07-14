"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function DebugBookingPage() {
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [testType, setTestType] = useState<"pricing" | "full">("pricing")

  const testBooking = async () => {
    setLoading(true)
    try {
      const testData = {
        firstName: "Test",
        lastName: "User",
        email: "test@example.com",
        phone: "1234567890",
        eventType: "birthday",
        guestCount: 50,
        eventDate: "2024-02-15",
        eventTime: "lunch",
        venue: "Test Venue",
        mainCourses: ["Beef Broccoli", "Chicken Alexander"],
        pasta: "Spaghetti (Red Sauce)",
        dessert: "Buko Salad",
        beverage: "Red Iced Tea",
      }

      const endpoint = testType === "pricing" ? "/api/debug-booking" : "/api/debug-full-booking"

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(testData),
      })

      const data = await response.json()
      setResult({ status: response.status, data })
    } catch (error) {
      setResult({ error: error.message })
    } finally {
      setLoading(false)
    }
  }

  const testActualBooking = async () => {
    setLoading(true)
    try {
      const testData = {
        firstName: "Test",
        lastName: "User",
        email: "test@example.com",
        phone: "1234567890",
        eventType: "birthday",
        guestCount: 50,
        eventDate: "2024-02-15",
        eventTime: "lunch",
        venue: "Test Venue",
        mainCourses: ["Beef Broccoli", "Chicken Alexander"],
        pasta: "Spaghetti (Red Sauce)",
        dessert: "Buko Salad",
        beverage: "Red Iced Tea",
      }

      const response = await fetch("/api/book-appointment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(testData),
      })

      const data = await response.json()
      setResult({ status: response.status, data, endpoint: "book-appointment" })
    } catch (error) {
      setResult({ error: error.message, endpoint: "book-appointment" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Debug Booking API</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button onClick={() => setTestType("pricing")} variant={testType === "pricing" ? "default" : "outline"}>
              Pricing Test
            </Button>
            <Button onClick={() => setTestType("full")} variant={testType === "full" ? "default" : "outline"}>
              Full Flow Test
            </Button>
          </div>

          <div className="flex gap-2">
            <Button onClick={testBooking} disabled={loading}>
              {loading ? "Testing..." : `Test ${testType === "pricing" ? "Pricing" : "Full Flow"}`}
            </Button>
            <Button onClick={testActualBooking} disabled={loading} variant="destructive">
              {loading ? "Testing..." : "Test Actual Booking API"}
            </Button>
          </div>

          {result && (
            <div className="mt-4">
              <h3 className="font-semibold mb-2">Result {result.endpoint && `(${result.endpoint})`}:</h3>
              <div className="bg-gray-100 p-4 rounded text-sm overflow-auto max-h-96">
                <pre>{JSON.stringify(result, null, 2)}</pre>
              </div>

              {result.data?.success === false && (
                <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded">
                  <h4 className="font-semibold text-red-800">Error Details:</h4>
                  <p className="text-red-700">Step: {result.data.step}</p>
                  <p className="text-red-700">Error: {result.data.error}</p>
                  {result.data.details && <p className="text-red-700">Details: {result.data.details}</p>}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
