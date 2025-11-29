"use client"

import { useState, useEffect } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CalendarIcon, Clock, AlertCircle, RefreshCw } from "lucide-react"
import { format, isSameDay, isAfter, startOfDay, parseISO } from "date-fns"
import { toZonedTime, formatInTimeZone } from "date-fns-tz"
import { cn } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"

interface TimeSlot {
  id: string
  time_slot: string
  max_capacity: number
  current_bookings: number
  is_available: boolean
}

interface SmartCalendarProps {
  onDateTimeSelect: (date: string, timeSlot: string) => void
  selectedDate?: string
  selectedTimeSlot?: string
}

const PHILIPPINES_TIMEZONE = "Asia/Manila"

export default function SmartCalendar({ onDateTimeSelect, selectedDate, selectedTimeSlot }: SmartCalendarProps) {
  const { toast } = useToast()
  const [date, setDate] = useState<Date | undefined>(selectedDate ? new Date(selectedDate) : undefined)
  const [timeSlot, setTimeSlot] = useState<string>(selectedTimeSlot || "")
  const [availableTimeSlots, setAvailableTimeSlots] = useState<TimeSlot[]>([])
  const [unavailableDates, setUnavailableDates] = useState<Date[]>([])
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [currentPhilippineTime, setCurrentPhilippineTime] = useState<Date>(new Date())
  const [dateAppointmentCount, setDateAppointmentCount] = useState<number>(0)
  const [isDateFullyBooked, setIsDateFullyBooked] = useState<boolean>(false)

  // Update Philippine time every minute
  useEffect(() => {
    const updatePhilippineTime = () => {
      const now = new Date()
      const philippineTime = toZonedTime(now, PHILIPPINES_TIMEZONE)
      setCurrentPhilippineTime(philippineTime)
    }

    updatePhilippineTime()
    const interval = setInterval(updatePhilippineTime, 60000)

    return () => clearInterval(interval)
  }, [])

  // Load unavailable dates on component mount
  useEffect(() => {
    loadUnavailableDates()
  }, [])

  // Load time slots when date changes
  useEffect(() => {
    if (date) {
      loadTimeSlots(format(date, "yyyy-MM-dd"))
    } else {
      setAvailableTimeSlots([])
      setTimeSlot("")
      setDateAppointmentCount(0)
      setIsDateFullyBooked(false)
    }
  }, [date])

  const loadUnavailableDates = async () => {
    try {
      const timestamp = new Date().getTime()
      const response = await fetch(`/api/scheduling/available-dates?t=${timestamp}`, {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
        },
      })
      const data = await response.json()

      if (data.success) {
        const unavailable = data.unavailableDates?.map((dateStr: string) => parseISO(dateStr)) || []
        setUnavailableDates(unavailable)
        console.log(
          "Loaded unavailable dates:",
          unavailable.length,
          unavailable.map((d: Date) => format(d, "yyyy-MM-dd")),
        )
      }
    } catch (error) {
      console.error("Error loading unavailable dates:", error)
    }
  }

  const loadTimeSlots = async (dateStr: string) => {
    setLoading(true)
    try {
      const timestamp = new Date().getTime()
      const response = await fetch(`/api/scheduling/availability?date=${encodeURIComponent(dateStr)}&t=${timestamp}`, {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
        },
      })
      const data = await response.json()

      if (data.success) {
        const slots = data.availableSlots || []
        const filteredSlots = slots.filter(
          (slot: TimeSlot) => !["8:00 PM", "9:00 PM", "10:00 PM"].includes(slot.time_slot),
        )
        console.log("Loaded time slots for", dateStr, ":", filteredSlots)
        setAvailableTimeSlots(filteredSlots)

        setDateAppointmentCount(data.totalAppointments || 0)
        setIsDateFullyBooked(data.isDateFullyBooked || false)

        // If date is fully booked, clear the selection
        if (data.isDateFullyBooked) {
          setDate(undefined)
          setTimeSlot("")
          toast({
            title: "Date Fully Booked",
            description: "This date has reached maximum capacity (4/4 appointments)",
            variant: "destructive",
          })
        }
      } else {
        console.error("Failed to load time slots:", data.error)
        toast({
          title: "Error",
          description: "Failed to load available time slots",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error loading time slots:", error)
      toast({
        title: "Error",
        description: "Failed to load available time slots",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (!selectedDate) {
      setDate(undefined)
      setTimeSlot("")
      return
    }

    const selectedDateStart = startOfDay(selectedDate)
    const currentPhilippineDate = startOfDay(currentPhilippineTime)

    // Check if date is in the past
    if (!isAfter(selectedDateStart, currentPhilippineDate) && !isSameDay(selectedDateStart, currentPhilippineDate)) {
      toast({
        title: "Invalid Date",
        description: "Please select a future date",
        variant: "destructive",
      })
      return
    }

    // Check if date is within 7-day preparation period
    const minimumBookingDate = new Date(currentPhilippineDate)
    minimumBookingDate.setDate(minimumBookingDate.getDate() + 7)
    if (selectedDateStart < minimumBookingDate) {
      toast({
        title: "Invalid Date",
        description: "Bookings require 1 week advance notice for event preparation",
        variant: "destructive",
      })
      return
    }

    // Check if date is fully booked (4 appointments)
    const isFullyBooked = unavailableDates.some((unavailableDate) => isSameDay(unavailableDate, selectedDate))
    if (isFullyBooked) {
      toast({
        title: "Date Unavailable",
        description: "This date is fully booked (4/4 appointments). Please select another date.",
        variant: "destructive",
      })
      return
    }

    setDate(selectedDate)
    setTimeSlot("")
  }

  const handleTimeSlotSelect = (selectedTimeSlot: string) => {
    setTimeSlot(selectedTimeSlot)
    if (date) {
      const dateStr = format(date, "yyyy-MM-dd")
      onDateTimeSelect(dateStr, selectedTimeSlot)
    }
  }

  const isDateUnavailable = (checkDate: Date) => {
    const dateStart = startOfDay(checkDate)
    const currentPhilippineDate = startOfDay(currentPhilippineTime)

    // Disable dates in the past
    if (!isAfter(dateStart, currentPhilippineDate) && !isSameDay(dateStart, currentPhilippineDate)) {
      return true
    }

    // Disable dates within 7-day preparation period
    const minimumBookingDate = new Date(currentPhilippineDate)
    minimumBookingDate.setDate(minimumBookingDate.getDate() + 7)
    if (dateStart < minimumBookingDate) {
      return true
    }

    // Disable dates that are fully booked (4 appointments)
    const isFullyBooked = unavailableDates.some((unavailableDate) => isSameDay(unavailableDate, checkDate))

    return isFullyBooked
  }

  const getTimeSlotStatus = (slot: TimeSlot) => {
    if (slot.current_bookings > 0) {
      return <Badge variant="destructive">Booked</Badge>
    } else if (!slot.is_available) {
      return <Badge variant="secondary">Unavailable</Badge>
    } else {
      return <Badge variant="default">Available</Badge>
    }
  }

  const refreshCalendar = async () => {
    setRefreshing(true)
    try {
      await loadUnavailableDates()
      if (date) {
        await loadTimeSlots(format(date, "yyyy-MM-dd"))
      }
      toast({
        title: "Calendar Refreshed",
        description: "Availability updated successfully",
      })
    } catch (error) {
      toast({
        title: "Refresh Failed",
        description: "Failed to refresh calendar",
        variant: "destructive",
      })
    } finally {
      setRefreshing(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                Smart Scheduling Calendar
              </CardTitle>
              <div className="text-sm text-gray-600 mt-2">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Current Philippine Time: {formatInTimeZone(currentPhilippineTime, PHILIPPINES_TIMEZONE, "PPP p")}
                </div>
                <div className="mt-1 text-xs text-gray-500">
                  Maximum 4 appointments per day • Service hours: 6:00 AM - 7:00 PM
                </div>
                <div className="mt-1 text-xs text-blue-600 font-medium">
                  ⏱️ Each event lasts approximately 4 hours from the selected start time
                </div>
                <div className="mt-1 text-xs text-orange-600 font-medium">
                  ⚠️ Bookings require 1 week advance notice for event preparation & food tasting
                </div>
              </div>
            </div>
            <Button onClick={refreshCalendar} variant="outline" size="sm" disabled={refreshing || loading}>
              <RefreshCw className={cn("h-4 w-4 mr-2", refreshing && "animate-spin")} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex justify-center">
            <Calendar
              mode="single"
              selected={date}
              onSelect={handleDateSelect}
              disabled={isDateUnavailable}
              className="rounded-md border"
              modifiers={{
                unavailable: unavailableDates,
              }}
              modifiersStyles={{
                unavailable: {
                  backgroundColor: "#fee2e2",
                  color: "#dc2626",
                  textDecoration: "line-through",
                  cursor: "not-allowed",
                },
              }}
            />
          </div>

          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-100 border border-blue-300 rounded"></div>
              <span>Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-100 border border-red-300 rounded"></div>
              <span>Fully Booked (4/4)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-100 border border-gray-300 rounded"></div>
              <span>Preparation Period (7 days)</span>
            </div>
          </div>

          {date && !isDateFullyBooked && (
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-medium text-blue-900">Selected Date: {format(date, "EEEE, MMMM d, yyyy")}</h3>
              <p className="text-sm text-blue-700 mt-1">
                Appointments booked: {dateAppointmentCount}/4 • Choose your preferred time slot below
              </p>
            </div>
          )}

          {date && !isDateFullyBooked && (
            <div className="space-y-4">
              <h3 className="font-medium flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Available Time Slots (6:00 AM - 7:00 PM)
              </h3>
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2 text-blue-800">
                  <Clock className="h-4 w-4" />
                  <span className="font-medium text-sm">Event Duration: 4 Hours</span>
                </div>
                <p className="text-xs text-blue-700 mt-1">
                  Each catering event runs for approximately 4 hours from your selected start time. Please ensure this
                  timeframe works with your event schedule.
                </p>
              </div>

              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
                </div>
              ) : availableTimeSlots.length > 0 ? (
                <div className="grid gap-2 grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                  {availableTimeSlots.map((slot) => {
                    const isSelected = timeSlot === slot.time_slot
                    const isBooked = slot.current_bookings > 0

                    return (
                      <Button
                        key={slot.id}
                        variant={isSelected ? "default" : "outline"}
                        size="sm"
                        className={cn(
                          "h-auto p-3 flex flex-col items-center gap-1",
                          !slot.is_available && "opacity-50 cursor-not-allowed",
                          isSelected && "ring-2 ring-blue-500",
                          isBooked && "bg-red-50 border-red-300 text-red-800 cursor-not-allowed hover:bg-red-50",
                        )}
                        disabled={!slot.is_available || isBooked}
                        onClick={() => slot.is_available && !isBooked && handleTimeSlotSelect(slot.time_slot)}
                      >
                        <div className="font-medium text-sm">{slot.time_slot}</div>
                        {getTimeSlotStatus(slot)}
                      </Button>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                  <p>No available time slots for this date</p>
                  <p className="text-sm">This date is fully booked (4/4 appointments)</p>
                </div>
              )}
            </div>
          )}

          {date && timeSlot && !isDateFullyBooked && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="font-medium text-green-900">Selection Confirmed</h4>
              <p className="text-sm text-green-700">
                {format(date, "EEEE, MMMM d, yyyy")} at {timeSlot}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export { SmartCalendar }
