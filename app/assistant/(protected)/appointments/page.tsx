"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { WalkInForm } from "@/components/assistant/walk-in-form"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, Filter, Search, User, MapPin, Users } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Mock appointment data
const APPOINTMENTS = [
  {
    id: "1",
    customerName: "Maria Santos",
    date: "2025-04-29",
    time: "10:00 AM",
    service: "Wedding Catering",
    guests: 50,
    status: "confirmed",
    location: "Quezon City",
    contact: "+63 912 345 6789",
  },
  {
    id: "2",
    customerName: "Juan Dela Cruz",
    date: "2025-04-29",
    time: "2:00 PM",
    service: "Birthday Party",
    guests: 25,
    status: "pending",
    location: "Makati City",
    contact: "+63 923 456 7890",
  },
  {
    id: "3",
    customerName: "Ana Reyes",
    date: "2025-04-30",
    time: "11:30 AM",
    service: "Corporate Event",
    guests: 100,
    status: "confirmed",
    location: "Taguig City",
    contact: "+63 934 567 8901",
  },
  {
    id: "4",
    customerName: "Pedro Lim",
    date: "2025-04-30",
    time: "4:00 PM",
    service: "Anniversary Celebration",
    guests: 30,
    status: "cancelled",
    location: "Pasig City",
    contact: "+63 945 678 9012",
  },
  {
    id: "5",
    customerName: "Sofia Garcia",
    date: "2025-05-01",
    time: "1:00 PM",
    service: "Baptismal Reception",
    guests: 40,
    status: "confirmed",
    location: "Mandaluyong City",
    contact: "+63 956 789 0123",
  },
]

export default function AppointmentsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  const filteredAppointments = APPOINTMENTS.filter((appointment) => {
    const matchesSearch =
      appointment.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.location.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || appointment.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Appointments</h1>
      </div>

      <Tabs defaultValue="upcoming">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="past">Past</TabsTrigger>
            <TabsTrigger value="new">New Appointment</TabsTrigger>
          </TabsList>

          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search appointments..."
                className="w-[200px] pl-8 md:w-[300px]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <TabsContent value="upcoming" className="space-y-4 mt-6">
          {filteredAppointments.length === 0 ? (
            <div className="flex h-[400px] items-center justify-center rounded-md border border-dashed">
              <div className="text-center">
                <h3 className="text-lg font-medium">No appointments found</h3>
                <p className="text-sm text-muted-foreground">
                  Try adjusting your search or filter to find what you're looking for.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredAppointments.map((appointment) => (
                <Card key={appointment.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <CardTitle>{appointment.customerName}</CardTitle>
                      <Badge className={getStatusColor(appointment.status)}>
                        {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                      </Badge>
                    </div>
                    <CardDescription>{appointment.service}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center">
                        <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>{new Date(appointment.date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>{appointment.time}</span>
                      </div>
                      <div className="flex items-center">
                        <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>{appointment.location}</span>
                      </div>
                      <div className="flex items-center">
                        <Users className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>{appointment.guests} guests</span>
                      </div>
                      <div className="flex items-center">
                        <User className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>{appointment.contact}</span>
                      </div>
                    </div>
                    <div className="mt-4 flex space-x-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        Edit
                      </Button>
                      <Button size="sm" className="flex-1">
                        Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="past">
          <div className="flex h-[400px] items-center justify-center rounded-md border border-dashed">
            <div className="text-center">
              <h3 className="text-lg font-medium">Past Appointments</h3>
              <p className="text-sm text-muted-foreground">View history of completed appointments.</p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="new">
          <WalkInForm />
        </TabsContent>
      </Tabs>
    </div>
  )
}
