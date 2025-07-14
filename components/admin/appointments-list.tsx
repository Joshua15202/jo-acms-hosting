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
import { Search, MoreVertical, Filter, RefreshCw, Eye, Edit } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

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
  const { toast } = useToast()

  // Fetch appointments
  const fetchAppointments = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/admin/appointments")
      const data = await response.json()

      if (data.success) {
        setAppointments(data.appointments)
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

  // Update appointment status
  const updateAppointmentStatus = async () => {
    if (!selectedAppointment || !newStatus) return

    try {
      setUpdating(true)
      const response = await fetch(`/api/admin/appointments/${selectedAppointment.id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: newStatus,
          notes: adminNotes,
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Success",
          description: "Appointment status updated successfully",
        })
        setStatusUpdateOpen(false)
        setNewStatus("")
        setAdminNotes("")
        fetchAppointments() // Refresh the list
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

  // Auto-refresh every 30 seconds to catch status updates
  useEffect(() => {
    const interval = setInterval(() => {
      fetchAppointments()
    }, 30000) // Refresh every 30 seconds

    return () => clearInterval(interval)
  }, [])

  const filteredAppointments = appointments.filter((appointment) => {
    // Filter by status
    if (filter !== "all" && appointment.status !== filter) {
      return false
    }

    // Filter by search query
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
    setSelectedAppointment(appointment)
    setViewDetailsOpen(true)
  }

  const openStatusUpdate = (appointment: Appointment) => {
    setSelectedAppointment(appointment)
    setNewStatus(appointment.status)
    setAdminNotes(appointment.admin_notes || "")
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
                  <TableCell>{appointment.event_time}</TableCell>
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

      {/* View Details Dialog */}
      <Dialog open={viewDetailsOpen} onOpenChange={setViewDetailsOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Appointment Details</DialogTitle>
            <DialogDescription>Viewing details for appointment {selectedAppointment?.id}</DialogDescription>
          </DialogHeader>
          {selectedAppointment && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Client Name</p>
                  <p>{selectedAppointment.tbl_users.full_name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Email</p>
                  <p>{selectedAppointment.tbl_users.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Phone</p>
                  <p>{selectedAppointment.tbl_users.phone || "Not provided"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Event Type</p>
                  <p>{selectedAppointment.event_type}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Event Date</p>
                  <p>{formatDate(selectedAppointment.event_date)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Event Time</p>
                  <p>{selectedAppointment.event_time}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Guest Count</p>
                  <p>{selectedAppointment.guest_count}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Status</p>
                  <div>{getStatusBadge(selectedAppointment.status)}</div>
                </div>
              </div>
              {selectedAppointment.venue_address && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Venue Address</p>
                  <p>{selectedAppointment.venue_address}</p>
                </div>
              )}
              {selectedAppointment.special_requests && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Special Requests</p>
                  <p>{selectedAppointment.special_requests}</p>
                </div>
              )}
              {selectedAppointment.admin_notes && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Admin Notes</p>
                  <p>{selectedAppointment.admin_notes}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Created</p>
                  <p>{formatDateTime(selectedAppointment.created_at)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Last Updated</p>
                  <p>{formatDateTime(selectedAppointment.updated_at)}</p>
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

      {/* Status Update Dialog */}
      <Dialog open={statusUpdateOpen} onOpenChange={setStatusUpdateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Update Appointment Status</DialogTitle>
            <DialogDescription>Update the status for appointment {selectedAppointment?.id}</DialogDescription>
          </DialogHeader>
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
