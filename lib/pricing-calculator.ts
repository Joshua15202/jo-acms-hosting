// Database-driven pricing system for accurate calculations across the entire application

export interface PricingRules {
  serviceFees: {
    [guestCount: string]: number
  }
  // ADDED: Wedding package pricing
  weddingPackages: {
    [guestCount: string]: number
  }
}

// Service fees and NEW wedding package prices - ALL SERVICE FEES SET TO ₱11,500
export const PRICING_RULES: PricingRules = {
  serviceFees: {
    "50": 11500, // 50 guests: ₱11,500
    "80": 10400, // 80 guests: ₱10,400
    "100": 11000, // 100 guests: ₱11,000
    "150": 16500, // 150 guests: ₱16,500
    "200": 22000, // 200 guests: ₱22,000
  },
  // ADDED: Wedding package pricing based on user request
  weddingPackages: {
    "50": 56500,
    "100": 63000,
    "150": 74500,
    "200": 86000,
    "300": 109000,
  },
}

export interface MenuSelections {
  mainCourses: string[]
  pasta: string | string[]
  dessert: string | string[]
  beverage: string | string[]
}

export interface PricingBreakdown {
  subtotal: number
  serviceFee: number
  total: number
  pricePerGuest: number
  menuItems: MenuItem[]
  guestCount: number
  isWeddingPackage?: boolean
  weddingPackagePrice?: number
  totalAmount?: number
  downPayment?: number
}

export interface MenuItem {
  id: number
  name: string
  category: string
  price: number
  description?: string
}

// Default menu items with correct categories and pricing
const DEFAULT_MENU_ITEMS: MenuItem[] = [
  // BEEF - ₱70 each
  { id: 1, name: "Beef Broccoli", category: "beef", price: 70 },
  { id: 2, name: "Beef Caldereta", category: "beef", price: 70 },
  { id: 3, name: "Beef Mechado", category: "beef", price: 70 },
  { id: 4, name: "Roast Beef w/ Mashed Potato or w/ Mix Vegetable", category: "beef", price: 70 },
  { id: 5, name: "Kare-kare Oxtail", category: "beef", price: 70 },
  { id: 6, name: "Beef Teriyaki w/ Vegetable siding", category: "beef", price: 70 },
  { id: 7, name: "Beef Lengua Pastel", category: "beef", price: 70 },
  { id: 8, name: "Garlic Beef", category: "beef", price: 70 },
  { id: 9, name: "Beef w/ Mushroom", category: "beef", price: 70 },

  // CHICKEN - ₱60 each
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

  // PORK - ₱70 each
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

  // SEAFOOD - ₱50 each
  { id: 32, name: "Fish Fillet w/ Tartar Sauce or Sweet and Sour Sauce", category: "seafood", price: 50 },
  { id: 33, name: "Camaron Rebosado", category: "seafood", price: 50 },
  { id: 34, name: "Fish Tofu", category: "seafood", price: 50 },
  { id: 35, name: "Apple Fish Salad", category: "seafood", price: 50 },
  { id: 36, name: "Crispy Fish Fillet", category: "seafood", price: 50 },
  { id: 37, name: "Fisherman's Delight", category: "seafood", price: 50 },

  // VEGETABLES - ₱50 each
  { id: 38, name: "Chopsuey", category: "vegetables", price: 50 },
  { id: 39, name: "Green Peas", category: "vegetables", price: 50 },
  { id: 40, name: "Oriental Mixed Vegetables", category: "vegetables", price: 50 },
  { id: 41, name: "Lumpiang Ubod (Fresh or Fried)", category: "vegetables", price: 50 },
  { id: 42, name: "Lumpiang Sariwa", category: "vegetables", price: 50 },
  { id: 43, name: "Stir Fry Vegetables", category: "vegetables", price: 50 },

  // PASTA - ₱40 each
  { id: 44, name: "Spaghetti", category: "pasta", price: 40 },
  { id: 45, name: "Fettuccine (Red Sauce)", category: "pasta", price: 40 },
  { id: 46, name: "Carbonara (White Sauce)", category: "pasta", price: 40 },
  { id: 47, name: "Lasagna", category: "pasta", price: 40 },
  { id: 48, name: "Bake Macaroni", category: "pasta", price: 40 },
  { id: 49, name: "Korean Noodles (Chapchi)", category: "pasta", price: 40 },
  { id: 50, name: "Penne in Italian Meat Sauce", category: "pasta", price: 40 },

  // DESSERT - ₱25 each
  { id: 51, name: "Buko Salad", category: "dessert", price: 25 },
  { id: 52, name: "Fruit Salad", category: "dessert", price: 25 },
  { id: 53, name: "Buko Pandan", category: "dessert", price: 25 },
  { id: 54, name: "Buko Lychees", category: "dessert", price: 25 },
  { id: 55, name: "Tropical Fruits", category: "dessert", price: 25 },
  { id: 56, name: "Leche Plan", category: "dessert", price: 25 },
  { id: 57, name: "Garden Salad", category: "dessert", price: 25 },
  { id: 58, name: "Chocolate Fountain", category: "dessert", price: 25 },

  // BEVERAGE - ₱25 each
  { id: 59, name: "Red Iced Tea", category: "beverage", price: 25 },
  { id: 60, name: "Four Season", category: "beverage", price: 25 },
  { id: 61, name: "Black Gulaman", category: "beverage", price: 25 },
  { id: 62, name: "Blue Raspberry", category: "beverage", price: 25 },
  { id: 63, name: "Soda", category: "beverage", price: 25 },
]

// Service fee calculation (15% of subtotal)
const SERVICE_FEE_PERCENTAGE = 0.15

export function calculatePricing(
  selectedMenuItems: string[],
  guestCount: number,
  availableMenuItems?: MenuItem[],
): PricingBreakdown {
  const menuItems = availableMenuItems || DEFAULT_MENU_ITEMS

  // Find selected menu items
  const selectedItems = menuItems.filter(
    (item) => selectedMenuItems.includes(item.name) || selectedMenuItems.includes(item.id.toString()),
  )

  if (selectedItems.length === 0) {
    return {
      subtotal: 0,
      serviceFee: 0,
      total: 0,
      pricePerGuest: 0,
      menuItems: [],
      guestCount,
    }
  }

  // Calculate subtotal (price per item × guest count)
  const subtotal = selectedItems.reduce((sum, item) => sum + item.price * guestCount, 0)

  // Calculate service fee
  const serviceFee = subtotal * SERVICE_FEE_PERCENTAGE

  // Calculate total
  const total = subtotal + serviceFee

  // Calculate price per guest
  const pricePerGuest = guestCount > 0 ? total / guestCount : 0

  return {
    subtotal,
    serviceFee,
    total,
    pricePerGuest,
    menuItems: selectedItems,
    guestCount,
  }
}

export function getMenuItemsByCategory(category: string, availableMenuItems?: MenuItem[]): MenuItem[] {
  const menuItems = availableMenuItems || DEFAULT_MENU_ITEMS
  return menuItems.filter((item) => item.category.toLowerCase() === category.toLowerCase())
}

export function getAllMenuItems(): MenuItem[] {
  return DEFAULT_MENU_ITEMS
}

export function getMenuCategories(): string[] {
  const categories = [...new Set(DEFAULT_MENU_ITEMS.map((item) => item.category))]
  return categories.sort()
}

// Helper function to determine if an item is a main course
export function isMainCourse(item: MenuItem): boolean {
  const mainCourseCategories = ["beef", "pork", "chicken", "seafood", "vegetables"]
  return mainCourseCategories.includes(item.category.toLowerCase())
}

// Helper function to get recommended items for budget
export function getRecommendedItemsForBudget(
  budget: number,
  guestCount: number,
  availableMenuItems?: MenuItem[],
): MenuItem[] {
  const menuItems = availableMenuItems || DEFAULT_MENU_ITEMS
  const budgetPerGuest = budget / guestCount

  // Filter items that fit within budget per guest
  const affordableItems = menuItems.filter((item) => item.price <= budgetPerGuest)

  // Sort by price (descending) to get best value items first
  return affordableItems.sort((a, b) => b.price - a.price)
}

// Helper function to validate menu selection
export function validateMenuSelection(
  selectedItems: string[],
  availableMenuItems?: MenuItem[],
): {
  isValid: boolean
  errors: string[]
  warnings: string[]
} {
  const menuItems = availableMenuItems || DEFAULT_MENU_ITEMS
  const errors: string[] = []
  const warnings: string[] = []

  if (selectedItems.length === 0) {
    errors.push("Please select at least one menu item")
    return { isValid: false, errors, warnings }
  }

  const selectedMenuItems = menuItems.filter(
    (item) => selectedItems.includes(item.name) || selectedItems.includes(item.id.toString()),
  )

  // Check if we have main courses
  const mainCourses = selectedMenuItems.filter(isMainCourse)
  if (mainCourses.length === 0) {
    warnings.push("Consider adding a main course (beef, chicken, pork, seafood, or vegetables)")
  }

  // Check for variety
  const categories = [...new Set(selectedMenuItems.map((item) => item.category))]
  if (categories.length === 1) {
    warnings.push("Consider adding variety with items from different categories")
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  }
}

// Updated fallback menu items with correct categories and pricing
export const FALLBACK_MENU_ITEMS: MenuItem[] = [
  // BEEF items (₱70 each)
  {
    id: 1,
    name: "Beef Broccoli",
    category: "beef",
    price: 70,
    description: "Tender beef with fresh broccoli in savory sauce",
  },
  { id: 2, name: "Beef Caldereta", category: "beef", price: 70, description: "Filipino beef stew with vegetables" },
  {
    id: 3,
    name: "Beef Mechado",
    category: "beef",
    price: 70,
    description: "Traditional Filipino beef dish with tomato sauce",
  },
  {
    id: 4,
    name: "Roast Beef w/ Mashed Potato or w/ Mix Vegetable",
    category: "beef",
    price: 70,
    description: "Roast beef with choice of sides",
  },
  {
    id: 5,
    name: "Kare-kare Oxtail",
    category: "beef",
    price: 70,
    description: "Filipino oxtail stew with peanut sauce",
  },
  {
    id: 6,
    name: "Beef Teriyaki w/ Vegetable siding",
    category: "beef",
    price: 70,
    description: "Teriyaki beef with vegetable side dish",
  },
  { id: 7, name: "Beef Lengua Pastel", category: "beef", price: 70, description: "Beef tongue in creamy sauce" },
  { id: 8, name: "Garlic Beef", category: "beef", price: 70, description: "Beef sautéed with garlic" },
  { id: 9, name: "Beef w/ Mushroom", category: "beef", price: 70, description: "Beef with mushrooms in savory sauce" },

  // CHICKEN items (₱60 each)
  {
    id: 10,
    name: "Chicken Alexander",
    category: "chicken",
    price: 60,
    description: "Creamy chicken dish with special sauce",
  },
  {
    id: 11,
    name: "Sweet Fire Chicken",
    category: "chicken",
    price: 60,
    description: "Spicy sweet chicken with fire sauce",
  },
  { id: 12, name: "Chicken Onion", category: "chicken", price: 60, description: "Chicken sautéed with onions" },
  { id: 13, name: "Buttered Chicken", category: "chicken", price: 60, description: "Chicken in rich butter sauce" },
  {
    id: 14,
    name: "Chicken Galantina",
    category: "chicken",
    price: 60,
    description: "Stuffed chicken roll with vegetables",
  },
  { id: 15, name: "Fried Chicken", category: "chicken", price: 60, description: "Classic crispy fried chicken" },
  {
    id: 16,
    name: "Chicken Cordon Blue",
    category: "chicken",
    price: 60,
    description: "Chicken stuffed with ham and cheese",
  },
  {
    id: 17,
    name: "Chicken Pastel",
    category: "chicken",
    price: 60,
    description: "Filipino chicken pie with vegetables",
  },
  { id: 18, name: "Chicken Teriyaki", category: "chicken", price: 60, description: "Japanese-style teriyaki chicken" },
  { id: 19, name: "Breaded Fried Chicken", category: "chicken", price: 60, description: "Crispy breaded chicken" },
  {
    id: 20,
    name: "Chicken Lollipop",
    category: "chicken",
    price: 60,
    description: "Chicken wings shaped like lollipops",
  },
  { id: 21, name: "Lemon Chicken", category: "chicken", price: 60, description: "Chicken with tangy lemon sauce" },

  // PORK items (₱70 each)
  { id: 22, name: "Lengua Pastel", category: "pork", price: 70, description: "Pork tongue in creamy sauce" },
  { id: 23, name: "Pork Teriyaki", category: "pork", price: 70, description: "Teriyaki-style pork" },
  { id: 24, name: "Menudo", category: "pork", price: 70, description: "Filipino pork and liver stew" },
  { id: 25, name: "Pork Kare-Kare", category: "pork", price: 70, description: "Pork in peanut sauce" },
  { id: 26, name: "Pork Mahonado", category: "pork", price: 70, description: "Pork in tomato-based sauce" },
  { id: 27, name: "Hawaiian Spareribs", category: "pork", price: 70, description: "Sweet and tangy pork ribs" },
  { id: 28, name: "Braised Pork", category: "pork", price: 70, description: "Slow-cooked tender pork" },
  { id: 29, name: "Embutido", category: "pork", price: 70, description: "Filipino meatloaf with eggs and vegetables" },
  { id: 30, name: "Pork and Pickles", category: "pork", price: 70, description: "Pork with pickled vegetables" },
  { id: 31, name: "Lumpiang Shanghai", category: "pork", price: 70, description: "Filipino spring rolls with pork" },

  // SEAFOOD items (₱50 each)
  {
    id: 32,
    name: "Fish Fillet w/ Tartar Sauce or Sweet and Sour Sauce",
    category: "seafood",
    price: 50,
    description: "Fish fillet with choice of sauce",
  },
  { id: 33, name: "Camaron Rebosado", category: "seafood", price: 50, description: "Battered and fried shrimp" },
  { id: 34, name: "Fish Tofu", category: "seafood", price: 50, description: "Fish and tofu combination dish" },
  { id: 35, name: "Apple Fish Salad", category: "seafood", price: 50, description: "Fish salad with apple chunks" },
  { id: 36, name: "Crispy Fish Fillet", category: "seafood", price: 50, description: "Crispy fried fish fillet" },
  { id: 37, name: "Fisherman's Delight", category: "seafood", price: 50, description: "Mixed seafood dish" },

  // VEGETABLE items (₱50 each)
  { id: 38, name: "Chopsuey", category: "vegetables", price: 50, description: "Mixed vegetables stir-fry" },
  { id: 39, name: "Green Peas", category: "vegetables", price: 50, description: "Fresh green peas dish" },
  {
    id: 40,
    name: "Oriental Mixed Vegetables",
    category: "vegetables",
    price: 50,
    description: "Asian-style mixed vegetables",
  },
  {
    id: 41,
    name: "Lumpiang Ubod (Fresh or Fried)",
    category: "vegetables",
    price: 50,
    description: "Heart of palm spring rolls",
  },
  { id: 42, name: "Lumpiang Sariwa", category: "vegetables", price: 50, description: "Fresh vegetable spring rolls" },
  {
    id: 43,
    name: "Stir Fry Vegetables",
    category: "vegetables",
    price: 50,
    description: "Stir-fried mixed vegetables",
  },

  // PASTA items (₱40 each)
  { id: 44, name: "Spaghetti", category: "pasta", price: 40, description: "Classic spaghetti with meat sauce" },
  {
    id: 45,
    name: "Fettuccine (Red Sauce)",
    category: "pasta",
    price: 40,
    description: "Fettuccine with tomato-based sauce",
  },
  { id: 46, name: "Carbonara (White Sauce)", category: "pasta", description: "Creamy carbonara pasta", price: 40 },
  { id: 47, name: "Lasagna", category: "pasta", price: 40, description: "Layered pasta with meat and cheese" },
  { id: 48, name: "Bake Macaroni", category: "pasta", price: 40, description: "Baked macaroni with cheese" },
  {
    id: 49,
    name: "Korean Noodles (Chapchi)",
    category: "pasta",
    price: 40,
    description: "Korean-style stir-fried noodles",
  },
  {
    id: 50,
    name: "Penne in Italian Meat Sauce",
    category: "pasta",
    price: 40,
    description: "Penne pasta with Italian meat sauce",
  },

  // DESSERT items (₱25 each)
  { id: 51, name: "Buko Salad", category: "dessert", price: 25, description: "Young coconut fruit salad" },
  { id: 52, name: "Fruit Salad", category: "dessert", price: 25, description: "Mixed fruit salad with cream" },
  { id: 53, name: "Buko Pandan", category: "dessert", price: 25, description: "Coconut and pandan dessert" },
  { id: 54, name: "Buko Lychees", category: "dessert", price: 25, description: "Coconut and lychee dessert" },
  { id: 55, name: "Tropical Fruits", category: "dessert", price: 25, description: "Fresh tropical fruit mix" },
  { id: 56, name: "Leche Plan", category: "dessert", price: 25, description: "Filipino caramel custard" },
  { id: 57, name: "Garden Salad", category: "dessert", price: 25, description: "Fresh garden vegetable salad" },
  { id: 58, name: "Chocolate Fountain", category: "dessert", price: 25, description: "Chocolate fountain with fruits" },

  // BEVERAGE items (₱25 each)
  { id: 59, name: "Red Iced Tea", category: "beverage", price: 25, description: "Refreshing red iced tea" },
  { id: 60, name: "Four Season", category: "beverage", price: 25, description: "Four season fruit drink" },
  { id: 61, name: "Black Gulaman", category: "beverage", price: 25, description: "Black gulaman drink" },
  { id: 62, name: "Blue Raspberry", category: "beverage", price: 25, description: "Blue raspberry flavored drink" },
  { id: 63, name: "Soda", category: "beverage", price: 25, description: "Assorted soft drinks" },
]

// Category pricing for main courses - FIXED: Define as a proper object with string keys
export const CATEGORY_PRICING: { [key: string]: number } = {
  beef: 70,
  pork: 70,
  chicken: 60,
  seafood: 50,
  vegetables: 50,
  pasta: 40,
  dessert: 25,
  beverage: 25,
}

// Main course categories (for "only" requests)
export const MAIN_COURSE_CATEGORIES = ["beef", "pork", "chicken", "seafood", "vegetables"]

// Helper function to normalize menu items to array
function normalizeToArray(items: string | string[] | undefined): string[] {
  if (!items) return []

  if (typeof items === "string") {
    try {
      // Try to parse as JSON first
      const parsed = JSON.parse(items)
      if (Array.isArray(parsed)) {
        return parsed.map((item) => (typeof item === "object" ? item.name || String(item) : String(item)))
      }
    } catch {
      // If JSON parsing fails, treat as comma-separated string
    }

    return items
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item.length > 0)
  }

  if (Array.isArray(items)) {
    return items
      .map((item) => {
        if (typeof item === "object" && item !== null) {
          if ("name" in item) return String(item.name)
          return JSON.stringify(item)
        }
        return String(item)
      })
      .filter((item) => item.length > 0)
  }

  return []
}

// Enhanced function to find menu item price with CORRECT pricing
async function findMenuItemPrice(itemName: string, category: string): Promise<number> {
  try {
    // For client-side, we need to make the API call
    if (typeof window !== "undefined") {
      const response = await fetch("/api/menu-items")
      const result = await response.json()

      if (result.success && result.menuItems) {
        const menuItems = result.menuItems
        const categoryItems = menuItems[category] || []

        // Try exact match first
        let foundItem = categoryItems.find(
          (item: MenuItem) => item.name.toLowerCase().trim() === itemName.toLowerCase().trim(),
        )

        // If no exact match, try partial match
        if (!foundItem) {
          foundItem = categoryItems.find(
            (item: MenuItem) =>
              item.name.toLowerCase().includes(itemName.toLowerCase()) ||
              itemName.toLowerCase().includes(item.name.toLowerCase()),
          )
        }

        if (foundItem) {
          console.log(`Found menu item: ${itemName} = ₱${foundItem.price}`)
          return foundItem.price
        }
      }
    }

    // Fallback to hardcoded menu items with CORRECT pricing
    const fallbackItems = FALLBACK_MENU_ITEMS.filter((item) => item.category === category)

    // Try exact match first
    let foundItem = fallbackItems.find((item) => item.name.toLowerCase().trim() === itemName.toLowerCase().trim())

    // If no exact match, try partial match
    if (!foundItem) {
      foundItem = fallbackItems.find(
        (item) =>
          item.name.toLowerCase().includes(itemName.toLowerCase()) ||
          itemName.toLowerCase().includes(item.name.toLowerCase()),
      )
    }

    if (foundItem) {
      console.log(`Found fallback menu item: ${itemName} = ₱${foundItem.price}`)
      return foundItem.price
    }

    // If still no match, return CORRECT default price for category
    const defaultPrice = getDefaultPrice(category)
    console.warn(`Menu item not found: ${itemName} in category ${category}, using default price ₱${defaultPrice}`)
    return defaultPrice
  } catch (error) {
    console.error("Error fetching menu item price:", error)
    return getDefaultPrice(category)
  }
}

// CORRECT default prices if database lookup fails - FIXED: Use proper function
function getDefaultPrice(category: string): number {
  const normalizedCategory = category.toLowerCase()
  return CATEGORY_PRICING[normalizedCategory] || 50
}

/**
 * Calculate accurate pricing for a catering package using database-driven menu prices
 * This is the single source of truth for all pricing calculations
 * NOTE: This function does NOT include backdrop pricing - that should be added separately
 */
export async function calculatePackagePricing(
  guestCount: number,
  menuSelections: MenuSelections,
  eventType?: string,
): Promise<PricingBreakdown> {
  try {
    const { serviceFees, weddingPackages } = PRICING_RULES

    // Validate inputs
    if (!guestCount || guestCount <= 0) {
      throw new Error("Invalid guest count")
    }

    console.log("Calculating pricing for:", { guestCount, menuSelections, eventType })

    // Normalize all menu selections to arrays
    const mainCourses = normalizeToArray(menuSelections.mainCourses)
    const pastaItems = normalizeToArray(menuSelections.pasta)
    const dessertItems = normalizeToArray(menuSelections.dessert)
    const beverageItems = normalizeToArray(menuSelections.beverage)

    console.log("Normalized selections:", { mainCourses, pastaItems, dessertItems, beverageItems })

    // Calculate main courses with database prices - now handles multiple categories
    let mainCoursesTotal = 0
    const mainCoursesBreakdown: { name: string; pricePerGuest: number; total: number }[] = []

    for (const course of mainCourses) {
      // Determine category based on item name
      let category = "beef" // default
      const courseLower = course.toLowerCase()

      if (courseLower.includes("chicken")) {
        category = "chicken"
      } else if (
        courseLower.includes("pork") ||
        courseLower.includes("menudo") ||
        courseLower.includes("embutido") ||
        courseLower.includes("lengua") ||
        courseLower.includes("lumpiang shanghai") ||
        courseLower.includes("hawaiian spareribs") ||
        courseLower.includes("braised pork")
      ) {
        category = "pork"
      } else if (
        courseLower.includes("fish") ||
        courseLower.includes("camaron") ||
        courseLower.includes("seafood") ||
        courseLower.includes("fisherman")
      ) {
        category = "seafood"
      } else if (
        courseLower.includes("chopsuey") ||
        courseLower.includes("vegetables") ||
        courseLower.includes("peas") ||
        courseLower.includes("lumpiang ubod") ||
        courseLower.includes("lumpiang sariwa") ||
        courseLower.includes("stir fry")
      ) {
        category = "vegetables"
      } else if (
        courseLower.includes("beef") ||
        courseLower.includes("kare-kare") ||
        courseLower.includes("roast") ||
        courseLower.includes("garlic")
      ) {
        category = "beef"
      }

      const pricePerGuest = await findMenuItemPrice(course, category)
      const total = pricePerGuest * guestCount
      mainCoursesTotal += total
      mainCoursesBreakdown.push({ name: course, pricePerGuest, total })
    }

    // Calculate pasta with database prices
    let pastaTotal = 0
    const pastaBreakdown: { name: string; pricePerGuest: number; total: number }[] = []

    for (const item of pastaItems) {
      const pricePerGuest = await findMenuItemPrice(item, "pasta")
      const total = pricePerGuest * guestCount
      pastaTotal += total
      pastaBreakdown.push({ name: item, pricePerGuest, total })
    }

    // Calculate dessert with database prices
    let dessertTotal = 0
    const dessertBreakdown: { name: string; pricePerGuest: number; total: number }[] = []

    for (const item of dessertItems) {
      const pricePerGuest = await findMenuItemPrice(item, "dessert")
      const total = pricePerGuest * guestCount
      dessertTotal += total
      dessertBreakdown.push({ name: item, pricePerGuest, total })
    }

    // Calculate beverages with database prices
    let beverageTotal = 0
    const beverageBreakdown: { name: string; pricePerGuest: number; total: number }[] = []

    for (const item of beverageItems) {
      const pricePerGuest = await findMenuItemPrice(item, "beverage")
      const total = pricePerGuest * guestCount
      beverageTotal += total
      beverageBreakdown.push({ name: item, pricePerGuest, total })
    }

    // Calculate subtotal for menu items
    const menuSubtotal = mainCoursesTotal + pastaTotal + dessertTotal + beverageTotal

    // Determine service fee or wedding package price
    const isWeddingEvent = eventType === "wedding"
    let finalServiceFee = 0
    let selectedItems: MenuItem[] = []

    if (isWeddingEvent) {
      finalServiceFee = weddingPackages[guestCount.toString()] || 0
      selectedItems = FALLBACK_MENU_ITEMS.filter((item) => MAIN_COURSE_CATEGORIES.includes(item.category.toLowerCase()))
    } else {
      // FIXED: Use fixed service fee from PRICING_RULES instead of percentage
      finalServiceFee = serviceFees[guestCount.toString()] || 11500 // Default to ₱11,500
      selectedItems = [
        ...mainCoursesBreakdown.map((item) => ({
          id: 0,
          name: item.name,
          category: "beef",
          price: item.pricePerGuest,
        })),
        ...pastaBreakdown.map((item) => ({
          id: 0,
          name: item.name,
          category: "pasta",
          price: item.pricePerGuest,
        })),
        ...dessertBreakdown.map((item) => ({
          id: 0,
          name: item.name,
          category: "dessert",
          price: item.pricePerGuest,
        })),
        ...beverageBreakdown.map((item) => ({
          id: 0,
          name: item.name,
          category: "beverage",
          price: item.pricePerGuest,
        })),
      ]
    }

    // Calculate totals (WITHOUT backdrop - that's added separately)
    const totalAmount = menuSubtotal + finalServiceFee
    const pricePerGuest = totalAmount / guestCount

    console.log("Pricing calculation result:", {
      mainCoursesTotal,
      pastaTotal,
      dessertTotal,
      beverageTotal,
      serviceFee: finalServiceFee,
      subtotal: menuSubtotal,
      totalAmount,
      pricePerGuest,
      selectedItems,
      guestCount,
    })

    return {
      subtotal: menuSubtotal || 0,
      serviceFee: finalServiceFee || 0,
      total: totalAmount || 0,
      pricePerGuest: pricePerGuest || 0,
      menuItems: selectedItems,
      guestCount,
      isWeddingPackage: isWeddingEvent,
      weddingPackagePrice: isWeddingEvent ? finalServiceFee : 0,
      totalAmount: totalAmount || 0,
      downPayment: Math.round((totalAmount || 0) * 0.5),
    }
  } catch (error) {
    console.error("Error calculating package pricing:", error)

    // Return a fallback pricing structure
    const serviceFee = PRICING_RULES.serviceFees[guestCount.toString()] || 11500 // Default to ₱11,500
    return {
      subtotal: 0,
      serviceFee,
      total: serviceFee,
      pricePerGuest: Math.round(serviceFee * 0.5),
      menuItems: [],
      guestCount: 0,
      totalAmount: serviceFee,
      downPayment: Math.round(serviceFee * 0.5),
    }
  }
}

/**
 * Server-side version that accepts menu items directly (for API routes)
 */
export function calculatePackagePricingWithMenuItems(
  guestCount: number,
  menuSelections: MenuSelections,
  menuItems: { [category: string]: MenuItem[] },
  eventType?: string,
): PricingBreakdown {
  const { serviceFees, weddingPackages } = PRICING_RULES

  console.log("Server-side pricing calculation for:", { guestCount, menuSelections, eventType })

  // Normalize all menu selections to arrays
  const mainCourses = normalizeToArray(menuSelections.mainCourses)
  const pastaItems = normalizeToArray(menuSelections.pasta)
  const dessertItems = normalizeToArray(menuSelections.dessert)
  const beverageItems = normalizeToArray(menuSelections.beverage)

  // Helper function to find price from provided menu items with CORRECT pricing
  const findPrice = (itemName: string, category: string): number => {
    const categoryItems = menuItems[category] || []

    // Try exact match first
    let foundItem = categoryItems.find(
      (item: MenuItem) => item.name.toLowerCase().trim() === itemName.toLowerCase().trim(),
    )

    // If no exact match, try partial match
    if (!foundItem) {
      foundItem = categoryItems.find(
        (item: MenuItem) =>
          item.name.toLowerCase().includes(itemName.toLowerCase()) ||
          itemName.toLowerCase().includes(item.name.toLowerCase()),
      )
    }

    if (foundItem) {
      return foundItem.price
    }

    // Fallback to hardcoded items with CORRECT pricing
    const fallbackItems = FALLBACK_MENU_ITEMS.filter((item) => item.category === category)
    const fallbackItem = fallbackItems.find((item) => item.name.toLowerCase().trim() === itemName.toLowerCase().trim())

    return fallbackItem ? fallbackItem.price : getDefaultPrice(category)
  }

  // Calculate main courses - now handles multiple categories
  let mainCoursesTotal = 0
  const mainCoursesBreakdown: { name: string; pricePerGuest: number; total: number }[] = []

  mainCourses.forEach((course) => {
    // Determine category based on item name
    let category = "beef" // default
    const courseLower = course.toLowerCase()

    if (courseLower.includes("chicken")) {
      category = "chicken"
    } else if (
      courseLower.includes("pork") ||
      courseLower.includes("menudo") ||
      courseLower.includes("embutido") ||
      courseLower.includes("lengua") ||
      courseLower.includes("lumpiang shanghai") ||
      courseLower.includes("hawaiian spareribs") ||
      courseLower.includes("braised pork")
    ) {
      category = "pork"
    } else if (
      courseLower.includes("fish") ||
      courseLower.includes("camaron") ||
      courseLower.includes("seafood") ||
      courseLower.includes("fisherman")
    ) {
      category = "seafood"
    } else if (
      courseLower.includes("chopsuey") ||
      courseLower.includes("vegetables") ||
      courseLower.includes("peas") ||
      courseLower.includes("lumpiang ubod") ||
      courseLower.includes("lumpiang sariwa") ||
      courseLower.includes("stir fry")
    ) {
      category = "vegetables"
    } else if (
      courseLower.includes("beef") ||
      courseLower.includes("kare-kare") ||
      courseLower.includes("roast") ||
      courseLower.includes("garlic")
    ) {
      category = "beef"
    }

    const pricePerGuest = findPrice(course, category)
    const total = pricePerGuest * guestCount
    mainCoursesTotal += total
    mainCoursesBreakdown.push({ name: course, pricePerGuest, total })
  })

  // Calculate pasta
  let pastaTotal = 0
  const pastaBreakdown: { name: string; pricePerGuest: number; total: number }[] = []

  pastaItems.forEach((item) => {
    const pricePerGuest = findPrice(item, "pasta")
    const total = pricePerGuest * guestCount
    pastaTotal += total
    pastaBreakdown.push({ name: item, pricePerGuest, total })
  })

  // Calculate dessert
  let dessertTotal = 0
  const dessertBreakdown: { name: string; pricePerGuest: number; total: number }[] = []

  dessertItems.forEach((item) => {
    const pricePerGuest = findPrice(item, "dessert")
    const total = pricePerGuest * guestCount
    dessertTotal += total
    dessertBreakdown.push({ name: item, pricePerGuest, total })
  })

  // Calculate beverages
  let beverageTotal = 0
  const beverageBreakdown: { name: string; pricePerGuest: number; total: number }[] = []

  beverageItems.forEach((item) => {
    const pricePerGuest = findPrice(item, "beverage")
    const total = pricePerGuest * guestCount
    beverageTotal += total
    beverageBreakdown.push({ name: item, pricePerGuest, total })
  })

  // Calculate subtotal for menu items
  const menuSubtotal = mainCoursesTotal + pastaTotal + dessertTotal + beverageTotal

  // Determine service fee or wedding package price
  const isWeddingEvent = eventType === "wedding"
  let finalServiceFee = 0
  let selectedItems: MenuItem[] = []

  if (isWeddingEvent) {
    finalServiceFee = weddingPackages[guestCount.toString()] || 0
    selectedItems = FALLBACK_MENU_ITEMS.filter((item) => MAIN_COURSE_CATEGORIES.includes(item.category.toLowerCase()))
  } else {
    // FIXED: Use fixed service fee from PRICING_RULES instead of percentage
    finalServiceFee = serviceFees[guestCount.toString()] || 11500 // Default to ₱11,500
    selectedItems = [
      ...mainCoursesBreakdown.map((item) => ({
        id: 0,
        name: item.name,
        category: "beef",
        price: item.pricePerGuest,
      })),
      ...pastaBreakdown.map((item) => ({
        id: 0,
        name: item.name,
        category: "pasta",
        price: item.pricePerGuest,
      })),
      ...dessertBreakdown.map((item) => ({
        id: 0,
        name: item.name,
        category: "dessert",
        price: item.pricePerGuest,
      })),
      ...beverageBreakdown.map((item) => ({
        id: 0,
        name: item.name,
        category: "beverage",
        price: item.pricePerGuest,
      })),
    ]
  }

  // Calculate totals (WITHOUT backdrop - that's added separately)
  const totalAmount = menuSubtotal + finalServiceFee
  const pricePerGuest = totalAmount / guestCount

  console.log("Server-side pricing result:", {
    mainCoursesTotal,
    pastaTotal,
    dessertTotal,
    beverageTotal,
    serviceFee: finalServiceFee,
    subtotal: menuSubtotal,
    totalAmount,
    pricePerGuest,
  })

  return {
    subtotal: menuSubtotal || 0,
    serviceFee: finalServiceFee || 0,
    total: totalAmount || 0,
    pricePerGuest: pricePerGuest || 0,
    menuItems: selectedItems,
    guestCount,
    totalAmount: totalAmount || 0,
    downPayment: Math.round((totalAmount || 0) * 0.5),
  }
}

/**
 * Get service fee for a specific guest count
 */
export function getServiceFee(guestCount: number): number {
  return PRICING_RULES.serviceFees[guestCount.toString()] || 11500 // Default to ₱11,500
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
  }).format(amount)
}

/**
 * Get detailed pricing breakdown as a formatted string
 */
export function getPricingBreakdownText(breakdown: PricingBreakdown): string {
  let text = "Pricing Breakdown:\n"

  // Main courses
  if (breakdown.menuItems.length > 0) {
    text += "\nSelected Items:\n"
    breakdown.menuItems.forEach((item) => {
      text += `• ${item.name}: ${formatCurrency(item.price)}/guest\n`
    })
  }

  text += `\nSubtotal: ${formatCurrency(breakdown.subtotal)}\n`
  text += `Service Fee: ${formatCurrency(breakdown.serviceFee)}\n`
  text += `Total Amount: ${formatCurrency(breakdown.total)}\n`
  text += `Price Per Guest: ${formatCurrency(breakdown.pricePerGuest)}\n`

  return text
}

// Export types
export type { PricingRules, MenuSelections, PricingBreakdown, MenuItem }

// Additional helper functions for menu items and categories
export function getMainCourseItems(menuItems: MenuItem[] = FALLBACK_MENU_ITEMS): MenuItem[] {
  return menuItems.filter((item) => MAIN_COURSE_CATEGORIES.includes(item.category.toLowerCase()))
}

export function getCategoryPrice(category: string): number {
  const normalizedCategory = category.toLowerCase()
  return CATEGORY_PRICING[normalizedCategory] || 0
}

export function isMainCourseCategory(category: string): boolean {
  return MAIN_COURSE_CATEGORIES.includes(category.toLowerCase())
}

// Helper function to get category display name
export function getCategoryDisplayName(category: string): string {
  const categoryMap: { [key: string]: string } = {
    beef: "Beef",
    pork: "Pork",
    chicken: "Chicken",
    seafood: "Seafood",
    vegetables: "Vegetables",
    pasta: "Pasta",
    dessert: "Dessert",
    beverage: "Beverage",
  }

  return categoryMap[category.toLowerCase()] || category
}
