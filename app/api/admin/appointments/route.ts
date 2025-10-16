import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export async function GET() {
  try {
    console.log("=== Admin: Fetching all appointments ===")

    const { data: appointments, error } = await supabaseAdmin
      .from("tbl_comprehensive_appointments")
      .select(`
        *,
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
        { status: 500 },
      )
    }

    console.log(`Found ${appointments?.length || 0} appointments`)

    const appointmentsWithMenuItems = await Promise.all(
      (appointments || []).map(async (appointment) => {
        try {
          console.log("Processing appointment:", appointment.id)
          console.log("Raw selected_menu:", appointment.selected_menu)

          let menuData = appointment.selected_menu
          if (typeof menuData === "string") {
            try {
              menuData = JSON.parse(menuData)
              console.log("Parsed menu data:", menuData)
            } catch (e) {
              console.error("Error parsing menu data for appointment", appointment.id, e)
              menuData = null
            }
          }

          if (!menuData) {
            console.log("No menu data for appointment:", appointment.id)
            return {
              ...appointment,
              menu_items: null,
            }
          }

          // Collect menu item IDs from main_courses
          const menuItemIds: string[] = []
          if (menuData.main_courses && Array.isArray(menuData.main_courses)) {
            const mainIds = menuData.main_courses.map((item: any) => item.id).filter(Boolean)
            console.log("Main course IDs:", mainIds)
            menuItemIds.push(...mainIds)
          }

          // Collect menu item names for extras (pasta, dessert, beverage)
          const extraNames: string[] = []
          if (menuData.pasta) extraNames.push(menuData.pasta)
          if (menuData.dessert) extraNames.push(menuData.dessert)
          if (menuData.beverage) extraNames.push(menuData.beverage)

          console.log("Extra names to fetch:", extraNames)

          // Fetch menu items by IDs and names
          const menuItems: any[] = []

          if (menuItemIds.length > 0) {
            const { data: itemsById, error: menuErrorById } = await supabaseAdmin
              .from("tbl_menu_items")
              .select("*")
              .in("id", menuItemIds)

            if (menuErrorById) {
              console.error("Error fetching menu items by ID:", menuErrorById)
            } else if (itemsById) {
              menuItems.push(...itemsById)
            }
          }

          if (extraNames.length > 0) {
            const { data: itemsByName, error: menuErrorByName } = await supabaseAdmin
              .from("tbl_menu_items")
              .select("*")
              .in("name", extraNames)

            if (menuErrorByName) {
              console.error("Error fetching menu items by name:", menuErrorByName)
            } else if (itemsByName) {
              menuItems.push(...itemsByName)
            }
          }

          console.log("Fetched all menu items:", menuItems)

          // Process main courses
          const mainCourses =
            menuData.main_courses?.map((selected: any) => {
              const item = menuItems.find((m) => m.id === selected.id)
              return {
                id: selected.id || "",
                name: item?.name || selected.name || "Unknown",
                category: item?.category || selected.category || "Unknown",
                description: item?.description || "",
                quantity: 1,
              }
            }) || []

          // Process extras (pasta, dessert, beverage)
          const extras: any[] = []

          if (menuData.pasta) {
            const pastaItem = menuItems.find((m) => m.name === menuData.pasta)
            extras.push({
              id: pastaItem?.id || "",
              name: menuData.pasta,
              category: pastaItem?.category || "pasta",
              description: pastaItem?.description || "",
              quantity: 1,
            })
          }

          if (menuData.dessert) {
            const dessertItem = menuItems.find((m) => m.name === menuData.dessert)
            extras.push({
              id: dessertItem?.id || "",
              name: menuData.dessert,
              category: dessertItem?.category || "dessert",
              description: dessertItem?.description || "",
              quantity: 1,
            })
          }

          if (menuData.beverage) {
            const beverageItem = menuItems.find((m) => m.name === menuData.beverage)
            extras.push({
              id: beverageItem?.id || "",
              name: menuData.beverage,
              category: beverageItem?.category || "beverage",
              description: beverageItem?.description || "",
              quantity: 1,
            })
          }

          const organizedMenu = {
            main_courses: mainCourses,
            extras: extras,
          }

          console.log("Final organized menu:", organizedMenu)
          console.log("Main courses count:", mainCourses.length)
          console.log("Extras count:", extras.length)

          return {
            ...appointment,
            menu_items: organizedMenu,
          }
        } catch (itemError) {
          console.error("Error processing appointment menu items:", appointment.id, itemError)
          return {
            ...appointment,
            menu_items: null,
          }
        }
      }),
    )

    return NextResponse.json({
      success: true,
      appointments: appointmentsWithMenuItems || [],
      count: appointmentsWithMenuItems?.length || 0,
    })
  } catch (error) {
    console.error("Unexpected error in admin appointments route:", error)
    return NextResponse.json(
      {
        success: false,
        message: "An unexpected error occurred",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
