import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    console.log("Fetching menu items from database...")

    // Fetch all menu items from the database
    const { data: menuItemsData, error } = await supabaseAdmin.from("tbl_menu_items").select("*").order("category")

    if (error) {
      console.error("Error fetching menu items:", error)
      return NextResponse.json({ success: false, error: "Failed to fetch menu items" }, { status: 500 })
    }

    console.log(`Fetched ${menuItemsData?.length || 0} menu items from database`)

    // Group menu items by category
    const menuItems = (menuItemsData || []).reduce(
      (acc, item) => {
        const category = (item.category || "other").toLowerCase()
        if (!acc[category]) {
          acc[category] = []
        }

        // Handle different possible column names for price and name
        const price = Number(item.price || item.price_per_guest || item.menu_price || 0)
        const name = item.name || item.item_name || item.menu_name || "Unknown Item"

        acc[category].push({
          id: item.id,
          name: name,
          category: category,
          price: price,
          description: item.description || item.menu_description || "",
        })

        return acc
      },
      {} as { [category: string]: any[] },
    )

    console.log("Menu items grouped by category:", Object.keys(menuItems))

    // If no menu items found, return fallback data
    if (!menuItemsData || menuItemsData.length === 0) {
      console.warn("No menu items found in database, returning fallback data")
      return NextResponse.json({
        success: true,
        menuItems: getFallbackMenuItems(),
        source: "fallback",
        message: "Using fallback menu data - database appears to be empty",
      })
    }

    return NextResponse.json({
      success: true,
      menuItems,
      source: "database",
      totalItems: menuItemsData.length,
    })
  } catch (error) {
    console.error("Error in menu items API:", error)

    // Return fallback data on error
    return NextResponse.json({
      success: true,
      menuItems: getFallbackMenuItems(),
      source: "fallback",
      error: error instanceof Error ? error.message : "Unknown error",
    })
  }
}

// Fallback menu items if database is unavailable
function getFallbackMenuItems() {
  return {
    beef: [
      { id: 1, name: "Beef Broccoli", category: "beef", price: 70 },
      { id: 2, name: "Beef Caldereta", category: "beef", price: 70 },
      { id: 3, name: "Beef Mechado", category: "beef", price: 70 },
      { id: 4, name: "Roast Beef w/ Mashed Potato or w/ Mix Vegetable", category: "beef", price: 70 },
      { id: 5, name: "Kare-kare Oxtail", category: "beef", price: 70 },
      { id: 6, name: "Beef Teriyaki w/ Vegetable siding", category: "beef", price: 70 },
      { id: 7, name: "Beef Lengua Pastel", category: "beef", price: 70 },
      { id: 8, name: "Garlic Beef", category: "beef", price: 70 },
      { id: 9, name: "Beef w/ Mushroom", category: "beef", price: 70 },
    ],
    chicken: [
      { id: 10, name: "Chicken Alexander", category: "chicken", price: 60 },
      { id: 11, name: "Sweet Fire Chicken", category: "chicken", price: 60 },
      { id: 12, name: "Chicken Onion", category: "chicken", price: 60 },
      { id: 13, name: "Buttered Chicken", category: "chicken", price: 60 },
      { id: 14, name: "Chicken Galantina", category: "chicken", price: 60 },
      { id: 15, name: "Fried Chicken", category: "chicken", price: 60 },
      { id: 16, name: "Chicken Cordon Blue", category: "chicken", price: 60 },
      { id: 17, name: "Chicken Pastel", category: "chicken", price: 60 },
      { id: 18, name: "Chicken Teriyaki", category: "chicken", price: 60 },
      { id: 19, name: "Breaded Fried Chicken", category: "chicken", price: 60 },
      { id: 20, name: "Chicken Lollipop", category: "chicken", price: 60 },
      { id: 21, name: "Lemon Chicken", category: "chicken", price: 60 },
    ],
    pork: [
      { id: 22, name: "Lengua Pastel", category: "pork", price: 70 },
      { id: 23, name: "Pork Teriyaki", category: "pork", price: 70 },
      { id: 24, name: "Menudo", category: "pork", price: 70 },
      { id: 25, name: "Pork Kare-Kare", category: "pork", price: 70 },
      { id: 26, name: "Pork Mahonado", category: "pork", price: 70 },
      { id: 27, name: "Hawaiian Spareribs", category: "pork", price: 70 },
      { id: 28, name: "Braised Pork", category: "pork", price: 70 },
      { id: 29, name: "Embutido", category: "pork", price: 70 },
      { id: 30, name: "Pork and Pickles", category: "pork", price: 70 },
      { id: 31, name: "Lumpiang Shanghai", category: "pork", price: 70 },
    ],
    seafood: [
      { id: 32, name: "Fish Fillet w/ Tartar Sauce or Sweet and Sour Sauce", category: "seafood", price: 50 },
      { id: 33, name: "Camaron Rebosado", category: "seafood", price: 50 },
      { id: 34, name: "Fish Tofu", category: "seafood", price: 50 },
      { id: 35, name: "Apple Fish Salad", category: "seafood", price: 50 },
      { id: 36, name: "Crispy Fish Fillet", category: "seafood", price: 50 },
      { id: 37, name: "Fisherman's Delight", category: "seafood", price: 50 },
    ],
    vegetables: [
      { id: 38, name: "Chopsuey", category: "vegetables", price: 50 },
      { id: 39, name: "Green Peas", category: "vegetables", price: 50 },
      { id: 40, name: "Oriental Mixed Vegetables", category: "vegetables", price: 50 },
      { id: 41, name: "Lumpiang Ubod (Fresh or Fried)", category: "vegetables", price: 50 },
      { id: 42, name: "Lumpiang Sariwa", category: "vegetables", price: 50 },
      { id: 43, name: "Stir Fry Vegetables", category: "vegetables", price: 50 },
    ],
    pasta: [
      { id: 44, name: "Spaghetti", category: "pasta", price: 40 },
      { id: 45, name: "Fettuccine (Red Sauce)", category: "pasta", price: 40 },
      { id: 46, name: "Carbonara (White Sauce)", category: "pasta", price: 40 },
      { id: 47, name: "Lasagna", category: "pasta", price: 40 },
      { id: 48, name: "Bake Macaroni", category: "pasta", price: 40 },
      { id: 49, name: "Korean Noodles (Chapchi)", category: "pasta", price: 40 },
      { id: 50, name: "Penne in Italian Meat Sauce", category: "pasta", price: 40 },
    ],
    dessert: [
      { id: 51, name: "Buko Salad", category: "dessert", price: 25 },
      { id: 52, name: "Fruit Salad", category: "dessert", price: 25 },
      { id: 53, name: "Buko Pandan", category: "dessert", price: 25 },
      { id: 54, name: "Buko Lychees", category: "dessert", price: 25 },
      { id: 55, name: "Tropical Fruits", category: "dessert", price: 25 },
      { id: 56, name: "Leche Plan", category: "dessert", price: 25 },
      { id: 57, name: "Garden Salad", category: "dessert", price: 25 },
      { id: 58, name: "Chocolate Fountain", category: "dessert", price: 25 },
    ],
    beverage: [
      { id: 59, name: "Red Iced Tea", category: "beverage", price: 25 },
      { id: 60, name: "Four Season", category: "beverage", price: 25 },
      { id: 61, name: "Black Gulaman", category: "beverage", price: 25 },
      { id: 62, name: "Blue Raspberry", category: "beverage", price: 25 },
      { id: 63, name: "Soda", category: "beverage", price: 25 },
    ],
  }
}
