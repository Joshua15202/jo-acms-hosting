"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import BookingForm from "@/components/booking-form"
import AIRecommendation from "@/components/ai-recommendation"
import SmartCalendar from "@/components/smart-calendar"
import { useAuth } from "@/components/user-auth-provider"
import { useToast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"

interface PersonalInfo {
  firstName: string
  lastName: string
  email: string
  phone: string
}

const timeSlots = [
  "Breakfast (6AM - 10AM)",
  "Brunch (10AM - 2PM)",
  "Lunch (11AM - 3PM)",
  "Afternoon (2PM - 6PM)",
  "Dinner (5PM - 9PM)",
  "Evening (7PM - 11PM)",
]

const eventTypes = [
  { value: "birthday", label: "Birthday Party" },
  { value: "wedding", label: "Wedding" },
  { value: "debut", label: "Debut" },
  { value: "anniversary", label: "Anniversary" },
  { value: "corporate", label: "Corporate Event" },
  { value: "other", label: "Other" },
]

const backdropOptions = [
  { value: "SINGLE_PANEL_BACKDROP", label: "Single Panel Backdrop - ₱7,000", price: 7000 },
  { value: "DOUBLE_PANEL_BACKDROP", label: "Double Panel Backdrop - ₱8,000", price: 8000 },
  { value: "TRIPLE_PANEL_BACKDROP", label: "Triple Panel Backdrop - ₱10,000", price: 10000 },
]

export default function BookAppointmentPage() {
  const { user, loading } = useAuth()
  const isAuthenticated = !!user
  const router = useRouter()
  const { toast } = useToast()

  const [personalInfoCompleted, setPersonalInfoCompleted] = useState(false)
  const [schedulingCompleted, setSchedulingCompleted] = useState(false)
  const [eventTypeSelected, setEventTypeSelected] = useState(false)
  const [backdropSelected, setBackdropSelected] = useState(false) // New state for backdrop selection
  const [personalInfo, setPersonalInfo] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  })

  const [schedulingInfo, setSchedulingInfo] = useState({
    eventDate: "",
    timeSlot: "",
  })

  // Auto-fill personal info when user data is available
  useEffect(() => {
    if (user && !personalInfoCompleted) {
      // Safely handle user.name which might be undefined
      const userName = user.name || ""
      const nameParts = userName.split(" ")
      const firstName = nameParts[0] || ""
      const lastName = nameParts.slice(1).join(" ") || ""

      setPersonalInfo({
        firstName: firstName,
        lastName: lastName,
        email: user.email || "",
        phone: user.phone || "",
      })
    }
  }, [user, personalInfoCompleted])

  const [eventType, setEventType] = useState("")
  const [celebrantInfo, setCelebrantInfo] = useState({
    celebrantName: "",
    celebrantAge: "",
    celebrantGender: "",
    debutanteGender: "",
    groomName: "",
    brideName: "",
    additionalEventInfo: "",
  })

  const [backdropStyle, setBackdropStyle] = useState("")

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login?redirect=/book-appointment")
    }
  }, [isAuthenticated, loading, router])

  const isValidEmail = (email: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  const isValidPhilippineMobile = (phone: string): boolean => /^(09|\+639)\d{9}$/.test(phone)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPersonalInfo((prev) => ({ ...prev, [name]: value }))
  }

  const handleCelebrantInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setCelebrantInfo((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    if (name === "eventType") {
      setEventType(value)
      // Reset backdrop selection when event type changes
      setBackdropStyle("")
      setBackdropSelected(false)
    } else {
      setCelebrantInfo((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handlePersonalInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (!personalInfo.firstName.trim()) {
      toast({ title: "Validation Error", description: "First Name is required.", variant: "destructive" })
      return
    }
    if (!personalInfo.lastName.trim()) {
      toast({ title: "Validation Error", description: "Last Name is required.", variant: "destructive" })
      return
    }
    if (!personalInfo.email.trim() || !isValidEmail(personalInfo.email)) {
      toast({
        title: "Validation Error",
        description: "A valid Email Address is required.",
        variant: "destructive",
      })
      return
    }
    if (!personalInfo.phone.trim() || !isValidPhilippineMobile(personalInfo.phone)) {
      toast({
        title: "Validation Error",
        description: "A valid Philippine Mobile Number is required.",
        variant: "destructive",
      })
      return
    }

    setPersonalInfoCompleted(true)
    toast({
      title: "Personal Information Saved",
      description: "Please select your preferred date and time.",
    })
  }

  const handleDateTimeSelect = (date: string, timeSlot: string) => {
    setSchedulingInfo({ eventDate: date, timeSlot })
  }

  const handleSchedulingSubmit = () => {
    if (!schedulingInfo.eventDate || !schedulingInfo.timeSlot) {
      toast({
        title: "Validation Error",
        description: "Please select both date and time slot.",
        variant: "destructive",
      })
      return
    }

    setSchedulingCompleted(true)
    toast({
      title: "Schedule Selected",
      description: "Please select your event type to continue.",
    })
  }

  const handleEventTypeSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!eventType) {
      toast({ title: "Validation Error", description: "Event Type is required.", variant: "destructive" })
      return
    }

    // Validate celebrant info for specific event types
    if (eventType === "birthday") {
      if (!celebrantInfo.celebrantName.trim()) {
        toast({
          title: "Validation Error",
          description: "Celebrant's Name is required for Birthday events.",
          variant: "destructive",
        })
        return
      }
      if (!celebrantInfo.celebrantAge.trim()) {
        toast({
          title: "Validation Error",
          description: "Celebrant's Age is required for Birthday events.",
          variant: "destructive",
        })
        return
      }
      if (!celebrantInfo.celebrantGender) {
        toast({
          title: "Validation Error",
          description: "Celebrant's Gender is required for Birthday events.",
          variant: "destructive",
        })
        return
      }
    }

    if (eventType === "debut") {
      if (!celebrantInfo.celebrantName.trim()) {
        toast({
          title: "Validation Error",
          description: "Debutante's Name is required for Debut events.",
          variant: "destructive",
        })
        return
      }
      if (!celebrantInfo.debutanteGender) {
        toast({
          title: "Validation Error",
          description: "Debutante's Gender is required for Debut events.",
          variant: "destructive",
        })
        return
      }
    }

    if (eventType === "wedding") {
      if (!celebrantInfo.groomName.trim()) {
        toast({
          title: "Validation Error",
          description: "Groom's Name is required for Wedding events.",
          variant: "destructive",
        })
        return
      }
      if (!celebrantInfo.brideName.trim()) {
        toast({
          title: "Validation Error",
          description: "Bride's Name is required for Wedding events.",
          variant: "destructive",
        })
        return
      }
    }

    if (eventType === "other" && !celebrantInfo.additionalEventInfo.trim()) {
      toast({
        title: "Validation Error",
        description: "Please specify the type of event for 'Other' category.",
        variant: "destructive",
      })
      return
    }

    setEventTypeSelected(true)

    // For birthday events, don't show final success message yet
    if (eventType === "birthday") {
      toast({
        title: "Event Type Selected",
        description: "Please select your backdrop styling option.",
      })
    } else {
      toast({
        title: "Event Type Selected",
        description: "You can now choose between our booking options.",
      })
    }
  }

  const handleBackdropSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!backdropStyle) {
      toast({
        title: "Validation Error",
        description: "Please select a backdrop styling option.",
        variant: "destructive",
      })
      return
    }

    setBackdropSelected(true)
    toast({
      title: "Backdrop Style Selected",
      description: "You can now choose between our booking options.",
    })
  }

  const handleChangeEventType = () => {
    setEventTypeSelected(false)
    setBackdropSelected(false) // Reset backdrop selection
    setEventType("")
    setBackdropStyle("")
    setCelebrantInfo({
      celebrantName: "",
      celebrantAge: "",
      celebrantGender: "",
      debutanteGender: "",
      groomName: "",
      brideName: "",
      additionalEventInfo: "",
    })
  }

  if (loading) {
    return (
      <div className="container mx-auto py-10 px-4 md:px-6">
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rose-600"></div>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null // Will redirect in useEffect
  }

  return (
    <div className="container mx-auto py-10 px-4 md:px-6">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Book Your Catering Service</h1>
        <p className="mt-4 text-gray-500 md:text-xl">
          {!personalInfoCompleted
            ? "Please provide your personal information to get started."
            : !schedulingCompleted
              ? "Select your preferred date and time."
              : !eventTypeSelected
                ? "Please select your event type to continue."
                : eventType === "birthday" && !backdropSelected
                  ? "Select your backdrop styling option."
                  : "Choose between our standard booking form or try our AI-powered recommendation system."}
        </p>
      </div>

      {!personalInfoCompleted ? (
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-sm text-blue-700">
                  <strong>Note:</strong> Your name, email, and phone number have been automatically filled from your
                  account. You can edit them if needed.
                </p>
              </div>
              <form onSubmit={handlePersonalInfoSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <label htmlFor="firstName">First Name</label>
                    <Input
                      id="firstName"
                      name="firstName"
                      value={personalInfo.firstName}
                      onChange={handleInputChange}
                      placeholder="Enter your first name"
                      className="bg-gray-50"
                      required
                      
                    />
                  </div>
                  <div className="grid gap-2">
                    <label htmlFor="lastName">Last Name</label>
                    <Input
                      id="lastName"
                      name="lastName"
                      value={personalInfo.lastName}
                      onChange={handleInputChange}
                      placeholder="Enter your last name"
                      className="bg-gray-50"
                      required
                      
                    />
                  </div>
                </div>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <label htmlFor="email">Email Address</label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={personalInfo.email}
                      onChange={handleInputChange}
                      placeholder="Enter your email address"
                      className="bg-gray-50"
                      required
                      
                    />
                  </div>
                  <div className="grid gap-2">
                    <label htmlFor="phone">Phone Number</label>
                    <Input
                      id="phone"
                      name="phone"
                      value={personalInfo.phone}
                      onChange={handleInputChange}
                      placeholder="e.g., 09xxxxxxxxx or +639xxxxxxxxx"
                      className="bg-gray-50"
                      required
                      
                    />
                  </div>
                </div>
                <div className="flex justify-end pt-4">
                  <Button type="submit" className="bg-rose-600 hover:bg-rose-700">
                    Continue to Scheduling
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      ) : !schedulingCompleted ? (
        <div className="max-w-4xl mx-auto">
          <SmartCalendar
            onDateTimeSelect={handleDateTimeSelect}
            selectedDate={schedulingInfo.eventDate}
            selectedTimeSlot={schedulingInfo.timeSlot}
          />
          <div className="flex justify-between pt-6">
            <Button type="button" variant="outline" onClick={() => setPersonalInfoCompleted(false)}>
              Back to Personal Info
            </Button>
            <Button
              onClick={handleSchedulingSubmit}
              disabled={!schedulingInfo.eventDate || !schedulingInfo.timeSlot}
              className="bg-rose-600 hover:bg-rose-700"
            >
              Continue to Event Type
            </Button>
          </div>
        </div>
      ) : !eventTypeSelected ? (
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Event Information</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleEventTypeSubmit} className="space-y-4">
                <div className="grid gap-2">
                  <label htmlFor="eventType">Event Type *</label>
                  <Select
                    name="eventType"
                    value={eventType}
                    onValueChange={(value) => handleSelectChange("eventType", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select event type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="wedding">Wedding</SelectItem>
                      <SelectItem value="birthday">Birthday</SelectItem>
                      <SelectItem value="debut">Debut</SelectItem>
                      <SelectItem value="corporate">Corporate Event</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {eventType === "birthday" && (
                  <>
                    <div className="grid gap-2">
                      <label htmlFor="celebrantName">Celebrant's Name *</label>
                      <Input
                        id="celebrantName"
                        name="celebrantName"
                        type="text"
                        value={celebrantInfo.celebrantName}
                        onChange={handleCelebrantInputChange}
                        placeholder="Enter celebrant's name"
                      />
                    </div>
                    <div className="grid gap-2">
                      <label htmlFor="celebrantAge">Celebrant's Age *</label>
                      <Input
                        id="celebrantAge"
                        name="celebrantAge"
                        type="number"
                        value={celebrantInfo.celebrantAge}
                        onChange={handleCelebrantInputChange}
                        placeholder="Enter celebrant's age"
                        min="1"
                        max="150"
                      />
                    </div>
                    <div className="grid gap-2">
                      <label htmlFor="celebrantGender">Celebrant's Gender *</label>
                      <Select
                        name="celebrantGender"
                        value={celebrantInfo.celebrantGender}
                        onValueChange={(value) => handleSelectChange("celebrantGender", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select celebrant's gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}

                {eventType === "debut" && (
                  <>
                    <div className="grid gap-2">
                      <label htmlFor="celebrantName">Debutante's Name *</label>
                      <Input
                        id="celebrantName"
                        name="celebrantName"
                        type="text"
                        value={celebrantInfo.celebrantName}
                        onChange={handleCelebrantInputChange}
                        placeholder="Enter debutante's name"
                      />
                    </div>
                    <div className="grid gap-2">
                      <label htmlFor="debutanteGender">Debutante's Gender *</label>
                      <Select
                        name="debutanteGender"
                        value={celebrantInfo.debutanteGender}
                        onValueChange={(value) => handleSelectChange("debutanteGender", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select debutante's gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}

                {eventType === "wedding" && (
                  <>
                    <div className="grid gap-2">
                      <label htmlFor="groomName">Groom's Name *</label>
                      <Input
                        id="groomName"
                        name="groomName"
                        type="text"
                        value={celebrantInfo.groomName}
                        onChange={handleCelebrantInputChange}
                        placeholder="Enter groom's name"
                      />
                    </div>
                    <div className="grid gap-2">
                      <label htmlFor="brideName">Bride's Name *</label>
                      <Input
                        id="brideName"
                        name="brideName"
                        type="text"
                        value={celebrantInfo.brideName}
                        onChange={handleCelebrantInputChange}
                        placeholder="Enter bride's name"
                      />
                    </div>
                  </>
                )}

                {eventType === "other" && (
                  <div className="grid gap-2">
                    <label htmlFor="additionalEventInfo">Event Details *</label>
                    <Input
                      id="additionalEventInfo"
                      name="additionalEventInfo"
                      value={celebrantInfo.additionalEventInfo}
                      onChange={handleCelebrantInputChange}
                      placeholder="E.g., Anniversary, Christening, Graduation"
                    />
                  </div>
                )}

                <div className="flex justify-between pt-4">
                  <Button type="button" variant="outline" onClick={() => setSchedulingCompleted(false)}>
                    Back to Scheduling
                  </Button>
                  <Button type="submit" className="bg-rose-600 hover:bg-rose-700">
                    {eventType === "birthday" ? "Continue to Backdrop Selection" : "Continue to Booking Options"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      ) : eventType === "birthday" && !backdropSelected ? (
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Backdrop Styling Selection</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-sm text-blue-700">
                  <strong>Birthday Event:</strong> Please select your preferred backdrop styling for the celebration.
                </p>
              </div>
              <form onSubmit={handleBackdropSubmit} className="space-y-4">
                <div className="grid gap-4">
                  <div className="grid gap-3">
                    <label className="text-base font-medium">Backdrop Styling Options *</label>
                    <div className="space-y-3">
                      <label className="flex items-start space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                        <input
                          type="radio"
                          name="backdropStyle"
                          value="SINGLE_PANEL_BACKDROP"
                          checked={backdropStyle === "SINGLE_PANEL_BACKDROP"}
                          onChange={(e) => setBackdropStyle(e.target.value)}
                          className="text-rose-600 focus:ring-rose-500 mt-1"
                        />
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-2">
                            <div className="font-medium text-lg">Single Panel Backdrop</div>
                            <div className="text-lg font-bold text-rose-600">₱7,000</div>
                          </div>
                          <div className="text-sm text-gray-600 space-y-1">
                            <div className="font-medium mb-2">Includes:</div>
                            <ul className="list-disc list-inside space-y-1 text-xs">
                              <li>(3) Regular Colored Balloon Garlands</li>
                              <li>Cut-out Name</li>
                              <li>Faux Grass Carpet</li>
                              <li>Celebrant's Accent Chair</li>
                              <li>Cake Cylinder Plinth</li>
                            </ul>
                          </div>
                        </div>
                      </label>

                      <label className="flex items-start space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                        <input
                          type="radio"
                          name="backdropStyle"
                          value="DOUBLE_PANEL_BACKDROP"
                          checked={backdropStyle === "DOUBLE_PANEL_BACKDROP"}
                          onChange={(e) => setBackdropStyle(e.target.value)}
                          className="text-rose-600 focus:ring-rose-500 mt-1"
                        />
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-2">
                            <div className="font-medium text-lg">Double Panel Backdrop</div>
                            <div className="text-lg font-bold text-rose-600">₱8,000</div>
                          </div>
                          <div className="text-sm text-gray-600 space-y-1">
                            <div className="font-medium mb-2">Includes:</div>
                            <ul className="list-disc list-inside space-y-1 text-xs">
                              <li>(3) Regular Colored Balloon Garlands</li>
                              <li>Cut-out Name</li>
                              <li>Faux Grass Carpet</li>
                              <li>Celebrant's Accent Chair</li>
                              <li>Cake Cylinder Plinth</li>
                              <li>Basic Balloon Entrance Arch</li>
                            </ul>
                          </div>
                        </div>
                      </label>

                      <label className="flex items-start space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                        <input
                          type="radio"
                          name="backdropStyle"
                          value="TRIPLE_PANEL_BACKDROP"
                          checked={backdropStyle === "TRIPLE_PANEL_BACKDROP"}
                          onChange={(e) => setBackdropStyle(e.target.value)}
                          className="text-rose-600 focus:ring-rose-500 mt-1"
                        />
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-2">
                            <div className="font-medium text-lg">Triple Panel Backdrop</div>
                            <div className="text-lg font-bold text-rose-600">₱10,000</div>
                          </div>
                          <div className="text-sm text-gray-600 space-y-1">
                            <div className="font-medium mb-2">Includes:</div>
                            <ul className="list-disc list-inside space-y-1 text-xs">
                              <li>(3-4) Regular Colored Balloon Garlands</li>
                              <li>Cut-out Name</li>
                              <li>Faux Grass Carpet</li>
                              <li>Celebrant's Accent Chair</li>
                              <li>Cake Cylinder Plinth</li>
                              <li>Basic Balloon Entrance Arch</li>
                              <li>18x24 Sintra Board Welcome Signage</li>
                              <li>(2) 2D Styro Character Standee</li>
                            </ul>
                          </div>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between pt-4">
                  <Button type="button" variant="outline" onClick={() => setEventTypeSelected(false)}>
                    Back to Event Type
                  </Button>
                  <Button type="submit" className="bg-rose-600 hover:bg-rose-700">
                    Continue to Booking Options
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-semibold">Selected Event: {eventType}</h2>
              <p className="text-gray-600">
                Date: {schedulingInfo.eventDate} | Time: {schedulingInfo.timeSlot}
              </p>
              {celebrantInfo.celebrantName && (
                <p className="text-gray-600">
                  {eventType === "birthday" ? "Celebrant" : eventType === "debut" ? "Debutante" : "Event"}:{" "}
                  {celebrantInfo.celebrantName}
                </p>
              )}
            </div>
          </div>

          <Tabs defaultValue="standard" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="standard">Book Appointment</TabsTrigger>
              <TabsTrigger value="ai">AI-Powered Recommendation</TabsTrigger>
            </TabsList>
            <TabsContent value="standard">
              <div className="mt-6 rounded-lg border p-6 shadow-sm">
                <BookingForm
                  personalInfo={personalInfo}
                  eventInfo={{ eventType, ...celebrantInfo }}
                  schedulingInfo={schedulingInfo}
                  backdropStyle={backdropStyle}
                  onChangeEventType={handleChangeEventType}
                />
              </div>
            </TabsContent>
            <TabsContent value="ai">
              <div className="mt-6 rounded-lg border p-6 shadow-sm">
                <AIRecommendation
                  personalInfo={personalInfo}
                  eventInfo={{ eventType, ...celebrantInfo }}
                  schedulingInfo={schedulingInfo}
                  onChangeEventType={handleChangeEventType}
                />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      )}

      {/* Add the Toaster component - this was missing! */}
      <Toaster />
    </div>
  )
}

const getBackdropPrice = (backdropType: string): number => {
  switch (backdropType) {
    case "SINGLE_PANEL_BACKDROP":
      return 7000
    case "DOUBLE_PANEL_BACKDROP":
      return 8000
    case "TRIPLE_PANEL_BACKDROP":
      return 10000
    default:
      return 0
  }
}
