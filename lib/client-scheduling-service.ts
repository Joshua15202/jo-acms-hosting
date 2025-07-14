// Client-side service for scheduling operations

export interface TimeSlot {
  time_slot: string
  is_available: boolean
}

export interface AppointmentData {
  event_type: string
  event_date: string // Should be 'YYYY-MM-DD'
  time_slot: string
  guest_count: number
  venue_address: string
  special_requests?: string
  total_amount: number
  deposit_amount: number
  celebrant_name?: string
  celebrant_age?: number
  celebrant_gender?: string
  theme?: string
  color_motif?: string
}

export class ClientSchedulingService {
  static async getAvailableDates(): Promise<string[]> {
    try {
      const response = await fetch("/api/scheduling/available-dates")
      const data = await response.json()
      if (data.success) return data.availableDates
      throw new Error(data.error || "Failed to fetch available dates")
    } catch (error) {
      console.error("Error fetching available dates:", error)
      const fallbackDates: string[] = []
      const today = new Date()
      for (let i = 0; i < 30; i++) {
        const date = new Date(today)
        date.setDate(today.getDate() + i)
        fallbackDates.push(date.toISOString().split("T")[0])
      }
      return fallbackDates
    }
  }

  static async getAvailableTimeSlots(date: string): Promise<TimeSlot[]> {
    try {
      const response = await fetch(`/api/scheduling/availability?date=${date}`)
      const data = await response.json()
      if (data.success) return data.availableSlots
      throw new Error(data.error || "Failed to fetch available time slots")
    } catch (error) {
      console.error("Error fetching available time slots:", error)
      return [
        { time_slot: "morning", is_available: true },
        { time_slot: "afternoon", is_available: true },
        { time_slot: "evening", is_available: true },
        { time_slot: "full_day", is_available: true },
      ]
    }
  }

  static async getRecommendedTimeSlots(date: string, eventType: string): Promise<string[]> {
    try {
      const response = await fetch(`/api/scheduling/recommendations?date=${date}&eventType=${eventType}`)
      const data = await response.json()
      if (data.success) return data.recommendedSlots
      return []
    } catch (error) {
      console.error("Error fetching recommended time slots:", error)
      return []
    }
  }

  static async createAppointment(
    appointmentData: AppointmentData,
  ): Promise<{ success: boolean; appointmentId?: string; error?: string; details?: any }> {
    console.log(
      "ClientSchedulingService.createAppointment: Sending data to API:",
      JSON.stringify(appointmentData, null, 2),
    )
    try {
      const response = await fetch("/api/scheduling/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" }, // Browser should automatically send cookies
        body: JSON.stringify(appointmentData),
      })

      const rawResponseText = await response.text()
      let responseData: any

      try {
        responseData = JSON.parse(rawResponseText)
      } catch (e) {
        console.error(
          "ClientSchedulingService.createAppointment: Failed to parse API response as JSON. Status:",
          response.status,
          "Raw text:",
          rawResponseText,
        )
        // If it's a 401 and not JSON, it's still an auth error.
        if (response.status === 401) {
          return {
            success: false,
            error: "Not authenticated (API response not valid JSON)",
            details: rawResponseText,
          }
        }
        // For other errors with non-JSON responses
        return {
          success: false,
          error: `API Error: ${response.status} (API response not valid JSON)`,
          details: rawResponseText,
        }
      }

      console.log("ClientSchedulingService.createAppointment: Response from API (parsed):", responseData)

      if (!response.ok) {
        console.error(
          "ClientSchedulingService.createAppointment: API returned an error status.",
          response.status,
          "Parsed Response Data:",
          responseData,
        )
        return {
          success: false,
          error: responseData?.error || `API Error: ${response.status}`, // Use optional chaining
          details: responseData?.details || responseData, // Use optional chaining
        }
      }
      return responseData
    } catch (error: any) {
      console.error("ClientSchedulingService.createAppointment: Network error or client-side issue:", error)
      return {
        success: false,
        error: error.message || "Failed to create appointment due to a network or client-side error.",
      }
    }
  }

  static calculateAdditionalMenuPrice(additionalItems: { type: string; name: string }[], guestCount: number): number {
    let totalPrice = 0
    for (const item of additionalItems) {
      switch (item.type) {
        case "main":
          if (item.name.toLowerCase().includes("beef") || item.name.toLowerCase().includes("pork"))
            totalPrice += 70 * guestCount
          else if (item.name.toLowerCase().includes("chicken")) totalPrice += 60 * guestCount
          else totalPrice += 50 * guestCount
          break
        case "pasta":
          totalPrice += 40 * guestCount
          break
        case "dessert":
          totalPrice += 25 * guestCount
          break
        case "beverage":
          totalPrice += 25 * guestCount
          break
        default:
          totalPrice += 50 * guestCount
      }
    }
    return totalPrice
  }
}
