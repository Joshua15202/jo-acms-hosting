"use client"
import type React from "react"
import { useState, useEffect, Suspense, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronRight, ChevronLeft, Home, Mail, AlertCircle } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { useCustomToast } from "@/components/custom-toast"
import { useSearchParams, useRouter } from "next/navigation"
import { calculatePackagePricing, formatCurrency, type MenuSelections } from "@/lib/pricing-calculator"
import { useAuth } from "@/components/user-auth-provider"

type FormStep = 1 | 2 | 3
type BudgetTier = "economy" | "standard" | "premium" | "luxury"

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

interface BookingFormProps {
  personalInfo: PersonalInfo
  eventInfo: EventInfo
  schedulingInfo: {
    eventDate: string
    timeSlot: string
  }
  backdropStyle?: string
  onChangeEventType?: () => void
}

interface AppointmentData {
  firstName: string
  lastName: string
  email: string
  phone: string
  eventType: string
  guestCount: number
  eventDate: string
  eventTime: string
  venue: string
  theme: string
  colorMotif: string
  celebrantName: string
  celebrantAge?: number
  celebrantGender: string
  groomName: string
  brideName: string
  mainCourses: string[]
  pasta: string
  dessert: string
  beverage: string
  additionalEventInfo: string
  additionalRequests: string
  backdropStyle?: string
  backdropPrice?: number
}

interface MenuItem {
  id: number
  name: string
  price: number
  category: string
}

const timeSlotOptions = [
  { value: "breakfast", label: "Breakfast (6AM - 10AM)" },
  { value: "lunch", label: "Lunch (12PM - 4PM)" },
  { value: "early_dinner", label: "Early Dinner (3PM - 7PM)" },
  { value: "dinner", label: "Dinner (6PM - 10PM)" },
]

function BookingFormContent({
  personalInfo,
  eventInfo,
  schedulingInfo,
  backdropStyle,
  onChangeEventType,
}: BookingFormProps) {
  const { toast } = useCustomToast()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, refreshSession } = useAuth()
  const [currentStep, setCurrentStep] = useState<FormStep>(1)
  const [date, setDate] = useState<Date | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isBookingComplete, setIsBookingComplete] = useState(false)
  const [countdown, setCountdown] = useState(10) // 10 second countdown
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([])
  const [menuItems, setMenuItems] = useState<{ [category: string]: MenuItem[] }>({})
  const [menuLoading, setMenuLoading] = useState(true)
  const [maxSelections, setMaxSelections] = useState({
    menu1: 1, // Beef, Pork, Shrimp
    menu2: 1, // Chicken
    menu3: 1, // Fish, Vegetables
    pasta: 1,
    dessert: 1,
    beverage: 1,
  })
  const [pricingData, setPricingData] = useState<any>(null)
  const [pricingLoading, setPricingLoading] = useState(false)
  const [bookingResponse, setBookingResponse] = useState<any>(null)

  // Add refs to track recent toast messages and prevent duplicates
  const recentToasts = useRef<Set<string>>(new Set())

  const showToastOnce = useCallback(
    (message: string, toastData: any) => {
      if (recentToasts.current.has(message)) {
        return // Don't show duplicate toast
      }

      recentToasts.current.add(message)
      toast(toastData)

      // Remove from recent toasts after 1 second
      setTimeout(() => {
        recentToasts.current.delete(message)
      }, 1000)
    },
    [toast],
  )

  const [formData, setFormData] = useState({
    eventType: eventInfo.eventType || "",
    guestCount: "",
    eventDate: "",
    eventTime: "",
    venue: "",
    theme: "",
    colorMotif: "",
    celebrantName: eventInfo.celebrantName || "",
    celebrantAge: eventInfo.celebrantAge || "",
    celebrantGender: eventInfo.celebrantGender || eventInfo.debutanteGender || "",
    groomName: eventInfo.groomName || "",
    brideName: eventInfo.brideName || "",
    additionalEventInfo: eventInfo.additionalEventInfo || "",
    // Updated menu structure
    menu1Selections: [] as string[], // Beef, Pork, Shrimp
    menu2Selections: [] as string[], // Chicken
    menu3Selections: [] as string[], // Fish, Vegetables
    pasta: "",
    dessert: "",
    beverage: "",
    additionalRequests: "",
  })

  // Load menu items from database
  useEffect(() => {
    const loadMenuItems = async () => {
      try {
        setMenuLoading(true)
        console.log("Loading menu items...")

        const response = await fetch("/api/menu-items")
        console.log("Menu API response status:", response.status)

        if (response.ok) {
          const data = await response.json()
          console.log("Menu API data:", data)

          if (data.success && data.menuItems) {
            setMenuItems(data.menuItems)
            console.log("Menu items set successfully:")
            console.log("- Beef items:", data.menuItems.beef?.length || 0)
            console.log("- Pork items:", data.menuItems.pork?.length || 0)
            console.log("- Chicken items:", data.menuItems.chicken?.length || 0)
            console.log("- Seafood items:", data.menuItems.seafood?.length || 0)
            console.log("- Vegetables items:", data.menuItems.vegetables?.length || 0)
          } else {
            console.error("Failed to load menu items - invalid response:", data)
            // Set fallback menu items directly in the component
            const fallbackMenu = {
              beef: [
                { id: 1, name: "Beef Broccoli", price: 70, category: "beef" },
                { id: 2, name: "Beef Caldereta", price: 70, category: "beef" },
                { id: 3, name: "Beef Mechado", price: 70, category: "beef" },
                { id: 4, name: "Roast Beef", price: 70, category: "beef" },
              ],
              pork: [
                { id: 5, name: "Pork Teriyaki", price: 70, category: "pork" },
                { id: 6, name: "Menudo", price: 70, category: "pork" },
                { id: 7, name: "Lechon Kawali", price: 70, category: "pork" },
              ],
              chicken: [
                { id: 8, name: "Chicken Alexander", price: 60, category: "chicken" },
                { id: 9, name: "Sweet Fire Chicken", price: 60, category: "chicken" },
                { id: 10, name: "Buttered Chicken", price: 60, category: "chicken" },
              ],
              seafood: [
                { id: 11, name: "Fish Fillet", price: 50, category: "seafood" },
                { id: 12, name: "Grilled Fish", price: 50, category: "seafood" },
                { id: 13, name: "Fish Teriyaki", price: 50, category: "seafood" },
              ],
              vegetables: [
                { id: 14, name: "Mixed Vegetables", price: 50, category: "vegetables" },
                { id: 15, name: "Pinakbet", price: 50, category: "vegetables" },
                { id: 16, name: "Grilled Vegetables", price: 50, category: "vegetables" },
              ],
              pasta: [
                { id: 17, name: "Spaghetti (Red Sauce)", price: 40, category: "pasta" },
                { id: 18, name: "Baked Mac", price: 40, category: "pasta" },
                { id: 19, name: "Carbonara", price: 40, category: "pasta" },
              ],
              dessert: [
                { id: 20, name: "Buko Salad", price: 25, category: "dessert" },
                { id: 21, name: "Fruit Salad", price: 25, category: "dessert" },
                { id: 22, name: "Leche Flan", price: 25, category: "dessert" },
              ],
              beverage: [
                { id: 23, name: "Red Iced Tea", price: 25, category: "beverage" },
                { id: 24, name: "Lemonade", price: 25, category: "beverage" },
                { id: 25, name: "Fresh Juice", price: 25, category: "beverage" },
              ],
            }
            setMenuItems(fallbackMenu)
            console.log("Using fallback menu items")
          }
        } else {
          console.error("Failed to fetch menu items - HTTP error:", response.status)
          // Set fallback menu here too
          const fallbackMenu = {
            beef: [
              { id: 1, name: "Beef Broccoli", price: 70, category: "beef" },
              { id: 2, name: "Beef Caldereta", price: 70, category: "beef" },
              { id: 3, name: "Beef Mechado", price: 70, category: "beef" },
            ],
            pork: [
              { id: 4, name: "Pork Teriyaki", price: 70, category: "pork" },
              { id: 5, name: "Menudo", price: 70, category: "pork" },
              { id: 6, name: "Lechon Kawali", price: 70, category: "pork" },
            ],
            chicken: [
              { id: 7, name: "Chicken Alexander", price: 60, category: "chicken" },
              { id: 8, name: "Sweet Fire Chicken", price: 60, category: "chicken" },
              { id: 9, name: "Buttered Chicken", price: 60, category: "chicken" },
            ],
            seafood: [
              { id: 10, name: "Fish Fillet", price: 50, category: "seafood" },
              { id: 11, name: "Grilled Fish", price: 50, category: "seafood" },
              { id: 12, name: "Fish Teriyaki", price: 50, category: "seafood" },
            ],
            vegetables: [
              { id: 13, name: "Mixed Vegetables", price: 50, category: "vegetables" },
              { id: 14, name: "Pinakbet", price: 50, category: "vegetables" },
              { id: 15, name: "Grilled Vegetables", price: 50, category: "vegetables" },
            ],
            pasta: [
              { id: 16, name: "Spaghetti (Red Sauce)", price: 40, category: "pasta" },
              { id: 17, name: "Baked Mac", price: 40, category: "pasta" },
              { id: 18, name: "Carbonara", price: 40, category: "pasta" },
            ],
            dessert: [
              { id: 19, name: "Buko Salad", price: 25, category: "dessert" },
              { id: 20, name: "Fruit Salad", price: 25, category: "dessert" },
              { id: 21, name: "Leche Flan", price: 25, category: "dessert" },
            ],
            beverage: [
              { id: 22, name: "Red Iced Tea", price: 25, category: "beverage" },
              { id: 23, name: "Lemonade", price: 25, category: "beverage" },
              { id: 24, name: "Fresh Juice", price: 25, category: "beverage" },
            ],
          }
          setMenuItems(fallbackMenu)
          console.log("Using fallback menu due to fetch error")
        }
      } catch (error) {
        console.error("Error loading menu items:", error)
        // Set fallback menu on error too
        const fallbackMenu = {
          beef: [
            { id: 1, name: "Beef Broccoli", price: 70, category: "beef" },
            { id: 2, name: "Beef Caldereta", price: 70, category: "beef" },
            { id: 3, name: "Beef Mechado", price: 70, category: "beef" },
          ],
          pork: [
            { id: 4, name: "Pork Teriyaki", price: 70, category: "pork" },
            { id: 5, name: "Menudo", price: 70, category: "pork" },
            { id: 6, name: "Lechon Kawali", price: 70, category: "pork" },
          ],
          chicken: [
            { id: 7, name: "Chicken Alexander", price: 60, category: "chicken" },
            { id: 8, name: "Sweet Fire Chicken", price: 60, category: "chicken" },
            { id: 9, name: "Buttered Chicken", price: 60, category: "chicken" },
          ],
          seafood: [
            { id: 10, name: "Fish Fillet", price: 50, category: "seafood" },
            { id: 11, name: "Grilled Fish", price: 50, category: "seafood" },
            { id: 12, name: "Fish Teriyaki", price: 50, category: "seafood" },
          ],
          vegetables: [
            { id: 13, name: "Mixed Vegetables", price: 50, category: "vegetables" },
            { id: 14, name: "Pinakbet", price: 50, category: "vegetables" },
            { id: 15, name: "Grilled Vegetables", price: 50, category: "vegetables" },
          ],
          pasta: [
            { id: 16, name: "Spaghetti (Red Sauce)", price: 40, category: "pasta" },
            { id: 17, name: "Baked Mac", price: 40, category: "pasta" },
            { id: 18, name: "Carbonara", price: 40, category: "pasta" },
          ],
          dessert: [
            { id: 19, name: "Buko Salad", price: 25, category: "dessert" },
            { id: 20, name: "Fruit Salad", price: 25, category: "dessert" },
            { id: 21, name: "Leche Flan", price: 25, category: "dessert" },
          ],
          beverage: [
            { id: 22, name: "Red Iced Tea", price: 25, category: "beverage" },
            { id: 23, name: "Lemonade", price: 25, category: "beverage" },
            { id: 24, name: "Fresh Juice", price: 25, category: "beverage" },
          ],
        }
        setMenuItems(fallbackMenu)
        console.log("Using fallback menu due to error")
      } finally {
        setMenuLoading(false)
      }
    }

    loadMenuItems()
  }, [])

  // Countdown timer effect
  useEffect(() => {
    let timer: NodeJS.Timeout
    if (isBookingComplete && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown(countdown - 1)
      }, 1000)
    } else if (isBookingComplete && countdown === 0) {
      // Auto redirect when countdown reaches 0
      router.push("/")
    }
    return () => clearTimeout(timer)
  }, [isBookingComplete, countdown, router])

  // Load URL parameters on mount - only run once
  useEffect(() => {
    const urlParams = {
      eventType: searchParams.get("eventType") || eventInfo.eventType || "",
      guestCount: searchParams.get("guestCount") || "",
      eventDate: searchParams.get("eventDate") || schedulingInfo.eventDate || "",
      eventTime: searchParams.get("eventTime") || schedulingInfo.timeSlot || "",
      venue: searchParams.get("venue") || "",
      theme: searchParams.get("theme") || "",
      colorMotif: searchParams.get("colorMotif") || "",
      celebrantName: searchParams.get("celebrantName") || eventInfo.celebrantName || "",
      celebrantAge: searchParams.get("celebrantAge") || eventInfo.celebrantAge || "",
      celebrantGender:
        searchParams.get("celebrantGender") || eventInfo.celebrantGender || eventInfo.debutanteGender || "",
      groomName: searchParams.get("groomName") || eventInfo.groomName || "",
      brideName: searchParams.get("brideName") || eventInfo.brideName || "",
      additionalEventInfo: searchParams.get("additionalEventInfo") || eventInfo.additionalEventInfo || "",
      // Updated for new menu structure
      menu1Selections: searchParams.get("ai_main_courses")?.split(",").filter(Boolean) || [],
      menu2Selections: [],
      menu3Selections: [],
      pasta: searchParams.get("ai_pasta")?.split(",")[0] || "",
      dessert: searchParams.get("ai_dessert")?.split(",")[0] || "",
      beverage: searchParams.get("ai_beverage")?.split(",")[0] || "",
      additionalRequests: "",
    }

    setFormData(urlParams)

    if (urlParams.eventDate) {
      setDate(new Date(urlParams.eventDate))
    }

    const redirectToStep = searchParams.get("redirectToStep")
    if (redirectToStep === "2") {
      setCurrentStep(2)
    }

    // Initialize time slots
    setAvailableTimeSlots(timeSlotOptions.map((slot) => slot.value))
  }, []) // Empty dependency array to run only once

  // Add this useEffect after the existing useEffects, around line 200
  useEffect(() => {
    // Clear guest count if it's 80 and event type is wedding
    if (formData.eventType === "wedding" && formData.guestCount === "80") {
      setFormData((prev) => ({ ...prev, guestCount: "" }))
    }
  }, [formData.eventType, formData.guestCount])

  const getBackdropPrice = useCallback((backdropType: string): number => {
    switch (backdropType) {
      case "SINGLE_PANEL_BACKDROP":
        return 7000
      case "DOUBLE_PANEL_BACKDROP":
        return 8000
      case "TRIPLE_PANEL_BACKDROP":
        return 10000
      default:
        return 0
    }
  }, [])

  const getBackdropDetails = useCallback((backdropType: string): string => {
    switch (backdropType) {
      case "SINGLE_PANEL_BACKDROP":
        return "• (3) Regular Colored Balloon Garlands\n• Cut-Out Name\n• Faux Grass Carpet\n• Celebrant's Accent Chair\n• Cake Cylinder Plinth"
      case "DOUBLE_PANEL_BACKDROP":
        return "• (3) Regular Colored Balloon Garlands\n• Cut-Out Name\n• Faux Grass Carpet\n• Celebrant's Accent Chair\n• Cake Cylinder Plinth\n• Basic Balloon Entrance Arch"
      case "TRIPLE_PANEL_BACKDROP":
        return "• (3–4) Regular Colored Balloon Garlands\n• Cut-Out Name\n• Faux Grass Carpet\n• Celebrant's Accent Chair\n• Cake Cylinder Plinth\n• Basic Balloon Entrance Arch\n• 18x24 Sintra Board Welcome Signage\n• (2) 2D Styro Character Standees"
      default:
        return "Backdrop details not available"
    }
  }, [])

  const getBackdropName = useCallback((backdropType: string): string => {
    switch (backdropType) {
      case "SINGLE_PANEL_BACKDROP":
        return "Single Panel Backdrop"
      case "DOUBLE_PANEL_BACKDROP":
        return "Double Panel Backdrop"
      case "TRIPLE_PANEL_BACKDROP":
        return "Triple Panel Backdrop"
      default:
        return "No backdrop selected"
    }
  }, [])

  // Update pricing when form data changes
  const getPackagePricing = useCallback(async () => {
    if (!formData.guestCount) return null

    try {
      const guestCount = Number.parseInt(formData.guestCount)
      const allMainCourses = [...formData.menu1Selections, ...formData.menu2Selections, ...formData.menu3Selections]
      const menuSelections: MenuSelections = {
        mainCourses: allMainCourses,
        pasta: formData.pasta,
        dessert: formData.dessert,
        beverage: formData.beverage,
      }

      console.log("Calculating pricing with selections:", menuSelections)
      console.log("Guest count:", guestCount)
      console.log("Event type:", formData.eventType)
      console.log("Backdrop style:", backdropStyle)

      // Get base pricing (pass event type for wedding package detection)
      const basePricing = await calculatePackagePricing(guestCount, menuSelections, formData.eventType)
      console.log("Base pricing result:", basePricing)

      // For non-wedding events, add backdrop price. For weddings, it's included in the package.
      const isWedding = formData.eventType === "wedding"
      const backdropPrice = !isWedding && backdropStyle ? getBackdropPrice(backdropStyle) : 0
      console.log("Backdrop price:", backdropPrice)

      // Create final pricing with backdrop added (if applicable)
      const finalPricing = {
        ...basePricing,
        totalAmount: basePricing.total + backdropPrice,
        downPayment: Math.round((basePricing.total + backdropPrice) * 0.5),
        isWeddingPackage: isWedding,
        weddingPackagePrice: isWedding ? basePricing.serviceFee : 0,
      }

      console.log("Final pricing with backdrop:", finalPricing)
      return finalPricing
    } catch (error) {
      console.error("Error calculating pricing:", error)
      return null
    }
  }, [
    formData.guestCount,
    formData.eventType,
    formData.menu1Selections,
    formData.menu2Selections,
    formData.menu3Selections,
    formData.pasta,
    formData.dessert,
    formData.beverage,
    backdropStyle,
    getBackdropPrice,
  ])

  useEffect(() => {
    const updatePricing = async () => {
      if (currentStep === 3 && formData.guestCount) {
        setPricingLoading(true)
        try {
          const pricing = await getPackagePricing()
          setPricingData(pricing)
        } catch (error) {
          console.error("Error updating pricing:", error)
          setPricingData(null)
        } finally {
          setPricingLoading(false)
        }
      }
    }

    updatePricing()
  }, [
    currentStep,
    formData.guestCount,
    formData.eventType,
    formData.menu1Selections,
    formData.menu2Selections,
    formData.menu3Selections,
    formData.pasta,
    formData.dessert,
    formData.beverage,
    getPackagePricing,
  ])

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }, [])

  const handleSelectChange = useCallback((name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }, [])

  const handleDateSelect = useCallback((selectedDate: Date | undefined) => {
    if (!selectedDate) {
      setDate(null)
      setFormData((prev) => ({ ...prev, eventDate: "" }))
      return
    }

    setDate(selectedDate)
    const formattedDate = format(selectedDate, "yyyy-MM-dd")
    setFormData((prev) => ({ ...prev, eventDate: formattedDate }))
  }, [])

  const validateStep1 = useCallback(() => {
    if (!formData.eventType) {
      toast({ title: "Validation Error", description: "Event Type is required.", variant: "destructive" })
      return false
    }
    if (!formData.guestCount) {
      toast({ title: "Validation Error", description: "Number of Guests is required.", variant: "destructive" })
      return false
    }
    if (!formData.venue.trim()) {
      toast({ title: "Validation Error", description: "Venue is required.", variant: "destructive" })
      return false
    }
    return true
  }, [formData.eventType, formData.guestCount, formData.venue, toast])

  const handleIncreaseLimit = useCallback((menuType: keyof typeof maxSelections) => {
    setMaxSelections((prev) => ({
      ...prev,
      [menuType]: prev[menuType] + 1,
    }))
  }, [])

  // Updated menu selection handlers
  const handleMenuSelection = useCallback(
    (menuType: "menu1" | "menu2" | "menu3", itemName: string, checked: boolean) => {
      const selectionKey = `${menuType}Selections` as keyof typeof formData
      const currentSelections = formData[selectionKey] as string[]
      const maxKey = menuType as keyof typeof maxSelections

      if (checked) {
        // Check if we've reached the maximum limit
        if (currentSelections.length >= maxSelections[maxKey]) {
          const limitMessage = `${menuType}-limit-${maxSelections[maxKey]}`
          showToastOnce(limitMessage, {
            title: "Selection Limit Reached",
            description: `${menuType.toUpperCase()} is already at maximum quantity (${maxSelections[maxKey]}). Click the +1 More button to add more selections.`,
            variant: "destructive",
          })
          return
        }

        // Add the item
        setFormData((prev) => ({
          ...prev,
          [selectionKey]: [...currentSelections, itemName],
        }))
      } else {
        // Remove the item
        setFormData((prev) => ({
          ...prev,
          [selectionKey]: currentSelections.filter((item) => item !== itemName),
        }))
      }
    },
    [formData, maxSelections, showToastOnce],
  )

  const validateStep2 = useCallback(() => {
    const totalMainCourses =
      formData.menu1Selections.length + formData.menu2Selections.length + formData.menu3Selections.length

    if (totalMainCourses === 0) {
      toast({
        title: "Validation Error",
        description: "At least one main course selection is required from Menu 1, 2, or 3.",
        variant: "destructive",
      })
      return false
    }
    if (!formData.pasta || !formData.pasta.trim()) {
      toast({ title: "Validation Error", description: "Pasta selection is required.", variant: "destructive" })
      return false
    }
    if (!formData.dessert || !formData.dessert.trim()) {
      toast({ title: "Validation Error", description: "Dessert selection is required.", variant: "destructive" })
      return false
    }
    if (!formData.beverage || !formData.beverage.trim()) {
      toast({ title: "Validation Error", description: "Beverage selection is required.", variant: "destructive" })
      return false
    }
    return true
  }, [
    formData.menu1Selections,
    formData.menu2Selections,
    formData.menu3Selections,
    formData.pasta,
    formData.dessert,
    formData.beverage,
    toast,
  ])

  const handleNext = useCallback(
    (e?: React.MouseEvent) => {
      e?.preventDefault() // Prevent form submission
      if (currentStep === 1 && validateStep1()) {
        setCurrentStep(2)
      } else if (currentStep === 2 && validateStep2()) {
        setCurrentStep(3)
      }
    },
    [currentStep, validateStep1, validateStep2],
  )

  const handleBack = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as FormStep)
    }
  }, [currentStep])

  const handleGoToHomepage = useCallback(() => {
    // Store success message in localStorage to show on homepage
    localStorage.setItem("bookingSuccess", "true")
    router.push("/")
  }, [router])

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()

      // Prevent multiple submissions
      if (isSubmitting || isBookingComplete) {
        return
      }

      // Check if user is still authenticated
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please log in to book your appointment.",
          variant: "destructive",
        })
        return
      }

      setIsSubmitting(true)

      try {
        // Try to refresh session first
        console.log("Refreshing session before booking...")
        const sessionValid = await refreshSession()
        if (!sessionValid) {
          toast({
            title: "Session Expired",
            description: "Your session has expired. Please refresh the page and log in again.",
            variant: "destructive",
          })
          setIsSubmitting(false)
          return
        }

        // Combine all menu selections for submission
        const allMainCourses = [...formData.menu1Selections, ...formData.menu2Selections, ...formData.menu3Selections]

        const appointmentData: AppointmentData = {
          firstName: personalInfo.firstName,
          lastName: personalInfo.lastName,
          email: personalInfo.email,
          phone: personalInfo.phone,
          eventType: formData.eventType,
          guestCount: Number.parseInt(formData.guestCount),
          eventDate: formData.eventDate,
          eventTime: formData.eventTime,
          venue: formData.venue,
          theme: formData.theme || "",
          colorMotif: formData.colorMotif || "",
          celebrantName: formData.celebrantName || "",
          celebrantAge: formData.celebrantAge ? Number.parseInt(formData.celebrantAge) : undefined,
          celebrantGender: formData.celebrantGender || "",
          groomName: formData.groomName || "",
          brideName: formData.brideName || "",
          mainCourses: allMainCourses,
          pasta: formData.pasta,
          dessert: formData.dessert,
          beverage: formData.beverage,
          additionalEventInfo: formData.additionalEventInfo || "",
          additionalRequests: formData.additionalRequests || "",
          backdropStyle: backdropStyle || undefined,
          backdropPrice: backdropStyle ? getBackdropPrice(backdropStyle) : undefined,
        }

        console.log("Submitting appointment data:", appointmentData)

        const response = await fetch("/api/book-appointment", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(appointmentData),
          credentials: "include", // Include cookies
        })

        console.log("API Response status:", response.status)
        console.log("API Response headers:", Object.fromEntries(response.headers.entries()))

        let result
        try {
          result = await response.json()
          console.log("API Response data:", result)
        } catch (jsonError) {
          console.error("Failed to parse response JSON:", jsonError)
          const responseText = await response.text()
          console.error("Raw response text:", responseText)
          throw new Error("Server returned invalid JSON response")
        }

        if (!response.ok) {
          console.error("API Response not OK:", {
            status: response.status,
            statusText: response.statusText,
            result: result,
          })

          if (response.status === 401) {
            if (result.requiresAuth || result.sessionExpired) {
              toast({
                title: "Session Expired",
                description: "Your session has expired. Please refresh the page and log in again.",
                variant: "destructive",
              })
              // Don't redirect, just ask user to refresh
              setIsSubmitting(false)
              return
            }
          }

          // Show detailed error information
          const errorMessage = result.error || `HTTP ${response.status}: ${response.statusText}`
          const errorDetails = result.details ? ` Details: ${result.details}` : ""
          const errorSuggestion = result.suggestion ? ` ${result.suggestion}` : ""

          throw new Error(`${errorMessage}${errorDetails}${errorSuggestion}`)
        }

        // Store the booking response for the success message
        setBookingResponse(result)

        // Mark booking as complete and start countdown
        setIsBookingComplete(true)
        setCountdown(20)
      } catch (error) {
        console.error("Error creating appointment:", error)
        console.error("Error details:", {
          name: error.name,
          message: error.message,
          stack: error.stack,
        })

        toast({
          title: "Booking Failed",
          description: error instanceof Error ? error.message : "An unexpected error occurred. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsSubmitting(false)
      }
    },
    [
      personalInfo,
      formData,
      toast,
      isSubmitting,
      isBookingComplete,
      user,
      refreshSession,
      backdropStyle,
      getBackdropPrice,
    ],
  )

  const getGuestCountOptions = () => {
    if (formData.eventType === "wedding") {
      return [
        { value: "50", label: "50 guests" },
        { value: "100", label: "100 guests" },
        { value: "150", label: "150 guests" },
        { value: "200", label: "200 guests" },
        { value: "300", label: "300 guests" },
      ]
    } else {
      return [
        { value: "50", label: "50 guests" },
        { value: "80", label: "80 guests" },
        { value: "100", label: "100 guests" },
        { value: "150", label: "150 guests" },
        { value: "200", label: "200 guests" },
      ]
    }
  }

  const renderStep1 = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Event Details</h3>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="grid gap-2">
          <label htmlFor="eventType">Event Type</label>
          <Select
            name="eventType"
            value={formData.eventType}
            onValueChange={(value) => handleSelectChange("eventType", value)}
            disabled={!!eventInfo.eventType}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select event type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="wedding">Wedding</SelectItem>
              <SelectItem value="birthday">Birthday</SelectItem>
              <SelectItem value="debut">Debut</SelectItem>
              <SelectItem value="corporate">Corporate Event</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <label htmlFor="guestCount">Number of Guests</label>
          <Select
            name="guestCount"
            value={formData.guestCount}
            onValueChange={(value) => handleSelectChange("guestCount", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select guest count" />
            </SelectTrigger>
            <SelectContent>
              {getGuestCountOptions().map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2 md:col-span-2">
          <label htmlFor="venue">Venue Address</label>
          <Input
            id="venue"
            name="venue"
            value={formData.venue}
            onChange={handleInputChange}
            placeholder="Enter venue address"
          />
        </div>
        <div className="grid gap-2">
          <label htmlFor="theme">Event Theme (Optional)</label>
          <Input
            id="theme"
            name="theme"
            value={formData.theme}
            onChange={handleInputChange}
            placeholder="Enter event theme"
          />
        </div>
        <div className="grid gap-2">
          <label htmlFor="colorMotif">Color Motif (Optional)</label>
          <Input
            id="colorMotif"
            name="colorMotif"
            value={formData.colorMotif}
            onChange={handleInputChange}
            placeholder="Enter color motif"
          />
        </div>
        {(formData.eventType === "birthday" || formData.eventType === "debut") && (
          <>
            <div className="grid gap-2">
              <label htmlFor="celebrantName">
                {formData.eventType === "birthday" ? "Celebrant's Name" : "Debutante's Name"}
              </label>
              <Input
                id="celebrantName"
                name="celebrantName"
                value={formData.celebrantName}
                onChange={handleInputChange}
                placeholder={`Enter ${formData.eventType === "birthday" ? "celebrant's" : "debutante's"} name`}
                disabled={!!eventInfo.celebrantName}
              />
            </div>
            {formData.eventType === "birthday" && (
              <div className="grid gap-2">
                <label htmlFor="celebrantAge">Celebrant's Age</label>
                <Input
                  id="celebrantAge"
                  name="celebrantAge"
                  type="number"
                  value={formData.celebrantAge}
                  onChange={handleInputChange}
                  placeholder="Enter celebrant's age"
                  min="1"
                  max="150"
                  disabled={!!eventInfo.celebrantAge}
                />
              </div>
            )}
            <div className="grid gap-2">
              <label htmlFor="celebrantGender">
                {formData.eventType === "birthday" ? "Celebrant's Gender" : "Debutante's Gender"}
              </label>
              <Select
                name="celebrantGender"
                value={formData.celebrantGender}
                onValueChange={(value) => handleSelectChange("celebrantGender", value)}
                disabled={!!(eventInfo.celebrantGender || eventInfo.debutanteGender)}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={`Select ${formData.eventType === "birthday" ? "celebrant's" : "debutante's"} gender`}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        )}

        {formData.eventType === "other" && (
          <div className="grid gap-2 md:col-span-2">
            <label htmlFor="additionalEventInfo">Event Details</label>
            <Input
              id="additionalEventInfo"
              name="additionalEventInfo"
              value={formData.additionalEventInfo}
              onChange={handleInputChange}
              placeholder="E.g., Anniversary, Christening, Graduation"
              disabled={!!eventInfo.additionalEventInfo}
            />
          </div>
        )}

        {formData.eventType === "wedding" && (
          <>
            <div className="grid gap-2">
              <label htmlFor="groomName">Groom's Name</label>
              <Input
                id="groomName"
                name="groomName"
                value={formData.groomName}
                onChange={handleInputChange}
                placeholder="Enter groom's name"
                disabled={!!eventInfo.groomName}
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="brideName">Bride's Name</label>
              <Input
                id="brideName"
                name="brideName"
                value={formData.brideName}
                onChange={handleInputChange}
                placeholder="Enter bride's name"
                disabled={!!eventInfo.brideName}
              />
            </div>
          </>
        )}
      </div>
    </div>
  )

  const renderStep2 = () => {
    if (menuLoading) {
      return (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-rose-600"></div>
          <span className="ml-3 text-gray-600">Loading menu items...</span>
        </div>
      )
    }

    if (Object.keys(menuItems).length === 0) {
      return (
        <div className="flex items-center justify-center py-8">
          <AlertCircle className="h-8 w-8 text-yellow-500 mr-3" />
          <span className="text-gray-600">Unable to load menu items. Please refresh the page.</span>
        </div>
      )
    }

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Menu Composition & Selection</h3>
          <div className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
            Structured Menu System
          </div>
        </div>
        <p className="text-gray-500 dark:text-gray-400">
          Select one item per menu (Menu 1-3). Use "+1 More" to add additional selections from the same menu.
        </p>

        {/* Menu 1: Beef, Pork, Shrimp */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-base font-medium">🥩 Menu 1: Beef, Pork</label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">
                {formData.menu1Selections?.length || 0}/{maxSelections.menu1} selected
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleIncreaseLimit("menu1")}
                className="h-6 px-2 text-xs"
              >
                +1 More
              </Button>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {["beef", "pork"].map((category) => (
              <div key={category} className="space-y-3 border rounded-lg p-4">
                <h4 className="font-medium capitalize text-gray-700 dark:text-gray-300 border-b pb-2">{category}</h4>
                <div className="space-y-2">
                  {menuItems[category] && menuItems[category].length > 0 ? (
                    menuItems[category].map((item) => (
                      <label
                        key={item.id}
                        className="flex items-start space-x-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 p-1 rounded"
                      >
                        <input
                          type="checkbox"
                          checked={formData.menu1Selections?.includes(item.name) || false}
                          onChange={(e) => handleMenuSelection("menu1", item.name, e.target.checked)}
                          className="mt-1 rounded border-gray-300 text-rose-600 focus:ring-rose-500 flex-shrink-0"
                        />
                        <div className="flex-1">
                          <span className="text-sm leading-tight">{item.name}</span>
                        </div>
                      </label>
                    ))
                  ) : (
                    <div className="text-sm text-gray-500 italic">No items available in this category</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Menu 2: Chicken */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-base font-medium">🐔 Menu 2: Chicken</label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">
                {formData.menu2Selections?.length || 0}/{maxSelections.menu2} selected
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleIncreaseLimit("menu2")}
                className="h-6 px-2 text-xs"
              >
                +1 More
              </Button>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
            <div className="space-y-3 border rounded-lg p-4">
              <h4 className="font-medium capitalize text-gray-700 dark:text-gray-300 border-b pb-2">Chicken</h4>
              <div className="space-y-2">
                {menuItems.chicken && menuItems.chicken.length > 0 ? (
                  menuItems.chicken.map((item) => (
                    <label
                      key={item.id}
                      className="flex items-start space-x-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 p-1 rounded"
                    >
                      <input
                        type="checkbox"
                        checked={formData.menu2Selections?.includes(item.name) || false}
                        onChange={(e) => handleMenuSelection("menu2", item.name, e.target.checked)}
                        className="mt-1 rounded border-gray-300 text-rose-600 focus:ring-rose-500 flex-shrink-0"
                      />
                      <div className="flex-1">
                        <span className="text-sm leading-tight">{item.name}</span>
                      </div>
                    </label>
                  ))
                ) : (
                  <div className="text-sm text-gray-500 italic">No items available in this category</div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Menu 3: Fish, Vegetables */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-base font-medium">🐟 Menu 3: Seafood, Vegetables</label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">
                {formData.menu3Selections?.length || 0}/{maxSelections.menu3} selected
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleIncreaseLimit("menu3")}
                className="h-6 px-2 text-xs"
              >
                +1 More
              </Button>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {["seafood", "vegetables"].map((category) => (
              <div key={category} className="space-y-3 border rounded-lg p-4">
                <h4 className="font-medium capitalize text-gray-700 dark:text-gray-300 border-b pb-2">
                  {category === "seafood" ? "Seafood" : "Vegetables"}
                </h4>
                <div className="space-y-2">
                  {menuItems[category] && menuItems[category].length > 0 ? (
                    menuItems[category].map((item) => (
                      <label
                        key={item.id}
                        className="flex items-start space-x-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 p-1 rounded"
                      >
                        <input
                          type="checkbox"
                          checked={formData.menu3Selections?.includes(item.name) || false}
                          onChange={(e) => handleMenuSelection("menu3", item.name, e.target.checked)}
                          className="mt-1 rounded border-gray-300 text-rose-600 focus:ring-rose-500 flex-shrink-0"
                        />
                        <div className="flex-1">
                          <span className="text-sm leading-tight">{item.name}</span>
                        </div>
                      </label>
                    ))
                  ) : (
                    <div className="text-sm text-gray-500 italic">No items available in this category</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Extras: Pasta, Dessert, Beverages */}
        <div className="border-t pt-6">
          <h4 className="text-base font-medium mb-4">🍽️ Extras: Pasta, Dessert, Beverage </h4>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
            {/* Pasta */}
            <div className="space-y-3 border rounded-lg p-4">
              <div className="flex items-center justify-between border-b pb-2">
                <h4 className="font-medium text-gray-700 dark:text-gray-300">🍝 Pasta</h4>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleIncreaseLimit("pasta")}
                  className="h-6 px-2 text-xs"
                >
                  +1 More
                </Button>
              </div>
              <p className="text-xs text-gray-500 mb-2">
                Choose up to {maxSelections.pasta} pasta{maxSelections.pasta > 1 ? "s" : ""}
              </p>
              <div className="space-y-2">
                {menuItems.pasta?.map((item) => (
                  <label
                    key={item.id}
                    className="flex items-start space-x-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 p-1 rounded"
                  >
                    <input
                      type="checkbox"
                      checked={formData.pasta.split(", ").includes(item.name)}
                      onChange={(e) => {
                        const currentPastas = formData.pasta ? formData.pasta.split(", ").filter((p) => p) : []
                        if (e.target.checked) {
                          if (currentPastas.length >= maxSelections.pasta) {
                            e.target.checked = false
                            const pastaLimitMessage = `pasta-limit-${maxSelections.pasta}`
                            showToastOnce(pastaLimitMessage, {
                              title: "Selection Limit Reached",
                              description: `Pasta is already at maximum quantity (${maxSelections.pasta}). Click the +1 More button to add more selections.`,
                              variant: "destructive",
                            })
                            return
                          }
                          const newPastas = [...currentPastas, item.name]
                          handleSelectChange("pasta", newPastas.join(", "))
                        } else {
                          const newPastas = currentPastas.filter((p) => p !== item.name)
                          handleSelectChange("pasta", newPastas.join(", "))
                        }
                      }}
                      className="mt-1 rounded border-gray-300 text-rose-600 focus:ring-rose-500 flex-shrink-0"
                    />
                    <div className="flex-1">
                      <span className="text-sm leading-tight">{item.name}</span>
                    </div>
                  </label>
                )) || <div className="text-sm text-gray-500 italic">No pasta items available</div>}
              </div>
            </div>

            {/* Dessert */}
            <div className="space-y-3 border rounded-lg p-4">
              <div className="flex items-center justify-between border-b pb-2">
                <h4 className="font-medium text-gray-700 dark:text-gray-300">🍰 Dessert</h4>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleIncreaseLimit("dessert")}
                  className="h-6 px-2 text-xs"
                >
                  +1 More
                </Button>
              </div>
              <p className="text-xs text-gray-500 mb-2">
                Choose up to {maxSelections.dessert} dessert{maxSelections.dessert > 1 ? "s" : ""}
              </p>
              <div className="space-y-2">
                {menuItems.dessert?.map((item) => (
                  <label
                    key={item.id}
                    className="flex items-start space-x-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 p-1 rounded"
                  >
                    <input
                      type="checkbox"
                      checked={formData.dessert.split(", ").includes(item.name)}
                      onChange={(e) => {
                        const currentDesserts = formData.dessert ? formData.dessert.split(", ").filter((d) => d) : []
                        if (e.target.checked) {
                          if (currentDesserts.length >= maxSelections.dessert) {
                            e.target.checked = false
                            const dessertLimitMessage = `dessert-limit-${maxSelections.dessert}`
                            showToastOnce(dessertLimitMessage, {
                              title: "Selection Limit Reached",
                              description: `Dessert is already at maximum quantity (${maxSelections.dessert}). Click the +1 More button to add more selections.`,
                              variant: "destructive",
                            })
                            return
                          }
                          const newDesserts = [...currentDesserts, item.name]
                          handleSelectChange("dessert", newDesserts.join(", "))
                        } else {
                          const newDesserts = currentDesserts.filter((d) => d !== item.name)
                          handleSelectChange("dessert", newDesserts.join(", "))
                        }
                      }}
                      className="mt-1 rounded border-gray-300 text-rose-600 focus:ring-rose-500 flex-shrink-0"
                    />
                    <div className="flex-1">
                      <span className="text-sm leading-tight">{item.name}</span>
                    </div>
                  </label>
                )) || <div className="text-sm text-gray-500 italic">No dessert items available</div>}
              </div>
            </div>

            {/* Beverage */}
            <div className="space-y-3 border rounded-lg p-4">
              <div className="flex items-center justify-between border-b pb-2">
                <h4 className="font-medium text-gray-700 dark:text-gray-300">🥤 Beverage</h4>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleIncreaseLimit("beverage")}
                  className="h-6 px-2 text-xs"
                >
                  +1 More
                </Button>
              </div>
              <p className="text-xs text-gray-500 mb-2">
                Choose up to {maxSelections.beverage} beverage{maxSelections.beverage > 1 ? "s" : ""}
              </p>
              <div className="space-y-2">
                {menuItems.beverage?.map((item) => (
                  <label
                    key={item.id}
                    className="flex items-start space-x-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 p-1 rounded"
                  >
                    <input
                      type="checkbox"
                      checked={formData.beverage.split(", ").includes(item.name)}
                      onChange={(e) => {
                        const currentBeverages = formData.beverage ? formData.beverage.split(", ").filter((b) => b) : []
                        if (e.target.checked) {
                          if (currentBeverages.length >= maxSelections.beverage) {
                            e.target.checked = false
                            const beverageLimitMessage = `beverage-limit-${maxSelections.beverage}`
                            showToastOnce(beverageLimitMessage, {
                              title: "Selection Limit Reached",
                              description: `Beverage is already at maximum quantity (${maxSelections.beverage}). Click the +1 More button to add more selections.`,
                              variant: "destructive",
                            })
                            return
                          }
                          const newBeverages = [...currentBeverages, item.name]
                          handleSelectChange("beverage", newBeverages.join(", "))
                        } else {
                          const newBeverages = currentBeverages.filter((b) => b !== item.name)
                          handleSelectChange("beverage", newBeverages.join(", "))
                        }
                      }}
                      className="mt-1 rounded border-gray-300 text-rose-600 focus:ring-rose-500 flex-shrink-0"
                    />
                    <div className="flex-1">
                      <span className="text-sm leading-tight">{item.name}</span>
                    </div>
                  </label>
                )) || <div className="text-sm text-gray-500 italic">No beverage items available</div>}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const renderStep3 = () => {
    // Add this helper function at the beginning of renderStep3
    const cleanValue = (value: string) => value.replace(/\s*$$Auto-filled$$\s*/gi, "").trim()

    return (
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Review & Additional Requests</h3>
        <Card>
          <CardContent className="p-6 space-y-4">
            <div>
              <h4 className="font-semibold text-base mb-3 text-rose-600">Personal Information</h4>
              <div className="grid gap-2 text-sm pl-4">
                <div className="flex justify-between">
                  <span className="font-medium">Name:</span>
                  <span>
                    {cleanValue(personalInfo.firstName)} {cleanValue(personalInfo.lastName)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Email:</span>
                  <span>{cleanValue(personalInfo.email)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Phone:</span>
                  <span>{cleanValue(personalInfo.phone)}</span>
                </div>
              </div>
            </div>

            <hr className="my-4" />

            <div>
              <h4 className="font-semibold text-base mb-3 text-rose-600">Event Details</h4>
              <div className="grid gap-2 text-sm pl-4">
                <div className="flex justify-between">
                  <span className="font-medium">Event Type:</span>
                  <span className="capitalize">{formData.eventType || "Not specified"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Number of Guests:</span>
                  <span>{formData.guestCount ? `${formData.guestCount} guests` : "Not specified"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Venue:</span>
                  <span className="text-right max-w-[300px] break-words">{formData.venue || "Not specified"}</span>
                </div>
                {formData.theme && (
                  <div className="flex justify-between">
                    <span className="font-medium">Theme:</span>
                    <span>{formData.theme}</span>
                  </div>
                )}
                {formData.colorMotif && (
                  <div className="flex justify-between">
                    <span className="font-medium">Color Motif:</span>
                    <span>{formData.colorMotif}</span>
                  </div>
                )}
                {(formData.celebrantName || formData.groomName || formData.brideName) && (
                  <div className="flex justify-between">
                    <span className="font-medium">
                      {formData.eventType === "birthday"
                        ? "Celebrant:"
                        : formData.eventType === "debut"
                          ? "Debutante:"
                          : formData.eventType === "wedding"
                            ? "Couple:"
                            : "Honoree:"}
                    </span>
                    <span>
                      {formData.eventType === "wedding"
                        ? `${formData.groomName || "Groom"} & ${formData.brideName || "Bride"}`
                        : formData.celebrantName}
                      {formData.celebrantAge && ` (${formData.celebrantAge} years old)`}
                      {formData.celebrantGender &&
                        ` - ${formData.celebrantGender.charAt(0).toUpperCase() + formData.celebrantGender.slice(1)}`}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <hr className="my-4" />

            <div>
              <h4 className="font-semibold text-base mb-3 text-rose-600">Scheduling Information</h4>
              <div className="grid gap-2 text-sm pl-4">
                <div className="flex justify-between">
                  <span className="font-medium">Event Date:</span>
                  <span>
                    {formData.eventDate ? format(new Date(formData.eventDate), "EEEE, MMMM d, yyyy") : "Not selected"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Time Slot:</span>
                  <span>{formData.eventTime || "Not selected"}</span>
                </div>
              </div>
            </div>

            <hr className="my-4" />

            <div>
              <h4 className="font-semibold text-base mb-3 text-rose-600">Menu Selection</h4>
              <div className="space-y-3 text-sm pl-4">
                {/* Menu 1 */}
                <div>
                  <span className="font-medium">
                    Menu 1 - Beef, Pork ({formData.menu1Selections?.length || 0} selected):
                  </span>
                  <div className="mt-1 pl-4">
                    {formData.menu1Selections && formData.menu1Selections.length > 0 ? (
                      <ul className="list-disc list-inside space-y-1">
                        {formData.menu1Selections.map((item, index) => (
                          <li key={index} className="text-gray-700 dark:text-gray-300">
                            {item}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <span className="text-gray-500 italic">None selected</span>
                    )}
                  </div>
                </div>

                {/* Menu 2 */}
                <div>
                  <span className="font-medium">
                    Menu 2 - Chicken ({formData.menu2Selections?.length || 0} selected):
                  </span>
                  <div className="mt-1 pl-4">
                    {formData.menu2Selections && formData.menu2Selections.length > 0 ? (
                      <ul className="list-disc list-inside space-y-1">
                        {formData.menu2Selections.map((item, index) => (
                          <li key={index} className="text-gray-700 dark:text-gray-300">
                            {item}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <span className="text-gray-500 italic">None selected</span>
                    )}
                  </div>
                </div>

                {/* Menu 3 */}
                <div>
                  <span className="font-medium">
                    Menu 3 - Seafood, Vegetables ({formData.menu3Selections?.length || 0} selected):
                  </span>
                  <div className="mt-1 pl-4">
                    {formData.menu3Selections && formData.menu3Selections.length > 0 ? (
                      <ul className="list-disc list-inside space-y-1">
                        {formData.menu3Selections.map((item, index) => (
                          <li key={index} className="text-gray-700 dark:text-gray-300">
                            {item}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <span className="text-gray-500 italic">None selected</span>
                    )}
                  </div>
                </div>

                <div>
                  <span className="font-medium">Pasta:</span>
                  <div className="mt-1 pl-4">
                    {formData.pasta && formData.pasta.trim() ? (
                      <ul className="list-disc list-inside space-y-1">
                        {formData.pasta
                          .split(", ")
                          .filter((p) => p.trim())
                          .map((pasta, index) => (
                            <li key={index} className="text-gray-700 dark:text-gray-300">
                              {pasta}
                            </li>
                          ))}
                      </ul>
                    ) : (
                      <span className="text-gray-500 italic">None selected</span>
                    )}
                  </div>
                </div>

                <div>
                  <span className="font-medium">Dessert:</span>
                  <div className="mt-1 pl-4">
                    {formData.dessert && formData.dessert.trim() ? (
                      <ul className="list-disc list-inside space-y-1">
                        {formData.dessert
                          .split(", ")
                          .filter((d) => d.trim())
                          .map((dessert, index) => (
                            <li key={index} className="text-gray-700 dark:text-gray-300">
                              {dessert}
                            </li>
                          ))}
                      </ul>
                    ) : (
                      <span className="text-gray-500 italic">None selected</span>
                    )}
                  </div>
                </div>

                <div>
                  <span className="font-medium">Beverage:</span>
                  <div className="mt-1 pl-4">
                    {formData.beverage && formData.beverage.trim() ? (
                      <ul className="list-disc list-inside space-y-1">
                        {formData.beverage
                          .split(", ")
                          .filter((b) => b.trim())
                          .map((beverage, index) => (
                            <li key={index} className="text-gray-700 dark:text-gray-300">
                              {beverage}
                            </li>
                          ))}
                      </ul>
                    ) : (
                      <span className="text-gray-500 italic">None selected</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <hr className="my-4" />

            {/* Add Backdrop Styling Information for Birthday Events */}
            {formData.eventType === "birthday" && backdropStyle && (
              <>
                <div>
                  <h4 className="font-semibold text-base mb-3 text-rose-600">Backdrop Styling</h4>
                  <div className="grid gap-3 text-sm pl-4">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Selected Backdrop:</span>
                      <span className="font-semibold text-rose-600">{getBackdropName(backdropStyle)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Backdrop Price:</span>
                      <span className="font-semibold text-rose-600">
                        {formatCurrency(getBackdropPrice(backdropStyle))}
                      </span>
                    </div>
                    <div className="bg-rose-50 dark:bg-rose-900/20 p-4 rounded-lg border border-rose-200 dark:border-rose-800">
                      <div className="font-medium text-rose-800 dark:text-rose-200 mb-2">Backdrop Includes:</div>
                      <div className="text-sm text-rose-700 dark:text-rose-300 space-y-1">
                        {getBackdropDetails(backdropStyle)
                          .split("\n")
                          .map((detail, index) => (
                            <div key={index}>{detail}</div>
                          ))}
                      </div>
                    </div>
                  </div>
                </div>

                <hr className="my-4" />
              </>
            )}

            <div>
              <h4 className="font-semibold text-base mb-3 text-rose-600">Package Information</h4>
              <div className="grid gap-3 text-sm pl-4">
                {pricingLoading ? (
                  <div className="flex items-center justify-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-rose-600"></div>
                    <span className="ml-2 text-gray-500">Calculating pricing...</span>
                  </div>
                ) : pricingData ? (
                  <>
                    {pricingData.isWeddingPackage ? (
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">Wedding Package Fee:</span>
                          <span className="font-semibold text-rose-600">
                            {formatCurrency(pricingData.weddingPackagePrice)}
                          </span>
                        </div>
                        <div className="bg-rose-50 dark:bg-rose-900/20 p-4 rounded-lg border border-rose-200 dark:border-rose-800">
                          <div className="font-medium text-rose-800 dark:text-rose-200 mb-2">Package Includes:</div>
                          <ul className="text-sm text-rose-700 dark:text-rose-300 space-y-1 list-disc list-inside">
                            <li>Rice & Drinks</li>
                            <li>Full Skirted Buffet Table w/ Faux Floral Centerpiece</li>
                            <li>Guest Chairs & Tables with Complete Linens & Themed Centerpiece</li>
                            <li>
                              2 (10) Presidential Tables with mix of Artificial & floral runners + Complete Table setup
                              & Glasswares + Crystal Chairs
                            </li>
                            <li>Couple's Table w/ Fresh Floral centerpiece & Couple's Couch</li>
                            <li>Cake Cylinder Plinth</li>
                            <li>White Carpet Aisle</li>
                            <li>Waiters & Food Attendant in Complete Uniform</li>
                            <li className="font-bold">
                              Semi Customized Backdrop Styling with full faux Flower design, Couples Couch + 6x6 Round
                              Flatform Stage with decor + Thematic Tunnel Entrance
                            </li>
                          </ul>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="font-medium">Menu Selections Total:</span>
                          <span className="font-semibold text-rose-600">{formatCurrency(pricingData.subtotal)}</span>
                        </div>
                      </div>
                    ) : pricingData.isDebutPackage ? (
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">Debut Package Fee:</span>
                          <span className="font-semibold text-rose-600">
                            {formatCurrency(pricingData.debutPackagePrice)}
                          </span>
                        </div>
                        <div className="bg-rose-50 dark:bg-rose-900/20 p-4 rounded-lg border border-rose-200 dark:border-rose-800">
                          <div className="font-medium text-rose-800 dark:text-rose-200 mb-2">
                            Debut Package Includes:
                          </div>
                          <ul className="text-sm text-rose-700 dark:text-rose-300 space-y-1 list-disc list-inside">
                            <li>Rice & Drinks</li>
                            <li>Buffet Table with Complete Set-up</li>
                            <li>Tables & Chairs with Complete Linens & Covers</li>
                            <li>Themed Table Centerpiece</li>
                            <li>Basic Backdrop Styling (Free: Letter Cut)</li>
                            <li>Waiters & Food Attendant in complete Uniforms</li>
                            <li>4 Hours Service Time</li>
                            <li className="font-bold">Free Fresh 18 Red Roses & 18 Candles</li>
                          </ul>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="font-medium">Menu Selections Total:</span>
                          <span className="font-semibold text-rose-600">{formatCurrency(pricingData.subtotal)}</span>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex justify-between items-center">
                          <span className="font-medium">Menu Selections Total:</span>
                          <span className="font-semibold text-rose-600">{formatCurrency(pricingData.subtotal)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="font-medium">Service Fee:</span>
                          <span className="font-semibold text-rose-600">{formatCurrency(pricingData.serviceFee)}</span>
                        </div>
                        {/* Add Service Fee Information for non-Wedding and non-Debut events */}
                        {formData.eventType !== "wedding" && formData.eventType !== "debut" && (
                          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                            <div className="font-medium text-blue-800 dark:text-blue-200 mb-2">
                              Service Fee Includes:
                            </div>
                            <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1 list-disc list-inside">
                              <li>Steamed Rice</li>
                              <li>Purified Mineral Water</li>
                              <li>1 Choice of Drink</li>
                              <li>Elegant Buffet Table</li>
                              <li>Guest Chairs & Tables</li>
                              <li>With Complete Setup</li>
                              <li>Table Centerpiece</li>
                              <li>Friendly Waiters & Food Attendant</li>
                              <li>4 Hours Service</li>
                            </ul>
                          </div>
                        )}
                        {formData.eventType === "birthday" && backdropStyle && (
                          <div className="flex justify-between items-center">
                            <span className="font-medium">Backdrop Styling:</span>
                            <span className="font-semibold text-rose-600">
                              {formatCurrency(getBackdropPrice(backdropStyle))}
                            </span>
                          </div>
                        )}
                      </>
                    )}
                    <hr />
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Total Package Amount:</span>
                      <span className="text-lg font-bold text-green-600">
                        {formatCurrency(pricingData.totalAmount)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Down Payment (50%):</span>
                      <span className="text-lg font-semibold text-green-600">
                        {formatCurrency(pricingData.downPayment)}
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    <p>Unable to calculate pricing at this time.</p>
                    <p className="text-sm">Please ensure all required fields are filled.</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-2">
          <label htmlFor="additionalRequests">Additional Requests (Optional)</label>
          <Textarea
            id="additionalRequests"
            name="additionalRequests"
            value={formData.additionalRequests}
            onChange={handleInputChange}
            placeholder="Any special requests, dietary restrictions, setup preferences, or other notes..."
            rows={4}
          />
        </div>
      </div>
    )
  }

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
              <h4 className="text-lg font-semibold text-rose-800">Food Tasting Confirmation</h4>
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
              Click <strong>"Confirm This Date to secure your tasting slot, or skip diretly to payment if preferred"</strong> in the email to confirm your tasting appointment.
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
              3. You can also click "Skip Food Tasting & Proceed to Payment" if you prefer not to have a food tasting day and skip to payment
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Book Your Appointment</h2>
          <p className="text-gray-500 dark:text-gray-400">Step {currentStep} of 3</p>
        </div>
        <div className="flex space-x-2">
          {[1, 2, 3].map((step) => (
            <div
              key={step}
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                step === currentStep
                  ? "bg-rose-600 text-white"
                  : step < currentStep
                    ? "bg-green-600 text-white"
                    : "bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400",
              )}
            >
              {step}
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}

        <div className="flex justify-between pt-6">
          {currentStep > 1 ? (
            <Button type="button" variant="outline" onClick={handleBack} disabled={isSubmitting || isBookingComplete}>
              <ChevronLeft className="mr-2 h-4 w-4" /> Back
            </Button>
          ) : (
            <div />
          )}

          <div className="flex gap-2">
            {onChangeEventType && currentStep === 1 && (
              <Button
                type="button"
                variant="outline"
                onClick={onChangeEventType}
                disabled={isSubmitting || isBookingComplete}
              >
                Change Event Type
              </Button>
            )}
            {currentStep < 3 ? (
              <Button
                type="button"
                onClick={handleNext}
                className="bg-rose-600 hover:bg-rose-700"
                disabled={isSubmitting || isBookingComplete}
              >
                Next <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={isSubmitting || isBookingComplete}
                className="bg-rose-600 hover:bg-rose-700"
              >
                {isSubmitting ? "Booking..." : isBookingComplete ? "Booked!" : "Book Appointment"}
              </Button>
            )}
          </div>
        </div>
      </form>
    </div>
  )
}

export default function BookingForm(props: BookingFormProps) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BookingFormContent {...props} />
    </Suspense>
  )
}
