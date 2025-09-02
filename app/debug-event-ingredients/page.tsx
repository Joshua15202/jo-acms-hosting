"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { RefreshCw, CheckCircle, XCircle, AlertCircle, Calendar, ChefHat } from "lucide-react"

interface DebugData {
  summary: {
    total_appointments: number
    future_appointments: number
    confirmed_appointments: number
    pending_ingredient_confirmation: number
    appointments_with_main_courses: number
  }
  all_appointments: Array<{
    id: string
    customer_name: string
    event_date: string
    status: string
    has_main_courses: boolean
    admin_notes: string | null
  }>
  future_appointments: Array<{
    id: string
    customer_name: string
    event_date: string
    status: string
    has_main_courses: boolean
    admin_notes: string | null
  }>
  confirmed_appointments: Array<{
    id: string
    customer_name: string
    event_date: string
    status: string
    has_main_courses: boolean
    admin_notes: string | null
  }>
  main_courses_analysis: Array<{
    id: string
    customer_name: string
    event_date: string
    status: string
    raw_main_courses: any
    parsed_courses: string[]
    parse_success: boolean
    admin_notes: string | null
  }>
}

export default function DebugEventIngredientsPage() {
  const [debugData, setDebugData] = useState<DebugData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDebugData = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch("/api/debug-event-ingredients")
      if (!response.ok) {
        throw new Error("Failed to fetch debug data")
      }
      const data = await response.json()
      setDebugData(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDebugData()
  }, [])

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <RefreshCw className="h-8 w-8 animate-spin" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-600">{error}</p>
            <Button onClick={fetchDebugData} className="mt-4">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!debugData) return null

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmed":
      case "tasting_confirmed":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "pending":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
      default:
        return <XCircle className="h-4 w-4 text-red-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    const variant = status === "confirmed" || status === "tasting_confirmed" ? "default" : "secondary"
    return <Badge variant={variant}>{status}</Badge>
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Event Ingredients Debug</h1>
          <p className="text-muted-foreground">Debugging why appointments don't show in event ingredients overview</p>
        </div>
        <Button onClick={fetchDebugData} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Appointments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{debugData.summary.total_appointments}</div>
            <p className="text-xs text-muted-foreground">Last 10 in database</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Future Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{debugData.summary.future_appointments}</div>
            <p className="text-xs text-muted-foreground">Event date ≥ today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Confirmed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{debugData.summary.confirmed_appointments}</div>
            <p className="text-xs text-muted-foreground">Confirmed status</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending Ingredients</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{debugData.summary.pending_ingredient_confirmation}</div>
            <p className="text-xs text-muted-foreground">Not yet confirmed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">With Main Courses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{debugData.summary.appointments_with_main_courses}</div>
            <p className="text-xs text-muted-foreground">Successfully parsed</p>
          </CardContent>
        </Card>
      </div>

      {/* All Appointments */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            All Appointments (Last 10)
          </CardTitle>
          <CardDescription>Recent appointments regardless of status or date</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {debugData.all_appointments.map((appointment) => (
              <div key={appointment.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getStatusIcon(appointment.status)}
                  <div>
                    <p className="font-medium">{appointment.customer_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {appointment.event_date} • ID: {appointment.id.slice(0, 8)}...
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(appointment.status)}
                  {appointment.has_main_courses ? (
                    <Badge variant="outline" className="text-green-600">
                      <ChefHat className="h-3 w-3 mr-1" />
                      Has Menu
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-red-600">
                      No Menu
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Future Appointments */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Future Appointments
          </CardTitle>
          <CardDescription>Appointments with event_date ≥ today</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {debugData.future_appointments.map((appointment) => (
              <div key={appointment.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getStatusIcon(appointment.status)}
                  <div>
                    <p className="font-medium">{appointment.customer_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {appointment.event_date} • ID: {appointment.id.slice(0, 8)}...
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(appointment.status)}
                  {appointment.has_main_courses ? (
                    <Badge variant="outline" className="text-green-600">
                      <ChefHat className="h-3 w-3 mr-1" />
                      Has Menu
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-red-600">
                      No Menu
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Confirmed Appointments */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Confirmed Appointments
          </CardTitle>
          <CardDescription>Future appointments with confirmed or tasting_confirmed status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {debugData.confirmed_appointments.map((appointment) => (
              <div key={appointment.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getStatusIcon(appointment.status)}
                  <div>
                    <p className="font-medium">{appointment.customer_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {appointment.event_date} • ID: {appointment.id.slice(0, 8)}...
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(appointment.status)}
                  {appointment.has_main_courses ? (
                    <Badge variant="outline" className="text-green-600">
                      <ChefHat className="h-3 w-3 mr-1" />
                      Has Menu
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-red-600">
                      No Menu
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Main Courses Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ChefHat className="h-5 w-5" />
            Main Courses Analysis
          </CardTitle>
          <CardDescription>Detailed analysis of main courses parsing for confirmed appointments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {debugData.main_courses_analysis.map((appointment) => (
              <div key={appointment.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {appointment.parse_success ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                    <div>
                      <p className="font-medium">{appointment.customer_name}</p>
                      <p className="text-sm text-muted-foreground">
                        Event Date: {appointment.event_date} • ID: {appointment.id.slice(0, 8)}...
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(appointment.status)}
                    {appointment.parse_success ? (
                      <Badge variant="outline" className="text-green-600">
                        ✓ Parsed
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-red-600">
                        ✗ Parse Failed
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Raw Main Courses:</h4>
                    <pre className="text-xs bg-gray-50 p-3 rounded border overflow-x-auto">
                      {JSON.stringify(appointment.raw_main_courses, null, 2)}
                    </pre>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Parsed Courses ({appointment.parsed_courses.length}):</h4>
                    {appointment.parsed_courses.length > 0 ? (
                      <ul className="text-sm space-y-1">
                        {appointment.parsed_courses.map((course, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <CheckCircle className="h-3 w-3 text-green-500" />
                            {course}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-red-600">No courses parsed</p>
                    )}
                  </div>
                </div>

                {appointment.admin_notes && (
                  <div className="mt-3 pt-3 border-t">
                    <h4 className="font-medium mb-1">Admin Notes:</h4>
                    <p className="text-sm text-muted-foreground">{appointment.admin_notes}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
