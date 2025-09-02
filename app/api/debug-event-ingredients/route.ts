import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

function parseMainCourses(mainCourses: any): any[] {
  if (!mainCourses) return []

  const courses = []

  try {
    // Handle string JSON
    const menuData = typeof mainCourses === "string" ? JSON.parse(mainCourses) : mainCourses

    console.log("Parsing main courses data:", JSON.stringify(menuData, null, 2))

    // If it's an array, extract names from objects or return strings directly
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

    // If it's an object, extract all values that are arrays or objects with names
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

export async function GET() {
  try {
    console.log("=== Debug Event Ingredients Overview ===")

    // Get all appointments (last 10 for debugging)
    const { data: allAppointments, error: allError } = await supabaseAdmin
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
        admin_notes,
        created_at
      `)
      .order("created_at", { ascending: false })
      .limit(10)

    if (allError) {
      console.error("Error fetching all appointments:", allError)
      return NextResponse.json({ error: "Failed to fetch appointments" }, { status: 500 })
    }

    // Get future appointments
    const { data: futureAppointments, error: futureError } = await supabaseAdmin
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
      .gte("event_date", new Date().toISOString().split("T")[0])
      .order("event_date", { ascending: true })

    if (futureError) {
      console.error("Error fetching future appointments:", futureError)
      return NextResponse.json({ error: "Failed to fetch future appointments" }, { status: 500 })
    }

    // Get confirmed appointments
    const confirmedAppointments =
      futureAppointments?.filter((appointment) => ["confirmed", "tasting_confirmed"].includes(appointment.status)) || []

    // Filter out events that have already been confirmed for ingredients
    const pendingAppointments = confirmedAppointments.filter(
      (appointment) => !appointment.admin_notes || !appointment.admin_notes.includes("INGREDIENTS_CONFIRMED"),
    )

    // Analyze main courses parsing
    const mainCoursesAnalysis = confirmedAppointments.map((appointment) => {
      const rawMainCourses = appointment.main_courses
      const parsedCourses = parseMainCourses(rawMainCourses)

      return {
        id: appointment.id,
        customer_name: `${appointment.contact_first_name} ${appointment.contact_last_name}`,
        event_date: appointment.event_date,
        status: appointment.status,
        raw_main_courses: rawMainCourses,
        parsed_courses: parsedCourses,
        parse_success: parsedCourses.length > 0,
        admin_notes: appointment.admin_notes,
      }
    })

    const summary = {
      total_appointments: allAppointments?.length || 0,
      future_appointments: futureAppointments?.length || 0,
      confirmed_appointments: confirmedAppointments.length,
      pending_ingredient_confirmation: pendingAppointments.length,
      appointments_with_main_courses: mainCoursesAnalysis.filter((a) => a.parse_success).length,
    }

    return NextResponse.json({
      summary,
      all_appointments: allAppointments?.map((a) => ({
        id: a.id,
        customer_name: `${a.contact_first_name} ${a.contact_last_name}`,
        event_date: a.event_date,
        status: a.status,
        has_main_courses: !!a.main_courses,
        admin_notes: a.admin_notes,
      })),
      future_appointments: futureAppointments?.map((a) => ({
        id: a.id,
        customer_name: `${a.contact_first_name} ${a.contact_last_name}`,
        event_date: a.event_date,
        status: a.status,
        has_main_courses: !!a.main_courses,
        admin_notes: a.admin_notes,
      })),
      confirmed_appointments: confirmedAppointments.map((a) => ({
        id: a.id,
        customer_name: `${a.contact_first_name} ${a.contact_last_name}`,
        event_date: a.event_date,
        status: a.status,
        has_main_courses: !!a.main_courses,
        admin_notes: a.admin_notes,
      })),
      main_courses_analysis: mainCoursesAnalysis,
    })
  } catch (error) {
    console.error("Error in debug event ingredients API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
