"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
  Download,
  BarChart3,
} from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"

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

interface MonthlyData {
  month: string
  revenue: number
  events: number
}

interface EventTypeData {
  name: string
  count: number
  percentage: number
}

interface PeakMonth {
  month: string
  events: number
  revenue: number
  topEventType: string
}

const COLORS = ["#e11d48", "#f97316", "#eab308", "#22c55e", "#3b82f6", "#8b5cf6", "#ec4899"]

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

  // New states for analytics
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([])
  const [eventTypeData, setEventTypeData] = useState<EventTypeData[]>([])
  const [peakMonths, setPeakMonths] = useState<PeakMonth[]>([])
  const [downloadFormat, setDownloadFormat] = useState<"monthly" | "yearly">("monthly")
  const [isDownloading, setIsDownloading] = useState(false)
  const [viewPeriod, setViewPeriod] = useState<"monthly" | "yearly">("monthly")

  useEffect(() => {
    fetchCustomersCount()
    fetchUpcomingEventsCount()
    fetchMonthlyRevenue()
  }, [])

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
      const timestamp = new Date().getTime()
      const response = await fetch(`/api/admin/all-customers?_=${timestamp}`, {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache",
        },
      })
      const data = await response.json()
      if (data.success) {
        setTotalCustomers(data.totalCustomers || 0)
      }
    } catch (error) {
      console.error("Error fetching customers count:", error)
    }
  }

  const fetchUpcomingEventsCount = async () => {
    try {
      const timestamp = new Date().getTime()
      const response = await fetch(`/api/admin/appointments?_=${timestamp}`, {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache",
        },
      })
      const data = await response.json()

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
      console.log("=== FETCHING REVENUE FROM DASHBOARD ===")
      console.log("View Period:", viewPeriod)
      const timestamp = new Date().getTime()
      const randomParam = Math.random().toString(36).substring(7)
      const response = await fetch(`/api/admin/monthly-revenue?period=${viewPeriod}&_=${timestamp}&r=${randomParam}`, {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      })
      const data = await response.json()

      console.log("=== REVENUE RESPONSE ===")
      console.log("Success:", data.success)
      console.log("Completed Events:", data.data?.completedEvents)
      console.log("Total Revenue:", data.data?.totalRevenue)

      if (data.success) {
        setRevenueData(data.data)
      }
    } catch (error) {
      console.error("Error fetching revenue:", error)
    }
  }

  const fetchDetailedAnalytics = async () => {
    try {
      const timestamp = new Date().getTime()
      const randomParam = Math.random().toString(36).substring(7)
      const response = await fetch(`/api/admin/revenue-analytics?_=${timestamp}&r=${randomParam}`, {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      })
      const data = await response.json()

      if (data.success) {
        setMonthlyData(data.monthlyData || [])
        setEventTypeData(data.eventTypeData || [])
        setPeakMonths(data.peakMonths || [])
      }
    } catch (error) {
      console.error("Error fetching detailed analytics:", error)
    }
  }

  const handleDownloadPDF = async () => {
    setIsDownloading(true)
    try {
      const response = await fetch(`/api/admin/download-sales-report?format=${downloadFormat}`)

      if (!response.ok) {
        throw new Error("Failed to generate report")
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `sales-report-${downloadFormat}-${new Date().toISOString().split("T")[0]}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error("Error downloading PDF:", error)
      alert("Failed to download report. Please try again.")
    } finally {
      setIsDownloading(false)
    }
  }

  const fetchCustomers = async () => {
    setLoadingCustomers(true)
    try {
      const timestamp = new Date().getTime()
      const response = await fetch(`/api/admin/all-customers?_=${timestamp}`, {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache",
        },
      })
      const data = await response.json()

      if (data.success && data.customers) {
        setCustomers(data.customers)
        setTotalCustomers(data.totalCustomers)
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
      const timestamp = new Date().getTime()
      const response = await fetch(`/api/admin/appointments?_=${timestamp}`, {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache",
        },
      })
      const data = await response.json()

      if (data.success && data.appointments) {
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        const upcoming = data.appointments
          .filter((appointment: UpcomingEvent) => {
            const eventDate = new Date(appointment.event_date)
            return eventDate >= today && appointment.status !== "cancelled" && appointment.status !== "completed"
          })
          .sort((a: UpcomingEvent, b: UpcomingEvent) => {
            const dateA = new Date(a.event_date)
            const dateB = new Date(b.event_date)
            if (dateA.getTime() !== dateB.getTime()) {
              return dateA.getTime() - dateB.getTime()
            }
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
      await fetchDetailedAnalytics()
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
    fetchRevenueDetails() // Always fetch fresh data when opening modal
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

  useEffect(() => {
    if (showRevenue) {
      fetchRevenueDetails()
    }
  }, [viewPeriod])

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
      <p className="text-gray-600 mb-6">Welcome to the Jo-ACMS Admin Dashboard.</p>

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
                            <Calendar className="h-3 w-3" />
                            Joined: {formatDate(customer.created_at)}
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            ID: {customer.id.slice(0, 8)}...
                          </Badge>
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

      {/* Revenue Analytics Modal */}
      <Dialog open={showRevenue} onOpenChange={setShowRevenue}>
        <DialogContent className="max-w-[95vw] max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Revenue Analytics & Reports
              </DialogTitle>
              <div className="flex items-center gap-2">
                <Select value={viewPeriod} onValueChange={(value: "monthly" | "yearly") => setViewPeriod(value)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={handleDownloadPDF} disabled={isDownloading} className="bg-rose-600 hover:bg-rose-700">
                  {isDownloading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Download PDF
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogHeader>

          <div className="overflow-y-auto max-h-[75vh] space-y-6 pr-2">
            {loadingRevenue ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-rose-600" />
                <span className="ml-2">Loading analytics...</span>
              </div>
            ) : (
              <>
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg border border-green-200">
                    <p className="text-sm font-medium text-green-700">Total Revenue</p>
                    <p className="text-3xl font-bold text-green-900 mt-1">
                      {revenueData ? formatCurrency(revenueData.totalRevenue) : "₱0"}
                    </p>
                    <p className="text-xs text-green-600 mt-2">
                      {viewPeriod === "yearly" ? revenueData?.year : `${revenueData?.monthName} ${revenueData?.year}`}
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200">
                    <p className="text-sm font-medium text-blue-700">Completed Events</p>
                    <p className="text-3xl font-bold text-blue-900 mt-1">{revenueData?.completedEvents || 0}</p>
                    <p className="text-xs text-blue-600 mt-2">Fully paid bookings</p>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg border border-purple-200">
                    <p className="text-sm font-medium text-purple-700">Growth Rate</p>
                    <div className="flex items-center gap-2 mt-1">
                      {revenueData && revenueData.percentageChange >= 0 ? (
                        <TrendingUp className="h-6 w-6 text-green-600" />
                      ) : (
                        <TrendingDown className="h-6 w-6 text-red-600" />
                      )}
                      <p
                        className={`text-3xl font-bold ${revenueData && revenueData.percentageChange >= 0 ? "text-green-900" : "text-red-900"}`}
                      >
                        {revenueData?.percentageChange >= 0 ? "+" : ""}
                        {revenueData?.percentageChange || 0}%
                      </p>
                    </div>
                    <p className="text-xs text-purple-600 mt-2">vs last {viewPeriod === "yearly" ? "year" : "month"}</p>
                  </div>
                </div>

                {/* Monthly Revenue Trend */}
                {monthlyData.length > 0 && (
                  <div className="bg-white p-6 rounded-lg border">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-green-600" />
                      12-Month Revenue Trend
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={monthlyData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip
                          formatter={(value: number, name: string) => {
                            if (name === "revenue") return [formatCurrency(value), "Revenue"]
                            return [value, "Events"]
                          }}
                        />
                        <Legend />
                        <Bar dataKey="revenue" fill="#22c55e" name="Revenue" radius={[8, 8, 0, 0]} />
                        <Bar dataKey="events" fill="#3b82f6" name="Events" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {/* Event Type Distribution & Peak Months */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {eventTypeData.length > 0 && (
                    <div className="bg-white p-6 rounded-lg border">
                      <h3 className="text-lg font-semibold mb-4">Event Type Distribution</h3>
                      <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                          <Pie
                            data={eventTypeData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={(entry) => `${entry.name}: ${entry.percentage}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="count"
                          >
                            {eventTypeData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  )}

                  {peakMonths.length > 0 && (
                    <div className="bg-white p-6 rounded-lg border">
                      <h3 className="text-lg font-semibold mb-4">Peak Months Analysis</h3>
                      <div className="space-y-3">
                        {peakMonths.slice(0, 3).map((peak, index) => (
                          <div
                            key={peak.month}
                            className="p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border border-orange-200"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <Badge className="bg-orange-600 text-white">#{index + 1} Peak Month</Badge>
                              <span className="text-sm font-medium text-gray-600">{peak.events} events</span>
                            </div>
                            <h4 className="text-xl font-bold text-gray-900">{peak.month}</h4>
                            <p className="text-sm text-gray-700 mt-1">
                              Revenue:{" "}
                              <span className="font-semibold text-green-600">{formatCurrency(peak.revenue)}</span>
                            </p>
                            <p className="text-sm text-gray-700">
                              Top Event: <span className="font-semibold text-blue-600">{peak.topEventType}</span>
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Event Type Breakdown Table */}
                {eventTypeData.length > 0 && (
                  <div className="bg-white p-6 rounded-lg border">
                    <h3 className="text-lg font-semibold mb-4">Event Type Breakdown</h3>
                    <div className="space-y-2">
                      {eventTypeData.map((type, index) => (
                        <div key={type.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-4 h-4 rounded-full"
                              style={{ backgroundColor: COLORS[index % COLORS.length] }}
                            />
                            <span className="font-medium">{type.name}</span>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">{type.count} events</p>
                            <p className="text-sm text-gray-500">{type.percentage}% of total</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Insights Section */}
                {peakMonths.length > 0 && eventTypeData.length > 0 && (
                  <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                    <h3 className="text-lg font-semibold mb-3 text-blue-900">Key Insights</h3>
                    <ul className="space-y-2 text-sm text-blue-800">
                      <li className="flex items-start gap-2">
                        <span className="font-bold mt-0.5">•</span>
                        <span>
                          Your busiest months are{" "}
                          {peakMonths
                            .slice(0, 3)
                            .map((p) => p.month)
                            .join(", ")}
                          . Consider increasing inventory and staff during these periods.
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="font-bold mt-0.5">•</span>
                        <span>
                          The most popular event type is <strong>{eventTypeData[0]?.name}</strong> with{" "}
                          {eventTypeData[0]?.count} bookings ({eventTypeData[0]?.percentage}% of total).
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="font-bold mt-0.5">•</span>
                        <span>
                          Peak season revenue reaches {formatCurrency(peakMonths[0]?.revenue || 0)} in{" "}
                          {peakMonths[0]?.month}.
                        </span>
                      </li>
                    </ul>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="flex justify-end pt-4 border-t">
            <Button variant="outline" onClick={() => setShowRevenue(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
