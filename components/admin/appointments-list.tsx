"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import {
  Search,
  MoreVertical,
  Filter,
  RefreshCw,
  Eye,
  Edit,
  UtensilsCrossed,
  ChefHat,
  Cake,
  Coffee,
  AlertCircle,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { getTimeRange } from "@/lib/utils"
import { Alert, AlertDescription } from "@/components/ui/alert"

type MenuItem = {
  id: string
  name: string
  category: string
  description?: string
  price?: number
}

type MenuItems = {
  main_courses: MenuItem[]
  extras: MenuItem[]
}

type Appointment = {
  id: string
  user_id: string
  event_type: string
  event_date: string
  event_time: string
  guest_count: number
  venue_address?: string
  budget_min?: number
  budget_max?: number
  special_requests?: string
  status: string
  admin_notes?: string
  created_at: string
  updated_at: string
  tbl_users: {
    id: string
    full_name: string
    email: string
    phone?: string
  }
  celebrant_gender?: string
  selected_menu?: any
  menu_items?: MenuItems
}

export default function AppointmentsList() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [viewDetailsOpen, setViewDetailsOpen] = useState(false)
  const [statusUpdateOpen, setStatusUpdateOpen] = useState(false)
  const [newStatus, setNewStatus] = useState("")
  const [adminNotes, setAdminNotes] = useState("")
  const [updating, setUpdating] = useState(false)
  const [authError, setAuthError] = useState(false)
  const { toast } = useToast()

  const fetchAppointments = async () => {
    try {
      setLoading(true)

      const timestamp = new Date().getTime()
      const response = await fetch(`/api/admin/appointments?_=${timestamp}`, {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
      })

      const data = await response.json()

      console.log("Fetched appointments data:", data)

      if (data.success) {
        setAppointments(data.appointments)
        console.log("Set appointments:", data.appointments.length, "appointments")

        // Log menu items for debugging
        if (data.appointments.length > 0) {
          console.log("First appointment menu_items:", data.appointments[0].menu_items)
        }
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch appointments",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching appointments:", error)
      toast({
        title: "Error",
        description: "Failed to fetch appointments",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const updateAppointmentStatus = async () => {
    if (!selectedAppointment || !newStatus) return

    try {
      setUpdating(true)
      setAuthError(false)

      console.log("Updating appointment status:", {
        id: selectedAppointment.id,
        newStatus,
        notes: adminNotes,
      })

      const response = await fetch(`/api/admin/appointments/${selectedAppointment.id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
        },
        credentials: "include",
        body: JSON.stringify({
          status: newStatus,
          notes: adminNotes,
        }),
      })

      const data = await response.json()

      console.log("Update response:", data)

      if (response.status === 401) {
        setAuthError(true)
        toast({
          title: "Authentication Error",
          description: "Your session may have expired. Please log out and log back in.",
          variant: "destructive",
        })
        return
      }

      if (data.success) {
        toast({
          title: "Success",
          description: "Appointment status updated successfully",
        })

        setStatusUpdateOpen(false)
        setNewStatus("")
        setAdminNotes("")
        setAuthError(false)

        console.log("Forcing refresh after update...")
        await fetchAppointments()

        console.log("Refresh complete")
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to update appointment status",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error updating appointment status:", error)
      toast({
        title: "Error",
        description: "Failed to update appointment status",
        variant: "destructive",
      })
    } finally {
      setUpdating(false)
    }
  }

  useEffect(() => {
    fetchAppointments()
  }, [])

  const filteredAppointments = appointments.filter((appointment) => {
    if (filter !== "all" && appointment.status !== filter) {
      return false
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return (
        appointment.tbl_users.full_name.toLowerCase().includes(query) ||
        appointment.id.toLowerCase().includes(query) ||
        appointment.event_type.toLowerCase().includes(query) ||
        appointment.tbl_users.email.toLowerCase().includes(query)
      )
    }

    return true
  })

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
      case "cancelled":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            Cancelled
          </Badge>
        )
      case "completed":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            Completed
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
      case "TASTING_COMPLETED":
        return (
          <Badge variant="outline" className="bg-teal-50 text-teal-700 border-teal-200">
            Tasting Completed
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const viewDetails = (appointment: Appointment) => {
    console.log("=== Viewing appointment details ===")
    console.log("Appointment:", appointment)
    console.log("Menu items:", appointment.menu_items)
    setSelectedAppointment(appointment)
    setViewDetailsOpen(true)
  }

  const openStatusUpdate = (appointment: Appointment) => {
    setSelectedAppointment(appointment)
    setNewStatus(appointment.status)
    setAdminNotes(appointment.admin_notes || "")
    setAuthError(false)
    setStatusUpdateOpen(true)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getCategoryIcon = (category: string) => {
    if (category.startsWith("main_")) {
      return <ChefHat className="h-4 w-4" />
    } else if (category === "dessert") {
      return <Cake className="h-4 w-4" />
    } else if (category === "beverage") {
      return <Coffee className="h-4 w-4" />
    }
    return <UtensilsCrossed className="h-4 w-4" />
  }

  const getCategoryName = (category: string) => {
    const categoryMap: { [key: string]: string } = {
      main_beef: "Beef",
      main_pork: "Pork",
      main_chicken: "Chicken",
      main_fish: "Fish/Seafood",
      main_vegetable: "Vegetables",
      pasta: "Pasta",
      dessert: "Dessert",
      beverage: "Beverage",
    }
    return categoryMap[category] || category
  }

  const hasMenuItems = (appointment: Appointment | null) => {
    if (!appointment || !appointment.menu_items) {
      return false
    }
    const menuItems = appointment.menu_items
    const hasMain = Array.isArray(menuItems.main_courses) && menuItems.main_courses.length > 0
    const hasExtras = Array.isArray(menuItems.extras) && menuItems.extras.length > 0
    return hasMain || hasExtras
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-gray-500" />
        <span className="ml-2 text-gray-500">Loading appointments...</span>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search appointments..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Appointments</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="PENDING_TASTING_CONFIRMATION">Pending Tasting</SelectItem>
              <SelectItem value="TASTING_CONFIRMED">Tasting Confirmed</SelectItem>
              <SelectItem value="TASTING_RESCHEDULE_REQUESTED">Tasting Reschedule</SelectItem>
              <SelectItem value="TASTING_COMPLETED">Tasting Completed</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={fetchAppointments} variant="outline" size="sm" disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Client Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Event Type</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Guests</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAppointments.length > 0 ? (
              filteredAppointments.map((appointment) => (
                <TableRow key={appointment.id}>
                  <TableCell className="font-medium">{appointment.id.slice(0, 8)}...</TableCell>
                  <TableCell>{appointment.tbl_users.full_name}</TableCell>
                  <TableCell>{appointment.tbl_users.email}</TableCell>
                  <TableCell>{appointment.event_type}</TableCell>
                  <TableCell>{formatDate(appointment.event_date)}</TableCell>
                  <TableCell>{getTimeRange(appointment.event_time)}</TableCell>
                  <TableCell>{getStatusBadge(appointment.status)}</TableCell>
                  <TableCell>{appointment.guest_count}</TableCell>
                  <TableCell>{formatDate(appointment.created_at)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => viewDetails(appointment)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openStatusUpdate(appointment)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Update Status
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={10} className="h-24 text-center">
                  No appointments found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={viewDetailsOpen} onOpenChange={setViewDetailsOpen}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Appointment Details</DialogTitle>
            <DialogDescription>Viewing details for appointment {selectedAppointment?.id}</DialogDescription>
          </DialogHeader>
          {selectedAppointment && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Client Name</p>
                  <p className="font-medium">{selectedAppointment.tbl_users.full_name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Email</p>
                  <p className="font-medium">{selectedAppointment.tbl_users.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Phone</p>
                  <p className="font-medium">{selectedAppointment.tbl_users.phone || "Not provided"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Event Type</p>
                  <p className="font-medium">{selectedAppointment.event_type}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Event Date</p>
                  <p className="font-medium">{formatDate(selectedAppointment.event_date)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Event Time</p>
                  <p className="font-medium">{getTimeRange(selectedAppointment.event_time)}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Guest Count</p>
                  <p className="font-medium">{selectedAppointment.guest_count}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Status</p>
                  <div>{getStatusBadge(selectedAppointment.status)}</div>
                </div>
              </div>
              {selectedAppointment.venue_address && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Venue Address</p>
                  <p className="font-medium">{selectedAppointment.venue_address}</p>
                </div>
              )}

              {selectedAppointment.celebrant_gender && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Gender</p>
                  <p className="font-medium capitalize">
                    {selectedAppointment.celebrant_gender === "other"
                      ? "Rather not say"
                      : selectedAppointment.celebrant_gender}
                  </p>
                </div>
              )}

              {hasMenuItems(selectedAppointment) && (
                <div className="border-t pt-4">
                  <div className="flex items-center gap-2 mb-4">
                    <UtensilsCrossed className="h-5 w-5 text-gray-700" />
                    <h3 className="text-base font-semibold text-gray-900">Selected Menu Items</h3>
                  </div>

                  {selectedAppointment.menu_items?.main_courses &&
                    selectedAppointment.menu_items.main_courses.length > 0 && (
                      <div className="mb-4">
                        <div className="flex items-center gap-2 mb-3">
                          <ChefHat className="h-4 w-4 text-gray-600" />
                          <p className="text-sm font-medium text-gray-700">Main Courses</p>
                          <span className="text-xs text-gray-500">(1 of each per guest)</span>
                        </div>
                        <div className="space-y-2">
                          {selectedAppointment.menu_items.main_courses.map((item, index) => (
                            <div
                              key={`main-${index}`}
                              className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                            >
                              <div className="mt-0.5">{getCategoryIcon(item.category)}</div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                  <p className="font-medium text-sm text-gray-900">{item.name}</p>
                                  <span className="text-xs text-gray-500 whitespace-nowrap">
                                    {getCategoryName(item.category)}
                                  </span>
                                </div>
                                {item.description && (
                                  <p className="text-xs text-gray-600 mt-1 line-clamp-2">{item.description}</p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  {selectedAppointment.menu_items?.extras && selectedAppointment.menu_items.extras.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <UtensilsCrossed className="h-4 w-4 text-gray-600" />
                        <p className="text-sm font-medium text-gray-700">Additional Items</p>
                      </div>
                      <div className="space-y-2">
                        {selectedAppointment.menu_items.extras.map((item, index) => (
                          <div
                            key={`extra-${index}`}
                            className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                          >
                            <div className="mt-0.5">{getCategoryIcon(item.category)}</div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <p className="font-medium text-sm text-gray-900">{item.name}</p>
                                <span className="text-xs text-gray-500 whitespace-nowrap">
                                  {getCategoryName(item.category)}
                                </span>
                              </div>
                              {item.description && (
                                <p className="text-xs text-gray-600 mt-1 line-clamp-2">{item.description}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {!hasMenuItems(selectedAppointment) && (
                <div className="border-t pt-4">
                  <div className="flex items-center gap-2 mb-3">
                    <UtensilsCrossed className="h-5 w-5 text-gray-400" />
                    <h3 className="text-base font-semibold text-gray-500">Selected Menu Items</h3>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-center">
                    <p className="text-sm text-gray-500">No menu items selected for this appointment</p>
                  </div>
                </div>
              )}

              <div className="border-t pt-4">
                <p className="text-sm font-medium text-gray-500 mb-2">Additional Requests</p>
                {selectedAppointment.special_requests ? (
                  <div className="bg-gray-50 p-3 rounded-md border">
                    <p className="text-sm whitespace-pre-wrap">{selectedAppointment.special_requests}</p>
                  </div>
                ) : (
                  <div className="bg-gray-50 p-3 rounded-md border">
                    <p className="text-sm text-gray-400 italic">No additional requests provided</p>
                  </div>
                )}
              </div>

              {selectedAppointment.admin_notes && (
                <div className="border-t pt-4">
                  <p className="text-sm font-medium text-gray-500 mb-2">Admin Notes</p>
                  <div className="bg-blue-50 p-3 rounded-md border border-blue-200">
                    <p className="text-sm whitespace-pre-wrap">{selectedAppointment.admin_notes}</p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 border-t pt-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Created</p>
                  <p className="text-sm">{formatDateTime(selectedAppointment.created_at)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Last Updated</p>
                  <p className="text-sm">{formatDateTime(selectedAppointment.updated_at)}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDetailsOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={statusUpdateOpen} onOpenChange={setStatusUpdateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Update Appointment Status</DialogTitle>
            <DialogDescription>Update the status for appointment {selectedAppointment?.id}</DialogDescription>
          </DialogHeader>

          {authError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Authentication failed. Please log out and log back in, then try again.
              </AlertDescription>
            </Alert>
          )}

          <div className="grid gap-4 py-4">
            <div>
              <label className="text-sm font-medium text-gray-500">New Status</label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select new status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="PENDING_TASTING_CONFIRMATION">Pending Tasting</SelectItem>
                  <SelectItem value="TASTING_CONFIRMED">Tasting Confirmed</SelectItem>
                  <SelectItem value="TASTING_RESCHEDULE_REQUESTED">Tasting Reschedule</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="TASTING_COMPLETED">Tasting Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Admin Notes (Optional)</label>
              <Textarea
                placeholder="Add any notes about this status change..."
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStatusUpdateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={updateAppointmentStatus} disabled={updating || !newStatus}>
              {updating ? "Updating..." : "Update Status"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
