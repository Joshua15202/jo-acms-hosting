"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import {
  ChevronRight,
  Loader2,
  Send,
  Shuffle,
  Calendar,
  Clock,
  Users,
  MapPin,
  Palette,
  User,
  Mail,
  Phone,
  Home,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useRouter } from "next/navigation"

interface PersonalInfo {
  firstName: string
  lastName: string
  email: string
  phone: string
}

interface EventInfo {
  eventType: string
  celebrantName: string
  celebrantAge: string
  celebrantGender: string
  debutanteGender: string
  groomName: string
  brideName: string
  additionalEventInfo: string
}

interface SchedulingInfo {
  eventDate: string
  timeSlot: string
}

interface AIRecommendationProps {
  personalInfo: PersonalInfo
  eventInfo: EventInfo
  schedulingInfo: SchedulingInfo
}

interface MenuItem {
  id: number
  name: string
  price: number
  category: string
}

interface MenuItems {
  beef: MenuItem[]
  pork: MenuItem[]
  chicken: MenuItem[]
  seafood: MenuItem[]
  vegetables: MenuItem[]
  pasta: MenuItem[]
  dessert: MenuItem[]
  beverage: MenuItem[]
}

const initialFormDataState = {
  guestCount: "",
  preferredMenus: "",
  venue: "",
  theme: "",
  colorMotif: "",
  additionalEventInfo: "",
}

export default function AIRecommendation({ personalInfo, eventInfo, schedulingInfo }: AIRecommendationProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isGenerating, setIsGenerating] = useState(false)
  const [isBooking, setIsBooking] = useState(false)
  const [isBookingComplete, setIsBookingComplete] = useState(false)
  const [bookingResponse, setBookingResponse] = useState<any>(null)
  const [countdown, setCountdown] = useState(10)
  const [recommendations, setRecommendations] = useState<any>(null)
  const [formData, setFormData] = useState(initialFormDataState)
  const [menuItems, setMenuItems] = useState<MenuItems | null>(null)
  const [isLoadingMenu, setIsLoadingMenu] = useState(true)
  const [generationCount, setGenerationCount] = useState(0)

  const [selectedMenuItems, setSelectedMenuItems] = useState<{
    menu1: string[] // Beef, Pork
    menu2: string[] // Chicken
    menu3: string[] // Seafood, Vegetables
    pasta: string[]
    dessert: string[]
    beverage: string[]
  }>({
    menu1: [],
    menu2: [],
    menu3: [],
    pasta: [],
    dessert: [],
    beverage: [],
  })

  // Countdown timer effect for auto-redirect
  useEffect(() => {
    if (isBookingComplete && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1)
      }, 1000)
      return () => clearTimeout(timer)
    } else if (isBookingComplete && countdown === 0) {
      handleGoToHomepage()
    }
  }, [isBookingComplete, countdown])

  const handleGoToHomepage = () => {
    router.push("/")
  }

  // Randomize array function for client-side fallback
  const shuffleArray = (array: any[]) => {
    const shuffled = [...array]
    // Multiple shuffle passes for better randomization
    for (let pass = 0; pass < 3; pass++) {
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
      }
    }
    return shuffled
  }

  // Parse user preferences to understand restrictions and emphasis
  const parseUserPreferences = (preferences: string) => {
    const lowerPrefs = preferences.toLowerCase()
    const restrictions = []
    const emphasis = []
    const onlyRequests = []
    const specialDiets = []
    const cookingStyles = []
    const quantities = []

    // Enhanced "only" pattern detection
    const onlyPatterns = {
      beef: [
        "only beef",
        "beef only",
        "just beef",
        "beef alone",
        "exclusively beef",
        "nothing but beef",
        "purely beef",
        "solely beef",
        "beef dishes only",
        "beef main course only",
        "main course beef only",
        "beef for main course",
        "beef main dishes only",
      ],
      pork: [
        "only pork",
        "pork only",
        "just pork",
        "pork alone",
        "exclusively pork",
        "nothing but pork",
        "purely pork",
        "solely pork",
        "pork dishes only",
        "pork main course only",
        "main course pork only",
        "pork for main course",
        "pork main dishes only",
      ],
      chicken: [
        "only chicken",
        "chicken only",
        "just chicken",
        "chicken alone",
        "exclusively chicken",
        "nothing but chicken",
        "purely chicken",
        "solely chicken",
        "chicken dishes only",
        "chicken main course only",
        "main course chicken only",
        "chicken for main course",
        "chicken main dishes only",
      ],
      seafood: [
        "only seafood",
        "seafood only",
        "just seafood",
        "seafood alone",
        "exclusively seafood",
        "nothing but seafood",
        "purely seafood",
        "solely seafood",
        "seafood dishes only",
        "only fish",
        "fish only",
        "just fish",
        "seafood main course only",
        "main course seafood only",
        "seafood for main course",
        "seafood main dishes only",
      ],
      vegetables: [
        "only vegetables",
        "vegetables only",
        "just vegetables",
        "vegetables alone",
        "exclusively vegetables",
        "nothing but vegetables",
        "purely vegetables",
        "solely vegetables",
        "vegetable dishes only",
        "only veggies",
        "veggies only",
        "just veggies",
        "vegetable main course only",
        "main course vegetables only",
        "vegetables for main course",
        "vegetable main dishes only",
      ],
      pasta: [
        "only pasta",
        "pasta only",
        "just pasta",
        "pasta alone",
        "exclusively pasta",
        "nothing but pasta",
        "purely pasta",
        "solely pasta",
        "pasta dishes only",
        "pasta main course only",
        "main course pasta only",
        "pasta for main course",
        "pasta main dishes only",
      ],
    }

    // Handle combination "only" requests like "only pork & chicken" or "only beef and pork"
    const combinationPatterns = [
      {
        pattern:
          /only\s+(beef|pork|chicken|seafood|vegetables|pasta)(\s*(&|and)\s*(beef|pork|chicken|seafood|vegetables|pasta))+/i,
        extract: (match: string) => {
          const categories = match
            .toLowerCase()
            .replace(/only\s+/, "")
            .replace(/\s*(&|and)\s*/g, ",")
            .split(",")
            .map((cat) => cat.trim())
            .filter((cat) => ["beef", "pork", "chicken", "seafood", "vegetables", "pasta"].includes(cat))
          return categories
        },
      },
      {
        pattern:
          /(beef|pork|chicken|seafood|vegetables|pasta)(\s*(&|and)\s*(beef|pork|chicken|seafood|vegetables|pasta))+\s+only/i,
        extract: (match: string) => {
          const categories = match
            .toLowerCase()
            .replace(/\s+only$/, "")
            .replace(/\s*(&|and)\s*/g, ",")
            .split(",")
            .map((cat) => cat.trim())
            .filter((cat) => ["beef", "pork", "chicken", "seafood", "vegetables", "pasta"].includes(cat))
          return categories
        },
      },
    ]

    // Check for combination "only" requests first
    for (const pattern of combinationPatterns) {
      const match = lowerPrefs.match(pattern.pattern)
      if (match) {
        const categories = pattern.extract(match[0])
        onlyRequests.push(...categories)
        console.log(`Detected combination "only" request:`, categories)
        break // Only process the first match to avoid duplicates
      }
    }

    // If no combination patterns matched, check individual "only" requests
    if (onlyRequests.length === 0) {
      Object.keys(onlyPatterns).forEach((category) => {
        const patterns = onlyPatterns[category as keyof typeof onlyPatterns]
        if (patterns.some((pattern) => lowerPrefs.includes(pattern))) {
          onlyRequests.push(category)
        }
      })
    }

    // Enhanced restriction patterns
    const restrictionPatterns = {
      beef: [
        "no beef",
        "without beef",
        "exclude beef",
        "remove beef",
        "skip beef",
        "avoid beef",
        "dont include beef",
        "i dont like beef",
        "i hate beef",
        "not a fan of beef",
        "allergic to beef",
        "cant eat beef",
        "beef free",
      ],
      pork: [
        "no pork",
        "without pork",
        "exclude pork",
        "remove pork",
        "skip pork",
        "avoid pork",
        "dont include pork",
        "i hate pork",
        "not a fan of pork",
        "allergic to pork",
        "cant eat pork",
        "halal",
        "muslim",
        "islamic",
        "no pork for religious reasons",
        "pork free",
      ],
      chicken: [
        "no chicken",
        "without chicken",
        "exclude chicken",
        "remove chicken",
        "skip chicken",
        "avoid chicken",
        "dont include chicken",
        "i dont like chicken",
        "i hate chicken",
        "not a fan of chicken",
        "allergic to chicken",
        "cant eat chicken",
        "chicken free",
      ],
      seafood: [
        "no seafood",
        "without seafood",
        "exclude seafood",
        "remove seafood",
        "skip seafood",
        "avoid seafood",
        "dont include seafood",
        "i dont like seafood",
        "i hate seafood",
        "not a fan of seafood",
        "allergic to seafood",
        "cant eat seafood",
        "no fish",
        "shellfish allergy",
        "seafood free",
      ],
      vegetables: [
        "no vegetables",
        "without vegetables",
        "exclude vegetables",
        "remove vegetables",
        "skip vegetables",
        "avoid vegetables",
        "dont include vegetables",
        "i dont like vegetables",
        "i hate vegetables",
        "not a fan of vegetables",
        "no veggies",
        "meat only",
        "vegetable free",
      ],
      pasta: [
        "no pasta",
        "without pasta",
        "exclude pasta",
        "remove pasta",
        "skip pasta",
        "avoid pasta",
        "dont include pasta",
        "i dont like pasta",
        "i hate pasta",
        "not a fan of pasta",
        "no carbs",
        "low carb",
        "keto",
        "gluten free",
        "pasta free",
      ],
    }

    // Enhanced emphasis patterns
    const emphasisPatterns = {
      beef: [
        "more beef",
        "extra beef",
        "add more beef",
        "lots of beef",
        "plenty of beef",
        "i love beef",
        "my favorite is beef",
        "prefer beef",
        "focus on beef",
        "emphasize beef",
        "highlight beef",
        "feature beef",
        "showcase beef",
        "double the beef",
        "heavy on beef",
        "rich in beef",
        "beef lover",
        "beef heavy",
      ],
      pork: [
        "more pork",
        "extra pork",
        "add more pork",
        "lots of pork",
        "plenty of pork",
        "i love pork",
        "my favorite is pork",
        "prefer pork",
        "focus on pork",
        "emphasize pork",
        "highlight pork",
        "feature pork",
        "showcase pork",
        "double the pork",
        "heavy on pork",
        "rich in pork",
        "pork lover",
        "pork heavy",
      ],
      chicken: [
        "more chicken",
        "extra chicken",
        "add more chicken",
        "lots of chicken",
        "plenty of chicken",
        "i love chicken",
        "my favorite is chicken",
        "prefer chicken",
        "focus on chicken",
        "emphasize chicken",
        "highlight chicken",
        "feature chicken",
        "showcase chicken",
        "double the chicken",
        "heavy on chicken",
        "rich in chicken",
        "chicken lover",
        "chicken heavy",
      ],
      seafood: [
        "more seafood",
        "extra seafood",
        "add more seafood",
        "lots of seafood",
        "plenty of seafood",
        "i love seafood",
        "my favorite is seafood",
        "prefer seafood",
        "focus on seafood",
        "emphasize seafood",
        "highlight seafood",
        "feature seafood",
        "showcase seafood",
        "double the seafood",
        "heavy on seafood",
        "rich in seafood",
        "seafood lover",
        "pescatarian",
        "fish only",
        "seafood heavy",
      ],
      vegetables: [
        "more vegetables",
        "extra vegetables",
        "add more vegetables",
        "lots of vegetables",
        "plenty of vegetables",
        "i love vegetables",
        "my favorite is vegetables",
        "prefer vegetables",
        "focus on vegetables",
        "emphasize vegetables",
        "highlight vegetables",
        "feature vegetables",
        "showcase vegetables",
        "double the vegetables",
        "heavy on vegetables",
        "rich in vegetables",
        "vegetable lover",
        "vegetarian",
        "veggie",
        "plant based",
        "green",
        "healthy",
        "vegetable heavy",
      ],
      pasta: [
        "more pasta",
        "extra pasta",
        "add more pasta",
        "lots of pasta",
        "plenty of pasta",
        "i love pasta",
        "my favorite is pasta",
        "prefer pasta",
        "focus on pasta",
        "emphasize pasta",
        "highlight pasta",
        "feature pasta",
        "showcase pasta",
        "double the pasta",
        "heavy on pasta",
        "rich in pasta",
        "pasta lover",
        "carb lover",
        "pasta heavy",
      ],
    }

    // Check for restrictions (but not if "only" is specified for that category)
    Object.keys(restrictionPatterns).forEach((category) => {
      if (!onlyRequests.includes(category)) {
        const patterns = restrictionPatterns[category as keyof typeof restrictionPatterns]
        if (patterns.some((pattern) => lowerPrefs.includes(pattern))) {
          restrictions.push(category)
        }
      }
    })

    // Check for emphasis (but not if restricted)
    Object.keys(emphasisPatterns).forEach((category) => {
      if (!restrictions.includes(category)) {
        const patterns = emphasisPatterns[category as keyof typeof emphasisPatterns]
        if (patterns.some((pattern) => lowerPrefs.includes(pattern))) {
          emphasis.push(category)
        }
      }
    })

    // Special dietary requirements
    if (lowerPrefs.includes("vegetarian") || lowerPrefs.includes("veggie only") || lowerPrefs.includes("no meat")) {
      onlyRequests.push("vegetables")
      restrictions.push("beef", "pork", "chicken", "seafood")
    }

    if (lowerPrefs.includes("pescatarian") || lowerPrefs.includes("fish only")) {
      onlyRequests.push("seafood")
      restrictions.push("beef", "pork", "chicken")
      emphasis.push("seafood", "vegetables")
    }

    // Cooking style preferences
    if (lowerPrefs.includes("spicy") || lowerPrefs.includes("hot") || lowerPrefs.includes("maanghang")) {
      cookingStyles.push("spicy")
    }

    if (lowerPrefs.includes("mild") || lowerPrefs.includes("not spicy") || lowerPrefs.includes("no spice")) {
      cookingStyles.push("mild")
    }

    if (lowerPrefs.includes("grilled") || lowerPrefs.includes("no fried")) {
      cookingStyles.push("grilled")
    }

    // Quantity preferences
    if (lowerPrefs.includes("light") || lowerPrefs.includes("small portions") || lowerPrefs.includes("minimal")) {
      quantities.push("light")
    }

    if (lowerPrefs.includes("heavy") || lowerPrefs.includes("large portions") || lowerPrefs.includes("generous")) {
      quantities.push("heavy")
    }

    return {
      restrictions: [...new Set(restrictions)],
      emphasis: [...new Set(emphasis)],
      onlyRequests: [...new Set(onlyRequests)],
      specialDiets,
      cookingStyles,
      quantities,
    }
  }

  // Fetch menu items from database on component mount
  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        setIsLoadingMenu(true)
        const response = await fetch("/api/menu-items")
        const result = await response.json()

        if (result.success && result.menuItems) {
          console.log("Fetched menu items:", result.menuItems)
          setMenuItems(result.menuItems)
        } else {
          console.error("Failed to fetch menu items:", result.message)
        }
      } catch (error) {
        console.error("Error fetching menu items:", error)
      } finally {
        setIsLoadingMenu(false)
      }
    }

    fetchMenuItems()
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleBookPackage = async (pkg: any) => {
    setIsBooking(true)

    try {
      // Combine all menu selections to match booking form structure
      const allMainCourses = [...selectedMenuItems.menu1, ...selectedMenuItems.menu2, ...selectedMenuItems.menu3]

      // Prepare appointment data similar to booking form
      const appointmentData = {
        firstName: personalInfo.firstName,
        lastName: personalInfo.lastName,
        email: personalInfo.email,
        phone: personalInfo.phone,
        eventType: eventInfo.eventType,
        guestCount: Number.parseInt(formData.guestCount),
        eventDate: schedulingInfo.eventDate,
        eventTime: schedulingInfo.timeSlot,
        venue: formData.venue,
        theme: formData.theme,
        colorMotif: formData.colorMotif,
        celebrantName: eventInfo.celebrantName,
        celebrantAge: eventInfo.celebrantAge ? Number.parseInt(eventInfo.celebrantAge) : null,
        celebrantGender: eventInfo.celebrantGender || eventInfo.debutanteGender,
        groomName: eventInfo.groomName,
        brideName: eventInfo.brideName,
        additionalEventInfo: eventInfo.additionalEventInfo,
        mainCourses: allMainCourses,
        pasta: selectedMenuItems.pasta,
        dessert: selectedMenuItems.dessert,
        beverage: selectedMenuItems.beverage,
        additionalRequests: formData.preferredMenus ? `AI Preferences: ${formData.preferredMenus}` : "",
        totalAmount: pkg.menuTotal + pkg.serviceFee,
        downPayment: pkg.downPayment,
        bookingSource: "AI Recommendation",
      }

      console.log("Booking appointment with data:", appointmentData)

      const response = await fetch("/api/book-appointment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(appointmentData),
      })

      const result = await response.json()

      if (result.success) {
        setBookingResponse(result)
        setIsBookingComplete(true)
        setCountdown(20) // Start 20-second countdown
      } else {
        throw new Error(result.error || "Failed to book appointment")
      }
    } catch (error) {
      console.error("Error booking appointment:", error)
      toast({
        title: "Booking Failed",
        description: error instanceof Error ? error.message : "Please try again or contact support.",
        variant: "destructive",
      })
    } finally {
      setIsBooking(false)
    }
  }

  // Enhanced function to enforce exactly 3 main courses
  const enforceFixedStructure = (aiRecommendations: any, userPrefs: any, filteredMenuItems: any) => {
    console.log("Enforcing fixed structure - Input:", aiRecommendations)

    const finalMenu = {
      menu1: [] as string[],
      menu2: [] as string[],
      menu3: [] as string[],
      pasta: aiRecommendations.pasta?.slice(0, 1) || [],
      dessert: aiRecommendations.dessert?.slice(0, 1) || [],
      beverage: aiRecommendations.beverage?.slice(0, 1) || [],
    }

    // Collect all main course items from AI response
    const allMainCourses = [
      ...(aiRecommendations.menu1 || []),
      ...(aiRecommendations.menu2 || []),
      ...(aiRecommendations.menu3 || []),
    ]

    console.log("All main courses from AI:", allMainCourses)

    // Handle "only" requests - fill all 3 slots with the requested category
    if (userPrefs.onlyRequests.length > 0) {
      console.log("Processing 'only' requests:", userPrefs.onlyRequests)

      if (userPrefs.onlyRequests.includes("beef")) {
        finalMenu.menu1 = shuffleArray([...filteredMenuItems.beef])
          .slice(0, 3)
          .map((item: any) => item.name || item)
      } else if (userPrefs.onlyRequests.includes("pork")) {
        finalMenu.menu1 = shuffleArray([...filteredMenuItems.pork])
          .slice(0, 3)
          .map((item: any) => item.name || item)
      } else if (userPrefs.onlyRequests.includes("chicken")) {
        finalMenu.menu2 = shuffleArray([...filteredMenuItems.chicken])
          .slice(0, 3)
          .map((item: any) => item.name || item)
      } else if (userPrefs.onlyRequests.includes("seafood")) {
        finalMenu.menu3 = shuffleArray([...filteredMenuItems.seafood])
          .slice(0, 3)
          .map((item: any) => item.name || item)
      } else if (userPrefs.onlyRequests.includes("vegetables")) {
        finalMenu.menu3 = shuffleArray([...filteredMenuItems.vegetables])
          .slice(0, 3)
          .map((item: any) => item.name || item)
      } else {
        // Multiple "only" categories - distribute among them
        const availableOnlyCategories = []
        if (userPrefs.onlyRequests.includes("beef") || userPrefs.onlyRequests.includes("pork")) {
          availableOnlyCategories.push({
            key: "menu1",
            items: [...filteredMenuItems.beef, ...filteredMenuItems.pork],
          })
        }
        if (userPrefs.onlyRequests.includes("chicken")) {
          availableOnlyCategories.push({ key: "menu2", items: filteredMenuItems.chicken })
        }
        if (userPrefs.onlyRequests.includes("seafood") || userPrefs.onlyRequests.includes("vegetables")) {
          availableOnlyCategories.push({
            key: "menu3",
            items: [...filteredMenuItems.seafood, ...filteredMenuItems.vegetables],
          })
        }

        // Distribute 3 items across the "only" categories
        const itemsPerCategory = Math.floor(3 / availableOnlyCategories.length)
        const extraItems = 3 % availableOnlyCategories.length

        availableOnlyCategories.forEach((category, index) => {
          const itemCount = itemsPerCategory + (index < extraItems ? 1 : 0)
          const selectedItems = shuffleArray([...category.items])
            .slice(0, itemCount)
            .map((item: any) => item.name || item)
          finalMenu[category.key as keyof typeof finalMenu] = selectedItems as any
        })
      }
    } else {
      // Normal distribution - ensure exactly 3 main courses total
      console.log("Processing normal distribution")

      // Get available categories (not restricted)
      const availableCategories = []
      if (
        !userPrefs.restrictions.includes("beef") &&
        !userPrefs.restrictions.includes("pork") &&
        (filteredMenuItems.beef.length > 0 || filteredMenuItems.pork.length > 0)
      ) {
        availableCategories.push({
          key: "menu1",
          items: [...filteredMenuItems.beef, ...filteredMenuItems.pork],
          priority: userPrefs.emphasis.includes("beef") || userPrefs.emphasis.includes("pork") ? 2 : 1,
        })
      }
      if (!userPrefs.restrictions.includes("chicken") && filteredMenuItems.chicken.length > 0) {
        availableCategories.push({
          key: "menu2",
          items: filteredMenuItems.chicken,
          priority: userPrefs.emphasis.includes("chicken") ? 2 : 1,
        })
      }
      if (
        !userPrefs.restrictions.includes("seafood") &&
        !userPrefs.restrictions.includes("vegetables") &&
        (filteredMenuItems.seafood.length > 0 || filteredMenuItems.vegetables.length > 0)
      ) {
        availableCategories.push({
          key: "menu3",
          items: [...filteredMenuItems.seafood, ...filteredMenuItems.vegetables],
          priority: userPrefs.emphasis.includes("seafood") || userPrefs.emphasis.includes("vegetables") ? 2 : 1,
        })
      }

      console.log(
        "Available categories:",
        availableCategories.map((c) => c.key),
      )

      if (availableCategories.length === 0) {
        console.warn("No available categories for main courses!")
        return finalMenu
      }

      // Sort by priority (emphasized categories first)
      availableCategories.sort((a, b) => b.priority - a.priority)

      // Distribute exactly 3 items across available categories
      let remainingItems = 3
      let categoryIndex = 0

      while (remainingItems > 0 && categoryIndex < availableCategories.length) {
        const category = availableCategories[categoryIndex]
        const maxItemsForCategory = Math.min(
          remainingItems,
          category.items.length,
          category.priority === 2 ? 2 : 1, // Emphasized categories can get up to 2 items
        )

        if (maxItemsForCategory > 0) {
          const selectedItems = shuffleArray([...category.items])
            .slice(0, maxItemsForCategory)
            .map((item: any) => item.name || item)

          finalMenu[category.key as keyof typeof finalMenu] = selectedItems as any
          remainingItems -= maxItemsForCategory
          console.log(`Assigned ${maxItemsForCategory} items to ${category.key}:`, selectedItems)
        }

        categoryIndex++

        // If we've gone through all categories and still have items to assign, loop back
        if (categoryIndex >= availableCategories.length && remainingItems > 0) {
          categoryIndex = 0
          // On second pass, allow any category to get additional items
          availableCategories.forEach((cat) => (cat.priority = 1))
        }
      }

      // If we still don't have exactly 3, fill remaining slots
      const currentMainCourseCount = finalMenu.menu1.length + finalMenu.menu2.length + finalMenu.menu3.length
      if (currentMainCourseCount < 3) {
        const needed = 3 - currentMainCourseCount
        console.log(`Need ${needed} more main courses`)

        for (const category of availableCategories) {
          if (needed <= 0) break

          const currentItems = finalMenu[category.key as keyof typeof finalMenu] as string[]
          const availableItems = category.items.filter((item: any) => !currentItems.includes(item.name || item))

          if (availableItems.length > 0) {
            const additionalItems = shuffleArray([...availableItems])
              .slice(0, Math.min(needed, availableItems.length))
              .map((item: any) => item.name || item)

            finalMenu[category.key as keyof typeof finalMenu] = [...currentItems, ...additionalItems] as any
            console.log(`Added ${additionalItems.length} more items to ${category.key}:`, additionalItems)
            break
          }
        }
      }
    }

    // Ensure we have exactly 1 pasta, 1 dessert, 1 beverage
    if (finalMenu.pasta.length === 0 && filteredMenuItems.pasta.length > 0) {
      finalMenu.pasta = [
        shuffleArray([...filteredMenuItems.pasta])[0].name || shuffleArray([...filteredMenuItems.pasta])[0],
      ]
    }
    if (finalMenu.dessert.length === 0 && filteredMenuItems.dessert.length > 0) {
      finalMenu.dessert = [
        shuffleArray([...filteredMenuItems.dessert])[0].name || shuffleArray([...filteredMenuItems.dessert])[0],
      ]
    }
    if (finalMenu.beverage.length === 0 && filteredMenuItems.beverage.length > 0) {
      finalMenu.beverage = [
        shuffleArray([...filteredMenuItems.beverage])[0].name || shuffleArray([...filteredMenuItems.beverage])[0],
      ]
    }

    const totalMainCourses = finalMenu.menu1.length + finalMenu.menu2.length + finalMenu.menu3.length
    console.log("Final menu structure:", {
      menu1: finalMenu.menu1.length,
      menu2: finalMenu.menu2.length,
      menu3: finalMenu.menu3.length,
      pasta: finalMenu.pasta.length,
      dessert: finalMenu.dessert.length,
      beverage: finalMenu.beverage.length,
      totalMainCourses,
    })

    return finalMenu
  }

  const generateAIRecommendations = async () => {
    if (!menuItems) {
      console.error("Menu items not loaded yet")
      return
    }

    setIsGenerating(true)
    setGenerationCount((prev) => prev + 1) // Increment generation count for variety tracking

    try {
      // Prepare menu data for AI with randomization
      const allMenuItems = {
        beef: menuItems.beef.map((item) => item.name),
        pork: menuItems.pork.map((item) => item.name),
        chicken: menuItems.chicken.map((item) => item.name),
        seafood: menuItems.seafood.map((item) => item.name),
        vegetables: menuItems.vegetables.map((item) => item.name),
        pasta: menuItems.pasta.map((item) => item.name),
        dessert: menuItems.dessert.map((item) => item.name),
        beverage: menuItems.beverage.map((item) => item.name),
      }

      const aiRequest = {
        eventType: eventInfo.eventType,
        guestCount: formData.guestCount,
        preferredMenus: formData.preferredMenus,
        venue: formData.venue,
        theme: formData.theme,
        colorMotif: formData.colorMotif,
        availableMenuItems: allMenuItems,
        generationCount: generationCount, // Include generation count for variety
      }

      console.log("Sending AI request:", aiRequest)

      const response = await fetch("/api/ai-menu-recommendation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(aiRequest),
      })

      const result = await response.json()
      console.log("AI API response:", result)

      // Handle successful AI response
      if (result.success && result.recommendations) {
        console.log("AI recommendations received successfully")

        // Parse user preferences for client-side validation
        const userPrefs = parseUserPreferences(formData.preferredMenus || "")

        // Apply user restrictions to available items
        const applyUserRestrictions = (items: MenuItem[], category: string) => {
          if (userPrefs.restrictions.includes(category.toLowerCase())) {
            return [] // Completely exclude this category
          }
          return shuffleArray(items) // Randomize available items
        }

        const filteredMenuItems = {
          beef: applyUserRestrictions(menuItems.beef, "beef"),
          pork: applyUserRestrictions(menuItems.pork, "pork"),
          chicken: applyUserRestrictions(menuItems.chicken, "chicken"),
          seafood: applyUserRestrictions(menuItems.seafood, "seafood"),
          vegetables: applyUserRestrictions(menuItems.vegetables, "vegetables"),
          pasta: applyUserRestrictions(menuItems.pasta, "pasta"),
          dessert: shuffleArray(menuItems.dessert),
          beverage: shuffleArray(menuItems.beverage),
        }

        // Enforce fixed structure: exactly 3 main courses, 1 pasta, 1 dessert, 1 beverage
        const finalMenu = enforceFixedStructure(result.recommendations, userPrefs, filteredMenuItems)

        // Update the state with the final menu
        setSelectedMenuItems({
          menu1: finalMenu.menu1,
          menu2: finalMenu.menu2,
          menu3: finalMenu.menu3,
          pasta: finalMenu.pasta,
          dessert: finalMenu.dessert,
          beverage: finalMenu.beverage,
        })

        // Calculate pricing based on final selections
        const calculateMenuPricing = (selections: any) => {
          const numGuests = Number.parseInt(formData.guestCount) || 50
          let total = 0
          const breakdown: any = {
            menu1: [],
            menu2: [],
            menu3: [],
            pasta: [],
            dessert: [],
            beverage: [],
          }

          // Menu 1 (Beef & Pork) - ₱70 per guest
          selections.menu1?.forEach((item: string) => {
            const itemTotal = 70 * numGuests
            total += itemTotal
            breakdown.menu1.push({ name: item, pricePerGuest: 70, total: itemTotal })
          })

          // Menu 2 (Chicken) - ₱60 per guest
          selections.menu2?.forEach((item: string) => {
            const itemTotal = 60 * numGuests
            total += itemTotal
            breakdown.menu2.push({ name: item, pricePerGuest: 60, total: itemTotal })
          })

          // Menu 3 (Seafood & Vegetables) - ₱50 per guest
          selections.menu3?.forEach((item: string) => {
            const itemTotal = 50 * numGuests
            total += itemTotal
            breakdown.menu3.push({ name: item, pricePerGuest: 50, total: itemTotal })
          })

          // Pasta - ₱40 per guest
          selections.pasta?.forEach((item: string) => {
            const itemTotal = 40 * numGuests
            total += itemTotal
            breakdown.pasta.push({ name: item, pricePerGuest: 40, total: itemTotal })
          })

          // Dessert - ₱25 per guest
          selections.dessert?.forEach((item: string) => {
            const itemTotal = 25 * numGuests
            total += itemTotal
            breakdown.dessert.push({ name: item, pricePerGuest: 25, total: itemTotal })
          })

          // Beverage - ₱25 per guest
          selections.beverage?.forEach((item: string) => {
            const itemTotal = 25 * numGuests
            total += itemTotal
            breakdown.beverage.push({ name: item, pricePerGuest: 25, total: itemTotal })
          })

          return { total, breakdown }
        }

        // Calculate pricing based on the final menu structure
        const menuPricing = calculateMenuPricing(finalMenu)
        const numGuests = Number.parseInt(formData.guestCount) || 50

        // Service fee based on guest count (except for wedding & debut)
        let serviceFee = 0
        const isWeddingOrDebut = eventInfo.eventType === "wedding" || eventInfo.eventType === "debut"

        if (!isWeddingOrDebut) {
          const serviceFees: { [key: string]: number } = {
            "50": 11500,
            "80": 10400,
            "100": 11000,
            "150": 16500,
            "200": 22000,
          }
          serviceFee = serviceFees[formData.guestCount] || 11500
        }

        // Calculate final total amount
        const finalTotalAmount = menuPricing.total + serviceFee
        const finalDownPayment = Math.round(finalTotalAmount * 0.5)

        // Service fee inclusions for non-wedding/debut events
        const isWeddingOrDebutEvent = eventInfo.eventType === "wedding" || eventInfo.eventType === "debut"
        const serviceFeeInclusions = !isWeddingOrDebutEvent
          ? [
              "Steamed Rice",
              "Purified Mineral Water",
              "1 Choice of Drink",
              "Elegant Buffet Table",
              "Guest Chairs & Tables",
              "With Complete Setup",
              "Table Centerpiece",
              "Friendly Waiters & Food Attendant",
              "4 Hours Service",
            ]
          : []

        // Create detailed package features with actual menu items
        const createPackageFeatures = (selections: any) => {
          const features = []

          // Main courses with actual names
          const mainCourseItems = [
            ...(selections.menu1 || []).map((item: string) => `${item} (Menu 1)`),
            ...(selections.menu2 || []).map((item: string) => `${item} (Menu 2)`),
            ...(selections.menu3 || []).map((item: string) => `${item} (Menu 3)`),
          ]

          if (mainCourseItems.length > 0) {
            features.push(`Main Courses (${mainCourseItems.length}): ${mainCourseItems.join(", ")}`)
          }

          // Pasta dishes
          if (selections.pasta && selections.pasta.length > 0) {
            features.push(`Pasta (${selections.pasta.length}): ${selections.pasta.join(", ")}`)
          }

          // Desserts
          if (selections.dessert && selections.dessert.length > 0) {
            features.push(`Desserts (${selections.dessert.length}): ${selections.dessert.join(", ")}`)
          }

          // Beverages
          if (selections.beverage && selections.beverage.length > 0) {
            features.push(`Beverages (${selections.beverage.length}): ${selections.beverage.join(", ")}`)
          }

          // Add user preference acknowledgment
          if (userPrefs.restrictions.length > 0) {
            features.push(`✓ Excludes: ${userPrefs.restrictions.join(", ")} (as requested)`)
          }
          if (userPrefs.emphasis.length > 0) {
            features.push(`✓ Emphasizes: ${userPrefs.emphasis.join(", ")} (as requested)`)
          }
          if (userPrefs.onlyRequests.length > 0) {
            features.push(`✓ Only includes: ${userPrefs.onlyRequests.join(", ")} (as requested)`)
          }

          // Add other standard features
          features.push(`${numGuests} guests`)
          features.push(`AI-personalized based on your preferences`)
          features.push(`Generation #${generationCount} - Fresh variety`)
          features.push(`Fixed structure: exactly 3 main courses, 1 pasta, 1 dessert, 1 beverage`)

          return features
        }

        const mockRecommendations = {
          packages: [
            {
              name: `AI-Curated ${eventInfo.eventType.charAt(0).toUpperCase() + eventInfo.eventType.slice(1)} Package`,
              description: `A personalized package for your ${eventInfo.eventType} featuring AI-selected menu items that strictly follow your dietary preferences with our standard structure of exactly 3 main courses, 1 pasta, 1 dessert, and 1 beverage.`,
              price: `₱${finalTotalAmount.toLocaleString()}`,
              features: createPackageFeatures(finalMenu),
              isRecommended: true,
              reasoning:
                result.recommendations.reasoning ||
                `This AI-curated package strictly follows your menu preferences: "${formData.preferredMenus}". Your dietary restrictions have been carefully respected while maintaining our standard menu structure of exactly 3 main courses, 1 pasta, 1 dessert, and 1 beverage.`,
              menuTotal: menuPricing.total,
              serviceFee: serviceFee,
              serviceFeeInclusions: serviceFeeInclusions,
              downPayment: finalDownPayment,
              isWeddingOrDebut: isWeddingOrDebut,
              userPreferences: userPrefs,
              menuSelections: finalMenu,
              generationCount: generationCount,
            },
          ],
          menu: finalMenu,
          menuPricing: menuPricing,
        }

        setRecommendations(mockRecommendations)
      } else {
        console.error("AI recommendation failed:", result.message)
        // Fallback to original logic if AI fails
        generateFallbackRecommendations()
      }
    } catch (error) {
      console.error("Error generating AI recommendations:", error)
      // Fallback to original logic if AI fails
      generateFallbackRecommendations()
    } finally {
      setIsGenerating(false)
    }
  }

  const generateFallbackRecommendations = () => {
    if (!menuItems) return

    const numGuests = Number.parseInt(formData.guestCount) || 50
    const userPrefs = parseUserPreferences(formData.preferredMenus || "")

    // Apply user restrictions to available items
    const applyUserRestrictions = (items: MenuItem[], category: string) => {
      if (userPrefs.restrictions.includes(category.toLowerCase())) {
        return [] // Completely exclude this category
      }
      return shuffleArray(items) // Randomize available items
    }

    const filteredMenuItems = {
      beef: applyUserRestrictions(menuItems.beef, "beef"),
      pork: applyUserRestrictions(menuItems.pork, "pork"),
      chicken: applyUserRestrictions(menuItems.chicken, "chicken"),
      seafood: applyUserRestrictions(menuItems.seafood, "seafood"),
      vegetables: applyUserRestrictions(menuItems.vegetables, "vegetables"),
      pasta: applyUserRestrictions(menuItems.pasta, "pasta"),
      dessert: shuffleArray(menuItems.dessert),
      beverage: shuffleArray(menuItems.beverage),
    }

    // Use the same fixed structure enforcement
    const fallbackRecommendations = {
      menu1: [],
      menu2: [],
      menu3: [],
      pasta: [],
      dessert: [],
      beverage: [],
    }

    const finalMenu = enforceFixedStructure(fallbackRecommendations, userPrefs, filteredMenuItems)

    setSelectedMenuItems({
      menu1: [...finalMenu.menu1],
      menu2: [...finalMenu.menu2],
      menu3: [...finalMenu.menu3],
      pasta: [...finalMenu.pasta],
      dessert: [...finalMenu.dessert],
      beverage: [...finalMenu.beverage],
    })

    const isWeddingOrDebutEvent = eventInfo.eventType === "wedding" || eventInfo.eventType === "debut"

    // Calculate final menu cost with fixed pricing
    const costs = { menu1: 70, menu2: 60, menu3: 50, pasta: 40, dessert: 25, beverage: 25 }
    const finalMenuCost =
      (finalMenu.menu1.length * costs.menu1 +
        finalMenu.menu2.length * costs.menu2 +
        finalMenu.menu3.length * costs.menu3 +
        finalMenu.pasta.length * costs.pasta +
        finalMenu.dessert.length * costs.dessert +
        finalMenu.beverage.length * costs.beverage) *
      numGuests

    // Service fee calculation
    let serviceFee = 0
    if (!isWeddingOrDebutEvent) {
      const serviceFees: { [key: string]: number } = {
        "50": 11500,
        "80": 10400,
        "100": 11000,
        "150": 16500,
        "200": 22000,
      }
      serviceFee = serviceFees[formData.guestCount] || 11500
    }

    // Calculate final total amount
    const finalTotalAmount = finalMenuCost + serviceFee
    const finalDownPayment = Math.round(finalTotalAmount * 0.5)

    // Service fee inclusions for non-wedding/debut events
    const serviceFeeInclusions = !isWeddingOrDebutEvent
      ? [
          "Steamed Rice",
          "Purified Mineral Water",
          "1 Choice of Drink",
          "Elegant Buffet Table",
          "Guest Chairs & Tables",
          "With Complete Setup",
          "Table Centerpiece",
          "Friendly Waiters & Food Attendant",
          "4 Hours Service",
        ]
      : []

    // Create detailed package features with actual menu items for fallback
    const createFallbackPackageFeatures = (selections: any) => {
      const features = []

      // Main courses with actual names
      const mainCourseItems = [
        ...(selections.menu1 || []).map((item: string) => `${item} (Menu 1)`),
        ...(selections.menu2 || []).map((item: string) => `${item} (Menu 2)`),
        ...(selections.menu3 || []).map((item: string) => `${item} (Menu 3)`),
      ]

      if (mainCourseItems.length > 0) {
        features.push(`Main Courses (${mainCourseItems.length}): ${mainCourseItems.join(", ")}`)
      }

      // Pasta dishes
      if (selections.pasta && selections.pasta.length > 0) {
        features.push(`Pasta (${selections.pasta.length}): ${selections.pasta.join(", ")}`)
      }

      // Desserts
      if (selections.dessert && selections.dessert.length > 0) {
        features.push(`Desserts (${selections.dessert.length}): ${selections.dessert.join(", ")}`)
      }

      // Beverages
      if (selections.beverage && selections.beverage.length > 0) {
        features.push(`Beverages (${selections.beverage.length}): ${selections.beverage.join(", ")}`)
      }

      // Add user preference acknowledgment
      if (userPrefs.restrictions.length > 0) {
        features.push(`✓ Excludes: ${userPrefs.restrictions.join(", ")} (as requested)`)
      }
      if (userPrefs.emphasis.length > 0) {
        features.push(`✓ Emphasizes: ${userPrefs.emphasis.join(", ")} (as requested)`)
      }
      if (userPrefs.onlyRequests.length > 0) {
        features.push(`✓ Only includes: ${userPrefs.onlyRequests.join(", ")} (as requested)`)
      }

      // Add other standard features
      features.push(`${numGuests} guests`)
      features.push(`Generation #${generationCount} - Standard structure`)
      features.push(`Fixed structure: exactly 3 main courses, 1 pasta, 1 dessert, 1 beverage`)

      return features
    }

    const mockRecommendations = {
      packages: [
        {
          name: `${eventInfo.eventType.charAt(0).toUpperCase() + eventInfo.eventType.slice(1)} Celebration Package`,
          description: `A standard package for your ${eventInfo.eventType} featuring menu selection that follows our fixed structure of exactly 3 main courses, 1 pasta, 1 dessert, and 1 beverage.`,
          price: `₱${finalTotalAmount.toLocaleString()}`,
          features: createFallbackPackageFeatures(finalMenu),
          isRecommended: true,
          reasoning: `This package has been customized to follow your preferences: "${formData.preferredMenus}". Your dietary restrictions have been respected while maintaining our standard menu structure of exactly 3 main courses, 1 pasta, 1 dessert, and 1 beverage.`,
          menuTotal: finalMenuCost,
          serviceFee: serviceFee,
          serviceFeeInclusions: serviceFeeInclusions,
          downPayment: finalDownPayment,
          isWeddingOrDebut: isWeddingOrDebutEvent,
          userPreferences: userPrefs,
          menuSelections: finalMenu,
          generationCount: generationCount,
        },
      ],
      menu: finalMenu,
    }

    setRecommendations(mockRecommendations)
  }

  const isFormDisabled = !eventInfo.eventType || isLoadingMenu

  // Show success message with countdown if booking is complete
  if (isBookingComplete) {
    const tastingDate = bookingResponse?.data?.tastingDate
    const tastingTime = bookingResponse?.data?.tastingTime

    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] space-y-6">
        <div className="text-center max-w-2xl">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-green-600 mb-4">🎉 Thank You!</h2>
          <h3 className="text-xl font-semibold text-gray-800 mb-3">Appointment Booked Successfully!</h3>

          <div className="bg-rose-50 border border-rose-200 rounded-lg p-6 mb-6">
            <div className="flex items-center justify-center mb-4">
              <Mail className="w-6 h-6 text-rose-600 mr-2" />
              <h4 className="text-lg font-semibold text-rose-800">📧 Food Tasting Confirmation</h4>
            </div>
            <p className="text-gray-700 text-sm leading-relaxed mb-4">
              Thank you for booking with <strong>Jo Pacheco Wedding & Events</strong>!
              <br />
              <br />
              <strong>📧 Food Tasting Details:</strong>
              <br />
              We've scheduled your food tasting for{" "}
              {tastingDate && tastingTime && (
                <span className="font-semibold text-rose-700">
                  {new Date(tastingDate).toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}{" "}
                  at {tastingTime}
                </span>
              )}
              .
              <br />
              <br />
              <strong>Please check your email at:</strong>
              <br />
              <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded text-rose-700">
                {personalInfo.email}
              </span>
              <br />
              <br />
              Click <strong>"Confirm This Date"</strong> in the email to confirm your tasting appointment.
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-blue-800 text-sm leading-relaxed">
              <strong>📋 Next Steps:</strong>
              <br />
              1. Check your email for the food tasting confirmation
              <br />
              2. Click "Confirm This Date" to secure your tasting slot
              <br />
              3. You can view your appointment details in "My Appointments"
            </p>
          </div>

          <div className="bg-gray-100 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <div className="w-8 h-8 bg-rose-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                {countdown}
              </div>
              <span className="text-gray-600 text-sm">seconds until redirect</span>
            </div>
            <p className="text-xs text-gray-500">Automatically redirecting to homepage...</p>
          </div>

          <Button onClick={handleGoToHomepage} className="bg-rose-600 hover:bg-rose-700 text-white px-6 py-2">
            <Home className="mr-2 h-4 w-4" />
            Go to Homepage Now
          </Button>
        </div>
      </div>
    )
  }

  if (isLoadingMenu) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-rose-600 mx-auto" />
            <div className="space-y-2">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Loading Menu Items</h3>
              <p className="text-gray-600 dark:text-gray-400">Please wait while we prepare your menu options...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {!recommendations ? (
        <>
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">AI-Powered Event Planning</h3>
              <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Fill in your preferences below and our AI will recommend the perfect menu for your{" "}
                <span className="font-medium text-rose-600">{eventInfo.eventType}</span> event using our standard
                structure: <strong>exactly 3 main courses, 1 pasta, 1 dessert, 1 beverage</strong>.
              </p>
            </div>

            <Card className="p-6 bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-900/20 dark:to-pink-900/20 border-rose-200 dark:border-rose-800">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-3">
                  <label htmlFor="guestCount" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Number of Guests
                  </label>
                  <Select
                    name="guestCount"
                    disabled={isFormDisabled}
                    value={formData.guestCount}
                    onValueChange={(value) => handleSelectChange("guestCount", value)}
                  >
                    <SelectTrigger className="h-12 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600">
                      <SelectValue placeholder="Select guest count" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="50">50 guests</SelectItem>
                      {eventInfo.eventType !== "wedding" && <SelectItem value="80">80 guests</SelectItem>}
                      <SelectItem value="100">100 guests</SelectItem>
                      <SelectItem value="150">150 guests</SelectItem>
                      <SelectItem value="200">200 guests</SelectItem>
                      {eventInfo.eventType === "wedding" && <SelectItem value="300">300+ guests</SelectItem>}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3 md:col-span-2">
                  <label htmlFor="preferredMenus" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    AI Menu Preferences & Dietary Restrictions
                  </label>
                  <div className="relative">
                    <Textarea
                      id="preferredMenus"
                      name="preferredMenus"
                      disabled={isFormDisabled}
                      value={formData.preferredMenus}
                      onChange={handleInputChange}
                      placeholder="Tell our AI your specific menu preferences and dietary restrictions. Examples: 'No beef', 'Add more chicken', 'More seafood', 'No pork', 'Prefer vegetables', 'Only chicken dishes', 'Vegetarian only', 'Halal requirements', 'No shellfish allergy', 'Gluten-free options', 'Keto diet', 'Pescatarian', etc. Our AI will maintain exactly 3 main courses, 1 pasta, 1 dessert, and 1 beverage while respecting your preferences."
                      className="min-h-[120px] bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 resize-none pr-12"
                    />
                    <Send className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
                  </div>

                  {/* Dietary Restrictions Quick Buttons */}
                  <div className="space-y-3">
                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Quick Dietary Restrictions:</p>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { label: "Vegetarian", value: "vegetarian only, no meat" },
                        { label: "Pescatarian", value: "pescatarian, fish only, no meat" },
                        { label: "Halal", value: "halal requirements, no pork" },
                        { label: "No Shellfish", value: "no shellfish, shellfish allergy" },
                        { label: "Gluten-Free", value: "gluten free, no pasta" },
                        { label: "Keto/Low-Carb", value: "keto diet, low carb, no pasta" },
                        { label: "No Beef", value: "no beef, exclude beef" },
                        { label: "No Pork", value: "no pork, exclude pork" },
                        { label: "No Chicken", value: "no chicken, exclude chicken" },
                        { label: "More Seafood", value: "more seafood, extra seafood, prefer seafood" },
                        { label: "More Vegetables", value: "more vegetables, extra vegetables, prefer vegetables" },
                        { label: "Only Chicken", value: "only chicken, chicken only, chicken dishes only" },
                        { label: "Only Beef", value: "only beef, beef only, beef dishes only" },
                        { label: "Only Seafood", value: "only seafood, seafood only, seafood dishes only" },
                      ].map((restriction) => (
                        <Button
                          key={restriction.label}
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={isFormDisabled}
                          onClick={() => {
                            const currentValue = formData.preferredMenus
                            const newValue = currentValue ? `${currentValue}, ${restriction.value}` : restriction.value
                            setFormData((prev) => ({ ...prev, preferredMenus: newValue }))
                          }}
                          className="text-xs px-3 py-1 h-7 border-gray-300 text-gray-600 hover:bg-gray-50 hover:border-gray-400 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700"
                        >
                          + {restriction.label}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                    <p className="text-xs text-blue-700 dark:text-blue-300">
                      💡 <strong>Fixed Menu Structure:</strong> Our AI will always provide exactly 3 main courses, 1
                      pasta, 1 dessert, and 1 beverage. You can specify preferences for specific dishes or categories,
                      and our AI will respect your dietary restrictions while maintaining this structure.
                    </p>
                    <ul className="text-xs text-blue-600 dark:text-blue-400 mt-2 space-y-1 ml-4">
                      <li>
                        • <strong>Restrictions:</strong> "No beef", "Avoid pork", "Exclude chicken", "No shellfish
                        allergy"
                      </li>
                      <li>
                        • <strong>Preferences:</strong> "More seafood", "Extra vegetables", "Prefer chicken", "Specific
                        pasta dish"
                      </li>
                      <li>
                        • <strong>Only requests:</strong> "Only chicken", "Only seafood", "Only beef dishes"
                      </li>
                      <li>
                        • <strong>Dietary needs:</strong> "Vegetarian", "Halal", "Gluten-free", "Keto diet",
                        "Pescatarian"
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="space-y-3">
                  <label htmlFor="venue" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Venue (Optional)
                  </label>
                  <Input
                    id="venue"
                    name="venue"
                    disabled={isFormDisabled}
                    value={formData.venue}
                    onChange={handleInputChange}
                    placeholder="e.g., Garden venue, Hotel ballroom"
                    className="h-12 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                  />
                </div>

                <div className="space-y-3">
                  <label htmlFor="theme" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Theme (Optional)
                  </label>
                  <Input
                    id="theme"
                    name="theme"
                    disabled={isFormDisabled}
                    value={formData.theme}
                    onChange={handleInputChange}
                    placeholder="e.g., Rustic, Modern, Traditional"
                    className="h-12 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                  />
                </div>

                <div className="space-y-3 md:col-span-2">
                  <label htmlFor="colorMotif" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Color Motif (Optional)
                  </label>
                  <Input
                    id="colorMotif"
                    name="colorMotif"
                    disabled={isFormDisabled}
                    value={formData.colorMotif}
                    onChange={handleInputChange}
                    placeholder="e.g., Rose gold and blush, Navy and gold"
                    className="h-12 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                  />
                </div>
              </div>

              <div className="mt-8 flex justify-center">
                <Button
                  onClick={generateAIRecommendations}
                  disabled={isFormDisabled || !formData.guestCount || isGenerating}
                  className="px-8 py-3 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Generating AI Menu...
                    </>
                  ) : (
                    <>
                      <Shuffle className="mr-2 h-5 w-5" />
                      Generate AI Menu {generationCount > 0 && `(#${generationCount + 1})`}
                    </>
                  )}
                </Button>
              </div>
            </Card>
          </div>
        </>
      ) : (
        <>
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">AI-Generated Menu</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Based on your preferences, here's your personalized menu with our standard structure:
              </p>
              {recommendations && (
                <div className="space-y-6">
                  {/* Personal Information Summary */}
                  <Card className="border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-900/20">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
                        <User className="h-5 w-5" />
                        Personal Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-blue-600" />
                          <span className="text-gray-600 dark:text-gray-400">Name:</span>
                          <span className="font-medium text-gray-800 dark:text-gray-200">
                            {personalInfo.firstName} {personalInfo.lastName}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-blue-600" />
                          <span className="text-gray-600 dark:text-gray-400">Email:</span>
                          <span className="font-medium text-gray-800 dark:text-gray-200">{personalInfo.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-blue-600" />
                          <span className="text-gray-600 dark:text-gray-400">Phone:</span>
                          <span className="font-medium text-gray-800 dark:text-gray-200">{personalInfo.phone}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Event Details Summary */}
                  <Card className="border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-900/20">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-green-800 dark:text-green-200">
                        <Calendar className="h-5 w-5" />
                        Event Details
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-600 dark:text-gray-400">Event Type:</span>
                          <span className="font-medium capitalize text-gray-800 dark:text-gray-200">
                            {eventInfo.eventType}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-green-600" />
                          <span className="text-gray-600 dark:text-gray-400">Guests:</span>
                          <span className="font-medium text-gray-800 dark:text-gray-200">
                            {formData.guestCount} people
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-green-600" />
                          <span className="text-gray-600 dark:text-gray-400">Venue:</span>
                          <span className="font-medium text-gray-800 dark:text-gray-200">{formData.venue}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-600 dark:text-gray-400">Theme:</span>
                          <span className="font-medium text-gray-800 dark:text-gray-200">{formData.theme}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Palette className="h-4 w-4 text-green-600" />
                          <span className="text-gray-600 dark:text-gray-400">Color Motif:</span>
                          <span className="font-medium text-gray-800 dark:text-gray-200">{formData.colorMotif}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Scheduling Information Summary */}
                  <Card className="border-purple-200 bg-purple-50/50 dark:border-purple-800 dark:bg-purple-900/20">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-purple-800 dark:text-purple-200">
                        <Clock className="h-5 w-5" />
                        Scheduling Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-purple-600" />
                          <span className="text-gray-600 dark:text-gray-400">Event Date:</span>
                          <span className="font-medium text-gray-800 dark:text-gray-200">
                            {new Date(schedulingInfo.eventDate).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-purple-600" />
                          <span className="text-gray-600 dark:text-gray-400">Time Slot:</span>
                          <span className="font-medium capitalize text-gray-800 dark:text-gray-200">
                            {schedulingInfo.timeSlot}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>

            <div className="grid gap-6">
              {recommendations.packages.map((pkg: any, index: number) => (
                <Card
                  key={index}
                  className={cn(
                    "overflow-hidden transition-all duration-200 hover:shadow-lg border-2",
                    pkg.isRecommended
                      ? "border-rose-300 bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-900/20 dark:to-pink-900/20"
                      : "border-gray-200 dark:border-gray-700",
                  )}
                >
                  <CardHeader className="pb-6">
                    {pkg.isRecommended && (
                      <div className="flex justify-end mb-2">
                        <div className="bg-gradient-to-r from-rose-600 to-pink-600 text-white px-3 py-1 text-sm font-semibold rounded-full">
                          AI Recommended - Fixed Structure
                        </div>
                      </div>
                    )}
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                          {pkg.name}
                        </CardTitle>
                        <CardDescription className="text-gray-600 dark:text-gray-400 text-base">
                          {pkg.description}
                        </CardDescription>
                      </div>
                      <div className="flex justify-end">
                        <div className="text-right">
                          <div className="text-3xl font-bold text-rose-600">{pkg.price}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Down Payment: ₱{pkg.downPayment.toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-6">
                    {/* User Preferences Acknowledgment */}
                    {pkg.userPreferences &&
                      (pkg.userPreferences.restrictions.length > 0 ||
                        pkg.userPreferences.emphasis.length > 0 ||
                        pkg.userPreferences.onlyRequests.length > 0) && (
                        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                          <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">
                            ✓ Your Preferences Applied
                          </h4>
                          <div className="space-y-1 text-sm text-green-700 dark:text-green-300">
                            {pkg.userPreferences.restrictions.length > 0 && (
                              <p>
                                <strong>Excluded:</strong> {pkg.userPreferences.restrictions.join(", ")}
                              </p>
                            )}
                            {pkg.userPreferences.emphasis.length > 0 && (
                              <p>
                                <strong>Emphasized:</strong> {pkg.userPreferences.emphasis.join(", ")}
                              </p>
                            )}
                            {pkg.userPreferences.onlyRequests.length > 0 && (
                              <p>
                                <strong>Only includes:</strong> {pkg.userPreferences.onlyRequests.join(", ")}
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                    {/* Package Includes */}
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Package Includes:</h4>
                      <div className="space-y-3">
                        {/* Main Courses */}
                        {pkg.menuSelections && (
                          <>
                            {(pkg.menuSelections.menu1?.length > 0 ||
                              pkg.menuSelections.menu2?.length > 0 ||
                              pkg.menuSelections.menu3?.length > 0) && (
                              <div className="flex items-start space-x-3">
                                <div className="w-2 h-2 bg-rose-500 rounded-full mt-2 flex-shrink-0" />
                                <div>
                                  <span className="font-medium text-gray-900 dark:text-gray-100">
                                    Main Courses (
                                    {(pkg.menuSelections.menu1?.length || 0) +
                                      (pkg.menuSelections.menu2?.length || 0) +
                                      (pkg.menuSelections.menu3?.length || 0)}
                                    ):
                                  </span>
                                  <span className="text-gray-700 dark:text-gray-300 ml-1">
                                    {[
                                      ...(pkg.menuSelections.menu1 || []).map((item: string) => `${item} (Menu 1)`),
                                      ...(pkg.menuSelections.menu2 || []).map((item: string) => `${item} (Menu 2)`),
                                      ...(pkg.menuSelections.menu3 || []).map((item: string) => `${item} (Menu 3)`),
                                    ].join(", ")}
                                  </span>
                                </div>
                              </div>
                            )}

                            {/* Pasta */}
                            {pkg.menuSelections.pasta?.length > 0 && (
                              <div className="flex items-start space-x-3">
                                <div className="w-2 h-2 bg-rose-500 rounded-full mt-2 flex-shrink-0" />
                                <div>
                                  <span className="font-medium text-gray-900 dark:text-gray-100">
                                    Pasta ({pkg.menuSelections.pasta.length}):
                                  </span>
                                  <span className="text-gray-700 dark:text-gray-300 ml-1">
                                    {pkg.menuSelections.pasta.join(", ")}
                                  </span>
                                </div>
                              </div>
                            )}

                            {/* Desserts */}
                            {pkg.menuSelections.dessert?.length > 0 && (
                              <div className="flex items-start space-x-3">
                                <div className="w-2 h-2 bg-rose-500 rounded-full mt-2 flex-shrink-0" />
                                <div>
                                  <span className="font-medium text-gray-900 dark:text-gray-100">
                                    Desserts ({pkg.menuSelections.dessert.length}):
                                  </span>
                                  <span className="text-gray-700 dark:text-gray-300 ml-1">
                                    {pkg.menuSelections.dessert.join(", ")}
                                  </span>
                                </div>
                              </div>
                            )}

                            {/* Beverages */}
                            {pkg.menuSelections.beverage?.length > 0 && (
                              <div className="flex items-start space-x-3">
                                <div className="w-2 h-2 bg-rose-500 rounded-full mt-2 flex-shrink-0" />
                                <div>
                                  <span className="font-medium text-gray-900 dark:text-gray-100">
                                    Beverages ({pkg.menuSelections.beverage.length}):
                                  </span>
                                  <span className="text-gray-700 dark:text-gray-300 ml-1">
                                    {pkg.menuSelections.beverage.join(", ")}
                                  </span>
                                </div>
                              </div>
                            )}
                          </>
                        )}

                        {/* Additional Features */}
                        <div className="flex items-start space-x-3">
                          <div className="w-2 h-2 bg-rose-500 rounded-full mt-2 flex-shrink-0" />
                          <span className="text-gray-700 dark:text-gray-300">{formData.guestCount} guests</span>
                        </div>
                        <div className="flex items-start space-x-3">
                          <div className="w-2 h-2 bg-rose-500 rounded-full mt-2 flex-shrink-0" />
                          <span className="text-gray-700 dark:text-gray-300">
                            Fixed structure: exactly 3 main courses, 1 pasta, 1 dessert, 1 beverage
                          </span>
                        </div>
                        {pkg.userPreferences &&
                          (pkg.userPreferences.restrictions.length > 0 ||
                            pkg.userPreferences.emphasis.length > 0 ||
                            pkg.userPreferences.onlyRequests.length > 0) && (
                            <div className="flex items-start space-x-3">
                              <div className="w-2 h-2 bg-rose-500 rounded-full mt-2 flex-shrink-0" />
                              <span className="text-gray-700 dark:text-gray-300">
                                AI-personalized based on your preferences
                              </span>
                            </div>
                          )}
                        {pkg.generationCount && (
                          <div className="flex items-start space-x-3">
                            <div className="w-2 h-2 bg-rose-500 rounded-full mt-2 flex-shrink-0" />
                            <span className="text-gray-700 dark:text-gray-300">
                              Generation #{pkg.generationCount} - Fresh variety
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Service Fee Inclusions for non-wedding/debut */}
                    {!pkg.isWeddingOrDebut && pkg.serviceFeeInclusions && pkg.serviceFeeInclusions.length > 0 && (
                      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                        <h4 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3">
                          Service Fee Includes:
                        </h4>
                        <div className="grid gap-2">
                          {pkg.serviceFeeInclusions.map((inclusion: string, inclusionIndex: number) => (
                            <div key={inclusionIndex} className="flex items-start space-x-3">
                              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                              <span className="text-blue-800 dark:text-blue-200">{inclusion}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Pricing Breakdown */}
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                        Pricing Breakdown:
                      </h4>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center py-2">
                          <span className="text-gray-600 dark:text-gray-400">Menu Total:</span>
                          <span className="font-semibold text-gray-900 dark:text-gray-100">
                            ₱{pkg.menuTotal.toLocaleString()}
                          </span>
                        </div>
                        {!pkg.isWeddingOrDebut && (
                          <div className="flex justify-between items-center py-2">
                            <span className="text-gray-600 dark:text-gray-400">Service Fee:</span>
                            <span className="font-semibold text-gray-900 dark:text-gray-100">
                              ₱{pkg.serviceFee.toLocaleString()}
                            </span>
                          </div>
                        )}
                        <div className="border-t border-gray-200 dark:border-gray-600 pt-3 flex justify-between items-center">
                          <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">Total Amount:</span>
                          <span className="text-xl font-bold text-rose-600">{pkg.price}</span>
                        </div>
                        <div className="flex justify-between items-center py-2">
                          <span className="text-gray-600 dark:text-gray-400">Down Payment (50%):</span>
                          <span className="font-semibold text-gray-900 dark:text-gray-100">
                            ₱{pkg.downPayment.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* AI Reasoning */}
                    <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                      <h4 className="text-lg font-semibold text-purple-900 dark:text-purple-100 mb-3">AI Reasoning:</h4>
                      <p className="text-purple-800 dark:text-purple-200 leading-relaxed">{pkg.reasoning}</p>
                    </div>
                  </CardContent>

                  <CardFooter className="pt-6">
                    <div className="flex gap-3 w-full">
                      <Button
                        onClick={() => handleBookPackage(pkg)}
                        disabled={isBooking}
                        className="flex-1 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white font-semibold py-4 text-lg rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
                      >
                        {isBooking ? (
                          <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Booking...
                          </>
                        ) : (
                          <>
                            Book This Package
                            <ChevronRight className="ml-2 h-5 w-5" />
                          </>
                        )}
                      </Button>
                      <Button
                        onClick={() => {
                          setRecommendations(null)
                          generateAIRecommendations()
                        }}
                        variant="outline"
                        className="px-6 py-4 border-rose-300 text-rose-600 hover:bg-rose-50 hover:border-rose-400 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
                      >
                        <Shuffle className="mr-2 h-5 w-5" />
                        Generate New Menu
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>

            <div className="flex justify-center">
              <Button
                onClick={() => {
                  setRecommendations(null)
                  setSelectedMenuItems({
                    menu1: [],
                    menu2: [],
                    menu3: [],
                    pasta: [],
                    dessert: [],
                    beverage: [],
                  })
                }}
                variant="outline"
                className="px-6 py-2 border-rose-300 text-rose-600 hover:bg-rose-50 hover:border-rose-400"
              >
                <Shuffle className="mr-2 h-4 w-4" />
                Generate New Menu
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
