"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Search, Plus, ClipboardList, Calendar, Users, Utensils } from "lucide-react"

export default function ServicesPage() {
  const [searchQuery, setSearchQuery] = useState("")

  // Mock data for services
  const services = [
    {
      id: "SVC-001",
      name: "Wedding Catering",
      description: "Full-service catering for weddings with customizable menu options.",
      price: "Starting at ₱85,000",
      availability: "Available",
      icon: Utensils,
    },
    {
      id: "SVC-002",
      name: "Corporate Events",
      description: "Professional catering services for business meetings, conferences, and corporate gatherings.",
      price: "Starting at ₱50,000",
      availability: "Available",
      icon: Users,
    },
    {
      id: "SVC-003",
      name: "Birthday Parties",
      description: "Catering packages for birthday celebrations with themed menu options.",
      price: "Starting at ₱35,000",
      availability: "Available",
      icon: Calendar,
    },
    {
      id: "SVC-004",
      name: "Menu Tasting",
      description: "Sample menu options before booking your event. Fee waived with booking.",
      price: "₱2,500",
      availability: "Limited Slots",
      icon: ClipboardList,
    },
    {
      id: "SVC-005",
      name: "Debut Packages",
      description: "Special catering packages designed specifically for debut celebrations.",
      price: "Starting at ₱70,000",
      availability: "Available",
      icon: Calendar,
    },
    {
      id: "SVC-006",
      name: "On-site Cooking",
      description: "Live cooking stations and on-site food preparation for a unique dining experience.",
      price: "Additional ₱15,000",
      availability: "Available",
      icon: Utensils,
    },
  ]

  const filteredServices = services.filter((service) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return (
        service.name.toLowerCase().includes(query) ||
        service.description.toLowerCase().includes(query) ||
        service.id.toLowerCase().includes(query)
      )
    }
    return true
  })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Services</h1>
          <p className="text-gray-500">Manage available services for walk-in customers</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-rose-600 hover:bg-rose-700">
              <Plus className="mr-2 h-4 w-4" />
              New Service
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Add New Service</DialogTitle>
              <DialogDescription>Enter the details for the new service offering.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="serviceName">Service Name</label>
                  <Input id="serviceName" placeholder="Enter service name" />
                </div>
                <div className="space-y-2">
                  <label htmlFor="serviceId">Service ID</label>
                  <Input id="serviceId" placeholder="e.g., SVC-007" />
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="description">Description</label>
                <Textarea id="description" placeholder="Enter service description" rows={3} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="price">Price</label>
                  <Input id="price" placeholder="e.g., Starting at ₱50,000" />
                </div>
                <div className="space-y-2">
                  <label htmlFor="availability">Availability</label>
                  <Input id="availability" placeholder="e.g., Available, Limited Slots" />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="active" />
                <Label htmlFor="active">Service is active and can be booked</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline">Cancel</Button>
              <Button className="bg-rose-600 hover:bg-rose-700">Add Service</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search services..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Tabs defaultValue="all">
            <TabsList>
              <TabsTrigger value="all">All Services</TabsTrigger>
              <TabsTrigger value="available">Available</TabsTrigger>
              <TabsTrigger value="limited">Limited</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredServices.map((service) => (
          <Card key={service.id} className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="flex items-start gap-3">
                  <div className="bg-rose-100 p-2 rounded-md">
                    <service.icon className="h-5 w-5 text-rose-600" />
                  </div>
                  <div>
                    <CardTitle>{service.name}</CardTitle>
                    <CardDescription className="text-xs mt-1">{service.id}</CardDescription>
                  </div>
                </div>
                <Badge
                  className={
                    service.availability === "Available"
                      ? "bg-green-100 text-green-800 hover:bg-green-100"
                      : "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                  }
                >
                  {service.availability}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500">{service.description}</p>
              <p className="text-sm font-medium mt-2">{service.price}</p>
            </CardContent>
            <CardFooter className="flex justify-between border-t pt-4">
              <Button variant="outline" size="sm">
                Edit
              </Button>
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="sm" className="bg-rose-600 hover:bg-rose-700">
                    Book Now
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Book {service.name}</DialogTitle>
                    <DialogDescription>Create a new appointment for this service.</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label htmlFor="clientName">Client Name</label>
                        <Input id="clientName" placeholder="Enter client name" />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="contactNumber">Contact Number</label>
                        <Input id="contactNumber" placeholder="Enter contact number" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label htmlFor="date">Date</label>
                        <Input id="date" type="date" />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="time">Time</label>
                        <Input id="time" type="time" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="notes">Notes</label>
                      <Textarea id="notes" placeholder="Enter any additional notes" rows={3} />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline">Cancel</Button>
                    <Button className="bg-rose-600 hover:bg-rose-700">Book Appointment</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
