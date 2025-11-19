import { NextResponse, type NextRequest } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export const dynamic = "force-dynamic"

// Weight estimation per guest (in grams)
const WEIGHT_PER_GUEST = {
  beef: 200,
  pork: 200,
  chicken: 180,
  seafood: 160,
  vegetables: 120,
  default: 150,
}

function getIngredientCategory(itemName: string): string {
  const name = itemName.toLowerCase()
  if (name.includes("beef") || name.includes("steak") || name.includes("brisket")) return "beef"
  if (name.includes("pork") || name.includes("ham") || name.includes("bacon")) return "pork"
  if (name.includes("chicken") || name.includes("poultry")) return "chicken"
  if (name.includes("fish") || name.includes("salmon") || name.includes("seafood") || name.includes("shrimp"))
    return "seafood"
  if (name.includes("vegetable") || name.includes("veggie") || name.includes("salad")) return "vegetables"
  return "other"
}

function calculateWeight(itemName: string, guestCount: number): number {
  const category = getIngredientCategory(itemName)
  const weightPerGuest = WEIGHT_PER_GUEST[category as keyof typeof WEIGHT_PER_GUEST] || WEIGHT_PER_GUEST.default
  return (weightPerGuest * guestCount) / 1000 // Convert to kg
}

function parseMainCourses(mainCourses: any): any[] {
  if (!mainCourses) return []

  const courses = []

  try {
    const menuData = typeof mainCourses === "string" ? JSON.parse(mainCourses) : mainCourses

    if (Array.isArray(menuData)) {
      menuData.forEach((item) => {
        if (typeof item === "string") {
          courses.push(item)
        } else if (typeof item === "object" && item !== null && item.name) {
          courses.push(item.name)
        }
      })
      return courses.filter((item) => item && typeof item === "string")
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
        } else if (typeof value === "string") {
          courses.push(value)
        } else if (typeof value === "object" && value !== null && (value as any).name) {
          courses.push((value as any).name)
        }
      })
    }
  } catch (error) {
    console.error("Error parsing main courses:", error)
  }

  return courses.filter((item) => item && typeof item === "string")
}

async function fetchDishIngredients(dishName: string, guestCount: number) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || "http://jo-acms.vercel.app"}/api/admin/dish-ingredients-research`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          dishName: dishName.trim(),
          guestCount,
        }),
      },
    )

    if (!response.ok) {
      console.error(`Failed to fetch ingredients for ${dishName}`)
      return null
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error(`Error fetching ingredients for ${dishName}:`, error)
    return null
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const appointmentId = searchParams.get("appointmentId")

    if (appointmentId) {
      const { data: appointment, error } = await supabaseAdmin
        .from("tbl_comprehensive_appointments")
        .select(`
          id,
          event_date,
          event_type,
          contact_first_name,
          contact_last_name,
          guest_count,
          main_courses,
          pasta_selection,
          dessert_selection,
          beverage_selection,
          status
        `)
        .eq("id", appointmentId)
        .single()

      if (error || !appointment) {
        return NextResponse.json({ error: "Appointment not found" }, { status: 404 })
      }

      const mainCourses = parseMainCourses(appointment.main_courses)
      const customerName = `${appointment.contact_first_name} ${appointment.contact_last_name}`

      // Fetch detailed ingredients for each main course
      const mainCourseDetails = await Promise.all(
        mainCourses.map(async (dishName) => {
          const details = await fetchDishIngredients(dishName, appointment.guest_count)
          return {
            name: dishName,
            category: getIngredientCategory(dishName),
            weight_kg: calculateWeight(dishName, appointment.guest_count),
            ingredients: details?.ingredients?.main || [],
            cookingNotes: details?.cookingNotes || "",
          }
        }),
      )

      // Generate PDF
      const jsPDF = (await import("jspdf")).default
      const autoTable = (await import("jspdf-autotable")).default

      const doc = new jsPDF()

      // Header
      doc.setFontSize(20)
      doc.setTextColor(225, 29, 72)
      doc.text("Ingredient List for Kitchen", 105, 20, { align: "center" })

      doc.setFontSize(12)
      doc.setTextColor(0, 0, 0)
      doc.text(`Customer: ${customerName}`, 14, 35)
      doc.text(`Event Type: ${appointment.event_type || "Event"}`, 14, 42)
      doc.text(`Event Date: ${new Date(appointment.event_date).toLocaleDateString()}`, 14, 49)
      doc.text(`Guest Count: ${appointment.guest_count}`, 14, 56)

      doc.setFontSize(10)
      doc.setTextColor(100, 100, 100)
      doc.text(`Generated on ${new Date().toLocaleString()}`, 14, 63)

      let yPos = 75

      // Main Courses Section
      doc.setFontSize(14)
      doc.setTextColor(225, 29, 72)
      doc.text("Main Courses", 14, yPos)

      for (const dish of mainCourseDetails) {
        yPos += 10

        if (yPos > 250) {
          doc.addPage()
          yPos = 20
        }

        // Dish Name
        doc.setFontSize(12)
        doc.setTextColor(0, 0, 0)
        doc.text(`${dish.name} (est ${dish.weight_kg} kg)`, 14, yPos)

        yPos += 5

        // Ingredients Table
        if (dish.ingredients && dish.ingredients.length > 0) {
          const ingredientRows = dish.ingredients.map((ingredient: any) => [ingredient.name, ingredient.quantity])

          autoTable(doc, {
            startY: yPos,
            head: [["Ingredient", "Quantity"]],
            body: ingredientRows,
            theme: "striped",
            headStyles: { fillColor: [225, 29, 72], fontSize: 10 },
            styles: { fontSize: 9 },
            margin: { left: 20 },
          })

          yPos = (doc as any).lastAutoTable.finalY + 5
        } else {
          doc.setFontSize(9)
          doc.setTextColor(150, 150, 150)
          doc.text("No detailed ingredients available", 20, yPos)
          yPos += 5
        }

        // Cooking Notes
        if (dish.cookingNotes) {
          if (yPos > 240) {
            doc.addPage()
            yPos = 20
          }

          doc.setFontSize(10)
          doc.setTextColor(100, 100, 100)
          doc.text("Cooking Notes:", 20, yPos)
          yPos += 5

          doc.setFontSize(9)
          const splitNotes = doc.splitTextToSize(dish.cookingNotes, 170)
          doc.text(splitNotes, 20, yPos)
          yPos += splitNotes.length * 5 + 5
        }

        yPos += 5
      }

      // Additional Items Section
      if (yPos > 230) {
        doc.addPage()
        yPos = 20
      }

      doc.setFontSize(14)
      doc.setTextColor(225, 29, 72)
      doc.text("Additional Items", 14, yPos)
      yPos += 10

      const additionalItems = []
      if (appointment.pasta_selection) {
        additionalItems.push(["Pasta", appointment.pasta_selection])
      }
      if (appointment.dessert_selection) {
        additionalItems.push(["Dessert", appointment.dessert_selection])
      }
      if (appointment.beverage_selection) {
        additionalItems.push(["Beverage", appointment.beverage_selection])
      }

      if (additionalItems.length > 0) {
        autoTable(doc, {
          startY: yPos,
          head: [["Category", "Selection"]],
          body: additionalItems,
          theme: "grid",
          headStyles: { fillColor: [225, 29, 72], fontSize: 10 },
          styles: { fontSize: 9 },
        })
      } else {
        doc.setFontSize(9)
        doc.setTextColor(150, 150, 150)
        doc.text("No additional items", 14, yPos)
      }

      // Footer
      const pageCount = doc.getNumberOfPages()
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i)
        doc.setFontSize(8)
        doc.setTextColor(150, 150, 150)
        doc.text("Jo-ACMS - Kitchen Ingredient List", 14, 290)
        doc.text(`Page ${i} of ${pageCount}`, 195, 290, { align: "right" })
      }

      const pdfBuffer = doc.output("arraybuffer")

      return new NextResponse(pdfBuffer, {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="ingredients-${customerName.replace(/[^a-z0-9]/gi, "-")}-${new Date().toISOString().split("T")[0]}.pdf"`,
        },
      })
    }

    // Fetch event ingredients data
    const today = new Date()
    const todayStr = today.toISOString().split("T")[0]

    const { data: appointments, error } = await supabaseAdmin
      .from("tbl_comprehensive_appointments")
      .select(`
        id,
        event_date,
        event_type,
        contact_first_name,
        contact_last_name,
        guest_count,
        main_courses,
        status,
        admin_notes
      `)
      .gte("event_date", todayStr)
      .order("event_date", { ascending: true })

    if (error) {
      console.error("Error fetching appointments:", error)
      return NextResponse.json({ error: "Failed to fetch appointments" }, { status: 500 })
    }

    const confirmedAppointments =
      appointments?.filter((appointment) =>
        ["confirmed", "tasting_confirmed", "tasting_completed"].includes(appointment.status?.toLowerCase() || ""),
      ) || []

    const pendingAppointments =
      confirmedAppointments.filter(
        (appointment) => !appointment.admin_notes || !appointment.admin_notes.includes("INGREDIENTS_CONFIRMED"),
      ) || []

    const eventIngredients = pendingAppointments
      .map((appointment) => {
        const eventDate = new Date(appointment.event_date)
        const daysUntilEvent = Math.ceil((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

        const mainCourses = parseMainCourses(appointment.main_courses)

        const mainCourseItems = mainCourses.map((item) => ({
          name: item,
          category: getIngredientCategory(item),
          weight_kg: calculateWeight(item, appointment.guest_count),
        }))

        const totalWeight = mainCourseItems.reduce((sum, item) => sum + item.weight_kg, 0)

        return {
          id: appointment.id,
          event_date: appointment.event_date,
          event_type: appointment.event_type || "Event",
          customer_name: `${appointment.contact_first_name} ${appointment.contact_last_name}`,
          guest_count: appointment.guest_count,
          main_course_items: mainCourseItems,
          total_weight_kg: Math.round(totalWeight * 100) / 100,
          days_until_event: daysUntilEvent,
        }
      })
      .filter((event) => event.main_course_items.length > 0)

    // Calculate summary
    const categoryBreakdown: Record<string, number> = {}
    eventIngredients.forEach((event) => {
      event.main_course_items.forEach((item) => {
        categoryBreakdown[item.category] = (categoryBreakdown[item.category] || 0) + item.weight_kg
      })
    })

    Object.keys(categoryBreakdown).forEach((category) => {
      categoryBreakdown[category] = Math.round(categoryBreakdown[category] * 100) / 100
    })

    const totalWeight = Math.round(eventIngredients.reduce((sum, event) => sum + event.total_weight_kg, 0) * 100) / 100

    // Generate PDF
    const jsPDF = (await import("jspdf")).default
    const autoTable = (await import("jspdf-autotable")).default

    const doc = new jsPDF()

    // Header
    doc.setFontSize(22)
    doc.setTextColor(225, 29, 72) // Rose color
    doc.text("Event Ingredients Overview", 105, 20, { align: "center" })

    doc.setFontSize(10)
    doc.setTextColor(100, 100, 100)
    doc.text(`Generated on ${new Date().toLocaleString()}`, 105, 28, { align: "center" })

    // Summary Section
    doc.setFontSize(14)
    doc.setTextColor(0, 0, 0)
    doc.text("Executive Summary", 14, 40)

    doc.setFontSize(10)
    doc.text(`Total Events: ${eventIngredients.length}`, 14, 50)
    doc.text(`Total Guests: ${eventIngredients.reduce((sum, event) => sum + event.guest_count, 0)}`, 14, 57)
    doc.text(`Total Ingredient Weight: est ${totalWeight} kg`, 14, 64)

    // Category Breakdown
    let yPos = 75
    doc.setFontSize(14)
    doc.setTextColor(0, 0, 0)
    doc.text("Ingredient Categories Breakdown", 14, yPos)

    const categoryRows = Object.entries(categoryBreakdown).map(([category, weight]) => [
      category.charAt(0).toUpperCase() + category.slice(1),
      `est ${weight} kg`,
    ])

    autoTable(doc, {
      startY: yPos + 5,
      head: [["Category", "Total Weight"]],
      body: categoryRows,
      theme: "grid",
      headStyles: { fillColor: [225, 29, 72] },
      styles: { fontSize: 10 },
    })

    // Events List
    yPos = (doc as any).lastAutoTable.finalY + 15

    if (yPos > 250) {
      doc.addPage()
      yPos = 20
    }

    doc.setFontSize(14)
    doc.setTextColor(0, 0, 0)
    doc.text("Upcoming Events - Detailed Breakdown", 14, yPos)

    eventIngredients.forEach((event, index) => {
      yPos += 10

      if (yPos > 260) {
        doc.addPage()
        yPos = 20
      }

      // Event Header
      doc.setFontSize(12)
      doc.setTextColor(225, 29, 72)
      doc.text(`${index + 1}. ${event.customer_name} - ${event.event_type}`, 14, yPos)

      yPos += 7
      doc.setFontSize(9)
      doc.setTextColor(100, 100, 100)
      doc.text(
        `Date: ${new Date(event.event_date).toLocaleDateString()} | Guests: ${event.guest_count} | Days Until: ${event.days_until_event}`,
        14,
        yPos,
      )

      // Menu Items Table
      const menuRows = event.main_course_items.map((item) => [item.name, item.category, `est ${item.weight_kg} kg`])

      autoTable(doc, {
        startY: yPos + 3,
        head: [["Dish Name", "Category", "Weight"]],
        body: menuRows,
        theme: "striped",
        headStyles: { fillColor: [225, 29, 72], fontSize: 9 },
        styles: { fontSize: 8 },
        margin: { left: 20 },
      })

      yPos = (doc as any).lastAutoTable.finalY + 2

      // Event Total
      doc.setFontSize(10)
      doc.setTextColor(0, 0, 0)
      doc.text(`Event Total: est ${event.total_weight_kg} kg`, 20, yPos)

      yPos += 5
    })

    // Footer
    const pageCount = doc.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)
      doc.setFontSize(8)
      doc.setTextColor(150, 150, 150)
      doc.text("Jo-ACMS - Event Ingredients Report", 14, 290)
      doc.text(`Page ${i} of ${pageCount}`, 195, 290, { align: "right" })
    }

    const pdfBuffer = doc.output("arraybuffer")

    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="event-ingredients-${new Date().toISOString().split("T")[0]}.pdf"`,
      },
    })
  } catch (error) {
    console.error("Error generating PDF:", error)
    return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 })
  }
}
