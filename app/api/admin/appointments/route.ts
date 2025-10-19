export const dynamic = "force-dynamic"
export const revalidate = 0

import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export async function GET() {
  try {
    const headers = {
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    }

    console.log("=== Fetching appointments with menu processing ===")

    const { data: appointments, error } = await supabaseAdmin
      .from("tbl_comprehensive_appointments")
      .select(`
        id,
        user_id,
        event_type,
        event_date,
        event_time,
        guest_count,
        venue_address,
        budget_min,
        budget_max,
        special_requests,
        status,
        admin_notes,
        created_at,
        updated_at,
        celebrant_gender,
        selected_menu,
        tbl_users (
          id,
          full_name,
          email,
          phone
        )
      `)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching appointments:", error)
      return NextResponse.json(
        {
          success: false,
          message: "Failed to fetch appointments",
          error: error.message,
        },
        { status: 500, headers },
      )
    }

    console.log(`Fetched ${appointments?.length || 0} appointments`)

    // Process appointments to fetch menu items
    const processedAppointments = await Promise.all(
      appointments.map(async (appointment) => {
        const selectedMenu = appointment.selected_menu

        if (!selectedMenu || typeof selectedMenu !== "object") {
          return {
            ...appointment,
            menu_items: {
              main_courses: [],
              extras: [],
            },
          }
        }

        console.log(`Processing appointment ${appointment.id} menu:`, selectedMenu)

        const mainCourses = []
        const extras = []

        // Helper function to fetch menu item by name
        async function fetchMenuItemByName(name: string, category: string) {
          const { data: items, error: itemError } = await supabaseAdmin
            .from("tbl_menu_items")
            .select("id, name, category, description, price")
            .eq("name", name)
            .limit(1)

          if (itemError) {
            console.error(`Error fetching ${category} "${name}":`, itemError.message)
            return null
          } else if (items && items.length > 0) {
            return items[0]
          }
          return null
        }

        // Helper function to handle comma-separated items
        async function fetchMultipleItems(value: string, category: string) {
          const items = value.split(",").map((item) => item.trim())
          const results = []

          for (const itemName of items) {
            const item = await fetchMenuItemByName(itemName, category)
            if (item) {
              results.push(item)
            }
          }

          return results
        }

        // Process main courses
        if (Array.isArray(selectedMenu.main_courses)) {
          for (const course of selectedMenu.main_courses) {
            let courseName = null

            if (typeof course === "string") {
              courseName = course
            } else if (typeof course === "object" && course !== null) {
              if (course.id) {
                const { data: items, error: itemError } = await supabaseAdmin
                  .from("tbl_menu_items")
                  .select("id, name, category, description, price")
                  .eq("id", course.id)
                  .limit(1)

                if (!itemError && items && items.length > 0) {
                  mainCourses.push(items[0])
                }
                continue
              } else if (course.name) {
                courseName = course.name
              }
            }

            if (courseName) {
              const item = await fetchMenuItemByName(courseName, "main course")
              if (item) {
                mainCourses.push(item)
              }
            }
          }
        }

        // Process pasta
        if (selectedMenu.pasta) {
          const pastaItems = await fetchMultipleItems(selectedMenu.pasta, "pasta")
          extras.push(...pastaItems)
        }

        // Process dessert
        if (selectedMenu.dessert) {
          const dessertItems = await fetchMultipleItems(selectedMenu.dessert, "dessert")
          extras.push(...dessertItems)
        }

        // Process beverage
        if (selectedMenu.beverage) {
          const beverageItems = await fetchMultipleItems(selectedMenu.beverage, "beverage")
          extras.push(...beverageItems)
        }

        console.log(`Appointment ${appointment.id}: ${mainCourses.length} main courses, ${extras.length} extras`)

        return {
          ...appointment,
          menu_items: {
            main_courses: mainCourses,
            extras: extras,
          },
        }
      }),
    )

    console.log("All appointments processed with menu items")

    return NextResponse.json(
      {
        success: true,
        appointments: processedAppointments,
      },
      { headers },
    )
  } catch (error) {
    console.error("Unexpected error in appointments route:", error)
    return NextResponse.json(
      {
        success: false,
        message: "An unexpected error occurred",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      },
    )
  }
}
