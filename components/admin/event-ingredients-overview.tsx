"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { ChefHat, Calendar, Users, Weight, CheckCircle, Clock, AlertTriangle, Package, RefreshCw } from "lucide-react"

interface MainCourseItem {
  name: string
  category: string
  weight_kg: number
}

interface EventIngredient {
  id: string
  appointment_id: string
  event_date: string
  event_type: string
  customer_name: string
  guest_count: number
  main_course_items: MainCourseItem[]
  total_weight_kg: number
  status: string
  days_until_event: number
  can_confirm: boolean
  urgency_level: "critical" | "high" | "medium" | "low"
}

interface Summary {
  total_events: number
  total_guests: number
  total_weight_kg: number
  ready_to_confirm: number
  by_urgency: {
    critical: number
    high: number
    medium: number
    low: number
  }
}

interface IngredientDetail {
  name: string
  quantity: string
}

interface DishIngredientsResponse {
  dishName: string
  guestCount: number
  ingredients: {
    main: IngredientDetail[]
  }
  cookingNotes: string
  totalEstimatedCost: string
}

export default function EventIngredientsOverview() {
  const [events, setEvents] = useState<EventIngredient[]>([])
  const [summary, setSummary] = useState<Summary | null>(null)
  const [categoryBreakdown, setCategoryBreakdown] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [confirmingId, setConfirmingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [selectedDish, setSelectedDish] = useState<string | null>(null)
  const [dishIngredients, setDishIngredients] = useState<DishIngredientsResponse | null>(null)
  const [researchingDish, setResearchingDish] = useState<string | null>(null)
  const [showIngredientsModal, setShowIngredientsModal] = useState(false)
  const [ingredientsError, setIngredientsError] = useState<string | null>(null)

  const fetchEventIngredients = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log("Fetching event ingredients...")
      const timestamp = new Date().getTime()
      const response = await fetch(`/api/admin/event-ingredients?_=${timestamp}`, {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache",
        },
      })
      const data = await response.json()

      console.log("Event ingredients response:", data)

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch event ingredients")
      }

      setEvents(data.events || [])
      setSummary(data.summary || null)
      setCategoryBreakdown(data.category_breakdown || {})
    } catch (err) {
      console.error("Error fetching event ingredients:", err)
      setError(err instanceof Error ? err.message : "Failed to load event ingredients")
    } finally {
      setLoading(false)
    }
  }

  const confirmIngredients = async (appointmentId: string) => {
    try {
      setConfirmingId(appointmentId)

      const response = await fetch(`/api/admin/event-ingredients/${appointmentId}/confirm`, {
        method: "POST",
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to confirm ingredients")
      }

      // Remove the confirmed event from the list
      setEvents((prev) => prev.filter((event) => event.appointment_id !== appointmentId))

      // Update summary
      if (summary) {
        setSummary((prev) =>
          prev
            ? {
                ...prev,
                total_events: prev.total_events - 1,
                ready_to_confirm: prev.ready_to_confirm - 1,
              }
            : null,
        )
      }
    } catch (err) {
      console.error("Error confirming ingredients:", err)
      setError(err instanceof Error ? err.message : "Failed to confirm ingredients")
    } finally {
      setConfirmingId(null)
    }
  }

  const researchDishIngredients = async (dishName: string, guestCount: number) => {
    try {
      setResearchingDish(dishName)
      setSelectedDish(dishName)
      setIngredientsError(null)

      console.log(`🔍 Researching specific ingredients for: "${dishName}" (${guestCount} guests)`)

      const response = await fetch("/api/admin/dish-ingredients-research", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          dishName: dishName.trim(),
          guestCount,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        console.error("❌ Failed to research ingredients:", data)
        throw new Error(data.details || data.error || `Failed to research ingredients for ${dishName}`)
      }

      console.log(`✓ Successfully researched ingredients for "${dishName}":`, data)
      setDishIngredients(data)
      setShowIngredientsModal(true)
    } catch (err) {
      console.error("Error researching dish ingredients:", err)
      const errorMessage = err instanceof Error ? err.message : "Failed to research ingredients"
      setIngredientsError(errorMessage)

      // Still show modal with error
      setShowIngredientsModal(true)
    } finally {
      setResearchingDish(null)
    }
  }

  useEffect(() => {
    fetchEventIngredients()
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
    switch (category) {
      case "beef":
        return "🥩"
      case "pork":
        return "🥓"
      case "chicken":
        return "🍗"
      case "seafood":
        return "🐟"
      case "vegetables":
        return "🥬"
      default:
        return "🍽️"
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
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
          <Button variant="outline" size="sm" onClick={fetchEventIngredients} className="ml-2 bg-transparent">
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Event Ingredients Overview</h1>
          <p className="text-gray-600 mt-1">
            Track and manage ingredients for upcoming events - Click any dish for AI-powered ingredient analysis
          </p>
        </div>
        <Button onClick={fetchEventIngredients} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Summary Cards - Now 3 columns instead of 4 */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Events</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                <span className="text-2xl font-bold">{summary.total_events}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Guests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-green-600" />
                <span className="text-2xl font-bold">{summary.total_guests}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Weight</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Weight className="h-5 w-5 text-purple-600" />
                <span className="text-2xl font-bold">est {summary.total_weight_kg} kg</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Category Breakdown */}
      {Object.keys(categoryBreakdown).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Ingredient Categories Breakdown
            </CardTitle>
            <CardDescription>Estimated total weight needed by ingredient category</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {Object.entries(categoryBreakdown).map(([category, weight]) => (
                <div key={category} className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl mb-1">{getCategoryIcon(category)}</div>
                  <div className="font-semibold capitalize">{category}</div>
                  <div className="text-sm text-gray-600">est {weight} kg</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Events List */}
      {events.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <ChefHat className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No upcoming events</h3>
            <p className="text-gray-600">
              All events have been confirmed or there are no upcoming confirmed events with main courses selected.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {events.map((event) => (
            <Card key={event.id} className="relative">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{event.customer_name}</CardTitle>
                    <CardDescription>
                      {event.event_type} • {new Date(event.event_date).toLocaleDateString()} • {event.guest_count}{" "}
                      guests
                    </CardDescription>
                  </div>
                  <Badge className={getUrgencyColor(event.urgency_level)}>
                    {event.days_until_event === 0
                      ? "Today"
                      : event.days_until_event === 1
                        ? "Tomorrow"
                        : `${event.days_until_event} days`}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Main Course Items */}
                  <div>
                    <h4 className="font-medium text-sm text-gray-700 mb-2 flex items-center gap-2">
                      <ChefHat className="h-4 w-4 text-blue-600" />
                      Main Course Items:
                      <span className="text-xs text-blue-600 font-normal">(Click for ingredient analysis)</span>
                    </h4>
                    {event.main_course_items.length > 0 ? (
                      <div className="space-y-2">
                        {event.main_course_items.map((item, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-blue-50 cursor-pointer transition-all duration-200 group border border-transparent hover:border-blue-300 hover:shadow-sm"
                            onClick={() => researchDishIngredients(item.name, event.guest_count)}
                            title={`Click to research ingredients for ${item.name}`}
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-lg">{getCategoryIcon(item.category)}</span>
                              <div className="flex flex-col">
                                <span className="text-sm font-medium group-hover:text-blue-600 transition-colors">
                                  {item.name}
                                  {researchingDish === item.name && (
                                    <Clock className="h-3 w-3 ml-2 inline animate-spin text-blue-600" />
                                  )}
                                </span>
                                <span className="text-xs text-gray-500 group-hover:text-blue-500">
                                  Click for detailed breakdown
                                </span>
                              </div>
                            </div>
                            <div className="text-sm font-medium text-gray-700 group-hover:text-blue-600">
                              est {item.weight_kg} kg
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500 italic p-3 bg-gray-50 rounded-lg">
                        No main course items selected
                      </div>
                    )}
                  </div>

                  {/* Total Weight */}
                  <div className="flex items-center justify-between pt-2 border-t">
                    <span className="font-medium">Total Weight:</span>
                    <span className="font-bold text-lg">est {event.total_weight_kg} kg</span>
                  </div>

                  {/* Confirm Button */}
                  {event.can_confirm && (
                    <div className="pt-2">
                      <Alert className="border-red-200 bg-red-50 mb-3">
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                        <AlertDescription className="text-red-800">
                          This event is within 1 day and can be confirmed for ingredient preparation.
                        </AlertDescription>
                      </Alert>
                      <Button
                        onClick={() => confirmIngredients(event.appointment_id)}
                        disabled={confirmingId === event.appointment_id}
                        className="w-full bg-red-600 hover:bg-red-700"
                      >
                        {confirmingId === event.appointment_id ? (
                          <>
                            <Clock className="h-4 w-4 mr-2 animate-spin" />
                            Confirming...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Confirm Ingredients
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Ingredients Research Modal */}
      {showIngredientsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <ChefHat className="h-5 w-5 text-blue-600" />
                    Specific Ingredients for
                  </h3>
                  <p className="text-lg text-blue-600 font-medium mt-1">"{selectedDish}"</p>
                  {dishIngredients && <p className="text-sm text-gray-600">For {dishIngredients.guestCount} guests</p>}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowIngredientsModal(false)
                    setDishIngredients(null)
                    setSelectedDish(null)
                    setIngredientsError(null)
                  }}
                >
                  ✕
                </Button>
              </div>

              {ingredientsError ? (
                <Alert className="border-red-200 bg-red-50">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">
                    <div className="font-semibold mb-2">Failed to research ingredients</div>
                    <div className="text-sm">{ingredientsError}</div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setShowIngredientsModal(false)
                        setIngredientsError(null)
                        if (selectedDish && dishIngredients) {
                          researchDishIngredients(selectedDish, dishIngredients.guestCount)
                        }
                      }}
                      className="mt-3"
                    >
                      <RefreshCw className="h-3 w-3 mr-2" />
                      Try Again
                    </Button>
                  </AlertDescription>
                </Alert>
              ) : dishIngredients && dishIngredients.ingredients && dishIngredients.ingredients.main.length > 0 ? (
                <div className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      Main Ingredients for "{selectedDish}":
                    </h4>
                    <div className="grid grid-cols-1 gap-2">
                      {dishIngredients.ingredients.main.map((ingredient: IngredientDetail, index: number) => (
                        <div
                          key={index}
                          className="flex justify-between items-center p-3 bg-white rounded border shadow-sm"
                        >
                          <span className="text-sm font-medium text-gray-900">{ingredient.name}</span>
                          <span className="text-sm font-bold text-blue-600 bg-blue-100 px-3 py-1 rounded">
                            {ingredient.quantity}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {dishIngredients.cookingNotes && (
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Cooking Notes for "{selectedDish}":
                      </h4>
                      <p className="text-sm text-gray-700 leading-relaxed">{dishIngredients.cookingNotes}</p>
                    </div>
                  )}

                  {dishIngredients.totalEstimatedCost && dishIngredients.totalEstimatedCost !== "0" && (
                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                      <h4 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
                        <Package className="h-4 w-4" />
                        Estimated Cost for "{selectedDish}":
                      </h4>
                      <p className="text-2xl font-bold text-green-600">₱{dishIngredients.totalEstimatedCost}</p>
                      <p className="text-sm text-green-700 mt-1">
                        For {dishIngredients.guestCount} guests (₱
                        {Math.round(Number.parseInt(dishIngredients.totalEstimatedCost) / dishIngredients.guestCount)}{" "}
                        per guest)
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <ChefHat className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                  <p>Loading ingredients...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
