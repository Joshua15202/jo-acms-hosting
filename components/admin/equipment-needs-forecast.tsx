"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  Package,
  Calendar,
  Users,
  AlertTriangle,
  RefreshCw,
  Wrench,
  Table,
  Loader2,
  CheckCircle2,
  XCircle,
  Download,
} from "lucide-react"

interface EquipmentPrediction {
  category: string
  item: string
  quantity: number
  reason: string
}

interface EventEquipmentForecast {
  id: string
  appointment_id: string
  event_date: string
  event_type: string
  customer_name: string
  guest_count: number
  main_courses: string[]
  equipment_predictions: EquipmentPrediction[]
  days_until_event: number
  urgency_level: "critical" | "high" | "medium" | "low"
}

interface Summary {
  total_events: number
  total_guests: number
  critical_events: number
  high_priority_events: number
}

export default function EquipmentNeedsForecast() {
  const [events, setEvents] = useState<EventEquipmentForecast[]>([])
  const [summary, setSummary] = useState<Summary | null>(null)
  const [equipmentBreakdown, setEquipmentBreakdown] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [downloadingId, setDownloadingId] = useState<string | null>(null)

  const [selectedEquipment, setSelectedEquipment] = useState<{
    item: string
    quantity: number
    category: string
  } | null>(null)
  const [inventoryAnalysis, setInventoryAnalysis] = useState<any>(null)
  const [checkingInventory, setCheckingInventory] = useState(false)

  const fetchEquipmentForecast = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log("Fetching equipment needs forecast...")
      const timestamp = new Date().getTime()
      const response = await fetch(`/api/admin/equipment-needs-forecast?_=${timestamp}`, {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache",
        },
      })
      const data = await response.json()

      console.log("Equipment forecast response:", data)

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch equipment forecast")
      }

      setEvents(data.events || [])
      setSummary(data.summary || null)
      setEquipmentBreakdown(data.equipment_breakdown || {})
    } catch (err) {
      console.error("Error fetching equipment forecast:", err)
      setError(err instanceof Error ? err.message : "Failed to load equipment forecast")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEquipmentForecast()
  }, [])

  const getUrgencyColor = (urgencyLevel: string) => {
    switch (urgencyLevel) {
      case "critical":
        return "bg-red-100 text-red-800 border-red-200"
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "low":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case "furniture":
        return "🪑"
      case "seating":
        return "💺"
      case "dinnerware":
        return "🍽️"
      case "glassware":
        return "🥤"
      case "silverware":
        return "🍴"
      case "linens":
        return "🧺"
      case "serving equipment":
        return "🍲"
      case "chafing dishes":
        return "🔥"
      default:
        return "📦"
    }
  }

  const checkInventoryAvailability = async (item: string, quantity: number, category: string) => {
    setSelectedEquipment({ item, quantity, category })
    setCheckingInventory(true)
    setInventoryAnalysis(null)

    try {
      const response = await fetch("/api/admin/equipment-inventory-check", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          equipmentItem: item,
          quantityNeeded: quantity,
          category: category,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to check inventory")
      }

      setInventoryAnalysis(data)
    } catch (err) {
      console.error("Error checking inventory:", err)
      setInventoryAnalysis({
        error: err instanceof Error ? err.message : "Failed to check inventory",
      })
    } finally {
      setCheckingInventory(false)
    }
  }

  const downloadEquipmentPDF = async (appointmentId: string, customerName: string) => {
    try {
      setDownloadingId(appointmentId)

      console.log("[v0] Downloading equipment PDF for appointment:", appointmentId)

      const response = await fetch(`/api/admin/equipment-forecast/download-pdf?appointmentId=${appointmentId}`)

      console.log("[v0] Equipment PDF response status:", response.status)

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to generate PDF")
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `Equipment_List_${customerName.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      console.log("[v0] Equipment PDF downloaded successfully")
    } catch (err) {
      console.error("[v0] Error downloading PDF:", err)
      alert(err instanceof Error ? err.message : "Failed to download PDF")
    } finally {
      setDownloadingId(null)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Alert className="border-red-200 bg-red-50">
        <AlertTriangle className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-800">
          {error}
          <Button variant="outline" size="sm" onClick={fetchEquipmentForecast} className="ml-2 bg-transparent">
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Equipment Needs Forecast</h2>
          <p className="text-sm text-gray-600">AI-powered equipment predictions</p>
        </div>
        <Button onClick={fetchEquipmentForecast} variant="outline" size="sm">
          <RefreshCw className="h-3 w-3 mr-1" />
          Refresh
        </Button>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card className="border-gray-200">
            <CardContent className="pt-3 pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600">Total Events</p>
                  <p className="text-xl font-bold mt-0.5">{summary.total_events}</p>
                </div>
                <Calendar className="h-4 w-4 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-200">
            <CardContent className="pt-3 pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600">Total Guests</p>
                  <p className="text-xl font-bold mt-0.5">{summary.total_guests}</p>
                </div>
                <Users className="h-4 w-4 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-200">
            <CardContent className="pt-3 pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600">Critical</p>
                  <p className="text-xl font-bold mt-0.5">{summary.critical_events}</p>
                </div>
                <AlertTriangle className="h-4 w-4 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-200">
            <CardContent className="pt-3 pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600">High Priority</p>
                  <p className="text-xl font-bold mt-0.5">{summary.high_priority_events}</p>
                </div>
                <Wrench className="h-4 w-4 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Equipment Category Breakdown */}
      {Object.keys(equipmentBreakdown).length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Package className="h-4 w-4" />
              Equipment Category Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
              {Object.entries(equipmentBreakdown).map(([category, quantity]) => (
                <div key={category} className="text-center p-2 bg-gray-50 rounded border border-gray-200">
                  <div className="text-lg mb-0.5">{getCategoryIcon(category)}</div>
                  <div className="font-semibold capitalize text-xs truncate">{category}</div>
                  <div className="text-sm font-bold text-blue-600">{quantity}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Events List */}
      {events.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <Table className="h-10 w-10 text-gray-400 mx-auto mb-3" />
            <h3 className="text-base font-medium text-gray-900 mb-1">No upcoming events</h3>
            <p className="text-sm text-gray-600">No confirmed events requiring equipment forecasting.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {events.map((event) => (
            <Card key={event.id} className="border-gray-200">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <CardTitle className="text-base truncate">{event.customer_name}</CardTitle>
                    <CardDescription className="text-xs mt-0.5">
                      {event.event_type} • {new Date(event.event_date).toLocaleDateString()} • {event.guest_count}{" "}
                      guests
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Badge className={`${getUrgencyColor(event.urgency_level)} text-xs px-2 py-0`}>
                      {event.days_until_event === 0
                        ? "Today"
                        : event.days_until_event === 1
                          ? "Tomorrow"
                          : `${event.days_until_event} days`}
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadEquipmentPDF(event.appointment_id, event.customer_name)}
                      disabled={downloadingId === event.appointment_id}
                      className="h-7 w-7 p-0"
                    >
                      {downloadingId === event.appointment_id ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Download className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0 pb-3">
                <div className="space-y-3">
                  {/* AI-Predicted Equipment Needs */}
                  <div>
                    <h4 className="font-medium text-xs text-gray-700 mb-2 flex items-center gap-1.5">
                      <Wrench className="h-3 w-3 text-blue-600" />
                      AI-Predicted Equipment Needs:
                      <span className="text-xs text-blue-600 font-normal">(Click for inventory check)</span>
                    </h4>
                    <div className="space-y-1.5">
                      {event.equipment_predictions.map((prediction, index) => (
                        <button
                          key={index}
                          onClick={() =>
                            checkInventoryAvailability(prediction.item, prediction.quantity, prediction.category)
                          }
                          className="w-full flex items-center justify-between p-2 bg-gray-50 rounded-lg hover:bg-blue-50 cursor-pointer transition-all duration-200 group border border-transparent hover:border-blue-300 hover:shadow-sm"
                          title={`Click to check inventory for ${prediction.item}`}
                        >
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <span className="text-base flex-shrink-0">{getCategoryIcon(prediction.category)}</span>
                            <div className="flex flex-col items-start min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-sm text-gray-900 group-hover:text-blue-600 transition-colors">
                                  {prediction.item}
                                </span>
                                <Badge
                                  variant="outline"
                                  className="bg-white text-xs px-1.5 py-0 flex-shrink-0 border-gray-300"
                                >
                                  {prediction.category}
                                </Badge>
                              </div>
                              <span className="text-xs text-gray-500 group-hover:text-blue-500 transition-colors">
                                {prediction.reason}
                              </span>
                            </div>
                          </div>
                          <div className="text-sm font-medium text-gray-700 group-hover:text-blue-600 flex-shrink-0 ml-2">
                            {prediction.quantity} needed
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Menu Items */}
                  {event.main_courses.length > 0 && (
                    <div className="pt-2 border-t border-gray-200">
                      <h4 className="font-medium text-xs text-gray-700 mb-1.5">Menu Items:</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {event.main_courses.map((course, index) => (
                          <Badge key={index} variant="outline" className="bg-gray-50 text-xs px-2 py-0">
                            {course}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={selectedEquipment !== null} onOpenChange={(open) => !open && setSelectedEquipment(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Inventory Availability Check</DialogTitle>
            <DialogDescription>
              Checking inventory for: <strong>{selectedEquipment?.item}</strong> ({selectedEquipment?.quantity} needed)
            </DialogDescription>
          </DialogHeader>

          {checkingInventory ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
                <p className="text-gray-600">AI is analyzing inventory availability...</p>
              </div>
            </div>
          ) : inventoryAnalysis?.error ? (
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">{inventoryAnalysis.error}</AlertDescription>
            </Alert>
          ) : inventoryAnalysis ? (
            <div className="space-y-4">
              {/* Summary */}
              <Card
                className={inventoryAnalysis.can_fulfill ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}
              >
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 mb-2">
                    {inventoryAnalysis.can_fulfill ? (
                      <CheckCircle2 className="h-6 w-6 text-green-600" />
                    ) : (
                      <XCircle className="h-6 w-6 text-red-600" />
                    )}
                    <div>
                      <h3 className="font-semibold text-lg">
                        {inventoryAnalysis.can_fulfill ? "Sufficient Inventory" : "Insufficient Inventory"}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Available: {inventoryAnalysis.total_available} / Needed: {inventoryAnalysis.total_needed}
                        {inventoryAnalysis.shortfall > 0 && ` (Shortfall: ${inventoryAnalysis.shortfall})`}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Matching Items */}
              {inventoryAnalysis.matches && inventoryAnalysis.matches.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3">Matching Inventory Items:</h4>
                  <div className="space-y-2">
                    {inventoryAnalysis.matches.map((match: any, index: number) => (
                      <Card key={index} className="border-gray-200">
                        <CardContent className="pt-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium">{match.item_name}</span>
                                <Badge
                                  variant="outline"
                                  className={
                                    match.match_confidence === "exact"
                                      ? "bg-green-100 text-green-800"
                                      : match.match_confidence === "high"
                                        ? "bg-blue-100 text-blue-800"
                                        : "bg-yellow-100 text-yellow-800"
                                  }
                                >
                                  {match.match_confidence} match
                                </Badge>
                                {match.sufficient && (
                                  <Badge variant="outline" className="bg-green-100 text-green-800">
                                    Sufficient
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-gray-700 mb-2">{match.reason}</p>
                              <div className="flex gap-4 text-sm">
                                <span>
                                  Available: <strong>{match.available}</strong>
                                </span>
                                <span>
                                  Needed: <strong>{match.needed}</strong>
                                </span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommendations */}
              {inventoryAnalysis.recommendations && (
                <Card className="border-blue-200 bg-blue-50">
                  <CardHeader>
                    <CardTitle className="text-sm">AI Recommendations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-700">{inventoryAnalysis.recommendations}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  )
}
