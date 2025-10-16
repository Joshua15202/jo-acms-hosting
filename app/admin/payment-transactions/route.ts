import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET(request: Request) {
  console.log("===========================================")
  console.log("=== PAYMENT TRANSACTIONS API V2 CALLED ===")
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
          venue,
          venue_address,
          total_package_amount, 
          down_payment_amount,
          payment_status,
          selected_menu,
          event_theme,
          color_motif,
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

        // Process main courses
        if (Array.isArray(selectedMenu.main_courses)) {
          console.log(`Processing ${selectedMenu.main_courses.length} main courses...`)

          for (let i = 0; i < selectedMenu.main_courses.length; i++) {
            const course = selectedMenu.main_courses[i]
            console.log(`  Main course ${i + 1}:`, course)

            const courseId = typeof course === "object" && course.id ? course.id : course

            if (courseId) {
              const { data: item, error: itemError } = await supabaseAdmin
                .from("tbl_menu_items")
                .select("id, name, category, description, price")
                .eq("id", courseId)
                .single()

              if (itemError) {
                console.error(`  ❌ Error fetching main course ${courseId}:`, itemError.message)
              } else if (item) {
                console.log(`  ✅ Found: ${item.name} (${item.category})`)
                mainCourses.push(item)
              }
            }
          }
        } else {
          console.log("⚠️ main_courses is not an array")
        }

        // Process pasta
        if (selectedMenu.pasta) {
          console.log(`Fetching pasta: "${selectedMenu.pasta}"`)

          const { data: item, error: itemError } = await supabaseAdmin
            .from("tbl_menu_items")
            .select("id, name, category, description, price")
            .eq("name", selectedMenu.pasta)
            .single()

          if (itemError) {
            console.error("  ❌ Error fetching pasta:", itemError.message)
          } else if (item) {
            console.log(`  ✅ Found pasta: ${item.name}`)
            extras.push(item)
          } else {
            console.log("  ⚠️ Pasta not found in database")
          }
        }

        // Process dessert
        if (selectedMenu.dessert) {
          console.log(`Fetching dessert: "${selectedMenu.dessert}"`)

          const { data: item, error: itemError } = await supabaseAdmin
            .from("tbl_menu_items")
            .select("id, name, category, description, price")
            .eq("name", selectedMenu.dessert)
            .single()

          if (itemError) {
            console.error("  ❌ Error fetching dessert:", itemError.message)
          } else if (item) {
            console.log(`  ✅ Found dessert: ${item.name}`)
            extras.push(item)
          } else {
            console.log("  ⚠️ Dessert not found in database")
          }
        }

        // Process beverage
        if (selectedMenu.beverage) {
          console.log(`Fetching beverage: "${selectedMenu.beverage}"`)

          const { data: item, error: itemError } = await supabaseAdmin
            .from("tbl_menu_items")
            .select("id, name, category, description, price")
            .eq("name", selectedMenu.beverage)
            .single()

          if (itemError) {
            console.error("  ❌ Error fetching beverage:", itemError.message)
          } else if (item) {
            console.log(`  ✅ Found beverage: ${item.name}`)
            extras.push(item)
          } else {
            console.log("  ⚠️ Beverage not found in database")
          }
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
