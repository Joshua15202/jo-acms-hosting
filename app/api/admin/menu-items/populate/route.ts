import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

const DEFAULT_MENU_ITEMS = [
  // BEEF - ₱70 each
  {
    name: "Beef Broccoli",
    category: "beef",
    price: 70,
    description: "Tender beef with fresh broccoli in savory sauce",
  },
  { name: "Beef Caldereta", category: "beef", price: 70, description: "Filipino beef stew with vegetables" },
  {
    name: "Beef Mechado",
    category: "beef",
    price: 70,
    description: "Traditional Filipino beef dish with tomato sauce",
  },
  {
    name: "Roast Beef w/ Mashed Potato or w/ Mix Vegetable",
    category: "beef",
    price: 70,
    description: "Roast beef with choice of sides",
  },
  { name: "Kare-kare Oxtail", category: "beef", price: 70, description: "Filipino oxtail stew with peanut sauce" },
  {
    name: "Beef Teriyaki w/ Vegetable siding",
    category: "beef",
    price: 70,
    description: "Teriyaki beef with vegetable side dish",
  },
  { name: "Beef Lengua Pastel", category: "beef", price: 70, description: "Beef tongue in creamy sauce" },
  { name: "Garlic Beef", category: "beef", price: 70, description: "Beef sautéed with garlic" },
  { name: "Beef w/ Mushroom", category: "beef", price: 70, description: "Beef with mushrooms in savory sauce" },

  // CHICKEN - ₱60 each
  { name: "Chicken Alexander", category: "chicken", price: 60, description: "Creamy chicken dish with special sauce" },
  { name: "Sweet Fire Chicken", category: "chicken", price: 60, description: "Spicy sweet chicken with fire sauce" },
  { name: "Chicken Onion", category: "chicken", price: 60, description: "Chicken sautéed with onions" },
  { name: "Buttered Chicken", category: "chicken", price: 60, description: "Chicken in rich butter sauce" },
  { name: "Chicken Galantina", category: "chicken", price: 60, description: "Stuffed chicken roll with vegetables" },
  { name: "Fried Chicken", category: "chicken", price: 60, description: "Classic crispy fried chicken" },
  { name: "Chicken Cordon Blue", category: "chicken", price: 60, description: "Chicken stuffed with ham and cheese" },
  { name: "Chicken Pastel", category: "chicken", price: 60, description: "Filipino chicken pie with vegetables" },
  { name: "Chicken Teriyaki", category: "chicken", price: 60, description: "Japanese-style teriyaki chicken" },
  { name: "Breaded Fried Chicken", category: "chicken", price: 60, description: "Crispy breaded chicken" },
  { name: "Chicken Lollipop", category: "chicken", price: 60, description: "Chicken wings shaped like lollipops" },
  { name: "Lemon Chicken", category: "chicken", price: 60, description: "Chicken with tangy lemon sauce" },

  // PORK - ₱70 each
  { name: "Lengua Pastel", category: "pork", price: 70, description: "Pork tongue in creamy sauce" },
  { name: "Pork Teriyaki", category: "pork", price: 70, description: "Teriyaki-style pork" },
  { name: "Menudo", category: "pork", price: 70, description: "Filipino pork and liver stew" },
  { name: "Pork Kare-Kare", category: "pork", price: 70, description: "Pork in peanut sauce" },
  { name: "Pork Mahonado", category: "pork", price: 70, description: "Pork in tomato-based sauce" },
  { name: "Hawaiian Spareribs", category: "pork", price: 70, description: "Sweet and tangy pork ribs" },
  { name: "Braised Pork", category: "pork", price: 70, description: "Slow-cooked tender pork" },
  { name: "Embutido", category: "pork", price: 70, description: "Filipino meatloaf with eggs and vegetables" },
  { name: "Pork and Pickles", category: "pork", price: 70, description: "Pork with pickled vegetables" },
  { name: "Lumpiang Shanghai", category: "pork", price: 70, description: "Filipino spring rolls with pork" },

  // SEAFOOD - ₱50 each
  {
    name: "Fish Fillet w/ Tartar Sauce or Sweet and Sour Sauce",
    category: "seafood",
    price: 50,
    description: "Fish fillet with choice of sauce",
  },
  { name: "Camaron Rebosado", category: "seafood", price: 50, description: "Battered and fried shrimp" },
  { name: "Fish Tofu", category: "seafood", price: 50, description: "Fish and tofu combination dish" },
  { name: "Apple Fish Salad", category: "seafood", price: 50, description: "Fish salad with apple chunks" },
  { name: "Crispy Fish Fillet", category: "seafood", price: 50, description: "Crispy fried fish fillet" },
  { name: "Fisherman's Delight", category: "seafood", price: 50, description: "Mixed seafood dish" },

  // VEGETABLES - ₱50 each
  { name: "Chopsuey", category: "vegetables", price: 50, description: "Mixed vegetables stir-fry" },
  { name: "Green Peas", category: "vegetables", price: 50, description: "Fresh green peas dish" },
  { name: "Oriental Mixed Vegetables", category: "vegetables", price: 50, description: "Asian-style mixed vegetables" },
  {
    name: "Lumpiang Ubod (Fresh or Fried)",
    category: "vegetables",
    price: 50,
    description: "Heart of palm spring rolls",
  },
  { name: "Lumpiang Sariwa", category: "vegetables", price: 50, description: "Fresh vegetable spring rolls" },
  { name: "Stir Fry Vegetables", category: "vegetables", price: 50, description: "Stir-fried mixed vegetables" },

  // PASTA - ₱40 each
  { name: "Spaghetti", category: "pasta", price: 40, description: "Classic spaghetti with meat sauce" },
  { name: "Fettuccine (Red Sauce)", category: "pasta", price: 40, description: "Fettuccine with tomato-based sauce" },
  { name: "Carbonara (White Sauce)", category: "pasta", price: 40, description: "Creamy carbonara pasta" },
  { name: "Lasagna", category: "pasta", price: 40, description: "Layered pasta with meat and cheese" },
  { name: "Bake Macaroni", category: "pasta", price: 40, description: "Baked macaroni with cheese" },
  { name: "Korean Noodles (Chapchi)", category: "pasta", price: 40, description: "Korean-style stir-fried noodles" },
  {
    name: "Penne in Italian Meat Sauce",
    category: "pasta",
    price: 40,
    description: "Penne pasta with Italian meat sauce",
  },

  // DESSERT - ₱25 each
  { name: "Buko Salad", category: "dessert", price: 25, description: "Young coconut fruit salad" },
  { name: "Fruit Salad", category: "dessert", price: 25, description: "Mixed fruit salad with cream" },
  { name: "Buko Pandan", category: "dessert", price: 25, description: "Coconut and pandan dessert" },
  { name: "Buko Lychees", category: "dessert", price: 25, description: "Coconut and lychee dessert" },
  { name: "Tropical Fruits", category: "dessert", price: 25, description: "Fresh tropical fruit mix" },
  { name: "Leche Plan", category: "dessert", price: 25, description: "Filipino caramel custard" },
  { name: "Garden Salad", category: "dessert", price: 25, description: "Fresh garden vegetable salad" },
  { name: "Chocolate Fountain", category: "dessert", price: 25, description: "Chocolate fountain with fruits" },

  // BEVERAGE - ₱25 each
  { name: "Red Iced Tea", category: "beverage", price: 25, description: "Refreshing red iced tea" },
  { name: "Four Season", category: "beverage", price: 25, description: "Four season fruit drink" },
  { name: "Black Gulaman", category: "beverage", price: 25, description: "Black gulaman drink" },
  { name: "Blue Raspberry", category: "beverage", price: 25, description: "Blue raspberry flavored drink" },
  { name: "Soda", category: "beverage", price: 25, description: "Assorted soft drinks" },
]

export async function POST() {
  try {
    console.log("=== POPULATING MENU ITEMS ===")

    // Check if table already has items
    const { count, error: countError } = await supabaseAdmin
      .from("tbl_menu_items")
      .select("*", { count: "exact", head: true })

    if (countError) {
      console.error("Error checking existing items:", countError)
      return NextResponse.json({ success: false, error: "Failed to check existing items" }, { status: 500 })
    }

    console.log(`Current items in database: ${count || 0}`)

    // Get table structure to determine column names
    const { data: sampleData } = await supabaseAdmin.from("tbl_menu_items").select("*").limit(1)
    const availableColumns = sampleData && sampleData.length > 0 ? Object.keys(sampleData[0]) : []

    console.log("Available columns:", availableColumns)

    // Prepare items for insertion
    const itemsToInsert = DEFAULT_MENU_ITEMS.map((item, index) => {
      const insertData: any = {
        category: item.category.toLowerCase(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      // Add name field(s)
      if (availableColumns.includes("name")) {
        insertData.name = item.name
      }
      if (availableColumns.includes("item_name")) {
        insertData.item_name = item.name
      }
      if (availableColumns.includes("menu_name")) {
        insertData.menu_name = item.name
      }

      // Add price field(s)
      if (availableColumns.includes("price")) {
        insertData.price = item.price
      }
      if (availableColumns.includes("price_per_guest")) {
        insertData.price_per_guest = item.price
      }
      if (availableColumns.includes("menu_price")) {
        insertData.menu_price = item.price
      }

      // Add description if column exists
      if (availableColumns.includes("description")) {
        insertData.description = item.description
      }
      if (availableColumns.includes("menu_description")) {
        insertData.menu_description = item.description
      }

      return insertData
    })

    console.log("Sample insert data:", itemsToInsert[0])

    // Insert all items
    const { data, error } = await supabaseAdmin.from("tbl_menu_items").insert(itemsToInsert).select()

    if (error) {
      console.error("Error inserting menu items:", error)
      return NextResponse.json(
        { success: false, error: "Failed to populate menu items", details: error },
        { status: 500 },
      )
    }

    console.log(`Successfully inserted ${data?.length || 0} menu items`)

    // Group by category for summary
    const categoryStats = (data || []).reduce(
      (acc, item) => {
        const category = item.category || "unknown"
        if (!acc[category]) {
          acc[category] = { count: 0, totalValue: 0 }
        }
        acc[category].count++
        acc[category].totalValue += Number(item.price || item.price_per_guest || item.menu_price || 0)
        return acc
      },
      {} as Record<string, { count: number; totalValue: number }>,
    )

    return NextResponse.json({
      success: true,
      message: `Successfully populated ${data?.length || 0} menu items`,
      data: {
        totalItems: data?.length || 0,
        categoryStats,
        categories: Object.keys(categoryStats),
      },
    })
  } catch (error) {
    console.error("Error in populate menu items:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
