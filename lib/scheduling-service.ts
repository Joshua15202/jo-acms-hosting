import { supabaseAdmin } from "@/lib/supabase" // Import supabaseAdmin client

export interface TimeSlot {
  id: string
  date: string
  time_slot: string
  max_capacity: number
  current_bookings: number
  is_available: boolean
}

export interface Appointment {
  id: string
  user_id: string
  event_type: string
  event_date: string
  time_slot: string
  guest_count: number
  venue_address?: string
  status:
    | "pending"
    | "confirmed"
    | "cancelled"
    | "completed"
    | "PENDING_TASTING_CONFIRMATION"
    | "TASTING_CONFIRMED"
    | "TASTING_RESCHEDULE_REQUESTED"
  total_amount?: number
  deposit_amount?: number
  special_requests?: string
  created_at: string
  updated_at: string
  // Removed tasting_date, tasting_time, tasting_status, tasting_confirmed_at, tasting_token
}

export interface BookingTrend {
  month: number
  day_of_week: number
  time_slot: string
  event_type: string
  booking_count: number
  average_guest_count: number
  peak_season: boolean
}

export interface MenuPricing {
  category: string
  price: number
  unit: string
}

export class SchedulingService {
  // All available time slots from 6 AM to 10 PM
  static getAllTimeSlots(): string[] {
    return [
      "6:00 AM",
      "7:00 AM",
      "8:00 AM",
      "9:00 AM",
      "10:00 AM",
      "11:00 AM",
      "12:00 PM",
      "1:00 PM",
      "2:00 PM",
      "3:00 PM",
      "4:00 PM",
      "5:00 PM",
      "6:00 PM",
      "7:00 PM",
      "8:00 PM",
      "9:00 PM",
      "10:00 PM",
    ]
  }

  // Menu pricing structure
  static getMenuPricing(): MenuPricing[] {
    return [
      { category: "Beef/Pork", price: 70.0, unit: "per head" },
      { category: "Chicken", price: 60.0, unit: "per head" },
      { category: "Fish/Vegetable", price: 50.0, unit: "per head" },
      { category: "Pasta", price: 40.0, unit: "per item" },
      { category: "Dessert", price: 25.0, unit: "per item" },
      { category: "Beverage", price: 25.0, unit: "per item" },
    ]
  }

  // Check if a date is fully booked (has 4 appointments total across all time slots)
  static async isDateFullyBooked(date: string): Promise<boolean> {
    try {
      console.log(`SchedulingService.isDateFullyBooked: Checking if date ${date} is fully booked`)

      const { count, error } = await supabaseAdmin
        .from("tbl_comprehensive_appointments")
        .select("id", { count: "exact", head: true })
        .eq("event_date", date)
        .in("status", [
          "pending",
          "confirmed",
          "PENDING_TASTING_CONFIRMATION",
          "TASTING_CONFIRMED",
          "TASTING_RESCHEDULE_REQUESTED",
        ])

      if (error) {
        console.error("Error checking if date is fully booked:", error)
        throw error
      }

      const isFullyBooked = (count || 0) >= 4
      console.log(
        `SchedulingService.isDateFullyBooked: Date ${date} has ${count || 0} appointments, fully booked: ${isFullyBooked}`,
      )

      return isFullyBooked
    } catch (error) {
      console.error("Error checking if date is fully booked:", error)
      return false
    }
  }

  // Get count of appointments for a specific date
  static async getDateAppointmentCount(date: string): Promise<number> {
    try {
      console.log(`SchedulingService.getDateAppointmentCount: Getting appointment count for date ${date}`)

      const { count, error } = await supabaseAdmin
        .from("tbl_comprehensive_appointments")
        .select("id", { count: "exact", head: true })
        .eq("event_date", date)
        .in("status", [
          "pending",
          "confirmed",
          "PENDING_TASTING_CONFIRMATION",
          "TASTING_CONFIRMED",
          "TASTING_RESCHEDULE_REQUESTED",
        ])

      if (error) {
        console.error("Error getting date appointment count:", error)
        throw error
      }

      console.log(`SchedulingService.getDateAppointmentCount: Date ${date} has ${count || 0} appointments`)
      return count || 0
    } catch (error) {
      console.error("Error getting date appointment count:", error)
      return 0
    }
  }

  // Get available dates for the next 6 months
  static async getAvailableDates(): Promise<string[]> {
    try {
      console.log("SchedulingService.getAvailableDates: Getting available dates for next 6 months")

      const today = new Date()
      const sixMonthsLater = new Date()
      sixMonthsLater.setMonth(today.getMonth() + 6)

      const availableDates: string[] = []
      const currentDate = new Date(today)

      while (currentDate <= sixMonthsLater) {
        const dateString = currentDate.toISOString().split("T")[0]
        const isFullyBooked = await this.isDateFullyBooked(dateString)

        if (!isFullyBooked) {
          availableDates.push(dateString)
        }

        currentDate.setDate(currentDate.getDate() + 1)
      }

      console.log(`SchedulingService.getAvailableDates: Found ${availableDates.length} available dates`)
      return availableDates
    } catch (error) {
      console.error("Error getting available dates:", error)
      return []
    }
  }

  // Check availability for a specific date and time slot
  static async checkAvailability(date: string, timeSlot: string): Promise<boolean> {
    try {
      console.log(`SchedulingService.checkAvailability: Checking availability for ${date} at ${timeSlot}`)

      // First check if the date is fully booked (4 appointments total)
      const dateFullyBooked = await this.isDateFullyBooked(date)
      if (dateFullyBooked) {
        console.log(`SchedulingService.checkAvailability: Date ${date} is fully booked`)
        return false
      }

      // Check if this specific time slot is already taken
      const { count, error } = await supabaseAdmin
        .from("tbl_comprehensive_appointments")
        .select("id", { count: "exact", head: true })
        .eq("event_date", date)
        .eq("event_time", timeSlot) // Using event_time instead of time_slot
        .in("status", [
          "pending",
          "confirmed",
          "PENDING_TASTING_CONFIRMATION",
          "TASTING_CONFIRMED",
          "TASTING_RESCHEDULE_REQUESTED",
        ])

      if (error) {
        console.error("Error checking time slot availability:", error)
        throw error
      }

      // Each time slot can only have 1 appointment
      const isAvailable = (count || 0) === 0
      console.log(
        `SchedulingService.checkAvailability: Time slot ${timeSlot} on ${date} has ${count || 0} bookings, available: ${isAvailable}`,
      )

      return isAvailable
    } catch (error) {
      console.error("Error checking availability:", error)
      return false
    }
  }

  // Get available time slots for a specific date - ALWAYS return all 17 slots with availability status
  static async getAvailableTimeSlots(date: string): Promise<TimeSlot[]> {
    try {
      console.log(`SchedulingService.getAvailableTimeSlots: Getting time slots for date ${date}`)

      const allTimeSlots = this.getAllTimeSlots()
      const dateFullyBooked = await this.isDateFullyBooked(date)
      const currentAppointmentCount = await this.getDateAppointmentCount(date)

      // Get all existing appointments for this date
      const { data: existingAppointments, error } = await supabaseAdmin
        .from("tbl_comprehensive_appointments")
        .select("event_time") // Using event_time instead of time_slot
        .eq("event_date", date)
        .in("status", [
          "pending",
          "confirmed",
          "PENDING_TASTING_CONFIRMATION",
          "TASTING_CONFIRMED",
          "TASTING_RESCHEDULE_REQUESTED",
        ])

      if (error) {
        console.error("Error fetching existing appointments:", error)
        throw error
      }

      console.log(
        `SchedulingService.getAvailableTimeSlots: Found ${existingAppointments?.length || 0} existing appointments for ${date}`,
      )

      const bookedTimeSlots = new Set(existingAppointments?.map((apt) => apt.event_time) || [])
      console.log(`SchedulingService.getAvailableTimeSlots: Booked time slots:`, Array.from(bookedTimeSlots))

      const timeSlots: TimeSlot[] = allTimeSlots.map((timeSlot, index) => {
        const isSlotBooked = bookedTimeSlots.has(timeSlot)
        const isAvailable = !dateFullyBooked && !isSlotBooked

        return {
          id: `${date}-${timeSlot.replace(/[:\s]/g, "-")}`,
          date,
          time_slot: timeSlot,
          max_capacity: 1, // Each time slot can only have 1 appointment
          current_bookings: isSlotBooked ? 1 : 0,
          is_available: isAvailable,
        }
      })

      console.log(`SchedulingService.getAvailableTimeSlots: Returning ${timeSlots.length} time slots for ${date}`)
      return timeSlots
    } catch (error) {
      console.error("Error getting available time slots:", error)
      // Return default slots even on error
      return this.getAllTimeSlots().map((timeSlot, index) => ({
        id: `${date}-${timeSlot.replace(/[:\s]/g, "-")}-default`,
        date,
        time_slot: timeSlot,
        max_capacity: 1,
        current_bookings: 0,
        is_available: true,
      }))
    }
  }

  // Calculate additional menu pricing
  static calculateAdditionalMenuPrice(menuItems: { type: string; name: string }[], guestCount: number): number {
    const pricing = this.getMenuPricing()
    let totalPrice = 0

    menuItems.forEach((item) => {
      let itemPrice = 0

      // Categorize menu items and apply pricing
      const itemName = item.name.toLowerCase()
      const itemType = item.type.toLowerCase()

      if (itemType === "main" || itemName.includes("beef") || itemName.includes("pork")) {
        itemPrice = pricing.find((p) => p.category === "Beef/Pork")?.price || 70
        totalPrice += itemPrice * guestCount
      } else if (itemType === "main" || itemName.includes("chicken")) {
        itemPrice = pricing.find((p) => p.category === "Chicken")?.price || 60
        totalPrice += itemPrice * guestCount
      } else if (itemType === "main" || itemName.includes("fish") || itemName.includes("vegetable")) {
        itemPrice = pricing.find((p) => p.category === "Fish/Vegetable")?.price || 50
        totalPrice += itemPrice * guestCount
      } else if (itemType === "pasta") {
        itemPrice = pricing.find((p) => p.category === "Pasta")?.price || 40
        totalPrice += itemPrice
      } else if (itemType === "dessert") {
        itemPrice = pricing.find((p) => p.category === "Dessert")?.price || 25
        totalPrice += itemPrice
      } else if (itemType === "beverage") {
        itemPrice = pricing.find((p) => p.category === "Beverage")?.price || 25
        totalPrice += itemPrice
      }
    })

    return totalPrice
  }

  // Create a new appointment - Updated to use comprehensive appointments table
  static async createAppointment(appointmentData: Partial<Appointment>): Promise<string | null> {
    console.log("SchedulingService.createAppointment: Received data:", JSON.stringify(appointmentData, null, 2))
    try {
      const id = Date.now().toString() + Math.random().toString(36).substr(2, 9)
      const {
        user_id,
        event_type,
        event_date,
        time_slot,
        guest_count,
        venue_address,
        total_amount,
        deposit_amount,
        special_requests,
        status = "pending", // Default status if not provided
      } = appointmentData

      // Validate required fields before DB interaction
      if (!user_id) {
        console.error("SchedulingService.createAppointment: Missing user_id")
        throw new Error("User ID is required to create an appointment.")
      }
      if (!event_type) {
        console.error("SchedulingService.createAppointment: Missing event_type")
        throw new Error("Event type is required.")
      }
      if (!event_date) {
        console.error("SchedulingService.createAppointment: Missing event_date")
        throw new Error("Event date is required.")
      }
      if (!time_slot) {
        console.error("SchedulingService.createAppointment: Missing time_slot")
        throw new Error("Time slot is required.")
      }
      if (guest_count === undefined || guest_count === null || isNaN(Number(guest_count))) {
        console.error("SchedulingService.createAppointment: Invalid or missing guest_count")
        throw new Error("Guest count is required and must be a number.")
      }

      // Ensure event_date is just the date part
      const cleanEventDate = event_date.split("T")[0]

      console.log(`SchedulingService.createAppointment: Checking if date ${cleanEventDate} is fully booked.`)
      const dateFullyBooked = await this.isDateFullyBooked(cleanEventDate!)
      if (dateFullyBooked) {
        console.warn(`SchedulingService.createAppointment: Date ${cleanEventDate} is fully booked.`)
        throw new Error("This date is fully booked (4 appointments maximum per day)")
      }
      console.log(`SchedulingService.createAppointment: Date ${cleanEventDate} is not fully booked.`)

      console.log(
        `SchedulingService.createAppointment: Checking availability for date ${cleanEventDate}, slot ${time_slot}.`,
      )
      const isAvailable = await this.checkAvailability(cleanEventDate!, time_slot!)
      if (!isAvailable) {
        console.warn(`SchedulingService.createAppointment: Slot ${time_slot} on ${cleanEventDate} is not available.`)
        throw new Error("Time slot is not available")
      }
      console.log(`SchedulingService.createAppointment: Slot ${time_slot} on ${cleanEventDate} is available.`)

      // Insert into comprehensive appointments table
      const { data, error } = await supabaseAdmin.from("tbl_comprehensive_appointments").insert({
        id,
        user_id,
        event_type,
        event_date: cleanEventDate,
        event_time: time_slot, // Store in event_time column
        time_slot: time_slot, // Also store in time_slot for compatibility
        guest_count: Number(guest_count),
        venue_address: venue_address || null,
        budget_min: total_amount || 0,
        budget_max: total_amount || 0,
        special_requests: special_requests || null,
        status,
        booking_source: "api", // Mark as API created
      })

      if (error) {
        console.error("SchedulingService.createAppointment: Supabase insert error:", error)
        throw new Error(`Failed to create appointment: ${error.message}`)
      }

      console.log("SchedulingService.createAppointment: Database insert result:", data)

      console.log(
        `SchedulingService.createAppointment: Updating booking trends for ${cleanEventDate}, ${time_slot}, ${event_type}.`,
      )
      await this.updateBookingTrends(cleanEventDate!, time_slot!, event_type!, Number(guest_count!))

      console.log(`SchedulingService.createAppointment: Appointment created with ID: ${id}`)
      return id
    } catch (error: any) {
      console.error("SchedulingService.createAppointment: CATCH BLOCK - Error during appointment creation:", error)
      console.error("SchedulingService.createAppointment: Error message:", error.message)
      console.error("SchedulingService.createAppointment: Error stack:", error.stack)
      throw error
    }
  }

  // Update booking trends for AI analysis
  static async updateBookingTrends(
    date: string,
    timeSlot: string,
    eventType: string,
    guestCount: number,
  ): Promise<void> {
    try {
      const dateObj = new Date(date)
      const month = dateObj.getMonth() + 1
      const dayOfWeek = dateObj.getDay() === 0 ? 7 : dateObj.getDay() // Convert Sunday from 0 to 7

      // Check if trend record exists
      const { data: existing, error: fetchError } = await supabaseAdmin
        .from("tbl_booking_trends")
        .select("id, booking_count, average_guest_count")
        .eq("month", month)
        .eq("day_of_week", dayOfWeek)
        .eq("time_slot", timeSlot)
        .eq("event_type", eventType)
        .single()

      if (fetchError && fetchError.code === "PGRST116") {
        // No row found, create new trend record
        const id = Date.now().toString() + Math.random().toString(36).substr(2, 9)
        const { error: insertError } = await supabaseAdmin.from("tbl_booking_trends").insert({
          id,
          month,
          day_of_week: dayOfWeek,
          time_slot: timeSlot,
          event_type: eventType,
          booking_count: 1,
          average_guest_count: guestCount,
        })
        if (insertError) throw insertError
      } else if (fetchError) {
        throw fetchError
      } else if (existing) {
        // Update existing trend
        const newBookingCount = existing.booking_count + 1
        const newAvgGuestCount = (existing.average_guest_count * existing.booking_count + guestCount) / newBookingCount

        const { error: updateError } = await supabaseAdmin
          .from("tbl_booking_trends")
          .update({
            booking_count: newBookingCount,
            average_guest_count: newAvgGuestCount,
            last_updated: new Date().toISOString(),
          })
          .eq("id", existing.id)
        if (updateError) throw updateError
      }
    } catch (error) {
      console.error("Error updating booking trends:", error)
    }
  }

  // Get booking trends for AI recommendations
  static async getBookingTrends(): Promise<BookingTrend[]> {
    try {
      const { data: result, error } = await supabaseAdmin
        .from("tbl_booking_trends")
        .select("*")
        .order("booking_count", { ascending: false })

      if (error) throw error
      return result as BookingTrend[]
    } catch (error) {
      console.error("Error getting booking trends:", error)
      return []
    }
  }

  // Get user appointments - Updated to use comprehensive appointments table
  static async getUserAppointments(userId: string): Promise<Appointment[]> {
    try {
      const { data: result, error } = await supabaseAdmin
        .from("tbl_comprehensive_appointments")
        .select("*")
        .eq("user_id", userId)
        .order("event_date", { ascending: false })
        .order("created_at", { ascending: false })

      if (error) throw error
      return result as Appointment[]
    } catch (error) {
      console.error("Error getting user appointments:", error)
      return []
    }
  }

  // AI-powered time slot recommendations
  static async getRecommendedTimeSlots(date: string, eventType: string): Promise<string[]> {
    try {
      const dateObj = new Date(date)
      const month = dateObj.getMonth() + 1
      const dayOfWeek = dateObj.getDay() === 0 ? 7 : dateObj.getDay()

      // Get trends for this date pattern and event type
      const { data: trends, error: trendsError } = await supabaseAdmin
        .from("tbl_booking_trends")
        .select("time_slot, booking_count")
        .eq("month", month)
        .eq("day_of_week", dayOfWeek)
        .eq("event_type", eventType)
        .order("booking_count", { ascending: false })

      if (trendsError) throw trendsError

      if (trends && trends.length > 0) {
        return trends.map((trend: any) => trend.time_slot)
      }

      // Fallback to general popularity
      const { data: generalTrends, error: generalTrendsError } = await supabaseAdmin
        .from("tbl_booking_trends")
        .select("time_slot, booking_count") // Select booking_count to sum
        .eq("event_type", eventType)

      if (generalTrendsError) throw generalTrendsError

      if (generalTrends) {
        // Manually sum and group by time_slot
        const summedTrends = generalTrends.reduce((acc: { [key: string]: number }, trend: any) => {
          acc[trend.time_slot] = (acc[trend.time_slot] || 0) + trend.booking_count
          return acc
        }, {})

        return Object.entries(summedTrends)
          .sort(([, countA], [, countB]) => (countB as number) - (countA as number))
          .map(([timeSlot]) => timeSlot)
      }

      // Default recommendation - popular time slots
      return ["10:00 AM", "2:00 PM", "6:00 PM", "8:00 PM"]
    } catch (error) {
      console.error("Error getting recommended time slots:", error)
      return ["10:00 AM", "2:00 PM", "6:00 PM", "8:00 PM"]
    }
  }

  // Schedule notification
  static async scheduleNotification(
    userId: string,
    appointmentId: string,
    type: string,
    message: string,
    email: string,
    scheduledFor: string,
  ): Promise<void> {
    try {
      const id = Date.now().toString() + Math.random().toString(36).substr(2, 9)
      const { error } = await supabaseAdmin.from("tbl_notification_queue").insert({
        id,
        user_id: userId,
        appointment_id: appointmentId,
        type,
        message,
        email,
        scheduled_for: scheduledFor,
      })
      if (error) throw error
    } catch (error) {
      console.error("Error scheduling notification:", error)
    }
  }
}
