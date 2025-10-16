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
          remaining_balance
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

        const selectedMenu = transaction.tbl_comprehensive_appointments?.selected_menu
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
