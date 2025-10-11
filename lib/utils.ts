import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Calculates a 4-hour time range from a given start time
 * @param startTime - Time string in format "HH:MM AM/PM" (e.g., "3:00 PM")
 * @returns Formatted time range (e.g., "3:00 PM - 7:00 PM")
 */
export function getTimeRange(startTime: string): string {
  // Parse the time string
  const timeMatch = startTime.match(/(\d+):(\d+)\s*(AM|PM)/i)
  if (!timeMatch) return startTime // Return original if format is invalid

  let hours = Number.parseInt(timeMatch[1])
  const minutes = Number.parseInt(timeMatch[2])
  const period = timeMatch[3].toUpperCase()

  // Convert to 24-hour format
  if (period === "PM" && hours !== 12) {
    hours += 12
  } else if (period === "AM" && hours === 12) {
    hours = 0
  }

  // Add 4 hours
  let endHours = hours + 4
  let endPeriod = period

  // Handle day overflow
  if (endHours >= 24) {
    endHours -= 24
  }

  // Convert back to 12-hour format for end time
  if (endHours === 0) {
    endHours = 12
    endPeriod = "AM"
  } else if (endHours === 12) {
    endPeriod = "PM"
  } else if (endHours > 12) {
    endHours -= 12
    endPeriod = "PM"
  } else {
    endPeriod = "AM"
  }

  // Format the end time
  const endTime = `${endHours}:${minutes.toString().padStart(2, "0")} ${endPeriod}`

  return `${startTime} - ${endTime}`
}
