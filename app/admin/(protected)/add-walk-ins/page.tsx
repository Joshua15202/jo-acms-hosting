"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { SmartCalendar } from "@/components/smart-calendar"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { formatCurrency, calculatePackagePricing, type MenuSelections } from "@/lib/pricing-calculator"

// Address data
const addressData = {
  "Metro Manila": {
    "Quezon City": [
      "Alicia",
      "Amihan",
      "Apolonio Samson",
      "Baesa",
      "Bagbag",
      "Bagong Lipunan ng Crame",
      "Bagong Pag-asa",
      "Bagong Silangan",
      "Bagumbayan",
      "Bagumbuhay",
      "Bahay Toro",
      "Balingasa",
      "Balong Bato",
      "Batasan Hills",
      "Bayanihan",
      "Blue Ridge A",
      "Blue Ridge B",
      "Botocan",
      "Bungad",
      "Camp Aguinaldo",
      "Capri",
      "Central",
      "Claro",
      "Commonwealth",
      "Culiat",
      "Damar",
      "Damayan",
      "Damayang Lagi",
      "Del Monte",
      "Dioquino Zobel",
      "Don Manuel",
      "Doña Imelda",
      "Doña Josefa",
      "Duyan-Duyan",
      "E. Rodriguez",
      "East Kamias",
      "Escopa I",
      "Escopa II",
      "Escopa III",
      "Escopa IV",
      "Fairview",
      "Greater Lagro",
      "Gulod",
      "Holy Spirit",
      "Horseshoe",
      "Immaculate Conception",
      "Kaligayahan",
      "Kalusugan",
      "Kamuning",
      "Katipunan",
      "Kaunlaran",
      "Kristong Hari",
      "Krus na Ligas",
      "Laging Handa",
      "Libis",
      "Lourdes",
      "Loyola Heights",
      "Maharlika",
      "Malaya",
      "Mangga",
      "Manresa",
      "Marcelo del Pilar",
      "Mariana",
      "Mariblo",
      "Marilag",
      "Masagana",
      "Masambong",
      "Matandang Balara",
      "Milagrosa",
      "N.S. Amoranto",
      "Nagkaisang Nayon",
      "Natong",
      "New Era",
      "North Fairview",
      "Novaliches Proper",
      "Obrero",
      "Old Capitol Site",
      "Pacita Complex",
      "Pag-ibig sa Nayon",
      "Paligsahan",
      "Paltok",
      "Pansol",
      "Paraiso",
      "Pasong Putik Proper",
      "Pasong Tamo",
      "Payatas",
      "Phil-Am",
      "Pinagkaisahan",
      "Pinyahan",
      "Project 6",
      "Quirino 2-A",
      "Quirino 2-B",
      "Quirino 2-C",
      "Quirino 3-A",
      "Ramon Magsaysay",
      "Roxas",
      "Sacred Heart",
      "Saint Ignatius",
      "Saint Peter",
      "Salvacion",
      "San Agustin",
      "San Antonio",
      "San Bartolome",
      "San Isidro",
      "San Isidro Labrador",
      "San Jose",
      "San Martin de Porres",
      "San Roque",
      "San Vicente",
      "Sangandaan",
      "Santa Cruz",
      "Santa Lucia",
      "Santa Monica",
      "Santa Teresita",
      "Santo Cristo",
      "Santo Niño",
      "Santol",
      "Sauyo",
      "Sienna",
      "Sikatuna Village",
      "Silangan",
      "South Triangle",
      "Tagumpay",
      "Talampas",
      "Talayan",
      "Talipapa",
      "Tandang Sora",
      "Tatalon",
      "Teachers Village East",
      "Teachers Village West",
      "Ugong Norte",
      "Unang Sigaw",
      "UP Campus",
      "UP Village",
      "Valencia",
      "Vasra",
      "Veterans Village",
      "Villa Maria Clara",
      "West Kamias",
      "West Triangle",
      "White Plains",
    ],
    Valenzuela: [
      "Arkong Bato",
      "Bagbaguin",
      "Balangkas",
      "Bignay",
      "Bisig",
      "Canumay East",
      "Canumay West",
      "Coloong",
      "Dalandanan",
      "Galutan",
      "Gen. T. de Leon",
      "Isla",
      "Karuhatan",
      "Lawang Bato",
      "Lingunan",
      "Mabolo",
      "Malanday",
      "Malinta",
      "Mapulang Lupa",
      "Marulas",
      "Maysan",
      "Palasan",
      "Parada",
      "Pariancillo Villa",
      "Pasolo",
      "Paso de Blas",
      "Poblacion",
      "Pulo",
      "Punturin",
      "Rincon",
      "Tagalag",
      "Ugong",
    ],
    Malabon: [
      "Acacia",
      "Baritan",
      "Bayan-bayanan",
      "Catmon",
      "Concepcion",
      "Dampalit",
      "Flores",
      "Hulong Duhat",
      "Ibaba",
      "Longos",
      "Maysilo",
      "Muzon",
      "Niugan",
      "Panghulo",
      "Potrero",
      "San Agustin",
      "Santolan",
      "Tañong",
      "Tinajeros",
      "Tonsuya",
      "Tugatog",
    ],
  },
  Bulacan: {
    Malolos: [
      "Anilao",
      "Atlag",
      "Babatnin",
      "Bagna",
      "Bagong Bayan",
      "Balayong",
      "Balite",
      "Bangkal",
      "Barihan",
      "Bulihan",
      "Bungahan",
      "Caingin",
      "Calero",
      "Caliligawan",
      "Canalate",
      "Caniogan",
      "Catmon",
      "Cofradia",
      "Dakila",
      "Guinhawa",
      "Ligas",
      "Liyang",
      "Longos",
      "Look 1st",
      "Look 2nd",
      "Lugam",
      "Mabolo",
      "Mambog",
      "Masile",
      "Matimbo",
      "Mojon",
      "Namayan",
      "Niugan",
      "Pamarawan",
      "Panasahan",
      "Parasahan",
      "Pembuhan",
      "San Agustin",
      "San Gabriel",
      "San Juan",
      "San Pablo",
      "San Vicente",
      "Santiago",
      "Santisima Trinidad",
      "Santo Cristo",
      "Santo Niño",
      "Santo Rosario",
      "Santol",
      "Sumapang Bata",
      "Sumapang Matanda",
      "Taal",
      "Tikay",
    ],
    Meycauayan: [
      "Bagbaguin",
      "Bahay Pare",
      "Bancal",
      "Banga",
      "Bayugo",
      "Caingin",
      "Calvario",
      "Camalig",
      "Hulo",
      "Iba",
      "Langka",
      "Lawa",
      "Libtong",
      "Liputan",
      "Longos",
      "Malhacan",
      "Pajo",
      "Pandayan",
      "Pantoc",
      "Perez",
      "Poblacion",
      "Saluysoy",
      "St. Francis",
      "Tugatog",
    ],
    Pandi: [
      "Bagbaguin",
      "Bagong Barrio",
      "Baka-bakahan",
      "Bunsuran 1st",
      "Bunsuran 2nd",
      "Bunsuran 3rd",
      "Cacarong Bata",
      "Cacarong Matanda",
      "Cupang",
      "Malibo",
      "Mapulang Lupa",
      "Masagana",
      "Masuso",
      "Pinagkuartelan",
      "Poblacion",
      "Real de Cacarong",
      "Siling Bata",
      "Siling Matanda",
      "Sipat",
      "Santo Rosario",
      "Manatal",
    ],
    Marilao: [
      "Abangan Norte",
      "Abangan Sur",
      "Ibayo",
      "Loma de Gato",
      "Lias",
      "Nagbalon",
      "Patubig",
      "Poblacion I",
      "Poblacion II",
      "Prenza I",
      "Prenza II",
      "Santa Rosa I",
      "Santa Rosa II",
      "Saog",
      "Tabing Ilog",
      "Lambakin",
    ],
  },
}

export default function AddWalkInsPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [menuItems, setMenuItems] = useState<any[]>([])
  const [pricingData, setPricingData] = useState<any>(null)

  // Step 1: Personal Information
  const [personalInfo, setPersonalInfo] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  })

  // Step 2: Date & Time
  const [dateTime, setDateTime] = useState({
    eventDate: "",
    eventTime: "",
  })

  // Step 3: Event Type
  const [eventType, setEventType] = useState("")
  const [eventSpecificData, setEventSpecificData] = useState({
    // Birthday
    celebrantName: "",
    celebrantAge: "",
    celebrantGender: "",
    backdropOption: "", // This was backdropStyling before
    // Wedding
    groomName: "",
    brideName: "",
    // Debut
    debutanteName: "",
    debutanteGender: "", // Added debutanteGender for debut events
    // Other
    eventDetails: "",
  })

  // Step 4: Event Details
  const [eventDetails, setEventDetails] = useState({
    guestCount: "",
    venueName: "",
    venueProvince: "",
    venueCity: "",
    venueBarangay: "",
    streetAddress: "",
    postalCode: "",
    eventTheme: "",
    colorMotif: "",
  })

  // Step 5: Menu Selection
  const [selectedMenus, setSelectedMenus] = useState<{ [key: string]: string[] }>({
    menu1: [], // Beef & Pork combined
    menu2: [], // Chicken
    menu3: [], // Seafood & Vegetables combined
    pasta: [],
    dessert: [],
    beverage: [],
  })

  const [menuLimits, setMenuLimits] = useState({
    menu1: 1, // Combined beef & pork limit
    menu2: 1, // Chicken limit
    menu3: 1, // Combined seafood & vegetables limit
    pasta: 1,
    dessert: 1,
    beverage: 1,
  })

  // Placeholder for additionalRequests to be managed globally
  const [walkInData, setWalkInData] = useState({
    additionalRequests: "",
  })

  // Fetch menu items
  useEffect(() => {
    fetch("/api/menu-items")
      .then((res) => res.json())
      .then((data) => {
        // API returns { success: true, menuItems: { beef: [...], chicken: [...] } }
        // Convert to flat array for easier filtering
        const menuItemsObj = data.menuItems || {}
        const flatItems: any[] = []

        Object.keys(menuItemsObj).forEach((category) => {
          if (Array.isArray(menuItemsObj[category])) {
            flatItems.push(...menuItemsObj[category])
          }
        })

        setMenuItems(flatItems)
      })
      .catch((err) => console.error("Error fetching menu items:", err))
  }, [])

  // Navigation functions
  const handleNext = () => {
    if (validateCurrentStep()) {
      setCurrentStep((prev) => prev + 1)
      setError("")
    }
  }

  const handleBack = () => {
    setCurrentStep((prev) => prev - 1)
    setError("")
  }

  const validateCurrentStep = () => {
    setError("")
    // **START UPDATED CODE**
    if (currentStep === 1) {
      // Renumbered steps to match UI, 0 is now 1, etc.
      if (!personalInfo.firstName || !personalInfo.lastName || !personalInfo.email || !personalInfo.phone) {
        setError("Please fill in all personal information fields")
        return false
      }
      const phoneRegex = /^09\d{9}$/
      if (!phoneRegex.test(personalInfo.phone)) {
        setError("Please enter a valid Philippine mobile number (09XXXXXXXXX)")
        return false
      }
    } else if (currentStep === 2) {
      if (!dateTime.eventDate || !dateTime.eventTime) {
        setError("Please select event date and time")
        return false
      }
    } else if (currentStep === 3) {
      if (!eventType) {
        setError("Please select an event type")
        return false
      }
      // Validate event-specific fields
      if (eventType === "wedding") {
        if (!eventSpecificData.groomName || !eventSpecificData.brideName) {
          setError("Please fill in all wedding information")
          return false
        }
      } else if (eventType === "birthday") {
        if (
          !eventSpecificData.celebrantName ||
          !eventSpecificData.celebrantAge ||
          !eventSpecificData.celebrantGender ||
          !eventSpecificData.backdropOption
        ) {
          setError("Please fill in all celebrant information and select backdrop styling")
          return false
        }
      } else if (eventType === "debut") {
        if (!eventSpecificData.debutanteName || !eventSpecificData.debutanteGender) {
          setError("Please fill in all debutante information")
          return false
        }
      } else if (eventType === "other" && !eventSpecificData.eventDetails) {
        setError("Please provide event details")
        return false
      }
    } else if (currentStep === 4) {
      if (
        !eventDetails.guestCount ||
        !eventDetails.venueName ||
        !eventDetails.venueProvince ||
        !eventDetails.venueCity ||
        !eventDetails.venueBarangay ||
        !eventDetails.streetAddress
      ) {
        setError("Please fill in all required venue information fields")
        return false
      }
    } else if (currentStep === 5) {
      if ((selectedMenus.menu1?.length || 0) === 0) {
        setError("Please select at least one dish from Menu 1 (Beef, Pork)")
        return false
      }
      if ((selectedMenus.menu2?.length || 0) === 0) {
        setError("Please select at least one dish from Menu 2 (Chicken)")
        return false
      }
      if ((selectedMenus.menu3?.length || 0) === 0) {
        setError("Please select at least one dish from Menu 3 (Seafood, Vegetables)")
        return false
      }
      if ((selectedMenus.pasta?.length || 0) === 0) {
        setError("Please select at least one Pasta dish")
        return false
      }
      if ((selectedMenus.dessert?.length || 0) === 0) {
        setError("Please select at least one Dessert")
        return false
      }
      if ((selectedMenus.beverage?.length || 0) === 0) {
        setError("Please select at least one Beverage")
        return false
      }
    } else if (currentStep === 6) {
      // No specific validation for step 6, but review is important
    }
    // **END UPDATED CODE**
    return true
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setError("")

    try {
      const response = await fetch("/api/admin/walk-ins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...personalInfo,
          ...dateTime,
          eventType,
          ...eventSpecificData,
          ...eventDetails,
          selectedMenus,
          additionalRequests: walkInData.additionalRequests, // Use the new state for additionalRequests
          // Include pricing details in submission
          pricingData: {
            ...pricingData,
            // Convert menu selections to the format expected by the backend
            menuSelections: {
              mainCourses: [
                ...(selectedMenus.menu1 || []),
                ...(selectedMenus.menu2 || []),
                ...(selectedMenus.menu3 || []),
              ],
              pasta: selectedMenus.pasta || [],
              dessert: selectedMenus.dessert || [],
              beverage: selectedMenus.beverage || [],
            },
          },
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to add walk-in appointment")
      }

      router.push("/admin/appointments")
    } catch (err: any) {
      setError(err.message)
      setIsSubmitting(false)
    }
  }

  const handleDateTimeSelect = (date: string, time: string) => {
    setDateTime({ eventDate: date, eventTime: time })
  }

  const toggleMenuItem = (menuType: string, itemId: string) => {
    setSelectedMenus((prev) => {
      const current = prev[menuType] || []
      const isSelected = current.includes(itemId)

      if (isSelected) {
        return { ...prev, [menuType]: current.filter((id) => id !== itemId) }
      } else {
        if (current.length >= menuLimits[menuType as keyof typeof menuLimits]) {
          return prev
        }
        return { ...prev, [menuType]: [...current, itemId] }
      }
    })
  }

  const increaseLimit = (menuType: string) => {
    setMenuLimits((prev) => ({
      ...prev,
      [menuType]: prev[menuType as keyof typeof prev] + 1,
    }))
  }

  const getCitiesForProvince = (province: string) => {
    return Object.keys(addressData[province as keyof typeof addressData] || {})
  }

  const getBarangaysForCity = (province: string, city: string) => {
    const provinceData = addressData[province as keyof typeof addressData]
    if (!provinceData) return []
    return provinceData[city as keyof typeof provinceData] || []
  }

  const formatGender = (gender: string) => {
    if (gender === "other") return "Rather not say"
    return gender.charAt(0).toUpperCase() + gender.slice(1)
  }

  const getEndTime = (startTime: string) => {
    if (!startTime) return "Not selected"

    const timeParts = startTime.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i)
    if (!timeParts) return startTime

    let hours = Number.parseInt(timeParts[1])
    const minutes = timeParts[2]
    const period = timeParts[3]?.toUpperCase()

    if (period === "PM" && hours !== 12) {
      hours += 12
    } else if (period === "AM" && hours === 12) {
      hours = 0
    }

    const endHours = (hours + 4) % 24

    const startHours12 = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours
    const startPeriod = hours >= 12 ? "PM" : "AM"
    const startTimeFormatted = `${startHours12}:${minutes} ${startPeriod}`

    const endHours12 = endHours === 0 ? 12 : endHours > 12 ? endHours - 12 : endHours
    const endPeriod = endHours >= 12 ? "PM" : "AM"
    const endTimeFormatted = `${endHours12}:${minutes} ${endPeriod}`

    return `${startTimeFormatted} - ${endTimeFormatted}`
  }

  // This function is no longer directly used in the new pricing calculation but kept for reference.
  // The new pricing logic is handled within the useEffect for Step 6.
  const getBackdropPrice = (backdropType: string): number => {
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
  }

  useEffect(() => {
    if (currentStep === 6) {
      const calculatePricing = async () => {
        try {
          const guestCount = Number.parseInt(eventDetails.guestCount) || 0

          const menuSelections: MenuSelections = {
            mainCourses: [
              ...(selectedMenus.menu1 || []),
              ...(selectedMenus.menu2 || []),
              ...(selectedMenus.menu3 || []),
            ],
            pasta: selectedMenus.pasta || [],
            dessert: selectedMenus.dessert || [],
            beverage: selectedMenus.beverage || [],
          }

          const basePricing = await calculatePackagePricing(guestCount, menuSelections, eventType)

          const isWedding = eventType === "wedding"
          const isDebut = eventType === "debut"

          // Backdrop price is now determined by eventSpecificData.backdropOption in the review step
          const backdropPrice = 0

          const finalPricing = {
            ...basePricing,
            backdropPrice, // This will be recalculated in the review step based on the selected option
            totalAmount: basePricing.total + backdropPrice,
            downPayment: Math.round((basePricing.total + backdropPrice) * 0.5),
            isWeddingPackage: isWedding,
            isDebutPackage: isDebut,
          }

          setPricingData(finalPricing)
        } catch (error) {
          console.error("Error calculating pricing:", error)
        }
      }

      calculatePricing()
    }
  }, [currentStep, eventDetails.guestCount, selectedMenus, eventType, eventSpecificData.backdropOption]) // Updated dependency to backdropOption

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-rose-600 mb-2">Add Walk-In Customer</h1>
        <p className="text-gray-600">Step {currentStep} of 6</p>
      </div>

      {/* Stepper */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {[1, 2, 3, 4, 5, 6].map((step) => (
            <div key={step} className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  currentStep >= step ? "bg-rose-600 text-white" : "bg-gray-200 text-gray-500"
                }`}
              >
                {step}
              </div>
              {step < 6 && <div className={`w-12 h-1 ${currentStep > step ? "bg-rose-600" : "bg-gray-200"}`} />}
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2 text-xs text-gray-600">
          <span>Personal Info</span>
          <span>Date & Time</span>
          <span>Event Type</span>
          <span>Event Details</span>
          <span>Menu</span>
          <span>Review</span>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Step 1: Personal Information */}
      {currentStep === 1 && (
        <Card>
          <CardContent className="pt-6">
            <h2 className="text-xl font-semibold mb-4">Customer Personal Information</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    value={personalInfo.firstName}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, firstName: e.target.value })}
                    placeholder="Enter first name"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={personalInfo.lastName}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, lastName: e.target.value })}
                    placeholder="Enter last name"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={personalInfo.email}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, email: e.target.value })}
                  placeholder="customer@example.com"
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  value={personalInfo.phone}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, phone: e.target.value })}
                  placeholder="+63 XXX XXX XXXX"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Date & Time */}
      {currentStep === 2 && (
        <Card>
          <CardContent className="pt-6">
            <h2 className="text-xl font-semibold mb-4">Select Event Date & Time</h2>
            <SmartCalendar
              onDateTimeSelect={handleDateTimeSelect}
              selectedDate={dateTime.eventDate}
              selectedTime={dateTime.eventTime}
            />
          </CardContent>
        </Card>
      )}

      {/* Step 3: Event Type */}
      {currentStep === 3 && (
        <Card>
          <CardContent className="pt-6">
            <h2 className="text-xl font-semibold mb-4">Event Type & Details</h2>
            <div className="space-y-6">
              <div>
                <Label>Select Event Type *</Label>
                <Select value={eventType} onValueChange={setEventType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose event type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="birthday">Birthday</SelectItem>
                    <SelectItem value="wedding">Wedding</SelectItem>
                    <SelectItem value="debut">Debut</SelectItem>
                    <SelectItem value="corporate">Corporate Event</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Birthday Fields */}
              {eventType === "birthday" && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="celebrant-name">Celebrant's Name *</Label>
                    <Input
                      id="celebrant-name"
                      value={eventSpecificData.celebrantName || ""}
                      onChange={(e) =>
                        setEventSpecificData({
                          ...eventSpecificData,
                          celebrantName: e.target.value,
                        })
                      }
                      placeholder="Enter celebrant's name"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="celebrant-age">Celebrant's Age *</Label>
                      <Input
                        id="celebrant-age"
                        type="number"
                        value={eventSpecificData.celebrantAge || ""}
                        onChange={(e) =>
                          setEventSpecificData({
                            ...eventSpecificData,
                            celebrantAge: e.target.value,
                          })
                        }
                        placeholder="Enter age"
                      />
                    </div>
                    <div>
                      <Label htmlFor="celebrant-gender">Celebrant's Gender *</Label>
                      <Select
                        value={eventSpecificData.celebrantGender || ""}
                        onValueChange={(value) =>
                          setEventSpecificData({
                            ...eventSpecificData,
                            celebrantGender: value,
                          })
                        }
                      >
                        <SelectTrigger id="celebrant-gender">
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Male">Male</SelectItem>
                          <SelectItem value="Female">Female</SelectItem>
                          <SelectItem value="Rather not say">Rather not say</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label>Backdrop Styling Options *</Label>
                    <RadioGroup
                      value={eventSpecificData.backdropOption} // Use backdropOption here
                      onValueChange={(value) =>
                        setEventSpecificData({
                          ...eventSpecificData,
                          backdropOption: value, // Update backdropOption
                        })
                      }
                    >
                      <div className="space-y-3">
                        <div className="flex items-start space-x-2 p-4 border rounded">
                          <RadioGroupItem value="single" id="backdrop-single" className="mt-1" />
                          <Label htmlFor="backdrop-single" className="flex-1 cursor-pointer">
                            <div className="flex items-center justify-between mb-2">
                              <p className="font-medium">Single Panel Backdrop</p>
                              <p className="text-sm font-semibold text-primary">{formatCurrency(7000)}</p>
                            </div>
                            <p className="text-sm font-medium mb-1">Includes:</p>
                            <ul className="text-xs text-gray-600 space-y-0.5 list-disc list-inside">
                              <li>(3) Regular Colored Balloon Garlands</li>
                              <li>Cut-out Name</li>
                              <li>Faux Grass Carpet</li>
                              <li>Celebrant's Accent Chair</li>
                              <li>Cake Cylinder Plinth</li>
                            </ul>
                          </Label>
                        </div>
                        <div className="flex items-start space-x-2 p-4 border rounded">
                          <RadioGroupItem value="double" id="backdrop-double" className="mt-1" />
                          <Label htmlFor="backdrop-double" className="flex-1 cursor-pointer">
                            <div className="flex items-center justify-between mb-2">
                              <p className="font-medium">Double Panel Backdrop</p>
                              <p className="text-sm font-semibold text-primary">{formatCurrency(8000)}</p>
                            </div>
                            <p className="text-sm font-medium mb-1">Includes:</p>
                            <ul className="text-xs text-gray-600 space-y-0.5 list-disc list-inside">
                              <li>(3) Regular Colored Balloon Garlands</li>
                              <li>Cut-out Name</li>
                              <li>Faux Grass Carpet</li>
                              <li>Celebrant's Accent Chair</li>
                              <li>Cake Cylinder Plinth</li>
                              <li>Basic Balloon Entrance Arch</li>
                            </ul>
                          </Label>
                        </div>
                        <div className="flex items-start space-x-2 p-4 border rounded">
                          <RadioGroupItem value="triple" id="backdrop-triple" className="mt-1" />
                          <Label htmlFor="backdrop-triple" className="flex-1 cursor-pointer">
                            <div className="flex items-center justify-between mb-2">
                              <p className="font-medium">Triple Panel Backdrop</p>
                              <p className="text-sm font-semibold text-primary">{formatCurrency(10000)}</p>
                            </div>
                            <p className="text-sm font-medium mb-1">Includes:</p>
                            <ul className="text-xs text-gray-600 space-y-0.5 list-disc list-inside">
                              <li>(3-4) Regular Colored Balloon Garlands</li>
                              <li>Cut-out Name</li>
                              <li>Faux Grass Carpet</li>
                              <li>Celebrant's Accent Chair</li>
                              <li>Cake Cylinder Plinth</li>
                              <li>Basic Balloon Entrance Arch</li>
                              <li>18×24 Sintra Board Welcome Signage</li>
                              <li>(2) 2D Styro Character Standee</li>
                            </ul>
                          </Label>
                        </div>
                      </div>
                    </RadioGroup>
                  </div>
                </div>
              )}

              {/* Wedding Fields */}
              {eventType === "wedding" && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="groomName">Groom's Name *</Label>
                    <Input
                      id="groomName"
                      type="text"
                      placeholder="Enter groom's name"
                      value={eventSpecificData.groomName || ""}
                      onChange={(e) =>
                        setEventSpecificData({
                          ...eventSpecificData,
                          groomName: e.target.value,
                        })
                      }
                      className={!eventSpecificData.groomName && "border-red-300"}
                    />
                  </div>

                  <div>
                    <Label htmlFor="brideName">Bride's Name *</Label>
                    <Input
                      id="brideName"
                      type="text"
                      placeholder="Enter bride's name"
                      value={eventSpecificData.brideName || ""}
                      onChange={(e) =>
                        setEventSpecificData({
                          ...eventSpecificData,
                          brideName: e.target.value,
                        })
                      }
                      className={!eventSpecificData.brideName && "border-red-300"}
                    />
                  </div>
                </div>
              )}

              {/* Debut Fields */}
              {eventType === "debut" && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="debutanteName">Debutante's Name *</Label>
                    <Input
                      id="debutanteName"
                      type="text"
                      placeholder="Enter debutante's name"
                      value={eventSpecificData.debutanteName || ""}
                      onChange={(e) =>
                        setEventSpecificData({
                          ...eventSpecificData,
                          debutanteName: e.target.value,
                        })
                      }
                      className={!eventSpecificData.debutanteName && "border-red-300"}
                    />
                  </div>

                  <div>
                    <Label htmlFor="debutanteGender">Debutante's Gender *</Label>
                    <Select
                      value={eventSpecificData.debutanteGender || ""}
                      onValueChange={(value) =>
                        setEventSpecificData({
                          ...eventSpecificData,
                          debutanteGender: value,
                        })
                      }
                    >
                      <SelectTrigger className={!eventSpecificData.debutanteGender && "border-red-300"}>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Rather not say</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {/* Corporate Fields - REMOVED per update */}

              {/* Other Event */}
              {eventType === "other" && (
                <div>
                  <Label htmlFor="eventDetails">Event Details *</Label>
                  <Input
                    id="eventDetails"
                    value={eventSpecificData.eventDetails}
                    onChange={(e) =>
                      setEventSpecificData({
                        ...eventSpecificData,
                        eventDetails: e.target.value,
                      })
                    }
                    placeholder="E.g., Anniversary, Christening, Graduation"
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Event Details */}
      {currentStep === 4 && (
        <Card>
          <CardContent className="pt-6">
            <h2 className="text-xl font-semibold mb-4">Event Details</h2>
            <div className="space-y-4">
              <div>
                <Label>Number of Guests *</Label>
                <Select
                  value={eventDetails.guestCount}
                  onValueChange={(value) => setEventDetails({ ...eventDetails, guestCount: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select guest count" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="50">50 guests</SelectItem>
                    {eventType !== "wedding" && <SelectItem value="80">80 guests</SelectItem>}
                    <SelectItem value="100">100 guests</SelectItem>
                    <SelectItem value="150">150 guests</SelectItem>
                    <SelectItem value="200">200 guests</SelectItem>
                    {eventType === "wedding" && <SelectItem value="300">300 guests</SelectItem>}
                  </SelectContent>
                </Select>
              </div>

              <div className="border-t pt-4 mt-4">
                <h3 className="font-semibold mb-3">Venue Information</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="venueName">Venue/Hall Name *</Label>
                    <Input
                      id="venueName"
                      value={eventDetails.venueName}
                      onChange={(e) => setEventDetails({ ...eventDetails, venueName: e.target.value })}
                      placeholder="e.g., Blessed Hall, Garden Pavilion"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Province *</Label>
                      <Select
                        value={eventDetails.venueProvince}
                        onValueChange={(value) => {
                          setEventDetails({
                            ...eventDetails,
                            venueProvince: value,
                            venueCity: "",
                            venueBarangay: "",
                          })
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select province" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Metro Manila">Metro Manila</SelectItem>
                          <SelectItem value="Bulacan">Bulacan</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>City/Municipality *</Label>
                      <Select
                        value={eventDetails.venueCity}
                        onValueChange={(value) => {
                          setEventDetails({
                            ...eventDetails,
                            venueCity: value,
                            venueBarangay: "",
                          })
                        }}
                        disabled={!eventDetails.venueProvince}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select city/municipality" />
                        </SelectTrigger>
                        <SelectContent>
                          {getCitiesForProvince(eventDetails.venueProvince).map((city) => (
                            <SelectItem key={city} value={city}>
                              {city}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label>Barangay *</Label>
                    <Select
                      value={eventDetails.venueBarangay}
                      onValueChange={(value) => setEventDetails({ ...eventDetails, venueBarangay: value })}
                      disabled={!eventDetails.venueCity}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select barangay" />
                      </SelectTrigger>
                      <SelectContent>
                        {getBarangaysForCity(eventDetails.venueProvince, eventDetails.venueCity).map((barangay) => (
                          <SelectItem key={barangay} value={barangay}>
                            {barangay}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="streetAddress">Street Address *</Label>
                      <Input
                        id="streetAddress"
                        value={eventDetails.streetAddress}
                        onChange={(e) =>
                          setEventDetails({
                            ...eventDetails,
                            streetAddress: e.target.value,
                          })
                        }
                        placeholder="e.g., 123 Main Street"
                      />
                    </div>
                    <div>
                      <Label htmlFor="postalCode">Postal Code</Label>
                      <Input
                        id="postalCode"
                        value={eventDetails.postalCode}
                        onChange={(e) => setEventDetails({ ...eventDetails, postalCode: e.target.value })}
                        placeholder="e.g., 1400"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <Alert className="bg-blue-50 border-blue-200">
                <AlertDescription className="text-blue-800">
                  <strong>Service Area:</strong> Jo Pacheco serves Fairview, Valenzuela, Quezon City, Malolos,
                  Novaliches, Malabon, Meycauayan, Pandi, and Marilao.
                </AlertDescription>
              </Alert>

              <div className="border-t pt-4 mt-4">
                <h3 className="font-semibold mb-3">Additional Details (Optional)</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="eventTheme">Event Theme</Label>
                    <Input
                      id="eventTheme"
                      value={eventDetails.eventTheme}
                      onChange={(e) => setEventDetails({ ...eventDetails, eventTheme: e.target.value })}
                      placeholder="Enter event theme"
                    />
                  </div>
                  <div>
                    <Label htmlFor="colorMotif">Color Motif</Label>
                    <Input
                      id="colorMotif"
                      value={eventDetails.colorMotif}
                      onChange={(e) => setEventDetails({ ...eventDetails, colorMotif: e.target.value })}
                      placeholder="Enter color motif"
                    />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 5: Menu Selection */}
      {currentStep === 5 && (
        <Card>
          <CardContent className="pt-6">
            <h2 className="text-xl font-semibold mb-4">Menu Composition & Selection</h2>
            <p className="text-gray-600 mb-6">
              Select one item per menu (Menu 1-3). Use "+1 More" to add additional selections from the same menu.
            </p>

            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-base">🥩 Menu 1: Beef, Pork</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">
                      {selectedMenus.menu1?.length || 0}/{menuLimits.menu1} selected
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => increaseLimit("menu1")}
                      className="h-8 px-3 text-xs"
                    >
                      +1 More
                    </Button>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  {["beef", "pork"].map((category) => (
                    <div key={category} className="border rounded-lg p-4 space-y-3">
                      <h4 className="font-medium capitalize text-gray-700 border-b pb-2">{category}</h4>
                      <div className="space-y-2">
                        {(menuItems || [])
                          .filter((item) => item.category === category)
                          .map((item) => {
                            const isSelected = selectedMenus.menu1?.includes(item.id) || false
                            const isDisabled = !isSelected && (selectedMenus.menu1?.length || 0) >= menuLimits.menu1

                            return (
                              <label
                                key={item.id}
                                className={`flex items-start space-x-2 cursor-pointer hover:bg-gray-50 p-1 rounded ${
                                  isDisabled ? "opacity-50 cursor-not-allowed" : ""
                                }`}
                              >
                                <Checkbox
                                  id={`menu1-${item.id}`}
                                  checked={isSelected}
                                  onCheckedChange={() => !isDisabled && toggleMenuItem("menu1", item.id)}
                                  disabled={isDisabled}
                                  className="mt-1"
                                />
                                <div className="flex-1">
                                  <span className="text-sm leading-tight">{item.name}</span>
                                </div>
                              </label>
                            )
                          })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-base">🐔 Menu 2: Chicken</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">
                      {selectedMenus.menu2?.length || 0}/{menuLimits.menu2} selected
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => increaseLimit("menu2")}
                      className="h-8 px-3 text-xs"
                    >
                      +1 More
                    </Button>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
                  <div className="border rounded-lg p-4 space-y-3">
                    <h4 className="font-medium capitalize text-gray-700 border-b pb-2">Chicken</h4>
                    <div className="space-y-2">
                      {(menuItems || [])
                        .filter((item) => item.category === "chicken")
                        .map((item) => {
                          const isSelected = selectedMenus.menu2?.includes(item.id) || false
                          const isDisabled = !isSelected && (selectedMenus.menu2?.length || 0) >= menuLimits.menu2

                          return (
                            <label
                              key={item.id}
                              className={`flex items-start space-x-2 cursor-pointer hover:bg-gray-50 p-1 rounded ${
                                isDisabled ? "opacity-50 cursor-not-allowed" : ""
                              }`}
                            >
                              <Checkbox
                                id={`menu2-${item.id}`}
                                checked={isSelected}
                                onCheckedChange={() => !isDisabled && toggleMenuItem("menu2", item.id)}
                                disabled={isDisabled}
                                className="mt-1"
                              />
                              <div className="flex-1">
                                <span className="text-sm leading-tight">{item.name}</span>
                              </div>
                            </label>
                          )
                        })}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-base">🐟 Menu 3: Seafood, Vegetables</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">
                      {selectedMenus.menu3?.length || 0}/{menuLimits.menu3} selected
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => increaseLimit("menu3")}
                      className="h-8 px-3 text-xs"
                    >
                      +1 More
                    </Button>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  {["seafood", "vegetables"].map((category) => (
                    <div key={category} className="border rounded-lg p-4 space-y-3">
                      <h4 className="font-medium capitalize text-gray-700 border-b pb-2">
                        {category === "seafood" ? "Seafood" : "Vegetables"}
                      </h4>
                      <div className="space-y-2">
                        {(menuItems || [])
                          .filter((item) => item.category === category)
                          .map((item) => {
                            const isSelected = selectedMenus.menu3?.includes(item.id) || false
                            const isDisabled = !isSelected && (selectedMenus.menu3?.length || 0) >= menuLimits.menu3

                            return (
                              <label
                                key={item.id}
                                className={`flex items-start space-x-2 cursor-pointer hover:bg-gray-50 p-1 rounded ${
                                  isDisabled ? "opacity-50 cursor-not-allowed" : ""
                                }`}
                              >
                                <Checkbox
                                  id={`menu3-${item.id}`}
                                  checked={isSelected}
                                  onCheckedChange={() => !isDisabled && toggleMenuItem("menu3", item.id)}
                                  disabled={isDisabled}
                                  className="mt-1"
                                />
                                <div className="flex-1">
                                  <span className="text-sm leading-tight">{item.name}</span>
                                </div>
                              </label>
                            )
                          })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-6">
                <h4 className="text-base font-medium mb-4">🍽️ Extras: Pasta, Dessert, Beverage</h4>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {["pasta", "dessert", "beverage"].map((category) => (
                    <div key={category} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium capitalize text-gray-700 border-b pb-2 flex-1">
                          {category === "beverage" ? "Beverage" : category.charAt(0).toUpperCase() + category.slice(1)}
                        </h4>
                        <div className="flex items-center gap-2 ml-2">
                          <span className="text-xs text-gray-600">
                            {selectedMenus[category]?.length || 0}/{menuLimits[category as keyof typeof menuLimits]}
                          </span>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => increaseLimit(category)}
                            className="h-6 px-2 text-xs"
                          >
                            +1
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        {(menuItems || [])
                          .filter((item) => item.category === category)
                          .map((item) => {
                            const isSelected = selectedMenus[category]?.includes(item.id) || false
                            const isDisabled =
                              !isSelected &&
                              (selectedMenus[category]?.length || 0) >= menuLimits[category as keyof typeof menuLimits]

                            return (
                              <label
                                key={item.id}
                                className={`flex items-start space-x-2 cursor-pointer hover:bg-gray-50 p-1 rounded ${
                                  isDisabled ? "opacity-50 cursor-not-allowed" : ""
                                }`}
                              >
                                <Checkbox
                                  id={`${category}-${item.id}`}
                                  checked={isSelected}
                                  onCheckedChange={() => !isDisabled && toggleMenuItem(category, item.id)}
                                  disabled={isDisabled}
                                  className="mt-1"
                                />
                                <div className="flex-1">
                                  <span className="text-sm leading-tight">{item.name}</span>
                                </div>
                              </label>
                            )
                          })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 6: Review & Additional Requests */}
      {currentStep === 6 && (
        <Card>
          <CardContent className="pt-6">
            <h2 className="text-xl font-semibold mb-6">Review & Additional Requests</h2>
            <div className="space-y-6">
              {/* Personal Information */}
              <div>
                <h3 className="font-semibold text-base mb-3 text-rose-600">Personal Information</h3>
                <div className="grid gap-2 text-sm pl-4">
                  <div className="flex justify-between">
                    <span className="font-medium">Name:</span>
                    <span>
                      {personalInfo.firstName} {personalInfo.lastName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Email:</span>
                    <span>{personalInfo.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Phone:</span>
                    <span>{personalInfo.phone}</span>
                  </div>
                </div>
              </div>

              <hr className="my-4" />

              {/* Event Details */}
              <div>
                <h3 className="font-semibold text-base mb-3 text-rose-600">Event Details</h3>
                <div className="grid gap-2 text-sm pl-4">
                  <div className="flex justify-between">
                    <span className="font-medium">Event Type:</span>
                    <span className="capitalize">{eventType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Number of Guests:</span>
                    <span>{eventDetails.guestCount} guests</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Venue:</span>
                    <span className="text-right">
                      {[
                        eventDetails.venueName,
                        eventDetails.streetAddress,
                        eventDetails.venueBarangay,
                        eventDetails.venueCity,
                        eventDetails.venueProvince,
                        eventDetails.postalCode,
                      ]
                        .filter(Boolean)
                        .join(", ")}
                    </span>
                  </div>
                  {eventDetails.eventTheme && (
                    <div className="flex justify-between">
                      <span className="font-medium">Theme:</span>
                      <span>{eventDetails.eventTheme}</span>
                    </div>
                  )}
                  {eventDetails.colorMotif && (
                    <div className="flex justify-between">
                      <span className="font-medium">Color Motif:</span>
                      <span>{eventDetails.colorMotif}</span>
                    </div>
                  )}
                  {eventType === "birthday" && (
                    <>
                      <div className="flex justify-between">
                        <span className="font-medium">Celebrant:</span>
                        <span>
                          {eventSpecificData.celebrantName} ({eventSpecificData.celebrantAge} years old) -{" "}
                          {eventSpecificData.celebrantGender}
                        </span>
                      </div>
                    </>
                  )}
                  {eventType === "wedding" && (
                    <div className="flex justify-between">
                      <span className="font-medium">Couple:</span>
                      <span>
                        {eventSpecificData.groomName} & {eventSpecificData.brideName}
                      </span>
                    </div>
                  )}
                  {eventType === "debut" && (
                    <div className="flex justify-between">
                      <span className="font-medium">Debutante:</span>
                      <span>
                        {eventSpecificData.debutanteName} - {formatGender(eventSpecificData.debutanteGender)}
                      </span>
                    </div>
                  )}
                  {eventType === "corporate" && (
                    <div className="flex justify-between">
                      <span className="font-medium">Event Name:</span>
                      <span>{eventSpecificData.eventName}</span>
                    </div>
                  )}
                  {eventType === "other" && (
                    <div className="flex justify-between">
                      <span className="font-medium">Event Details:</span>
                      <span>{eventSpecificData.eventDetails}</span>
                    </div>
                  )}
                </div>
              </div>

              <hr className="my-4" />

              {/* Scheduling Information */}
              <div>
                <h3 className="font-semibold text-base mb-3 text-rose-600">Scheduling Information</h3>
                <div className="grid gap-2 text-sm pl-4">
                  <div className="flex justify-between">
                    <span className="font-medium">Event Date:</span>
                    <span>
                      {dateTime.eventDate
                        ? new Date(dateTime.eventDate).toLocaleDateString("en-US", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })
                        : "Not selected"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Time Slot:</span>
                    <span>{getEndTime(dateTime.eventTime)}</span>
                  </div>
                </div>
              </div>

              <hr className="my-4" />

              {/* Menu Selection */}
              <div>
                <h3 className="font-semibold text-base mb-3 text-rose-600">Menu Selection</h3>
                <div className="space-y-3 text-sm pl-4">
                  <div>
                    <span className="font-medium">
                      Menu 1 - Beef, Pork ({selectedMenus.menu1?.length || 0} selected):
                    </span>
                    <ul className="list-disc list-inside space-y-1 mt-1 pl-4">
                      {(selectedMenus.menu1 || []).map((id) => {
                        const item = menuItems.find((item) => item.id === id)
                        return item ? <li key={id}>{item.name}</li> : null
                      })}
                    </ul>
                  </div>
                  <div>
                    <span className="font-medium">Menu 2 - Chicken ({selectedMenus.menu2?.length || 0} selected):</span>
                    <ul className="list-disc list-inside space-y-1 mt-1 pl-4">
                      {(selectedMenus.menu2 || []).map((id) => {
                        const item = menuItems.find((item) => item.id === id)
                        return item ? <li key={id}>{item.name}</li> : null
                      })}
                    </ul>
                  </div>
                  <div>
                    <span className="font-medium">
                      Menu 3 - Seafood, Vegetables ({selectedMenus.menu3?.length || 0} selected):
                    </span>
                    <ul className="list-disc list-inside space-y-1 mt-1 pl-4">
                      {(selectedMenus.menu3 || []).map((id) => {
                        const item = menuItems.find((item) => item.id === id)
                        return item ? <li key={id}>{item.name}</li> : null
                      })}
                    </ul>
                  </div>
                  <div>
                    <span className="font-medium">Pasta ({selectedMenus.pasta?.length || 0} selected):</span>
                    <ul className="list-disc list-inside space-y-1 mt-1 pl-4">
                      {(selectedMenus.pasta || []).map((id) => {
                        const item = menuItems.find((item) => item.id === id)
                        return item ? <li key={id}>{item.name}</li> : null
                      })}
                    </ul>
                  </div>
                  <div>
                    <span className="font-medium">Dessert ({selectedMenus.dessert?.length || 0} selected):</span>
                    <ul className="list-disc list-inside space-y-1 mt-1 pl-4">
                      {(selectedMenus.dessert || []).map((id) => {
                        const item = menuItems.find((item) => item.id === id)
                        return item ? <li key={id}>{item.name}</li> : null
                      })}
                    </ul>
                  </div>
                  <div>
                    <span className="font-medium">Beverage ({selectedMenus.beverage?.length || 0} selected):</span>
                    <ul className="list-disc list-inside space-y-1 mt-1 pl-4">
                      {(selectedMenus.beverage || []).map((id) => {
                        const item = menuItems.find((item) => item.id === id)
                        return item ? <li key={id}>{item.name}</li> : null
                      })}
                    </ul>
                  </div>
                </div>
              </div>

              <hr className="my-4" />

              {/* Backdrop Styling (Birthday only) */}
              {eventType === "birthday" &&
                eventSpecificData.backdropOption && ( // Removed check for "none" since that option no longer exists
                  <>
                    <div>
                      <h3 className="font-semibold text-base mb-3 text-rose-600">Backdrop Styling</h3>
                      <div className="grid gap-2 text-sm pl-4">
                        <div className="flex justify-between">
                          <span className="font-medium">Selected Backdrop:</span>
                          <span className="capitalize">{eventSpecificData.backdropOption?.replace("-", " ")}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">Backdrop Price:</span>
                          <span className="text-rose-600 font-semibold">
                            ₱
                            {eventSpecificData.backdropOption === "single"
                              ? "7,000.00"
                              : eventSpecificData.backdropOption === "double"
                                ? "8,000.00"
                                : eventSpecificData.backdropOption === "triple"
                                  ? "10,000.00"
                                  : "0.00"}
                          </span>
                        </div>
                        <div className="mt-3 bg-gray-50 p-3 rounded text-xs">
                          <div className="font-medium mb-1">Backdrop Includes:</div>
                          <ul className="list-disc list-inside space-y-1 pl-2">
                            {eventSpecificData.backdropOption === "single" && (
                              <>
                                <li>(3) Regular Colored Balloon Garlands</li>
                                <li>Cut-out Name</li>
                                <li>Faux Grass Carpet</li>
                                <li>Celebrant's Accent Chair</li>
                                <li>Cake Cylinder Plinth</li>
                              </>
                            )}
                            {eventSpecificData.backdropOption === "double" && (
                              <>
                                <li>(3) Regular Colored Balloon Garlands</li>
                                <li>Cut-out Name</li>
                                <li>Faux Grass Carpet</li>
                                <li>Celebrant's Accent Chair</li>
                                <li>Cake Cylinder Plinth</li>
                                <li>Basic Balloon Entrance Arch</li>
                              </>
                            )}
                            {eventSpecificData.backdropOption === "triple" && (
                              <>
                                <li>(3-4) Regular Colored Balloon Garlands</li>
                                <li>Cut-out Name</li>
                                <li>Faux Grass Carpet</li>
                                <li>Celebrant's Accent Chair</li>
                                <li>Cake Cylinder Plinth</li>
                                <li>Basic Balloon Entrance Arch</li>
                                <li>18×24 Sintra Board Welcome Signage</li>
                                <li>(2) 2D Styro Character Standees</li>
                              </>
                            )}
                          </ul>
                        </div>
                      </div>

                      <hr className="my-4" />
                    </div>
                  </>
                )}

              {/* Package Information */}
              <div>
                <h3 className="font-semibold text-base mb-3 text-rose-600">Package Information</h3>
                <div className="space-y-3 text-sm">
                  {/* Menu Selections Total */}
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Menu Selections Total:</span>
                    <span className="text-rose-600 font-semibold">
                      ₱{(() => {
                        let total = 0
                        const guestCount = Number.parseInt(eventDetails.guestCount) || 0

                        // Calculate beef and pork (₱70 each)
                        selectedMenus.menu1?.forEach((id) => {
                          const item = (menuItems || []).find((m) => m.id === id)
                          if (item && (item.category === "beef" || item.category === "pork")) {
                            total += 70 * guestCount
                          }
                        })

                        // Calculate chicken (₱60 each)
                        selectedMenus.menu2?.forEach(() => {
                          total += 60 * guestCount
                        })

                        // Calculate seafood and vegetables (₱50 each)
                        selectedMenus.menu3?.forEach(() => {
                          total += 50 * guestCount
                        })

                        // Calculate pasta (₱40 each)
                        selectedMenus.pasta?.forEach(() => {
                          total += 40 * guestCount
                        })

                        // Calculate dessert (₱25 each)
                        selectedMenus.dessert?.forEach(() => {
                          total += 25 * guestCount
                        })

                        // Calculate beverage (₱25 each)
                        selectedMenus.beverage?.forEach(() => {
                          total += 25 * guestCount
                        })

                        return total.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                      })()}
                    </span>
                  </div>

                  {/* Service Fee for Debut */}
                  {eventType === "debut" && (
                    <div className="border rounded-lg p-4 bg-rose-50">
                      <div className="flex justify-between items-center mb-3">
                        <span className="font-medium">Service Fee:</span>
                        <span className="text-rose-600 font-semibold">
                          ₱{(() => {
                            const guestCount = Number.parseInt(eventDetails.guestCount) || 0
                            if (guestCount === 50) return "21,500.00"
                            if (guestCount === 80) return "26,400.00"
                            if (guestCount === 100) return "28,000.00"
                            if (guestCount === 150) return "36,500.00"
                            if (guestCount === 200) return "36,000.00"
                            return "0.00"
                          })()}
                        </span>
                      </div>
                      <div className="text-xs space-y-1">
                        <div className="font-medium mb-1">Service Fee Includes:</div>
                        <ul className="list-disc pl-5 space-y-1">
                          <li>Rice & Drinks</li>
                          <li>Buffet Table with Complete Set-up</li>
                          <li>Tables & Chairs with Complete Linens & Covers</li>
                          <li>Themed Table Centerpiece</li>
                          <li>Basic Backdrop Styling (Free: Letter Cut)</li>
                          <li>Waiters & Food Attendant in complete Uniforms</li>
                          <li>4 Hours Service Time</li>
                        </ul>
                        <div className="font-semibold text-rose-600 mt-2">**Free Fresh 18 Red Roses & 18 Candles**</div>
                      </div>
                    </div>
                  )}

                  {/* Service Fee for Wedding */}
                  {eventType === "wedding" && (
                    <div className="border rounded-lg p-4 bg-rose-50">
                      <div className="flex justify-between items-center mb-3">
                        <span className="font-medium">Service Fee:</span>
                        <span className="text-rose-600 font-semibold">
                          ₱{(() => {
                            const guestCount = Number.parseInt(eventDetails.guestCount) || 0
                            if (guestCount === 50) return "56,500.00"
                            if (guestCount === 100) return "63,000.00"
                            if (guestCount === 150) return "74,500.00"
                            if (guestCount === 200) return "86,000.00"
                            if (guestCount === 300) return "109,000.00"
                            return "0.00"
                          })()}
                        </span>
                      </div>
                      <div className="text-xs space-y-1">
                        <div className="font-medium mb-1">Service Fee Includes:</div>
                        <ul className="list-disc pl-5 space-y-1">
                          <li>Rice & Drinks</li>
                          <li>Full Skirted Buffet Table w/ Faux Floral Centerpiece</li>
                          <li>Guest Chairs & Tables with Complete Linens & Themed Centerpiece</li>
                          <li>
                            2 (10) Presidential Tables with mix of Artificial & floral runners + Complete Table setup &
                            Glasswares + Crystal Chairs
                          </li>
                          <li>Couple's Table w/ Fresh Floral centerpiece & Couple's Couch</li>
                          <li>Cake Cylinder Plinth</li>
                          <li>White Carpet Aisle</li>
                          <li>Waiters & Food Attendant in Complete Uniform</li>
                        </ul>
                        <div className="font-semibold text-rose-600 mt-2">
                          **Semi Customized Backdrop Styling with full faux Flower design, Couples Couch + 6x6 Round
                          Flatform Stage with decor + Thematic Tunnel Entrance**
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Service Fee for Other Event Types */}
                  {eventType !== "debut" && eventType !== "wedding" && (
                    <div className="border rounded-lg p-4 bg-gray-50">
                      <div className="flex justify-between items-center mb-3">
                        <span className="font-medium">Service Fee:</span>
                        <span className="text-rose-600 font-semibold">
                          ₱{(() => {
                            const guestCount = Number.parseInt(eventDetails.guestCount) || 0
                            if (guestCount === 50) return "11,500.00"
                            if (guestCount === 80) return "10,400.00"
                            if (guestCount === 100) return "11,000.00"
                            if (guestCount === 150) return "16,500.00"
                            if (guestCount === 200) return "22,000.00"
                            return "0.00"
                          })()}
                        </span>
                      </div>
                      <div className="text-xs space-y-1">
                        <div className="font-medium mb-1">Service Fee Includes:</div>
                        <ul className="list-disc pl-5 space-y-1">
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
                    </div>
                  )}

                  {/* Backdrop Styling Price for Birthday */}
                  {eventType === "birthday" &&
                    eventSpecificData.backdropOption &&
                    eventSpecificData.backdropOption !== "none" && (
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Backdrop Styling:</span>
                        <span className="text-rose-600 font-semibold">
                          ₱
                          {eventSpecificData.backdropOption === "single"
                            ? "7,000.00"
                            : eventSpecificData.backdropOption === "double"
                              ? "8,000.00"
                              : eventSpecificData.backdropOption === "triple"
                                ? "10,000.00"
                                : "0.00"}
                        </span>
                      </div>
                    )}

                  {/* Total Package Amount */}
                  <div className="border-t pt-3 mt-3">
                    <div className="flex justify-between items-center text-base">
                      <span className="font-semibold">Total Package Amount:</span>
                      <span className="text-rose-600 font-bold text-lg">
                        ₱{(() => {
                          let total = 0
                          const guestCount = Number.parseInt(eventDetails.guestCount) || 0

                          // Menu selections total
                          selectedMenus.menu1?.forEach((id) => {
                            const item = (menuItems || []).find((m) => m.id === id)
                            if (item && (item.category === "beef" || item.category === "pork")) {
                              total += 70 * guestCount
                            }
                          })
                          selectedMenus.menu2?.forEach(() => {
                            total += 60 * guestCount
                          })
                          selectedMenus.menu3?.forEach(() => {
                            total += 50 * guestCount
                          })
                          selectedMenus.pasta?.forEach(() => {
                            total += 40 * guestCount
                          })
                          selectedMenus.dessert?.forEach(() => {
                            total += 25 * guestCount
                          })
                          selectedMenus.beverage?.forEach(() => {
                            total += 25 * guestCount
                          })

                          // Service fee
                          if (eventType === "debut") {
                            if (guestCount === 50) total += 21500
                            else if (guestCount === 80) total += 26400
                            else if (guestCount === 100) total += 28000
                            else if (guestCount === 150) total += 36500
                            else if (guestCount === 200) total += 36000
                          } else if (eventType === "wedding") {
                            if (guestCount === 50) total += 56500
                            else if (guestCount === 100) total += 63000
                            else if (guestCount === 150) total += 74500
                            else if (guestCount === 200) total += 86000
                            else if (guestCount === 300) total += 109000
                          } else {
                            if (guestCount === 50) total += 11500
                            else if (guestCount === 80) total += 10400
                            else if (guestCount === 100) total += 11000
                            else if (guestCount === 150) total += 16500
                            else if (guestCount === 200) total += 22000
                          }

                          // Backdrop styling for birthday
                          if (eventType === "birthday" && eventSpecificData.backdropOption) {
                            if (eventSpecificData.backdropOption === "single") total += 7000
                            else if (eventSpecificData.backdropOption === "double") total += 8000
                            else if (eventSpecificData.backdropOption === "triple") total += 10000
                          }

                          return total.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                        })()}
                      </span>
                    </div>
                  </div>

                  {/* Down Payment */}
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Down Payment (50%):</span>
                    <span className="text-green-600 font-semibold">
                      ₱{(() => {
                        let total = 0
                        const guestCount = Number.parseInt(eventDetails.guestCount) || 0

                        // Menu selections total
                        selectedMenus.menu1?.forEach((id) => {
                          const item = (menuItems || []).find((m) => m.id === id)
                          if (item && (item.category === "beef" || item.category === "pork")) {
                            total += 70 * guestCount
                          }
                        })
                        selectedMenus.menu2?.forEach(() => {
                          total += 60 * guestCount
                        })
                        selectedMenus.menu3?.forEach(() => {
                          total += 50 * guestCount
                        })
                        selectedMenus.pasta?.forEach(() => {
                          total += 40 * guestCount
                        })
                        selectedMenus.dessert?.forEach(() => {
                          total += 25 * guestCount
                        })
                        selectedMenus.beverage?.forEach(() => {
                          total += 25 * guestCount
                        })

                        // Service fee
                        if (eventType === "debut") {
                          if (guestCount === 50) total += 21500
                          else if (guestCount === 80) total += 26400
                          else if (guestCount === 100) total += 28000
                          else if (guestCount === 150) total += 36500
                          else if (guestCount === 200) total += 36000
                        } else if (eventType === "wedding") {
                          if (guestCount === 50) total += 56500
                          else if (guestCount === 100) total += 63000
                          else if (guestCount === 150) total += 74500
                          else if (guestCount === 200) total += 86000
                          else if (guestCount === 300) total += 109000
                        } else {
                          if (guestCount === 50) total += 11500
                          else if (guestCount === 80) total += 10400
                          else if (guestCount === 100) total += 11000
                          else if (guestCount === 150) total += 16500
                          else if (guestCount === 200) total += 22000
                        }

                        // Backdrop styling for birthday
                        if (eventType === "birthday" && eventSpecificData.backdropOption) {
                          if (eventSpecificData.backdropOption === "single") total += 7000
                          else if (eventSpecificData.backdropOption === "double") total += 8000
                          else if (eventSpecificData.backdropOption === "triple") total += 10000
                        }

                        const downPayment = total * 0.5
                        return downPayment.toLocaleString("en-PH", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })
                      })()}
                    </span>
                  </div>
                </div>
              </div>

              <hr className="my-4" />

              {/* Additional Requests */}
              <div>
                <h3 className="font-semibold text-base mb-3 text-rose-600">Additional Requests (Optional)</h3>
                <Textarea
                  placeholder="Any special requests, dietary restrictions, setup preferences, or other notes..."
                  value={walkInData.additionalRequests || ""}
                  onChange={(e) => setWalkInData({ ...walkInData, additionalRequests: e.target.value })}
                  className="min-h-[100px]"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-6">
        <Button variant="outline" onClick={handleBack} disabled={currentStep === 1}>
          Back
        </Button>
        {currentStep < 6 ? (
          <Button onClick={handleNext} className="bg-rose-600 hover:bg-rose-700">
            Next
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={isSubmitting} className="bg-rose-600 hover:bg-rose-700">
            {isSubmitting ? "Adding..." : "Add Walk-In Appointment"}
          </Button>
        )}
      </div>
    </div>
  )
}
