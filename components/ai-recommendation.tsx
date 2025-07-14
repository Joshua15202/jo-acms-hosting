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
  Plus,
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
  AlertTriangle,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Slider } from "@/components/ui/slider"
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
  budget: "25000", // General initial default
  preferredMenus: "",
  venue: "",
  theme: "",
  colorMotif: "",
  additionalEventInfo: "",
}

const budgetRules = {
  wedding: {
    "50": { min: 70000, max: 89000, displayMaxText: "₱89,000" },
    "100": { min: 90000, max: 114000, displayMaxText: "₱114,000" },
    "150": { min: 115000, max: 139000, displayMaxText: "₱139,000" },
    "200": { min: 140000, max: 189000, displayMaxText: "₱189,000" },
    "300": { min: 190000, max: 300000, displayMaxText: "₱300,000+" },
  },
  debut: {
    "50": { min: 35000, max: 47000, displayMaxText: "₱47,000" },
    "80": { min: 48000, max: 54000, displayMaxText: "₱54,000" },
    "100": { min: 55000, max: 76000, displayMaxText: "₱76,000" },
    "150": { min: 77000, max: 89000, displayMaxText: "₱89,000" },
    "200": { min: 90000, max: 300000, displayMaxText: "₱300,000+" },
  },
  birthday: {
    "50": { min: 30000, max: 36000, displayMaxText: "₱36,000" },
    "80": { min: 37000, max: 42000, displayMaxText: "₱42,000" },
    "100": { min: 43000, max: 61000, displayMaxText: "₱61,000" },
    "150": { min: 62000, max: 85000, displayMaxText: "₱85,000" },
    "200": { min: 86000, max: 300000, displayMaxText: "₱300,000+" },
  },
  corporate: {
    "50": { min: 25000, max: 31000, displayMaxText: "₱31,000" },
    "80": { min: 32000, max: 37000, displayMaxText: "₱37,000" },
    "100": { min: 38000, max: 56000, displayMaxText: "₱56,000" },
    "150": { min: 57000, max: 75000, displayMaxText: "₱75,000" },
    "200": { min: 76000, max: 300000, displayMaxText: "₱300,000+" },
  },
  other: {
    "50": { min: 25000, max: 31000, displayMaxText: "₱31,000" },
    "80": { min: 32000, max: 37000, displayMaxText: "₱37,000" },
    "100": { min: 38000, max: 56000, displayMaxText: "₱56,000" },
    "150": { min: 57000, max: 75000, displayMaxText: "₱75,000" },
    "200": { min: 76000, max: 300000, displayMaxText: "₱300,000+" },
  },
}

const generalDefaultSliderConfig = {
  min: 25000,
  max: 300000, // Absolute max for the slider component
  displayMinText: "₱25,000",
  displayMaxText: "₱300,000+",
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
  const [budgetValue, setBudgetValue] = useState<number[]>([
    initialFormDataState.budget ? Number.parseInt(initialFormDataState.budget) : generalDefaultSliderConfig.min,
  ])
  const [currentSliderConfig, setCurrentSliderConfig] = useState(generalDefaultSliderConfig)
  const [menuItems, setMenuItems] = useState<MenuItems | null>(null)
  const [isLoadingMenu, setIsLoadingMenu] = useState(true)
  const [generationCount, setGenerationCount] = useState(0) // Track number of generations for variety

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
    const specialDiets = []
    const cookingStyles = []
    const quantities = []

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
      ],
    }

    // Check for restrictions
    Object.keys(restrictionPatterns).forEach((category) => {
      const patterns = restrictionPatterns[category as keyof typeof restrictionPatterns]
      if (patterns.some((pattern) => lowerPrefs.includes(pattern))) {
        restrictions.push(category)
      }
    })

    // Check for emphasis
    Object.keys(emphasisPatterns).forEach((category) => {
      const patterns = emphasisPatterns[category as keyof typeof emphasisPatterns]
      if (patterns.some((pattern) => lowerPrefs.includes(pattern))) {
        emphasis.push(category)
      }
    })

    // Special dietary requirements
    if (lowerPrefs.includes("vegetarian") || lowerPrefs.includes("veggie only") || lowerPrefs.includes("no meat")) {
      specialDiets.push("vegetarian")
      restrictions.push("beef", "pork", "chicken")
      emphasis.push("vegetables")
    }

    if (lowerPrefs.includes("pescatarian") || lowerPrefs.includes("fish only")) {
      specialDiets.push("pescatarian")
      restrictions.push("beef", "pork", "chicken")
      emphasis.push("seafood", "vegetables")
    }

    if (lowerPrefs.includes("keto") || lowerPrefs.includes("low carb") || lowerPrefs.includes("no carbs")) {
      specialDiets.push("keto")
      restrictions.push("pasta")
      emphasis.push("beef", "pork", "chicken", "seafood")
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
    const updatedFormData = { ...formData, [name]: value }

    if (name === "guestCount") {
      // Guest count changed, event type is already set from props
      const eventType = eventInfo.eventType
      const guestCount = value
      if (eventType && guestCount) {
        const rule = budgetRules[eventType as keyof typeof budgetRules]?.[guestCount]
        if (rule) {
          setBudgetValue([rule.min])
          updatedFormData.budget = rule.min.toString()
          setCurrentSliderConfig({
            min: rule.min,
            max: rule.max,
            displayMinText: `₱${rule.min.toLocaleString()}`,
            displayMaxText: rule.displayMaxText,
          })
        } else {
          // Fallback if guest count value is unexpected (e.g. cleared)
          setBudgetValue([generalDefaultSliderConfig.min])
          updatedFormData.budget = generalDefaultSliderConfig.min.toString()
          setCurrentSliderConfig(generalDefaultSliderConfig)
        }
      } else if (eventType && !guestCount) {
        // Guest count cleared
        // Revert to the event type's default budget (e.g., 50pax or general)
        const defaultMinForEventType =
          budgetRules[eventType as keyof typeof budgetRules]?.["50"]?.min || generalDefaultSliderConfig.min
        const defaultMaxForEventType =
          budgetRules[eventType as keyof typeof budgetRules]?.["50"]?.max || generalDefaultSliderConfig.max
        const defaultDisplayMaxText =
          budgetRules[eventType as keyof typeof budgetRules]?.["50"]?.displayMaxText ||
          generalDefaultSliderConfig.displayMaxText
        setBudgetValue([defaultMinForEventType])
        updatedFormData.budget = defaultMinForEventType.toString()
        setCurrentSliderConfig({
          min: defaultMinForEventType,
          max: defaultMaxForEventType,
          displayMinText: `₱${defaultMinForEventType.toLocaleString()}`,
          displayMaxText: defaultDisplayMaxText,
        })
      }
    }
    setFormData(updatedFormData)
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
        setCountdown(20) // Start 10-second countdown
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
        budget: budgetValue[0],
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

      // Handle budget exceeded response FIRST - this is the key fix
      if (!result.success && result.budgetExceeded) {
        console.log("Budget exceeded detected, showing warnings")

        // Show budget warnings to user via toast
        toast({
          title: "Budget Adjustment Needed",
          description: result.message,
          variant: "destructive",
        })

        // Create a special recommendations object to show budget warnings
        const budgetWarningRecommendations = {
          packages: [],
          budgetExceeded: true,
          budgetWarnings: result.budgetWarnings,
          suggestions: result.suggestions,
          message: result.message,
        }

        setRecommendations(budgetWarningRecommendations)
        return // Exit early, don't proceed to fallback
      }

      // Handle successful AI response
      if (result.success && result.recommendations) {
        console.log("AI recommendations received successfully")

        // Parse user preferences for client-side validation
        const userPrefs = parseUserPreferences(formData.preferredMenus || "")

        // Budget-conscious optimization function
        const optimizeMenuForBudget = (
          selections: any,
          allMenuItems: MenuItems,
          budget: number,
          numGuests: number,
          userPreferences: any,
        ) => {
          const costs = {
            menu1: 70,
            menu2: 60,
            menu3: 50,
            pasta: 40,
            dessert: 25,
            beverage: 25,
          }

          // Service fee calculation
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

          const availableMenuBudget = budget - serviceFee

          // Determine budget tier and target quantities
          let budgetTier = "low"
          let targetMainCourses = 3
          let targetPasta = 1
          let targetDessert = 1
          let targetBeverage = 1

          if (budget >= 150000) {
            budgetTier = "premium"
            targetMainCourses = 8
            targetPasta = 3
            targetDessert = 3
            targetBeverage = 3
          } else if (budget >= 81000) {
            budgetTier = "high"
            targetMainCourses = 6
            targetPasta = 2
            targetDessert = 2
            targetBeverage = 2
          } else if (budget >= 41000) {
            budgetTier = "medium"
            targetMainCourses = 4
            targetPasta = 1
            targetDessert = 1
            targetBeverage = 1
          } else {
            budgetTier = "low"
            targetMainCourses = 3
            targetPasta = 1
            targetDessert = 1
            targetBeverage = 1
          }

          console.log("Budget tier analysis:", {
            budget: budget,
            budgetTier: budgetTier,
            availableMenuBudget: availableMenuBudget,
            targets: { targetMainCourses, targetPasta, targetDessert, targetBeverage },
          })

          // Apply user restrictions to available items with randomization
          const applyUserRestrictions = (items: MenuItem[], category: string) => {
            if (userPreferences.restrictions.includes(category.toLowerCase())) {
              return [] // Completely exclude this category
            }
            // Double shuffle for maximum randomization
            return shuffleArray([...shuffleArray(items)]).map((item) => item.name)
          }

          // Filter available items based on user restrictions with enhanced randomization
          const filteredMenuItems = {
            beef: applyUserRestrictions(allMenuItems.beef, "beef"),
            pork: applyUserRestrictions(allMenuItems.pork, "pork"),
            chicken: applyUserRestrictions(allMenuItems.chicken, "chicken"),
            seafood: applyUserRestrictions(allMenuItems.seafood, "seafood"),
            vegetables: applyUserRestrictions(allMenuItems.vegetables, "vegetables"),
            pasta: applyUserRestrictions(allMenuItems.pasta, "pasta"),
            dessert: shuffleArray([...shuffleArray(allMenuItems.dessert)]).map((item) => item.name),
            beverage: shuffleArray([...shuffleArray(allMenuItems.beverage)]).map((item) => item.name),
          }

          // Start with AI selections but validate against budget
          const finalSelections = {
            menu1: [] as string[],
            menu2: [] as string[],
            menu3: [] as string[],
            pasta: [] as string[],
            dessert: [] as string[],
            beverage: [] as string[],
            reasoning: selections.reasoning,
            explanation: selections.explanation,
          }

          // Helper function to calculate cost for current selections
          const calculateCurrentCost = () => {
            return (
              (finalSelections.menu1.length * costs.menu1 +
                finalSelections.menu2.length * costs.menu2 +
                finalSelections.menu3.length * costs.menu3 +
                finalSelections.pasta.length * costs.pasta +
                finalSelections.dessert.length * costs.dessert +
                finalSelections.beverage.length * costs.beverage) *
              numGuests
            )
          }

          // Helper function to get items within budget constraints
          const getItemsWithinBudget = (
            aiItems: string[],
            availableItems: string[],
            category: string,
            targetCount: number,
          ) => {
            const result: string[] = []
            const used = new Set<string>()
            const categoryCost = costs[category as keyof typeof costs]

            // Try AI suggestions first
            for (const item of aiItems || []) {
              if (result.length >= targetCount) break
              if (item && availableItems.includes(item) && !used.has(item)) {
                const testCost = calculateCurrentCost() + categoryCost * numGuests
                if (testCost <= availableMenuBudget) {
                  result.push(item)
                  used.add(item)
                }
              }
            }

            // Fill remaining slots if budget allows and we haven't reached target
            for (const item of availableItems) {
              if (result.length >= targetCount) break
              if (item && !used.has(item)) {
                const testCost = calculateCurrentCost() + categoryCost * numGuests
                if (testCost <= availableMenuBudget) {
                  result.push(item)
                  used.add(item)
                } else {
                  break // Stop if we can't afford more
                }
              }
            }

            return result
          }

          // Handle non-main course items first (pasta, dessert, beverage)
          // Adjust targets based on user restrictions
          const adjustedTargetPasta = userPreferences.restrictions.includes("pasta")
            ? 0
            : userPreferences.emphasis.includes("pasta")
              ? Math.min(targetPasta + 1, filteredMenuItems.pasta.length)
              : targetPasta

          const adjustedTargetDessert = userPreferences.emphasis.includes("dessert")
            ? Math.min(targetDessert + 1, filteredMenuItems.dessert.length)
            : targetDessert

          const adjustedTargetBeverage = userPreferences.emphasis.includes("beverage")
            ? Math.min(targetBeverage + 1, filteredMenuItems.beverage.length)
            : targetBeverage

          finalSelections.pasta = getItemsWithinBudget(
            selections.pasta || [],
            filteredMenuItems.pasta,
            "pasta",
            adjustedTargetPasta,
          )
          finalSelections.dessert = getItemsWithinBudget(
            selections.dessert || [],
            filteredMenuItems.dessert,
            "dessert",
            adjustedTargetDessert,
          )
          finalSelections.beverage = getItemsWithinBudget(
            selections.beverage || [],
            filteredMenuItems.beverage,
            "beverage",
            adjustedTargetBeverage,
          )

          // Handle main courses with budget-conscious compensation
          const availableMainCategories = [
            { name: "menu1", items: [...filteredMenuItems.beef, ...filteredMenuItems.pork], cost: costs.menu1 },
            { name: "menu2", items: filteredMenuItems.chicken, cost: costs.menu2 },
            {
              name: "menu3",
              items: [...filteredMenuItems.seafood, ...filteredMenuItems.vegetables],
              cost: costs.menu3,
            },
          ].filter((cat) => cat.items.length > 0)

          // Calculate excluded main course categories for compensation
          const excludedMainCategories = [
            userPreferences.restrictions.includes("beef") || userPreferences.restrictions.includes("pork")
              ? "menu1"
              : null,
            userPreferences.restrictions.includes("chicken") ? "menu2" : null,
            userPreferences.restrictions.includes("seafood") || userPreferences.restrictions.includes("vegetables")
              ? "menu3"
              : null,
          ].filter(Boolean)

          // Adjust target main courses based on exclusions and budget tier
          let adjustedTargetMainCourses = targetMainCourses
          if (excludedMainCategories.length > 0) {
            // Compensate for excluded categories by adding more to remaining categories
            const compensationFactor = budgetTier === "premium" ? 2 : budgetTier === "high" ? 1.5 : 1
            adjustedTargetMainCourses = Math.min(
              targetMainCourses + Math.floor(excludedMainCategories.length * compensationFactor),
              availableMainCategories.reduce((sum, cat) => sum + cat.items.length, 0),
            )
          }

          // Sort categories by preference and cost efficiency
          const sortedCategories = [...availableMainCategories].sort((a, b) => {
            // Prioritize emphasized categories
            const aEmphasized =
              (a.name === "menu1" &&
                (userPreferences.emphasis.includes("beef") || userPreferences.emphasis.includes("pork"))) ||
              (a.name === "menu2" && userPreferences.emphasis.includes("chicken")) ||
              (a.name === "menu3" &&
                (userPreferences.emphasis.includes("seafood") || userPreferences.emphasis.includes("vegetables")))

            const bEmphasized =
              (b.name === "menu1" &&
                (userPreferences.emphasis.includes("beef") || userPreferences.emphasis.includes("pork"))) ||
              (b.name === "menu2" && userPreferences.emphasis.includes("chicken")) ||
              (b.name === "menu3" &&
                (userPreferences.emphasis.includes("seafood") || userPreferences.emphasis.includes("vegetables")))

            if (aEmphasized && !bEmphasized) return -1
            if (!aEmphasized && bEmphasized) return 1

            // For low budgets, prefer cheaper options
            if (budgetTier === "low") return a.cost - b.cost

            return 0
          })

          // Distribute main courses across available categories
          let remainingBudget = availableMenuBudget - calculateCurrentCost()
          let addedMainCourses = 0

          // Calculate items per category
          const itemsPerCategory = Math.floor(adjustedTargetMainCourses / sortedCategories.length)
          const extraItems = adjustedTargetMainCourses % sortedCategories.length

          for (let i = 0; i < sortedCategories.length; i++) {
            const category = sortedCategories[i]
            if (addedMainCourses >= adjustedTargetMainCourses) break

            let targetForThisCategory = itemsPerCategory
            if (i < extraItems) targetForThisCategory += 1 // Distribute extra items

            // For emphasized categories, add bonus items if budget allows
            const isEmphasized =
              (category.name === "menu1" &&
                (userPreferences.emphasis.includes("beef") || userPreferences.emphasis.includes("pork"))) ||
              (category.name === "menu2" && userPreferences.emphasis.includes("chicken")) ||
              (category.name === "menu3" &&
                (userPreferences.emphasis.includes("seafood") || userPreferences.emphasis.includes("vegetables")))

            if (isEmphasized && budgetTier !== "low") {
              targetForThisCategory = Math.min(targetForThisCategory + 1, category.items.length)
            }

            const maxAffordable = Math.floor(remainingBudget / (category.cost * numGuests))
            const actualTarget = Math.min(targetForThisCategory, maxAffordable, category.items.length)

            if (actualTarget > 0) {
              const categoryKey = category.name as keyof typeof finalSelections
              const aiCategoryItems =
                category.name === "menu1"
                  ? selections.menu1 || []
                  : category.name === "menu2"
                    ? selections.menu2 || []
                    : selections.menu3 || []

              const selectedItems = getItemsWithinBudget(aiCategoryItems, category.items, category.name, actualTarget)
              finalSelections[categoryKey] = selectedItems as any
              addedMainCourses += selectedItems.length
              remainingBudget -= selectedItems.length * category.cost * numGuests
            }
          }

          // If we still have budget and haven't reached minimum main courses, add more
          if (addedMainCourses < 3 && remainingBudget > 0) {
            for (const category of sortedCategories) {
              if (addedMainCourses >= 3) break

              const categoryKey = category.name as keyof typeof finalSelections
              const currentItems = finalSelections[categoryKey] as string[]
              const maxAffordable = Math.floor(remainingBudget / (category.cost * numGuests))

              if (maxAffordable > 0 && currentItems.length < category.items.length) {
                const additionalItems = category.items
                  .filter((item) => !currentItems.includes(item))
                  .slice(0, Math.min(maxAffordable, 3 - addedMainCourses))
                finalSelections[categoryKey] = [...currentItems, ...additionalItems] as any
                addedMainCourses += additionalItems.length
                remainingBudget -= additionalItems.length * category.cost * numGuests
              }
            }
          }

          // If we have significant remaining budget (>20% of available), try to add more items
          const budgetUtilization = (availableMenuBudget - remainingBudget) / availableMenuBudget
          if (budgetUtilization < 0.8 && remainingBudget > availableMenuBudget * 0.2) {
            // Try to add more items to utilize budget better
            const allCategories = [
              { name: "pasta", items: filteredMenuItems.pasta, cost: costs.pasta },
              { name: "dessert", items: filteredMenuItems.dessert, cost: costs.dessert },
              { name: "beverage", items: filteredMenuItems.beverage, cost: costs.beverage },
              ...sortedCategories,
            ]

            for (const category of allCategories) {
              if (remainingBudget < category.cost * numGuests) continue

              const categoryKey = category.name as keyof typeof finalSelections
              const currentItems = finalSelections[categoryKey] as string[]
              const maxAffordable = Math.floor(remainingBudget / (category.cost * numGuests))

              if (maxAffordable > 0 && currentItems.length < category.items.length) {
                const additionalItems = category.items
                  .filter((item) => !currentItems.includes(item))
                  .slice(0, Math.min(maxAffordable, 2)) // Add up to 2 more items

                if (additionalItems.length > 0) {
                  finalSelections[categoryKey] = [...currentItems, ...additionalItems] as any
                  remainingBudget -= additionalItems.length * category.cost * numGuests
                }
              }
            }
          }

          console.log("Enhanced budget optimization result:", {
            budgetTier: budgetTier,
            targetMainCourses: adjustedTargetMainCourses,
            actualMainCourses: addedMainCourses,
            remainingBudget: remainingBudget,
            budgetUtilization: (((availableMenuBudget - remainingBudget) / availableMenuBudget) * 100).toFixed(1) + "%",
            finalStructure: {
              menu1: finalSelections.menu1.length,
              menu2: finalSelections.menu2.length,
              menu3: finalSelections.menu3.length,
              pasta: finalSelections.pasta.length,
              dessert: finalSelections.dessert.length,
              beverage: finalSelections.beverage.length,
            },
          })

          return finalSelections
        }

        // Create package recommendations based on AI suggestions
        const numGuests = Number.parseInt(formData.guestCount) || 50
        const userBudget = budgetValue[0]

        // Optimize menu based on budget while respecting user preferences strictly
        const adjustedMenuSelections = optimizeMenuForBudget(
          result.recommendations,
          menuItems,
          userBudget,
          numGuests,
          userPrefs,
        )

        // Update the state with the final, preference-respecting menu
        setSelectedMenuItems({
          menu1: adjustedMenuSelections.menu1 || [],
          menu2: adjustedMenuSelections.menu2 || [],
          menu3: adjustedMenuSelections.menu3 || [],
          pasta: adjustedMenuSelections.pasta || [],
          dessert: adjustedMenuSelections.dessert || [],
          beverage: adjustedMenuSelections.beverage || [],
        })

        // Calculate pricing based on final selections
        const calculateMenuPricing = (selections: any) => {
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

        // Calculate pricing based on the FINAL menu structure
        const menuPricing = calculateMenuPricing(adjustedMenuSelections)

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

        // Determine if the final price is over budget to display a message
        let budgetExceededMessage = ""
        if (finalTotalAmount > userBudget) {
          budgetExceededMessage = `The package price of ₱${finalTotalAmount.toLocaleString()} is above your budget of ₱${userBudget.toLocaleString()}. This reflects your specific menu preferences and restrictions.`
        }

        // Determine budget tier based on budget and guest count
        let budgetTierKey = "economy"
        if (userBudget >= (budgetRules.wedding["200"]?.min || 140000) && numGuests >= 200) budgetTierKey = "luxury"
        else if (userBudget >= (budgetRules.wedding["150"]?.min || 115000) && numGuests >= 150)
          budgetTierKey = "premium"
        else if (userBudget >= (budgetRules.wedding["100"]?.min || 90000) && numGuests >= 100)
          budgetTierKey = "standard"

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

          // Add other standard features
          features.push(`${numGuests} guests`)
          features.push(`AI-personalized based on your preferences`)
          features.push(`${budgetTierKey.charAt(0).toUpperCase() + budgetTierKey.slice(1)} tier quality`)
          features.push(`Generation #${generationCount} - Fresh variety`)

          // Show budget context
          if (finalTotalAmount <= userBudget) {
            features.push(`✓ Within your ₱${userBudget.toLocaleString()} budget`)
          } else {
            features.push(`Customized for your specific preferences`)
          }

          return features
        }

        const mockRecommendations = {
          packages: [
            {
              name: `AI-Curated ${budgetTierKey.charAt(0).toUpperCase() + budgetTierKey.slice(1)} Package`,
              description: `A personalized ${budgetTierKey} package for your ${eventInfo.eventType} featuring AI-selected menu items that strictly follow your dietary preferences and budget constraints.`,
              price: `₱${finalTotalAmount.toLocaleString()}`,
              budgetTier: budgetTierKey,
              features: createPackageFeatures(adjustedMenuSelections),
              isRecommended: true,
              reasoning:
                adjustedMenuSelections.reasoning ||
                `This AI-curated package strictly follows your menu preferences: "${formData.preferredMenus}". Your dietary restrictions and budget constraints have been carefully respected.`,
              menuTotal: menuPricing.total,
              serviceFee: serviceFee,
              serviceFeeInclusions: serviceFeeInclusions,
              downPayment: finalDownPayment,
              isWeddingOrDebut: isWeddingOrDebut,
              budgetExceededMessage: budgetExceededMessage,
              userPreferences: userPrefs,
              menuSelections: adjustedMenuSelections,
              generationCount: generationCount,
            },
          ],
          menu: adjustedMenuSelections,
          menuPricing: menuPricing,
          budgetTier: budgetTierKey,
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
    const currentBudget = budgetValue[0]
    const userPrefs = parseUserPreferences(formData.preferredMenus || "")

    // If no preferences provided, ensure maximum randomization
    const hasNoPreferences = !formData.preferredMenus || formData.preferredMenus.trim() === ""
    if (hasNoPreferences) {
      console.log("No user preferences detected - applying maximum randomization")
    }

    // Determine budget tier and target quantities
    let budgetTier = "economy"
    let targetMainCourses = 3
    let targetPasta = 1
    let targetDessert = 1
    let targetBeverage = 1

    if (currentBudget >= 150000) {
      budgetTier = "luxury"
      targetMainCourses = 8
      targetPasta = 3
      targetDessert = 3
      targetBeverage = 3
    } else if (currentBudget >= 81000) {
      budgetTier = "premium"
      targetMainCourses = 6
      targetPasta = 2
      targetDessert = 2
      targetBeverage = 2
    } else if (currentBudget >= 41000) {
      budgetTier = "standard"
      targetMainCourses = 4
      targetPasta = 1
      targetDessert = 1
      targetBeverage = 1
    }

    // Calculate service fee
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

    const availableMenuBudget = currentBudget - serviceFee

    const applyUserRestrictions = (items: MenuItem[], category: string) => {
      if (userPrefs.restrictions.includes(category.toLowerCase())) {
        return [] // Completely exclude this category
      }
      // Apply extra randomization when no preferences are specified
      if (hasNoPreferences) {
        return shuffleArray([...shuffleArray(items)]) // Double shuffle for no preferences
      }
      return shuffleArray(items) // Single shuffle for normal cases
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

    // Define costs per guest for each category
    const costs = {
      menu1: 70,
      menu2: 60,
      menu3: 50,
      pasta: 40,
      dessert: 25,
      beverage: 25,
    }

    // Adjust targets based on user preferences
    const adjustedTargetPasta = userPrefs.restrictions.includes("pasta")
      ? 0
      : userPrefs.emphasis.includes("pasta")
        ? Math.min(targetPasta + 1, filteredMenuItems.pasta.length)
        : targetPasta

    const adjustedTargetDessert = userPrefs.emphasis.includes("dessert")
      ? Math.min(targetDessert + 1, filteredMenuItems.dessert.length)
      : targetDessert

    const adjustedTargetBeverage = userPrefs.emphasis.includes("beverage")
      ? Math.min(targetBeverage + 1, filteredMenuItems.beverage.length)
      : targetBeverage

    // Reserve budget for essentials first
    const essentialCost =
      (adjustedTargetPasta * costs.pasta +
        adjustedTargetDessert * costs.dessert +
        adjustedTargetBeverage * costs.beverage) *
      numGuests
    let remainingBudget = availableMenuBudget - essentialCost

    // Available main course categories with budget priority
    const availableMainCategories = [
      { name: "menu3", items: [...filteredMenuItems.seafood, ...filteredMenuItems.vegetables], cost: costs.menu3 },
      { name: "menu2", items: filteredMenuItems.chicken, cost: costs.menu2 },
      { name: "menu1", items: [...filteredMenuItems.beef, ...filteredMenuItems.pork], cost: costs.menu1 },
    ].filter((cat) => cat.items.length > 0)

    // Calculate excluded main course categories for compensation
    const excludedMainCategories = [
      userPrefs.restrictions.includes("beef") || userPrefs.restrictions.includes("pork") ? "menu1" : null,
      userPrefs.restrictions.includes("chicken") ? "menu2" : null,
      userPrefs.restrictions.includes("seafood") || userPrefs.restrictions.includes("vegetables") ? "menu3" : null,
    ].filter(Boolean)

    // Adjust target main courses based on exclusions and budget tier
    let adjustedTargetMainCourses = targetMainCourses
    if (excludedMainCategories.length > 0) {
      const compensationFactor = budgetTier === "luxury" ? 2 : budgetTier === "premium" ? 1.5 : 1
      adjustedTargetMainCourses = Math.min(
        targetMainCourses + Math.floor(excludedMainCategories.length * compensationFactor),
        availableMainCategories.reduce((sum, cat) => sum + cat.items.length, 0),
      )
    }

    // Sort categories by preference and cost efficiency
    const sortedCategories = [...availableMainCategories].sort((a, b) => {
      const aEmphasized =
        (a.name === "menu1" && (userPrefs.emphasis.includes("beef") || userPrefs.emphasis.includes("pork"))) ||
        (a.name === "menu2" && userPrefs.emphasis.includes("chicken")) ||
        (a.name === "menu3" && (userPrefs.emphasis.includes("seafood") || userPrefs.emphasis.includes("vegetables")))

      const bEmphasized =
        (b.name === "menu1" && (userPrefs.emphasis.includes("beef") || userPrefs.emphasis.includes("pork"))) ||
        (b.name === "menu2" && userPrefs.emphasis.includes("chicken")) ||
        (b.name === "menu3" && (userPrefs.emphasis.includes("seafood") || userPrefs.emphasis.includes("vegetables")))

      if (aEmphasized && !bEmphasized) return -1
      if (!aEmphasized && bEmphasized) return 1

      // For low budgets, prefer cheaper options
      if (budgetTier === "economy") return a.cost - b.cost

      return 0
    })

    // Distribute main courses across available categories
    let finalMenu1 = 0
    let finalMenu2 = 0
    let finalMenu3 = 0
    let addedMainCourses = 0

    // Calculate items per category
    const itemsPerCategory = Math.floor(adjustedTargetMainCourses / sortedCategories.length)
    const extraItems = adjustedTargetMainCourses % sortedCategories.length

    for (let i = 0; i < sortedCategories.length; i++) {
      const category = sortedCategories[i]
      if (addedMainCourses >= adjustedTargetMainCourses) break

      let targetForThisCategory = itemsPerCategory
      if (i < extraItems) targetForThisCategory += 1

      // For emphasized categories, add bonus items if budget allows
      const isEmphasized =
        (category.name === "menu1" && (userPrefs.emphasis.includes("beef") || userPrefs.emphasis.includes("pork"))) ||
        (category.name === "menu2" && userPrefs.emphasis.includes("chicken")) ||
        (category.name === "menu3" &&
          (userPrefs.emphasis.includes("seafood") || userPrefs.emphasis.includes("vegetables")))

      if (isEmphasized && budgetTier !== "economy") {
        targetForThisCategory = Math.min(targetForThisCategory + 1, category.items.length)
      }

      const maxAffordable = Math.floor(remainingBudget / (category.cost * numGuests))
      const actualTarget = Math.min(targetForThisCategory, maxAffordable, category.items.length)

      if (actualTarget > 0) {
        if (category.name === "menu1") finalMenu1 = actualTarget
        else if (category.name === "menu2") finalMenu2 = actualTarget
        else if (category.name === "menu3") finalMenu3 = actualTarget

        addedMainCourses += actualTarget
        remainingBudget -= actualTarget * category.cost * numGuests
      }
    }

    // Ensure minimum 3 main courses if budget allows
    if (addedMainCourses < 3 && remainingBudget > 0) {
      for (const category of sortedCategories) {
        if (addedMainCourses >= 3) break

        const currentItems =
          category.name === "menu1" ? finalMenu1 : category.name === "menu2" ? finalMenu2 : finalMenu3

        if (currentItems === 0) {
          const canAfford = Math.floor(remainingBudget / (category.cost * numGuests))
          if (canAfford > 0) {
            if (category.name === "menu1") finalMenu1 = 1
            else if (category.name === "menu2") finalMenu2 = 1
            else if (category.name === "menu3") finalMenu3 = 1

            addedMainCourses += 1
            remainingBudget -= category.cost * numGuests
          }
        }
      }
    }

    console.log("Enhanced fallback result:", {
      budgetTier: budgetTier,
      targetMainCourses: adjustedTargetMainCourses,
      actualMainCourses: addedMainCourses,
      remainingBudget: remainingBudget,
      budgetUtilization: (((availableMenuBudget - remainingBudget) / availableMenuBudget) * 100).toFixed(1) + "%",
      finalStructure: {
        finalMenu1,
        finalMenu2,
        finalMenu3,
        adjustedTargetPasta,
        adjustedTargetDessert,
        adjustedTargetBeverage,
      },
    })

    const pickItems = (items: MenuItem[], count: number) =>
      items.slice(0, Math.min(items.length, count)).map((item) => item.name)

    const suggestedMenu = {
      menu1: pickItems([...filteredMenuItems.beef, ...filteredMenuItems.pork], finalMenu1),
      menu2: pickItems(filteredMenuItems.chicken, finalMenu2),
      menu3: pickItems([...filteredMenuItems.seafood, ...filteredMenuItems.vegetables], finalMenu3),
      pasta: pickItems(filteredMenuItems.pasta, adjustedTargetPasta),
      dessert: pickItems(filteredMenuItems.dessert, adjustedTargetDessert),
      beverage: pickItems(filteredMenuItems.beverage, adjustedTargetBeverage),
    }

    setSelectedMenuItems({
      menu1: [...suggestedMenu.menu1],
      menu2: [...suggestedMenu.menu2],
      menu3: [...suggestedMenu.menu3],
      pasta: [...suggestedMenu.pasta],
      dessert: [...suggestedMenu.dessert],
      beverage: [...suggestedMenu.beverage],
    })

    const isWeddingOrDebutEvent = eventInfo.eventType === "wedding" || eventInfo.eventType === "debut"

    // Calculate final menu cost
    const finalMenuCost =
      (suggestedMenu.menu1.length * costs.menu1 +
        suggestedMenu.menu2.length * costs.menu2 +
        suggestedMenu.menu3.length * costs.menu3 +
        suggestedMenu.pasta.length * costs.pasta +
        suggestedMenu.dessert.length * costs.dessert +
        suggestedMenu.beverage.length * costs.beverage) *
      numGuests

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

      // Add other standard features
      features.push(`${numGuests} guests`)
      features.push(`${budgetTier.charAt(0).toUpperCase() + budgetTier.slice(1)} tier quality`)
      features.push(`Generation #${generationCount} - Budget-scaled variety`)

      // Show budget context
      if (finalTotalAmount <= currentBudget) {
        features.push(`✓ Within your ₱${currentBudget.toLocaleString()} budget`)
      } else {
        features.push(`Customized for your specific preferences`)
      }

      return features
    }

    const mockRecommendations = {
      packages: [
        {
          name: `${budgetTier.charAt(0).toUpperCase() + budgetTier.slice(1)} Celebration Package`,
          description: `A budget-scaled ${budgetTier} package for your ${eventInfo.eventType} featuring menu selection that maximizes value within your budget range.`,
          price: `₱${finalTotalAmount.toLocaleString()}`,
          budgetTier: budgetTier,
          features: createFallbackPackageFeatures(suggestedMenu),
          isRecommended: true,
          reasoning: `This package has been customized to follow your preferences: "${formData.preferredMenus}". Your dietary restrictions and budget have been optimized for maximum value with ${addedMainCourses} main courses, ${adjustedTargetPasta} pasta, ${adjustedTargetDessert} dessert, and ${adjustedTargetBeverage} beverage options.`,
          menuTotal: finalMenuCost,
          serviceFee: serviceFee,
          serviceFeeInclusions: serviceFeeInclusions,
          downPayment: finalDownPayment,
          isWeddingOrDebut: isWeddingOrDebutEvent,
          userPreferences: userPrefs,
          menuSelections: suggestedMenu,
          generationCount: generationCount,
        },
      ],
      menu: suggestedMenu,
      budgetTier: budgetTier,
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
                Fill in your preferences below and our AI will recommend the perfect package and menu for your{" "}
                <span className="font-medium text-rose-600">{eventInfo.eventType}</span> event using our structured menu
                system with budget-conscious recommendations.
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

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label htmlFor="budget" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Budget Range
                    </label>
                    <span className="text-lg font-bold text-rose-600">₱{budgetValue[0].toLocaleString()}</span>
                  </div>
                  <div className="space-y-4">
                    <Slider
                      id="budget"
                      disabled={isFormDisabled || !formData.guestCount}
                      value={budgetValue}
                      max={currentSliderConfig.max}
                      min={currentSliderConfig.min}
                      step={1000}
                      onValueChange={(value) => {
                        setBudgetValue(value)
                        setFormData((prev) => ({ ...prev, budget: value[0].toString() }))
                      }}
                      className="py-2"
                    />
                    <div className="flex items-center justify-between">
                      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 flex-1">
                        <span>{currentSliderConfig.displayMinText}</span>
                        <span>{currentSliderConfig.displayMaxText}</span>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setCurrentSliderConfig((prev) => ({
                            ...prev,
                            max: prev.max + 5000,
                            displayMaxText: `₱${(prev.max + 5000).toLocaleString()}+`,
                          }))
                        }}
                        className="ml-4 text-xs px-3 py-1 h-7 border-rose-300 text-rose-600 hover:bg-rose-50 hover:border-rose-400"
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        ₱5K
                      </Button>
                    </div>
                  </div>
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
                      placeholder="Tell our AI your specific menu preferences and dietary restrictions. Examples: 'No beef', 'Add more chicken', 'More seafood', 'No pork', 'Prefer vegetables', 'Extra pasta options', 'Vegetarian only', 'Halal requirements', 'No shellfish allergy', 'Gluten-free options', 'Keto diet', 'Pescatarian', etc."
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
                        { label: "Spicy Food", value: "spicy food, hot dishes, maanghang" },
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
                      💡 <strong>Pro tip:</strong> Be specific about your dietary needs! Our AI understands:
                    </p>
                    <ul className="text-xs text-blue-600 dark:text-blue-400 mt-2 space-y-1 ml-4">
                      <li>
                        • <strong>Restrictions:</strong> "No beef", "Avoid pork", "Exclude chicken", "No shellfish
                        allergy"
                      </li>
                      <li>
                        • <strong>Preferences:</strong> "More seafood", "Extra vegetables", "Prefer chicken", "Add
                        pasta"
                      </li>
                      <li>
                        • <strong>Dietary needs:</strong> "Vegetarian", "Halal", "Gluten-free", "Keto diet",
                        "Pescatarian"
                      </li>
                      <li>
                        • <strong>Cooking style:</strong> "Spicy food", "Mild flavors", "Grilled only", "No fried"
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
                      Generating AI Recommendations...
                    </>
                  ) : (
                    <>
                      <Shuffle className="mr-2 h-5 w-5" />
                      Generate AI Recommendations {generationCount > 0 && `(#${generationCount + 1})`}
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
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">AI-Generated Recommendations</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Based on your preferences and budget analysis, here's your personalized package:
              </p>
              {recommendations && !recommendations.budgetExceeded && (
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
                          AI Recommended - Budget Optimized
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
                      (pkg.userPreferences.restrictions.length > 0 || pkg.userPreferences.emphasis.length > 0) && (
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
                          </div>
                        </div>
                      )}

                    {/* Budget Exceeded Message */}
                    {pkg.budgetExceededMessage && (
                      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                        <h4 className="font-semibold text-amber-800 dark:text-amber-200 mb-2">Budget Notice</h4>
                        <p className="text-sm text-amber-700 dark:text-amber-300">{pkg.budgetExceededMessage}</p>
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
                            {pkg.budgetTier.charAt(0).toUpperCase() + pkg.budgetTier.slice(1)} tier quality
                          </span>
                        </div>
                        {pkg.userPreferences &&
                          (pkg.userPreferences.restrictions.length > 0 || pkg.userPreferences.emphasis.length > 0) && (
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
                              Generation #{pkg.generationCount} - Budget optimized
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

            {/* Budget Exceeded Warning Display */}
            {recommendations.budgetExceeded && (
              <div className="space-y-6">
                <Card className="border-amber-300 bg-amber-50 dark:border-amber-700 dark:bg-amber-900/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
                      <AlertTriangle className="h-5 w-5" />
                      Budget Adjustment Required
                    </CardTitle>
                    <CardDescription className="text-amber-700 dark:text-amber-300">
                      {recommendations.message}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {recommendations.budgetWarnings?.map((warning: any, index: number) => (
                      <div
                        key={index}
                        className="bg-white dark:bg-gray-800 border border-amber-200 dark:border-amber-700 rounded-lg p-4"
                      >
                        <h4 className="font-semibold text-amber-800 dark:text-amber-200 mb-2">
                          {warning.category === "premium_preferences"
                            ? "Premium Preferences"
                            : `"Only ${warning.category}" Request`}
                        </h4>
                        <p className="text-sm text-amber-700 dark:text-amber-300 mb-3">{warning.reason}</p>
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-sm text-gray-600 dark:text-gray-400">Current Budget:</span>
                            <span className="font-semibold text-gray-800 dark:text-gray-200 ml-2">
                              ₱{warning.currentBudget.toLocaleString()}
                            </span>
                          </div>
                          <div>
                            <span className="text-sm text-gray-600 dark:text-gray-400">Suggested Budget:</span>
                            <span className="font-semibold text-green-600 ml-2">
                              ₱{warning.suggestedBudget.toLocaleString()}
                            </span>
                          </div>
                        </div>
                        <Button
                          onClick={() => {
                            setBudgetValue([warning.suggestedBudget])
                            setFormData((prev) => ({ ...prev, budget: warning.suggestedBudget.toString() }))
                            setCurrentSliderConfig((prev) => ({
                              ...prev,
                              max: Math.max(prev.max, warning.suggestedBudget + 50000),
                              displayMaxText: `₱${(warning.suggestedBudget + 50000).toLocaleString()}+`,
                            }))
                            setRecommendations(null) // Clear recommendations to show form again
                          }}
                          className="w-full mt-3 bg-green-600 hover:bg-green-700 text-white"
                        >
                          Update Budget to ₱{warning.suggestedBudget.toLocaleString()}
                        </Button>
                      </div>
                    ))}

                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                      <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Alternative Options:</h4>
                      <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                        <li>• Adjust your menu preferences to be less specific</li>
                        <li>• Remove some dietary restrictions if possible</li>
                        <li>• Consider a mixed menu instead of "only" requests</li>
                        <li>• Reduce the number of emphasized categories</li>
                      </ul>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <div className="flex gap-3 w-full">
                      <Button
                        onClick={() => {
                          setRecommendations(null)
                          setFormData((prev) => ({ ...prev, preferredMenus: "" }))
                        }}
                        variant="outline"
                        className="flex-1"
                      >
                        Clear Preferences & Try Again
                      </Button>
                      <Button
                        onClick={() => setRecommendations(null)}
                        className="flex-1 bg-rose-600 hover:bg-rose-700 text-white"
                      >
                        Adjust Preferences
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              </div>
            )}

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
                Generate New Recommendations
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
