import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"
import { createGoogleGenerativeAI } from "@ai-sdk/google"
import { generateText } from "ai"

export const dynamic = "force-dynamic"
export const revalidate = 0

interface EquipmentPrediction {
  category: string
  item: string
  quantity: number
  reason: string
}

async function predictEquipmentNeeds(
  eventType: string,
  guestCount: number,
  mainCourses: string[],
): Promise<EquipmentPrediction[]> {
  try {
    const google = createGoogleGenerativeAI({
      apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
    })

    const prompt = `You are a professional catering equipment specialist. Based on the following event details, predict the equipment needs:

Event Type: ${eventType}
Guest Count: ${guestCount}
Menu Items: ${mainCourses.join(", ") || "Standard catering menu"}

Provide a detailed list of equipment needed including:
- Tables and seating (calculate based on 8 guests per round table - IMPORTANT: Round tables are 8-seaters only)
- Dinnerware (plates, bowls, utensils per guest)
- Glassware (water glasses, wine glasses if applicable)
- Serving equipment (chafing dishes, serving trays, etc.)
- Furniture (chairs, tables)
- Linens (tablecloths, napkins)
- Any event-type specific equipment

Return ONLY a valid JSON array with this exact structure:
[
  {
    "category": "Furniture",
    "item": "Round Tables (8-seater)",
    "quantity": 10,
    "reason": "For 80 guests at 8 guests per table"
  }
]

Be specific with quantities and provide clear reasoning.`

    const { text } = await generateText({
      model: google("gemini-2.5-flash"),
      prompt,
      temperature: 0.3,
    })

    // Extract JSON from response
    const jsonMatch = text.match(/\[[\s\S]*\]/)
    if (!jsonMatch) {
      throw new Error("No valid JSON found in AI response")
    }

    const predictions = JSON.parse(jsonMatch[0])
    return predictions
  } catch (error) {
    console.error("Error predicting equipment needs:", error)
    // Return fallback predictions
    return generateFallbackPredictions(eventType, guestCount)
  }
}

function generateFallbackPredictions(eventType: string, guestCount: number): EquipmentPrediction[] {
  const tablesNeeded = Math.ceil(guestCount / 8) // 8 guests per table
  const chairsNeeded = guestCount
  const platesNeeded = guestCount * 2 // Main + dessert
  const glassesNeeded = guestCount * 2 // Water + beverage

  return [
    {
      category: "Furniture",
      item: "Round Tables (8-seater)",
      quantity: tablesNeeded,
      reason: `For ${guestCount} guests at 8 guests per table`,
    },
    {
      category: "Seating",
      item: "Chairs",
      quantity: chairsNeeded,
      reason: `One chair per guest (${guestCount} guests)`,
    },
    {
      category: "Dinnerware",
      item: "Dinner Plates",
      quantity: platesNeeded,
      reason: `${guestCount} guests × 2 plates (main course + dessert)`,
    },
    {
      category: "Glassware",
      item: "Drinking Glasses",
      quantity: glassesNeeded,
      reason: `${guestCount} guests × 2 glasses (water + beverage)`,
    },
    {
      category: "Silverware",
      item: "Complete Utensil Sets",
      quantity: guestCount,
      reason: `One complete set (fork, knife, spoon) per guest`,
    },
    {
      category: "Linens",
      item: "Tablecloths",
      quantity: tablesNeeded,
      reason: `One tablecloth per table (${tablesNeeded} tables)`,
    },
    {
      category: "Linens",
      item: "Napkins",
      quantity: guestCount,
      reason: `One napkin per guest`,
    },
    {
      category: "Serving Equipment",
      item: "Chafing Dishes",
      quantity: Math.ceil(guestCount / 25),
      reason: `One chafing dish per 25 guests for buffet service`,
    },
  ]
}

function parseMainCourses(mainCourses: any): string[] {
  if (!mainCourses) return []

  try {
    const menuData = typeof mainCourses === "string" ? JSON.parse(mainCourses) : mainCourses

    const courses: string[] = []

    if (Array.isArray(menuData)) {
      menuData.forEach((item) => {
        if (typeof item === "string") {
          courses.push(item)
        } else if (typeof item === "object" && item !== null && item.name) {
          courses.push(item.name)
        }
      })
      return courses
    }

    if (typeof menuData === "object" && menuData !== null) {
      Object.values(menuData).forEach((value) => {
        if (Array.isArray(value)) {
          value.forEach((item) => {
            if (typeof item === "string") {
              courses.push(item)
            } else if (typeof item === "object" && item !== null && (item as any).name) {
              courses.push((item as any).name)
            }
          })
        }
      })
    }

    return courses
  } catch (error) {
    console.error("Error parsing main courses:", error)
    return []
  }
}

export async function GET() {
  try {
    console.log("=== Fetching Equipment Needs Forecast ===")

    const today = new Date().toISOString().split("T")[0]

    // Get all future confirmed appointments
    const { data: appointments, error } = await supabaseAdmin
      .from("tbl_comprehensive_appointments")
      .select(
        `
        id,
        event_date,
        event_type,
        contact_first_name,
        contact_last_name,
        guest_count,
        main_courses,
        status
      `,
      )
      .gte("event_date", today)
      .in("status", ["confirmed", "tasting_confirmed", "tasting_completed"])
      .order("event_date", { ascending: true })

    if (error) {
      console.error("Error fetching appointments:", error)
      return NextResponse.json({ error: "Failed to fetch appointments" }, { status: 500 })
    }

    console.log(`Found ${appointments?.length || 0} upcoming confirmed appointments`)

    // Process each appointment and predict equipment needs
    const equipmentForecasts = await Promise.all(
      (appointments || []).map(async (appointment) => {
        const eventDate = new Date(appointment.event_date)
        const daysUntilEvent = Math.ceil((eventDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))

        const mainCourses = parseMainCourses(appointment.main_courses)

        // Get AI predictions for equipment needs
        const equipmentPredictions = await predictEquipmentNeeds(
          appointment.event_type || "Event",
          appointment.guest_count,
          mainCourses,
        )

        return {
          id: appointment.id,
          appointment_id: appointment.id,
          event_date: appointment.event_date,
          event_type: appointment.event_type || "Event",
          customer_name: `${appointment.contact_first_name} ${appointment.contact_last_name}`,
          guest_count: appointment.guest_count,
          main_courses: mainCourses,
          equipment_predictions: equipmentPredictions,
          days_until_event: daysUntilEvent,
          urgency_level:
            daysUntilEvent <= 3 ? "critical" : daysUntilEvent <= 7 ? "high" : daysUntilEvent <= 14 ? "medium" : "low",
        }
      }),
    )

    // Calculate summary statistics
    const summary = {
      total_events: equipmentForecasts.length,
      total_guests: equipmentForecasts.reduce((sum, event) => sum + event.guest_count, 0),
      critical_events: equipmentForecasts.filter((e) => e.urgency_level === "critical").length,
      high_priority_events: equipmentForecasts.filter((e) => e.urgency_level === "high").length,
    }

    // Calculate equipment category breakdown
    const equipmentBreakdown: Record<string, number> = {}
    equipmentForecasts.forEach((event) => {
      event.equipment_predictions.forEach((pred) => {
        equipmentBreakdown[pred.category] = (equipmentBreakdown[pred.category] || 0) + pred.quantity
      })
    })

    return NextResponse.json(
      {
        events: equipmentForecasts,
        summary,
        equipment_breakdown: equipmentBreakdown,
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      },
    )
  } catch (error) {
    console.error("Error in equipment needs forecast API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
