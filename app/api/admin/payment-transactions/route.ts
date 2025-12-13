import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET(request: Request) {
  console.log("===========================================")
  console.log("=== PAYMENT TRANSACTIONS API V6 CALLED ===")
  console.log("===========================================")

  try {
    console.log("Step 1: Fetching transactions from database...")

    const { data: transactions, error } = await supabaseAdmin
      .from("tbl_payment_transactions")
      .select(`
        id,
        appointment_id,
        user_id,
        amount,
        payment_type,
        payment_method,
        reference_number,
        notes,
        proof_image_url,
        status,
        admin_notes,
        created_at,
        updated_at,
        tbl_users (
          id, 
          full_name,
          first_name,
          email, 
          phone
        ),
        tbl_comprehensive_appointments (
          id, 
          event_type, 
          event_date, 
          event_time, 
          guest_count,
          venue_address,
          total_package_amount, 
          down_payment_amount,
          payment_status,
          selected_menu,
          theme,
          remaining_balance,
          contact_first_name,
          contact_last_name,
          contact_email,
          contact_phone,
          main_courses,
          pasta_selection,
          dessert_selection,
          beverage_selection
        )
      `)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("ERROR fetching transactions:", error)
      return NextResponse.json(
        { success: false, message: "Failed to fetch transactions", error: error.message },
        { status: 500 },
      )
    }

    console.log(`Step 2: Successfully fetched ${transactions?.length || 0} transactions`)

    if (!transactions || transactions.length === 0) {
      console.log("No transactions found, returning empty array")
      return NextResponse.json({
        success: true,
        transactions: [],
      })
    }

    console.log("Step 3: Processing transactions to add menu items...")

    const processedTransactions = await Promise.all(
      transactions.map(async (transaction, index) => {
        console.log(`\n--- Transaction ${index + 1}/${transactions.length} ---`)
        console.log(`Transaction ID: ${transaction.id}`)

        const appointment = transaction.tbl_comprehensive_appointments
        const selectedMenu = appointment?.selected_menu

        const isWalkIn = !transaction.user_id && appointment?.contact_first_name
        console.log("Is walk-in customer?", isWalkIn)

        // If walk-in, process the walk-in menu fields
        if (isWalkIn && appointment) {
          console.log("✅ Processing walk-in customer menu...")
          console.log("[v0] Walk-in menu fields:")
          console.log("[v0] - main_courses:", appointment.main_courses)
          console.log("[v0] - pasta_selection:", appointment.pasta_selection)
          console.log("[v0] - dessert_selection:", appointment.dessert_selection)
          console.log("[v0] - beverage_selection:", appointment.beverage_selection)

          const mainCourses = []
          const extras = []

          // Helper function to fetch menu items by ID
          async function fetchMenuItemsByIds(ids: number[], category: string) {
            if (!ids || ids.length === 0) return []

            console.log(`  Looking up ${category} IDs:`, ids)
            const { data: items, error: itemError } = await supabaseAdmin
              .from("tbl_menu_items")
              .select("id, name, category, description, price")
              .in("id", ids)

            if (itemError) {
              console.error(`  ❌ Error fetching ${category}:`, itemError.message)
              return []
            }

            console.log(`  ✅ Found ${items?.length || 0} ${category} items`)
            return items || []
          }

          if (appointment.main_courses) {
            console.log("[v0] Processing main courses, type:", typeof appointment.main_courses)
            console.log("[v0] main_courses value:", JSON.stringify(appointment.main_courses))

            // Check if it's an array of objects with 'name' property
            if (
              Array.isArray(appointment.main_courses) &&
              appointment.main_courses.length > 0 &&
              typeof appointment.main_courses[0] === "object" &&
              appointment.main_courses[0].name
            ) {
              console.log("[v0] ✅ main_courses already contains objects, using directly")

              // Fetch full menu item details by name to get prices and descriptions
              for (const course of appointment.main_courses) {
                const { data: items, error: itemError } = await supabaseAdmin
                  .from("tbl_menu_items")
                  .select("id, name, category, description, price")
                  .eq("name", course.name)
                  .limit(1)

                if (items && items.length > 0) {
                  mainCourses.push(items[0])
                  console.log(`[v0] Found full details for: ${course.name}`)
                } else {
                  // If not found in DB, use the object as-is
                  mainCourses.push(course)
                  console.log(`[v0] Using stored data for: ${course.name}`)
                }
              }
            } else {
              // It's an array of IDs, fetch from database
              console.log("[v0] main_courses contains IDs, fetching from database")
              const mainCourseItems = await fetchMenuItemsByIds(appointment.main_courses, "main courses")
              mainCourses.push(...mainCourseItems)
            }
            console.log("[v0] Final main courses count:", mainCourses.length)
          }

          // Process walk-in pasta
          if (appointment.pasta_selection) {
            const pastaItems = await fetchMenuItemsByIds([appointment.pasta_selection], "pasta")
            extras.push(...pastaItems)
          }

          // Process walk-in dessert
          if (appointment.dessert_selection) {
            const dessertItems = await fetchMenuItemsByIds([appointment.dessert_selection], "dessert")
            extras.push(...dessertItems)
          }

          // Process walk-in beverage
          if (appointment.beverage_selection) {
            const beverageItems = await fetchMenuItemsByIds([appointment.beverage_selection], "beverage")
            extras.push(...beverageItems)
          }

          console.log(`✅ Walk-in menu processed: ${mainCourses.length} main courses, ${extras.length} extras`)

          return {
            ...transaction,
            menu_items: {
              main_courses: mainCourses,
              extras: extras,
            },
          }
        }

        console.log("Has selected_menu?", !!selectedMenu)
        console.log("Selected menu type:", typeof selectedMenu)

        if (!selectedMenu || typeof selectedMenu !== "object") {
          console.log("❌ No valid selected_menu, skipping menu processing")
          return {
            ...transaction,
            menu_items: {
              main_courses: [],
              extras: [],
            },
          }
        }

        console.log("✅ Valid selected_menu found:", JSON.stringify(selectedMenu, null, 2))

        const mainCourses = []
        const extras = []

        // Helper function to fetch menu item by name
        async function fetchMenuItemByName(name: string, category: string) {
          console.log(`  Looking up ${category}: "${name}"`)

          const { data: items, error: itemError } = await supabaseAdmin
            .from("tbl_menu_items")
            .select("id, name, category, description, price")
            .eq("name", name)
            .limit(1)

          if (itemError) {
            console.error(`  ❌ Error fetching ${category} "${name}":`, itemError.message)
            return null
          } else if (items && items.length > 0) {
            console.log(`  ✅ Found ${category}: ${items[0].name}`)
            return items[0]
          } else {
            console.log(`  ⚠️ ${category} "${name}" not found in database`)
            return null
          }
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
          console.log(`Processing ${selectedMenu.main_courses.length} main courses...`)

          for (let i = 0; i < selectedMenu.main_courses.length; i++) {
            const course = selectedMenu.main_courses[i]
            console.log(`  Main course ${i + 1}:`, JSON.stringify(course))

            let courseName: string | null = null

            if (typeof course === "string") {
              courseName = course
            } else if (typeof course === "object" && course !== null) {
              if (course.id) {
                const { data: items, error: itemError } = await supabaseAdmin
                  .from("tbl_menu_items")
                  .select("id, name, category, description, price")
                  .eq("id", course.id)
                  .limit(1)

                if (itemError) {
                  console.error(`  ❌ Error fetching main course by ID ${course.id}:`, itemError.message)
                } else if (items && items.length > 0) {
                  console.log(`  ✅ Found by ID: ${items[0].name} (${items[0].category})`)
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
            } else {
              console.log(`  ⚠️ Could not extract name or ID from course:`, course)
            }
          }
        } else {
          console.log("⚠️ main_courses is not an array")
        }

        // Process pasta (can be comma-separated)
        if (selectedMenu.pasta) {
          console.log(`Fetching pasta: "${selectedMenu.pasta}"`)
          const pastaItems = await fetchMultipleItems(selectedMenu.pasta, "pasta")
          extras.push(...pastaItems)
        }

        // Process dessert (can be comma-separated)
        if (selectedMenu.dessert) {
          console.log(`Fetching dessert: "${selectedMenu.dessert}"`)
          const dessertItems = await fetchMultipleItems(selectedMenu.dessert, "dessert")
          extras.push(...dessertItems)
        }

        // Process beverage (can be comma-separated)
        if (selectedMenu.beverage) {
          console.log(`Fetching beverage: "${selectedMenu.beverage}"`)
          const beverageItems = await fetchMultipleItems(selectedMenu.beverage, "beverage")
          extras.push(...beverageItems)
        }

        console.log(`✅ Finished: ${mainCourses.length} main courses, ${extras.length} extras`)

        return {
          ...transaction,
          menu_items: {
            main_courses: mainCourses,
            extras: extras,
          },
        }
      }),
    )

    console.log("\n===========================================")
    console.log("Step 4: All transactions processed!")
    console.log(`Total transactions: ${processedTransactions.length}`)

    if (processedTransactions.length > 0) {
      console.log("First transaction menu_items:", processedTransactions[0].menu_items)
      console.log("  Main courses:", processedTransactions[0].menu_items.main_courses.length)
      console.log("  Extras:", processedTransactions[0].menu_items.extras.length)
    }
    console.log("===========================================\n")

    return NextResponse.json({
      success: true,
      transactions: processedTransactions,
    })
  } catch (error: any) {
    console.error("UNEXPECTED ERROR:", error)
    return NextResponse.json(
      { success: false, message: "An unexpected error occurred", error: error.message },
      { status: 500 },
    )
  }
}
