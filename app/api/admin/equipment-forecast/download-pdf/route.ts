import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"
import { createGoogleGenerativeAI } from "@ai-sdk/google"
import { generateText } from "ai"
import { jsPDF } from "jspdf"
import "jspdf-autotable"

export const dynamic = "force-dynamic"
export const revalidate = 0

interface EquipmentPrediction {
  category: string
  item: string
  quantity: number
  reason: string
}

interface InventoryMatch {
  inventory_id: string
  item_name: string
  available: number
  needed: number
  sufficient: boolean
  match_confidence: string
  reason: string
}

interface InventoryAnalysis {
  matches: InventoryMatch[]
  total_available: number
  total_needed: number
  can_fulfill: boolean
  recommendations: string
  shortfall: number
}

async function getInventoryMatches(
  equipmentItem: string,
  quantity: number,
  category: string,
): Promise<InventoryAnalysis | null> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || "http://jo-acms.vercel.app"}/api/admin/equipment-inventory-check`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          equipmentItem,
          quantityNeeded: quantity,
          category,
        }),
      },
    )

    if (!response.ok) {
      console.error(`Failed to fetch inventory matches for ${equipmentItem}`)
      return null
    }

    return await response.json()
  } catch (error) {
    console.error(`Error fetching inventory matches for ${equipmentItem}:`, error)
    return null
  }
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

    const jsonMatch = text.match(/\[[\s\S]*\]/)
    if (!jsonMatch) {
      throw new Error("No valid JSON found in AI response")
    }

    const predictions = JSON.parse(jsonMatch[0])
    return predictions
  } catch (error) {
    console.error("Error predicting equipment needs:", error)
    return generateFallbackPredictions(eventType, guestCount)
  }
}

function generateFallbackPredictions(eventType: string, guestCount: number): EquipmentPrediction[] {
  const tablesNeeded = Math.ceil(guestCount / 8)
  const chairsNeeded = guestCount
  const platesNeeded = guestCount * 2
  const glassesNeeded = guestCount * 2

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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const appointmentId = searchParams.get("appointmentId")

    if (!appointmentId) {
      return NextResponse.json({ error: "Appointment ID is required" }, { status: 400 })
    }

    const { data: appointment, error } = await supabaseAdmin
      .from("tbl_comprehensive_appointments")
      .select(
        `
        id,
        event_date,
        event_type,
        contact_first_name,
        contact_last_name,
        contact_phone,
        guest_count,
        venue_address,
        main_courses,
        status
      `,
      )
      .eq("id", appointmentId)
      .single()

    if (error || !appointment) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 })
    }

    const mainCourses = parseMainCourses(appointment.main_courses)
    const equipmentPredictions = await predictEquipmentNeeds(
      appointment.event_type || "Event",
      appointment.guest_count,
      mainCourses,
    )

    const equipmentWithMatches = await Promise.all(
      equipmentPredictions.map(async (prediction) => {
        const matches = await getInventoryMatches(prediction.item, prediction.quantity, prediction.category)
        return {
          ...prediction,
          inventoryMatches: matches,
        }
      }),
    )

    const doc = new jsPDF()

    doc.setFontSize(20)
    doc.setTextColor(37, 99, 235)
    doc.text("Equipment Requirements List", 105, 20, { align: "center" })

    doc.setFontSize(10)
    doc.setTextColor(100, 100, 100)
    doc.text(
      `Generated on ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}`,
      105,
      28,
      { align: "center" },
    )

    const eventDate = new Date(appointment.event_date).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })

    doc.setFontSize(14)
    doc.setTextColor(0, 0, 0)
    doc.text("Event Information", 14, 40)

    doc.setFontSize(10)
    doc.text(`Customer: ${appointment.contact_first_name} ${appointment.contact_last_name}`, 14, 50)
    doc.text(`Event Type: ${appointment.event_type || "Event"}`, 14, 57)
    doc.text(`Event Date: ${eventDate}`, 14, 64)
    doc.text(`Guest Count: ${appointment.guest_count} guests`, 14, 71)
    doc.text(`Venue: ${appointment.venue_address || "To be confirmed"}`, 14, 78)
    if (appointment.contact_phone) {
      doc.text(`Contact: ${appointment.contact_phone}`, 14, 85)
    }

    const equipmentByCategory: Record<string, typeof equipmentWithMatches> = {}
    equipmentWithMatches.forEach((pred) => {
      if (!equipmentByCategory[pred.category]) {
        equipmentByCategory[pred.category] = []
      }
      equipmentByCategory[pred.category].push(pred)
    })

    let yPos = 95

    Object.entries(equipmentByCategory).forEach(([category, items]) => {
      if (yPos > 250) {
        doc.addPage()
        yPos = 20
      }

      doc.setFontSize(12)
      doc.setTextColor(37, 99, 235)
      doc.text(category, 14, yPos)
      yPos += 5

      items.forEach((item) => {
        if (yPos > 270) {
          doc.addPage()
          yPos = 20
        }

        doc.setFontSize(10)
        doc.setTextColor(0, 0, 0)
        doc.setFont("helvetica", "bold")
        doc.text(`${item.item} - Qty: ${item.quantity}`, 20, yPos)
        yPos += 5

        doc.setFont("helvetica", "normal")
        doc.setFontSize(9)
        const reasonLines = doc.splitTextToSize(`Reason: ${item.reason}`, 170)
        doc.text(reasonLines, 20, yPos)
        yPos += reasonLines.length * 4 + 3

        if (item.inventoryMatches && item.inventoryMatches.matches && item.inventoryMatches.matches.length > 0) {
          doc.setFontSize(9)
          doc.setFont("helvetica", "bold")
          doc.setTextColor(0, 100, 0)
          doc.text("Available in Inventory:", 25, yPos)
          yPos += 5

          const matchesData = item.inventoryMatches.matches.map((match) => [
            match.item_name,
            match.match_confidence,
            match.available.toString(),
            match.sufficient ? "Yes" : "No",
            match.reason,
          ])

          doc.autoTable({
            startY: yPos,
            head: [["Item", "Match", "Available", "Sufficient", "Reason"]],
            body: matchesData,
            theme: "grid",
            headStyles: { fillColor: [22, 163, 74], fontSize: 8 },
            bodyStyles: { fontSize: 8 },
            columnStyles: {
              0: { cellWidth: 40 },
              1: { cellWidth: 20 },
              2: { cellWidth: 20 },
              3: { cellWidth: 20 },
              4: { cellWidth: 80 },
            },
            margin: { left: 25 },
          })

          yPos = doc.lastAutoTable.finalY + 3

          doc.setFontSize(8)
          doc.setFont("helvetica", "bold")
          doc.setTextColor(
            item.inventoryMatches.can_fulfill ? 0 : 255,
            item.inventoryMatches.can_fulfill ? 128 : 0,
            item.inventoryMatches.can_fulfill ? 0 : 0,
          )
          doc.text(
            item.inventoryMatches.can_fulfill ? "✓ Sufficient Inventory Available" : "✗ Insufficient Inventory",
            25,
            yPos,
          )
          yPos += 4

          if (item.inventoryMatches.recommendations) {
            doc.setTextColor(100, 100, 100)
            doc.setFont("helvetica", "italic")
            const recLines = doc.splitTextToSize(`Note: ${item.inventoryMatches.recommendations}`, 160)
            doc.text(recLines, 25, yPos)
            yPos += recLines.length * 3 + 2
          }

          doc.setTextColor(0, 0, 0)
        } else {
          doc.setFontSize(8)
          doc.setFont("helvetica", "italic")
          doc.setTextColor(128, 128, 128)
          doc.text("No matching inventory items found - may need to procure", 25, yPos)
          yPos += 4
        }

        yPos += 5
      })

      yPos += 3
    })

    if (mainCourses.length > 0) {
      if (yPos > 240) {
        doc.addPage()
        yPos = 20
      }

      doc.setFontSize(12)
      doc.setTextColor(37, 99, 235)
      doc.text("Menu Items for Reference", 14, yPos)
      yPos += 7

      doc.setFontSize(9)
      doc.setTextColor(0, 0, 0)
      mainCourses.forEach((course) => {
        if (yPos > 280) {
          doc.addPage()
          yPos = 20
        }
        doc.text(`• ${course}`, 20, yPos)
        yPos += 5
      })
    }

    if (yPos > 240) {
      doc.addPage()
      yPos = 20
    }

    yPos += 10
    doc.setFontSize(14)
    doc.setTextColor(22, 163, 74)
    doc.text("Equipment Summary", 14, yPos)

    const totalItems = equipmentPredictions.reduce((sum, pred) => sum + pred.quantity, 0)

    doc.setFontSize(10)
    doc.setTextColor(0, 0, 0)
    doc.text(`Total Equipment Categories: ${Object.keys(equipmentByCategory).length}`, 14, yPos + 10)
    doc.text(`Total Items Required: ${totalItems}`, 14, yPos + 17)

    const pageCount = doc.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)
      doc.setFontSize(8)
      doc.setTextColor(150, 150, 150)
      doc.text("Jo-ACMS - Equipment Management System", 14, 290)
      doc.text(`Page ${i} of ${pageCount}`, 195, 290, { align: "right" })
    }

    const pdfBuffer = doc.output("arraybuffer")

    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="Equipment_List_${appointment.contact_first_name}_${appointment.contact_last_name}_${new Date().toISOString().split("T")[0]}.pdf"`,
      },
    })
  } catch (error) {
    console.error("[v0] Equipment PDF - Error:", error)
    return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 })
  }
}
