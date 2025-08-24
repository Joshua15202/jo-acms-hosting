"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Loader2,
  User,
  Mail,
  Calendar,
  Clock,
  MapPin,
  Users,
  Phone,
  Search,
  DollarSign,
  TrendingUp,
  TrendingDown,
} from "lucide-react"

interface Customer {
  id: string
  email: string
  full_name: string
  phone?: string
  created_at: string
  updated_at?: string
}

interface UpcomingEvent {
  id: string
  event_type: string
  event_date: string
  event_time: string
  guest_count: number
  venue_address?: string
  status: string
  tbl_users: {
    id: string
    full_name: string
    email: string
    phone?: string
  }
}

interface RevenueData {
  totalRevenue: number
  prevMonthRevenue: number
  percentageChange: number
  completedEvents: number
  revenueBreakdown: {
    id: string
    customerName: string
    customerEmail: string
    eventType: string
    eventDate: string
    guestCount: number
    amount: number
    paymentStatus: string
    completedAt: string
  }[]
  month: number
  year: number
  monthName: string
}

export default function AdminDashboard() {
  const [showCustomers, setShowCustomers] = useState(false)
  const [showEvents, setShowEvents] = useState(false)
  const [showRevenue, setShowRevenue] = useState(false)
  const [customers, setCustomers] = useState<Customer[]>([])
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([])
  const [upcomingEvents, setUpcomingEvents] = useState<UpcomingEvent[]>([])
  const [revenueData, setRevenueData] = useState<RevenueData | null>(null)
  const [loadingCustomers, setLoadingCustomers] = useState(false)
  const [loadingEvents, setLoadingEvents] = useState(false)
  const [loadingRevenue, setLoadingRevenue] = useState(false)
  const [totalCustomers, setTotalCustomers] = useState(0)
  const [totalUpcomingEvents, setTotalUpcomingEvents] = useState(0)
  const [customerSearchTerm, setCustomerSearchTerm] = useState("")
  const [debugInfo, setDebugInfo] = useState("")

  // Fetch total customers count on component mount
  useEffect(() => {
    fetchCustomersCount()
    fetchUpcomingEventsCount()
    fetchMonthlyRevenue()
  }, [])

  // Filter customers based on search term
  useEffect(() => {
    if (!customerSearchTerm) {
      setFilteredCustomers(customers)
    } else {
      const filtered = customers.filter(
        (customer) =>
          customer.full_name?.toLowerCase().includes(customerSearchTerm.toLowerCase()) ||
          customer.email.toLowerCase().includes(customerSearchTerm.toLowerCase()) ||
          customer.phone?.includes(customerSearchTerm),
      )
      setFilteredCustomers(filtered)
    }
  }, [customers, customerSearchTerm])

  const fetchCustomersCount = async () => {
    try {
      console.log("Fetching customers count...")

      // Try the new comprehensive API first
      try {
        const response = await fetch("/api/admin/all-customers")
        const text = await response.text()

        console.log("Raw response:", text.substring(0, 200))

        // Check if response is HTML (error page)
        if (text.startsWith("<!DOCTYPE")) {
          throw new Error("Received HTML instead of JSON - API route may not exist")
        }

        const data = JSON.parse(text)
        console.log("All customers API response:", data)
        setDebugInfo(`All Customers API Response: ${JSON.stringify(data, null, 2)}`)

        if (data.success) {
          setTotalCustomers(data.totalCustomers || 0)
          console.log(`Set total customers to: ${data.totalCustomers}`)
          return
        }
      } catch (apiError) {
        console.error("All customers API failed:", apiError)
        setDebugInfo(`All Customers API Error: ${apiError}`)
      }

      // Try the regular customers API
      try {
        const response = await fetch("/api/admin/customers")
        const text = await response.text()

        if (text.startsWith("<!DOCTYPE")) {
          throw new Error("Received HTML instead of JSON")
        }

        const data = JSON.parse(text)
        console.log("Customers API response:", data)

        if (data.success) {
          setTotalCustomers(data.totalCustomers || 0)
          console.log(`Set total customers to: ${data.totalCustomers}`)
          return
        }
      } catch (apiError) {
        console.error("Customers API failed:", apiError)
      }

      // Fallback to debug-all-users endpoint
      console.log("Falling back to debug-all-users endpoint...")
      const fallbackResponse = await fetch("/api/debug-all-users")
      const fallbackText = await fallbackResponse.text()

      if (fallbackText.startsWith("<!DOCTYPE")) {
        throw new Error("Fallback API also returned HTML")
      }

      const fallbackData = JSON.parse(fallbackText)
      console.log("Fallback API response:", fallbackData)
      setDebugInfo(`Fallback API Response (Limited to 10): ${JSON.stringify(fallbackData, null, 2)}`)

      if (fallbackData.users) {
        // Filter for valid emails
        const validUsers = fallbackData.users.filter((user: any) => {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
          return user.email && emailRegex.test(user.email)
        })
        setTotalCustomers(validUsers.length)
        console.log(`Set total customers from fallback: ${validUsers.length} (Note: This may be limited)`)
      }
    } catch (error) {
      console.error("Error fetching customers count:", error)
      setDebugInfo(`Error: ${error}`)
      setTotalCustomers(0)
    }
  }

  const fetchUpcomingEventsCount = async () => {
    try {
      const response = await fetch("/api/admin/appointments")
      const text = await response.text()

      if (text.startsWith("<!DOCTYPE")) {
        console.error("Appointments API returned HTML")
        return
      }

      const data = JSON.parse(text)

      if (data.success && data.appointments) {
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        const upcoming = data.appointments.filter((appointment: UpcomingEvent) => {
          const eventDate = new Date(appointment.event_date)
          return eventDate >= today && appointment.status !== "cancelled" && appointment.status !== "completed"
        })

        setTotalUpcomingEvents(upcoming.length)
      }
    } catch (error) {
      console.error("Error fetching upcoming events count:", error)
    }
  }

  const fetchMonthlyRevenue = async () => {
    try {
      console.log("Fetching monthly revenue...")
      const response = await fetch("/api/admin/monthly-revenue")
      const text = await response.text()

      if (text.startsWith("<!DOCTYPE")) {
        console.error("Monthly revenue API returned HTML")
        return
      }

      const data = JSON.parse(text)
      console.log("Monthly revenue API response:", data)

      if (data.success) {
        setRevenueData(data.data)
      }
    } catch (error) {
      console.error("Error fetching monthly revenue:", error)
    }
  }

  const fetchCustomers = async () => {
    setLoadingCustomers(true)
    try {
      console.log("Fetching full customers list...")

      // Try the comprehensive API first
      try {
        const response = await fetch("/api/admin/all-customers")
        const text = await response.text()

        if (text.startsWith("<!DOCTYPE")) {
          throw new Error("Received HTML instead of JSON")
        }

        const data = JSON.parse(text)
        console.log("Full customers API response:", data)

        if (data.success && data.customers) {
          setCustomers(data.customers)
          setTotalCustomers(data.totalCustomers)
          console.log(`Loaded ${data.customers.length} customers`)
          return
        }
      } catch (apiError) {
        console.error("All customers API failed:", apiError)
      }

      // Try the regular customers API
      try {
        const response = await fetch("/api/admin/customers")
        const text = await response.text()

        if (text.startsWith("<!DOCTYPE")) {
          throw new Error("Received HTML instead of JSON")
        }

        const data = JSON.parse(text)
        console.log("Customers API response:", data)

        if (data.success && data.customers) {
          setCustomers(data.customers)
          setTotalCustomers(data.totalCustomers)
          console.log(`Loaded ${data.customers.length} customers`)
          return
        }
      } catch (apiError) {
        console.error("Customers API failed:", apiError)
      }

      // Fallback to debug-all-users endpoint
      console.log("Using fallback endpoint...")
      const fallbackResponse = await fetch("/api/debug-all-users")
      const fallbackText = await fallbackResponse.text()

      if (fallbackText.startsWith("<!DOCTYPE")) {
        throw new Error("Fallback API also returned HTML")
      }

      const fallbackData = JSON.parse(fallbackText)
      console.log("Using fallback endpoint:", fallbackData)

      if (fallbackData.users) {
        // Filter for valid emails and format data
        const validUsers = fallbackData.users
          .filter((user: any) => {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
            return user.email && emailRegex.test(user.email)
          })
          .map((user: any) => ({
            id: user.id,
            email: user.email,
            full_name: user.full_name,
            phone: user.phone,
            created_at: user.created_at,
            updated_at: user.updated_at,
          }))

        setCustomers(validUsers)
        setTotalCustomers(validUsers.length)
        console.log(`Loaded ${validUsers.length} customers from fallback (may be limited)`)
      }
    } catch (error) {
      console.error("Error fetching customers:", error)
    } finally {
      setLoadingCustomers(false)
    }
  }

  const fetchUpcomingEvents = async () => {
    setLoadingEvents(true)
    try {
      const response = await fetch("/api/admin/appointments")
      const text = await response.text()

      if (text.startsWith("<!DOCTYPE")) {
        console.error("Appointments API returned HTML")
        return
      }

      const data = JSON.parse(text)

      if (data.success && data.appointments) {
        // Filter for upcoming events (events in the future)
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        const upcoming = data.appointments
          .filter((appointment: UpcomingEvent) => {
            const eventDate = new Date(appointment.event_date)
            return eventDate >= today && appointment.status !== "cancelled" && appointment.status !== "completed"
          })
          .sort((a: UpcomingEvent, b: UpcomingEvent) => {
            // Sort by date, then by time
            const dateA = new Date(a.event_date)
            const dateB = new Date(b.event_date)
            if (dateA.getTime() !== dateB.getTime()) {
              return dateA.getTime() - dateB.getTime()
            }
            // If same date, sort by time
            return a.event_time.localeCompare(b.event_time)
          })

        setUpcomingEvents(upcoming)
        setTotalUpcomingEvents(upcoming.length)
      }
    } catch (error) {
      console.error("Error fetching upcoming events:", error)
    } finally {
      setLoadingEvents(false)
    }
  }

  const fetchRevenueDetails = async () => {
    setLoadingRevenue(true)
    try {
      await fetchMonthlyRevenue()
    } catch (error) {
      console.error("Error fetching revenue details:", error)
    } finally {
      setLoadingRevenue(false)
    }
  }

  const handleCustomersClick = () => {
    setShowCustomers(true)
    if (customers.length === 0) {
      fetchCustomers()
    }
  }

  const handleEventsClick = () => {
    setShowEvents(true)
    if (upcomingEvents.length === 0) {
      fetchUpcomingEvents()
    }
  }

  const handleRevenueClick = () => {
    setShowRevenue(true)
    if (!revenueData) {
      fetchRevenueDetails()
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatEventDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            Pending
          </Badge>
        )
      case "confirmed":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Confirmed
          </Badge>
        )
      case "PENDING_TASTING_CONFIRMATION":
        return (
          <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
            Pending Tasting
          </Badge>
        )
      case "TASTING_CONFIRMED":
        return (
          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
            Tasting Confirmed
          </Badge>
        )
      case "TASTING_RESCHEDULE_REQUESTED":
        return (
          <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">
            Tasting Reschedule
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getDaysUntilEvent = (eventDate: string) => {
    const today = new Date()
    const event = new Date(eventDate)
    const diffTime = event.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return "Today"
    if (diffDays === 1) return "Tomorrow"
    if (diffDays < 7) return `In ${diffDays} days`
    return `In ${Math.ceil(diffDays / 7)} weeks`
  }

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
      <p className="text-gray-600 mb-8">Welcome to the Jo-AIMS admin dashboard.</p>

      {/* Debug Info - Remove this in production */}
      {debugInfo && (
        <div className="mb-4 p-4 bg-gray-100 rounded-lg">
          <details>
            <summary className="cursor-pointer text-sm font-medium">Debug Info (Click to expand)</summary>
            <pre className="mt-2 text-xs overflow-auto max-h-40">{debugInfo}</pre>
          </details>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Clickable Registered Customers Card */}
        <div
          className="bg-white p-6 rounded-lg shadow border cursor-pointer hover:shadow-lg transition-shadow duration-200 hover:bg-gray-50"
          onClick={handleCustomersClick}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Registered Customers</p>
              <p className="text-2xl font-bold text-gray-900">{totalCustomers}</p>
            </div>
            <div className="h-8 w-8 bg-rose-100 rounded-full flex items-center justify-center">
              <User className="h-5 w-5 text-rose-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">Click to view all customers</p>
        </div>

        {/* Clickable Upcoming Events Card */}
        <div
          className="bg-white p-6 rounded-lg shadow border cursor-pointer hover:shadow-lg transition-shadow duration-200 hover:bg-gray-50"
          onClick={handleEventsClick}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Upcoming Events</p>
              <p className="text-2xl font-bold text-gray-900">{totalUpcomingEvents}</p>
            </div>
            <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
              <Calendar className="h-5 w-5 text-blue-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">Click to view upcoming events</p>
        </div>

        {/* Clickable Monthly Revenue Card */}
        <div
          className="bg-white p-6 rounded-lg shadow border cursor-pointer hover:shadow-lg transition-shadow duration-200 hover:bg-gray-50"
          onClick={handleRevenueClick}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
              <p className="text-2xl font-bold text-gray-900">
                {revenueData ? formatCurrency(revenueData.totalRevenue) : "Loading..."}
              </p>
            </div>
            <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-green-600" />
            </div>
          </div>
          <div className="flex items-center mt-2">
            {revenueData && (
              <>
                {revenueData.percentageChange >= 0 ? (
                  <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-600 mr-1" />
                )}
                <p className={`text-xs ${revenueData.percentageChange >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {revenueData.percentageChange >= 0 ? "+" : ""}
                  {revenueData.percentageChange}% from last month
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-semibold mb-4">Upcoming Events</h3>
          <p className="text-sm text-gray-600 mb-4">Events scheduled for the next 30 days</p>
          <div className="h-48 bg-gray-50 rounded-md flex items-center justify-center">
            <p className="text-gray-500">Events chart will be displayed here</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-semibold mb-4">Revenue Analytics</h3>
          <p className="text-sm text-gray-600 mb-4">Monthly revenue trends and projections</p>
          <div className="h-48 bg-gray-50 rounded-md flex items-center justify-center">
            <p className="text-gray-500">Revenue chart will be displayed here</p>
          </div>
        </div>
      </div>

      {/* Customers Modal */}
      <Dialog open={showCustomers} onOpenChange={setShowCustomers}>
        <DialogContent className="max-w-5xl max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Registered Customers ({totalCustomers})
            </DialogTitle>
          </DialogHeader>

          {/* Search Bar */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search customers by name, email, or phone..."
              value={customerSearchTerm}
              onChange={(e) => setCustomerSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="overflow-y-auto max-h-[60vh]">
            {loadingCustomers ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-rose-600" />
                <span className="ml-2">Loading customers...</span>
              </div>
            ) : filteredCustomers.length > 0 ? (
              <div className="space-y-4">
                {filteredCustomers.map((customer) => (
                  <div key={customer.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="h-10 w-10 bg-rose-100 rounded-full flex items-center justify-center">
                            <User className="h-5 w-5 text-rose-600" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold text-gray-900">
                                {customer.full_name || "No name provided"}
                              </h4>
                              {isValidEmail(customer.email) && (
                                <Badge
                                  variant="outline"
                                  className="bg-green-50 text-green-700 border-green-200 text-xs"
                                >
                                  Verified Email
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-1 text-sm text-gray-600 mb-1">
                              <Mail className="h-4 w-4" />
                              {customer.email}
                            </div>
                            {customer.phone && (
                              <div className="flex items-center gap-1 text-sm text-gray-600">
                                <Phone className="h-4 w-4" />
                                {customer.phone}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            Joined: {formatDate(customer.created_at)}
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            ID: {customer.id.slice(0, 8)}...
                          </Badge>
                          {customer.updated_at && customer.updated_at !== customer.created_at && (
                            <div className="flex items-center gap-1 text-xs">
                              <Clock className="h-3 w-3" />
                              Updated: {formatDate(customer.updated_at)}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : customerSearchTerm ? (
              <div className="text-center py-8">
                <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No customers found matching "{customerSearchTerm}"</p>
                <Button variant="outline" onClick={() => setCustomerSearchTerm("")} className="mt-2">
                  Clear Search
                </Button>
              </div>
            ) : (
              <div className="text-center py-8">
                <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No registered customers found</p>
              </div>
            )}
          </div>

          <div className="flex justify-between items-center pt-4 border-t">
            <p className="text-sm text-gray-500">
              Showing {filteredCustomers.length} of {totalCustomers} customers
            </p>
            <Button variant="outline" onClick={() => setShowCustomers(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Upcoming Events Modal */}
      <Dialog open={showEvents} onOpenChange={setShowEvents}>
        <DialogContent className="max-w-5xl max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Upcoming Events ({totalUpcomingEvents})
            </DialogTitle>
          </DialogHeader>

          <div className="overflow-y-auto max-h-[60vh]">
            {loadingEvents ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <span className="ml-2">Loading upcoming events...</span>
              </div>
            ) : upcomingEvents.length > 0 ? (
              <div className="space-y-4">
                {upcomingEvents.map((event) => (
                  <div key={event.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                            <Calendar className="h-6 w-6 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold text-gray-900">{event.event_type}</h4>
                              {getStatusBadge(event.status)}
                            </div>
                            <p className="text-sm text-gray-600">
                              Client: {event.tbl_users.full_name} ({event.tbl_users.email})
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium text-blue-600">
                              {getDaysUntilEvent(event.event_date)}
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span>{formatEventDate(event.event_date)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <span>{event.event_time}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-gray-400" />
                            <span>{event.guest_count} guests</span>
                          </div>
                          {event.venue_address && (
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-gray-400" />
                              <span className="truncate">{event.venue_address}</span>
                            </div>
                          )}
                        </div>

                        <div className="mt-2 text-xs text-gray-500">Event ID: {event.id.slice(0, 8)}...</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No upcoming events found</p>
              </div>
            )}
          </div>

          <div className="flex justify-end pt-4 border-t">
            <Button variant="outline" onClick={() => setShowEvents(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Monthly Revenue Modal */}
      <Dialog open={showRevenue} onOpenChange={setShowRevenue}>
        <DialogContent className="max-w-6xl max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              {revenueData ? `${revenueData.monthName} ${revenueData.year} Revenue` : "Monthly Revenue"}
            </DialogTitle>
          </DialogHeader>

          <div className="overflow-y-auto max-h-[60vh]">
            {loadingRevenue ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-green-600" />
                <span className="ml-2">Loading revenue data...</span>
              </div>
            ) : revenueData ? (
              <div className="space-y-6">
                {/* Revenue Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Total Revenue</p>
                    <p className="text-2xl font-bold text-green-600">{formatCurrency(revenueData.totalRevenue)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Completed Events</p>
                    <p className="text-2xl font-bold text-blue-600">{revenueData.completedEvents}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">vs Last Month</p>
                    <div className="flex items-center justify-center gap-1">
                      {revenueData.percentageChange >= 0 ? (
                        <TrendingUp className="h-5 w-5 text-green-600" />
                      ) : (
                        <TrendingDown className="h-5 w-5 text-red-600" />
                      )}
                      <p
                        className={`text-xl font-bold ${revenueData.percentageChange >= 0 ? "text-green-600" : "text-red-600"}`}
                      >
                        {revenueData.percentageChange >= 0 ? "+" : ""}
                        {revenueData.percentageChange}%
                      </p>
                    </div>
                  </div>
                </div>

                {/* Revenue Breakdown */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Completed Events Breakdown</h3>
                  {revenueData.revenueBreakdown.length > 0 ? (
                    <div className="space-y-3">
                      {revenueData.revenueBreakdown.map((event) => (
                        <div key={event.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                                  <DollarSign className="h-5 w-5 text-green-600" />
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h4 className="font-semibold text-gray-900">{event.eventType}</h4>
                                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                      Fully Paid
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-gray-600">
                                    Client: {event.customerName} ({event.customerEmail})
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="text-lg font-bold text-green-600">{formatCurrency(event.amount)}</p>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-500">
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-4 w-4" />
                                  <span>{formatEventDate(event.eventDate)}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Users className="h-4 w-4" />
                                  <span>{event.guestCount} guests</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Clock className="h-4 w-4" />
                                  <span>Completed: {formatDate(event.completedAt)}</span>
                                </div>
                                <div className="text-xs">ID: {event.id.slice(0, 8)}...</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No completed events with full payment found for this month</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No revenue data available</p>
              </div>
            )}
          </div>

          <div className="flex justify-between items-center pt-4 border-t">
            <p className="text-sm text-gray-500">
              {revenueData
                ? `${revenueData.completedEvents} completed events • ${formatCurrency(revenueData.totalRevenue)} total revenue`
                : "Loading..."}
            </p>
            <Button variant="outline" onClick={() => setShowRevenue(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
