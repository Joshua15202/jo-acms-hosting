"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function DebugBookingPage() {
  const [debugResult, setDebugResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const runDebugTest = async () => {
    setLoading(true)
    try {
      const testData = {
        firstName: "Test",
        lastName: "User",
        email: "test@example.com",
        phone: "1234567890",
        eventType: "birthday",
        guestCount: 50,
        eventDate: "2024-12-31",
        eventTime: "10:00 AM",
        venue: "Test Venue",
        mainCourses: ["Beef Broccoli"],
        pasta: "Spaghetti",
        dessert: "Fruit Salad",
        beverage: "Red Iced Tea",
      }

      const response = await fetch("/api/debug-booking-detailed", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(testData),
        credentials: "include",
      })

      const result = await response.json()
      setDebugResult(result)
    } catch (error) {
      setDebugResult({
        success: false,
        error: "Debug test failed",
        details: error.message,
      })
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
        eventDate: "2024-12-31",
        eventTime: "10:00 AM",
        venue: "Test Venue",
        mainCourses: ["Beef Broccoli"],
        pasta: "Spaghetti",
        dessert: "Fruit Salad",
        beverage: "Red Iced Tea",
      }

      const response = await fetch("/api/book-appointment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(testData),
        credentials: "include",
      })

      const result = await response.json()
      setDebugResult({
        actualBookingTest: true,
        status: response.status,
        success: response.ok,
        result: result,
      })
    } catch (error) {
      setDebugResult({
        actualBookingTest: true,
        success: false,
        error: "Actual booking test failed",
        details: error.message,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Debug Booking Process</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button onClick={runDebugTest} disabled={loading}>
              {loading ? "Running..." : "Run Debug Test"}
            </Button>
            <Button onClick={testActualBooking} disabled={loading} variant="outline">
              {loading ? "Testing..." : "Test Actual Booking API"}
            </Button>
          </div>

          {debugResult && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-2">Debug Results:</h3>
              <pre className="bg-gray-100 p-4 rounded-lg overflow-auto text-sm">
                {JSON.stringify(debugResult, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
