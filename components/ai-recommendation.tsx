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
  Sparkles,
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
  onChangeEventType?: () => void
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
  venueName: "",
  venueProvince: "",
  venueCity: "",
  venueBarangay: "",
  venueStreetAddress: "",
  venueZipCode: "",
  theme: "",
  colorMotif: "",
  additionalEventInfo: "",
}

// Address data structure
const addressData = {
  "Metro Manila": {
    "Quezon City": [
      "Alicia",
      "Amihan",
      "Apolonio Samson",
      "Baesa",
      "Bagbaguin",
      "Bagong Lipunan ng Crame",
      "Bagong Pag-asa",
      "Bagong Silangan",
      "Bagumbayan",
      "Bagumbuhay",
      "Bahay Toro",
      "Balingasa",
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
      "Dona Imelda",
      "Dona Josefa",
      "Don Manuel",
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
      "Immaculate Concepcion",
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
      "Mariana",
      "Mariblo",
      "Marilag",
      "Masagana",
      "Masambong",
      "Matalahib",
      "Matandang Balara",
      "Milagrosa",
      "N.S. Amoranto",
      "Nagkaisang Nayon",
      "New Era",
      "North Fairview",
      "Novaliches Proper",
      "Nueve de Febrero",
      "Obrero",
      "Old Capitol Site",
      "Paang Bundok",
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
      "Santo Domingo",
      "Santo Nino",
      "Santol",
      "Sauyo",
      "Sienna",
      "Silangan",
      "Sikatuna Village",
      "Socorro",
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
      "Gen. T. de Leon",
      "Hen. T. de Leon",
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
      "Polo",
      "Punturin",
      "Rincon",
      "Tagalag",
      "Ugong",
      "Viente Reales",
      "Wawang Pulo",
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
      "Tanong",
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
      "Capihan",
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
      "Pinagbakahan",
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
      "Sariling Bayan",
      "Subukan",
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
      "Malhacan",
      "Pajo",
      "Pandayan",
      "Pantoc",
      "Perez",
      "Saluysoy",
      "St. Francis",
      "Tugatog",
      "Ubihan",
      "Zamora",
    ],
    Pandi: [
      "Bagbaguin",
      "Bagong Barrio",
      "Baka-bakahan",
      "Baliuag",
      "Bunsuran I",
      "Bunsuran II",
      "Bunsuran III",
      "Cacarong Bata",
      "Cacarong Matanda",
      "Cupang",
      "Malibo",
      "Manatal",
      "Mapulang Lupa",
      "Masagana",
      "Masangsang",
      "Pinagkuartelan",
      "Poblacion",
      "Real de Cacarong",
      "San Roque",
      "Siling Bata",
      "Siling Matanda",
    ],
    Marilao: [
      "Abangan Norte",
      "Abangan Sur",
      "Ibayo",
      "Lambakin",
      "Lias",
      "Loma de Gato",
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
    ],
  },
}

export default function AIRecommendation({
  personalInfo,
  eventInfo,
  schedulingInfo,
  onChangeEventType,
}: AIRecommendationProps) {
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
    menu1: string[]
    menu2: string[]
    menu3: string[]
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

  const [availableCities, setAvailableCities] = useState<string[]>([])
  const [availableBarangays, setAvailableBarangays] = useState<string[]>([])

  // Update cities when province changes
  useEffect(() => {
    if (formData.venueProvince) {
      const cities = Object.keys(addressData[formData.venueProvince as keyof typeof addressData] || {})
      setAvailableCities(cities)
      if (!cities.includes(formData.venueCity)) {
        setFormData((prev) => ({ ...prev, venueCity: "", venueBarangay: "" }))
        setAvailableBarangays([])
      }
    } else {
      setAvailableCities([])
      setAvailableBarangays([])
      setFormData((prev) => ({ ...prev, venueCity: "", venueBarangay: "" }))
    }
  }, [formData.venueProvince])

  // Update barangays when city changes
  useEffect(() => {
    if (formData.venueProvince && formData.venueCity) {
      const barangays =
        addressData[formData.venueProvince as keyof typeof addressData]?.[
          formData.venueCity as keyof (typeof addressData)[keyof typeof addressData]
        ] || []
      setAvailableBarangays(barangays)
      if (!barangays.includes(formData.venueBarangay)) {
        setFormData((prev) => ({ ...prev, venueBarangay: "" }))
      }
    } else {
      setAvailableBarangays([])
      setFormData((prev) => ({ ...prev, venueBarangay: "" }))
    }
  }, [formData.venueProvince, formData.venueCity])

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
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
        break
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
        venue: `${formData.venueName ? formData.venueName + ", " : ""}${formData.venueStreetAddress}, ${formData.venueBarangay}, ${formData.venueCity}, ${formData.venueProvince}${formData.venueZipCode ? ", " + formData.venueZipCode : ""}`,
        theme: formData.theme,
        colorMotif: formData.colorMotif,
        celebrantName: eventInfo.celebrantName,
        celebrantAge: eventInfo.celebrantAge ? Number.parseInt(eventInfo.celebrantAge) : null,
        celebrantGender: eventInfo.celebrantGender || eventInfo.debutanteGender,
        groomName: eventInfo.groomName,
        brideName: eventInfo.brideName,
        additionalEventInfo: eventInfo.additionalEventInfo,
        mainCourses: allMainCourses,
        pasta: selectedMenuItems.pasta.join(", "),
        dessert: selectedMenuItems.dessert.join(", "),
        beverage: selectedMenuItems.beverage.join(", "),
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
        setCountdown(20)
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

  // Enhanced function to enforce exactly 1 main course from each menu category
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

    console.log("User preferences:", userPrefs)

    // Handle "only" requests
    if (userPrefs.onlyRequests.length > 0) {
      console.log("Processing 'only' requests:", userPrefs.onlyRequests)

      if (userPrefs.onlyRequests.includes("beef") && filteredMenuItems.beef.length > 0) {
        finalMenu.menu1 = [
          shuffleArray([...filteredMenuItems.beef])[0].name || shuffleArray([...filteredMenuItems.beef])[0],
        ]
      } else if (userPrefs.onlyRequests.includes("pork") && filteredMenuItems.pork.length > 0) {
        finalMenu.menu1 = [
          shuffleArray([...filteredMenuItems.pork])[0].name || shuffleArray([...filteredMenuItems.pork])[0],
        ]
      }

      if (userPrefs.onlyRequests.includes("chicken") && filteredMenuItems.chicken.length > 0) {
        finalMenu.menu2 = [
          shuffleArray([...filteredMenuItems.chicken])[0].name || shuffleArray([...filteredMenuItems.chicken])[0],
        ]
      }

      if (userPrefs.onlyRequests.includes("seafood") && filteredMenuItems.seafood.length > 0) {
        finalMenu.menu3 = [
          shuffleArray([...filteredMenuItems.seafood])[0].name || shuffleArray([...filteredMenuItems.seafood])[0],
        ]
      } else if (userPrefs.onlyRequests.includes("vegetables") && filteredMenuItems.vegetables.length > 0) {
        finalMenu.menu3 = [
          shuffleArray([...filteredMenuItems.vegetables])[0].name || shuffleArray([...filteredMenuItems.vegetables])[0],
        ]
      }
    } else {
      console.log("Processing normal distribution - 1 from each menu, respecting restrictions")

      if (!userPrefs.restrictions.includes("beef") || !userPrefs.restrictions.includes("pork")) {
        let menu1Items = []

        if (!userPrefs.restrictions.includes("beef") && filteredMenuItems.beef.length > 0) {
          menu1Items.push(...filteredMenuItems.beef)
        }

        if (!userPrefs.restrictions.includes("pork") && filteredMenuItems.pork.length > 0) {
          menu1Items.push(...filteredMenuItems.pork)
        }

        if (menu1Items.length > 0) {
          if (userPrefs.emphasis.includes("beef") || userPrefs.emphasis.includes("pork")) {
            const emphasizedItems = menu1Items.filter((item) => {
              const itemName = (item.name || item).toLowerCase()
              return (
                (userPrefs.emphasis.includes("beef") && itemName.includes("beef")) ||
                (userPrefs.emphasis.includes("pork") && itemName.includes("pork"))
              )
            })

            if (emphasizedItems.length > 0) {
              menu1Items = emphasizedItems
            }
          }

          const selectedItem = shuffleArray(menu1Items)[0]
          finalMenu.menu1 = [selectedItem.name || selectedItem]
        }
      }

      if (!userPrefs.restrictions.includes("chicken") && filteredMenuItems.chicken.length > 0) {
        let chickenItems = [...filteredMenuItems.chicken]

        if (userPrefs.emphasis.includes("chicken")) {
          chickenItems = shuffleArray(chickenItems)
        }

        const selectedItem = shuffleArray(chickenItems)[0]
        finalMenu.menu2 = [selectedItem.name || selectedItem]
      }

      if (!userPrefs.restrictions.includes("seafood") || !userPrefs.restrictions.includes("vegetables")) {
        let menu3Items = []

        if (!userPrefs.restrictions.includes("seafood") && filteredMenuItems.seafood.length > 0) {
          menu3Items.push(...filteredMenuItems.seafood)
        }

        if (!userPrefs.restrictions.includes("vegetables") && filteredMenuItems.vegetables.length > 0) {
          menu3Items.push(...filteredMenuItems.vegetables)
        }

        if (menu3Items.length > 0) {
          if (userPrefs.emphasis.includes("seafood") || userPrefs.emphasis.includes("vegetables")) {
            const emphasizedItems = menu3Items.filter((item) => {
              const itemName = (item.name || item).toLowerCase()
              return (
                (userPrefs.emphasis.includes("seafood") &&
                  (itemName.includes("fish") || itemName.includes("seafood") || itemName.includes("camaron"))) ||
                (userPrefs.emphasis.includes("vegetables") &&
                  (itemName.includes("vegetable") || itemName.includes("chopsuey") || itemName.includes("lumpiang")))
              )
            })

            if (emphasizedItems.length > 0) {
              menu3Items = emphasizedItems
            }
          }

          const selectedItem = shuffleArray(menu3Items)[0]
          finalMenu.menu3 = [selectedItem.name || selectedItem]
        }
      }
    }

    if (
      finalMenu.pasta.length === 0 &&
      !userPrefs.restrictions.includes("pasta") &&
      filteredMenuItems.pasta.length > 0
    ) {
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
    setGenerationCount((prev) => prev + 1)

    try {
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
        venue: `${formData.venueName ? formData.venueName + ", " : ""}${formData.venueStreetAddress}, ${formData.venueBarangay}, ${formData.venueCity}, ${formData.venueProvince}${formData.venueZipCode ? ", " + formData.venueZipCode : ""}`,
        venueCity: formData.venueCity,
        theme: formData.theme,
        colorMotif: formData.colorMotif,
        availableMenuItems: allMenuItems,
        generationCount: generationCount,
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

      if (result.success && result.recommendations) {
        console.log("AI recommendations received successfully")

        const userPrefs = parseUserPreferences(formData.preferredMenus || "")

        const applyUserRestrictions = (items: MenuItem[], category: string) => {
          if (userPrefs.restrictions.includes(category.toLowerCase())) {
            return []
          }
          return shuffleArray(items)
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

        const finalMenu = enforceFixedStructure(result.recommendations, userPrefs, filteredMenuItems)

        setSelectedMenuItems({
          menu1: finalMenu.menu1,
          menu2: finalMenu.menu2,
          menu3: finalMenu.menu3,
          pasta: finalMenu.pasta,
          dessert: finalMenu.dessert,
          beverage: finalMenu.beverage,
        })

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

          selections.menu1?.forEach((item: string) => {
            const itemTotal = 70 * numGuests
            total += itemTotal
            breakdown.menu1.push({ name: item, pricePerGuest: 70, total: itemTotal })
          })

          selections.menu2?.forEach((item: string) => {
            const itemTotal = 60 * numGuests
            total += itemTotal
            breakdown.menu2.push({ name: item, pricePerGuest: 60, total: itemTotal })
          })

          selections.menu3?.forEach((item: string) => {
            const itemTotal = 50 * numGuests
            total += itemTotal
            breakdown.menu3.push({ name: item, pricePerGuest: 50, total: itemTotal })
          })

          selections.pasta?.forEach((item: string) => {
            const itemTotal = 40 * numGuests
            total += itemTotal
            breakdown.pasta.push({ name: item, pricePerGuest: 40, total: itemTotal })
          })

          selections.dessert?.forEach((item: string) => {
            const itemTotal = 25 * numGuests
            total += itemTotal
            breakdown.dessert.push({ name: item, pricePerGuest: 25, total: itemTotal })
          })

          selections.beverage?.forEach((item: string) => {
            const itemTotal = 25 * numGuests
            total += itemTotal
            breakdown.beverage.push({ name: item, pricePerGuest: 25, total: itemTotal })
          })

          return { total, breakdown }
        }

        const menuPricing = calculateMenuPricing(finalMenu)
        const numGuests = Number.parseInt(formData.guestCount) || 50

        let serviceFee = 0
        const isWeddingEvent = eventInfo.eventType === "wedding"
        const isDebutEvent = eventInfo.eventType === "debut"

        if (isWeddingEvent) {
          const weddingPackagePricing: { [key: string]: number } = {
            "50": 56500,
            "100": 63000,
            "150": 74500,
            "200": 86000,
            "300": 109000,
          }
          serviceFee = weddingPackagePricing[formData.guestCount] || 56500
        } else if (isDebutEvent) {
          const debutPackagePricing: { [key: string]: number } = {
            "50": 21500,
            "80": 26400,
            "100": 28000,
            "150": 36500,
            "200": 36000,
          }
          serviceFee = debutPackagePricing[formData.guestCount] || 21500
        } else {
          const serviceFees: { [key: string]: number } = {
            "50": 11500,
            "80": 10400,
            "100": 11000,
            "150": 16500,
            "200": 22000,
          }
          serviceFee = serviceFees[formData.guestCount] || 11500
        }

        const finalTotalAmount = menuPricing.total + serviceFee
        const finalDownPayment = Math.round(finalTotalAmount * 0.5)

        const weddingPackageInclusions = isWeddingEvent
          ? [
              "Rice & Drinks",
              "Full Skirted Buffet Table w/ Faux Floral Centerpiece",
              "Guest Chairs & Tables with Complete Linens & Themed Centerpiece",
              "2 (10) Presidential Tables with mix of Artificial & floral runners + Complete Table setup & Glasswares + Crystal Chairs",
              "Couple's Table w/ Fresh Floral centerpiece & Couple's Couch",
              "Cake Cylinder Plinth",
              "White Carpet Aisle",
              "Waiters & Food Attendant in Complete Uniform",
              "Semi Customized Backdrop Styling with full faux Flower design, Couples Couch + 6x6 Round Flatform Stage with decor + Thematic Tunnel Entrance",
            ]
          : []

        const debutPackageInclusions = isDebutEvent
          ? [
              "Rice & Drinks",
              "Buffet Table with Complete Set-up",
              "Tables & Chairs with Complete Linens & Covers",
              "Themed Table Centerpiece",
              "Basic Backdrop Styling (Free: Letter Cut)",
              "Waiters & Food Attendant in complete Uniforms",
              "4 Hours Service Time",
              "Free Fresh 18 Red Roses & 18 Candles",
            ]
          : []

        const serviceFeeInclusions =
          !isWeddingEvent && !isDebutEvent
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

        const createPackageFeatures = (selections: any) => {
          const features = []

          const mainCourseItems = [
            ...(selections.menu1 || []).map((item: string) => `${item} (Menu 1)`),
            ...(selections.menu2 || []).map((item: string) => `${item} (Menu 2)`),
            ...(selections.menu3 || []).map((item: string) => `${item} (Menu 3)`),
          ]

          if (mainCourseItems.length > 0) {
            features.push(`Main Courses (${mainCourseItems.length}): ${mainCourseItems.join(", ")}`)
          }

          if (selections.pasta && selections.pasta.length > 0) {
            features.push(`Pasta (${selections.pasta.length}): ${selections.pasta.join(", ")}`)
          }

          if (selections.dessert && selections.dessert.length > 0) {
            features.push(`Desserts (${selections.dessert.length}): ${selections.dessert.join(", ")}`)
          }

          if (selections.beverage && selections.beverage.length > 0) {
            features.push(`Beverages (${selections.beverage.length}): ${selections.beverage.join(", ")}`)
          }

          if (userPrefs.restrictions.length > 0) {
            features.push(`✓ Excludes: ${userPrefs.restrictions.join(", ")} (as requested)`)
          }
          if (userPrefs.emphasis.length > 0) {
            features.push(`✓ Emphasizes: ${userPrefs.emphasis.join(", ")} (as requested)`)
          }
          if (userPrefs.onlyRequests.length > 0) {
            features.push(`✓ Only includes: ${userPrefs.onlyRequests.join(", ")} (as requested)`)
          }

          features.push(`${numGuests} guests`)
          features.push(`AI-personalized based on your preferences`)
          features.push(`Fixed structure: exactly 1 main course, 1 pasta, 1 dessert, 1 beverage`)

          return features
        }

        const mockRecommendations = {
          packages: [
            {
              name: `AI-Curated ${eventInfo.eventType.charAt(0).toUpperCase() + eventInfo.eventType.slice(1)} Package`,
              description: `A personalized package for your ${eventInfo.eventType} featuring AI-selected menu items that strictly follow your dietary preferences with our standard structure of exactly 1 main course, 1 pasta, 1 dessert, and 1 beverage.`,
              price: `₱${finalTotalAmount.toLocaleString()}`,
              features: createPackageFeatures(finalMenu),
              isRecommended: true,
              reasoning:
                result.recommendations.reasoning ||
                `This AI-curated package strictly follows your menu preferences: "${formData.preferredMenus}". Your dietary restrictions have been carefully respected while maintaining our standard menu structure of exactly 1 main course, 1 pasta, 1 dessert, and 1 beverage.`,
              menuTotal: menuPricing.total,
              serviceFee: serviceFee,
              serviceFeeInclusions: serviceFeeInclusions,
              weddingPackageInclusions: weddingPackageInclusions,
              debutPackageInclusions: debutPackageInclusions,
              downPayment: finalDownPayment,
              isWeddingEvent: isWeddingEvent,
              isDebutEvent: isDebutEvent,
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
        generateFallbackRecommendations()
      }
    } catch (error) {
      console.error("Error generating AI recommendations:", error)
      generateFallbackRecommendations()
    } finally {
      setIsGenerating(false)
    }
  }

  const generateFallbackRecommendations = () => {
    if (!menuItems) return

    const numGuests = Number.parseInt(formData.guestCount) || 50
    const userPrefs = parseUserPreferences(formData.preferredMenus || "")

    const applyUserRestrictions = (items: MenuItem[], category: string) => {
      if (userPrefs.restrictions.includes(category.toLowerCase())) {
        return []
      }
      return shuffleArray(items)
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

    const isWeddingEvent = eventInfo.eventType === "wedding"
    const isDebutEvent = eventInfo.eventType === "debut"

    const costs = { menu1: 70, menu2: 60, menu3: 50, pasta: 40, dessert: 25, beverage: 25 }
    const finalMenuCost =
      (finalMenu.menu1.length * costs.menu1 +
        finalMenu.menu2.length * costs.menu2 +
        finalMenu.menu3.length * costs.menu3 +
        finalMenu.pasta.length * costs.pasta +
        finalMenu.dessert.length * costs.dessert +
        finalMenu.beverage.length * costs.beverage) *
      numGuests

    let serviceFee = 0
    if (isWeddingEvent) {
      const weddingPackagePricing: { [key: string]: number } = {
        "50": 56500,
        "100": 63000,
        "150": 74500,
        "200": 86000,
        "300": 109000,
      }
      serviceFee = weddingPackagePricing[formData.guestCount] || 56500
    } else if (isDebutEvent) {
      const debutPackagePricing: { [key: string]: number } = {
        "50": 21500,
        "80": 26400,
        "100": 28000,
        "150": 36500,
        "200": 36000,
      }
      serviceFee = debutPackagePricing[formData.guestCount] || 21500
    } else {
      const serviceFees: { [key: string]: number } = {
        "50": 11500,
        "80": 10400,
        "100": 11000,
        "150": 16500,
        "200": 22000,
      }
      serviceFee = serviceFees[formData.guestCount] || 11500
    }

    const finalTotalAmount = finalMenuCost + serviceFee
    const finalDownPayment = Math.round(finalTotalAmount * 0.5)

    const weddingPackageInclusions = isWeddingEvent
      ? [
          "Rice & Drinks",
          "Full Skirted Buffet Table w/ Faux Floral Centerpiece",
          "Guest Chairs & Tables with Complete Linens & Themed Centerpiece",
          "2 (10) Presidential Tables with mix of Artificial & floral runners + Complete Table setup & Glasswares + Crystal Chairs",
          "Couple's Table w/ Fresh Floral centerpiece & Couple's Couch",
          "Cake Cylinder Plinth",
          "White Carpet Aisle",
          "Waiters & Food Attendant in Complete Uniform",
          "Semi Customized Backdrop Styling with full faux Flower design, Couples Couch + 6x6 Round Flatform Stage with decor + Thematic Tunnel Entrance",
        ]
      : []

    const debutPackageInclusions = isDebutEvent
      ? [
          "Rice & Drinks",
          "Buffet Table with Complete Set-up",
          "Tables & Chairs with Complete Linens & Covers",
          "Themed Table Centerpiece",
          "Basic Backdrop Styling (Free: Letter Cut)",
          "Waiters & Food Attendant in complete Uniforms",
          "4 Hours Service Time",
          "Free Fresh 18 Red Roses & 18 Candles",
        ]
      : []

    const serviceFeeInclusions =
      !isWeddingEvent && !isDebutEvent
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

    const createFallbackPackageFeatures = (selections: any) => {
      const features = []

      const mainCourseItems = [
        ...(selections.menu1 || []).map((item: string) => `${item} (Menu 1)`),
        ...(selections.menu2 || []).map((item: string) => `${item} (Menu 2)`),
        ...(selections.menu3 || []).map((item: string) => `${item} (Menu 3)`),
      ]

      if (mainCourseItems.length > 0) {
        features.push(`Main Courses (${mainCourseItems.length}): ${mainCourseItems.join(", ")}`)
      }

      if (selections.pasta && selections.pasta.length > 0) {
        features.push(`Pasta (${selections.pasta.length}): ${selections.pasta.join(", ")}`)
      }

      if (selections.dessert && selections.dessert.length > 0) {
        features.push(`Desserts (${selections.dessert.length}): ${selections.dessert.join(", ")}`)
      }

      if (selections.beverage && selections.beverage.length > 0) {
        features.push(`Beverages (${selections.beverage.length}): ${selections.beverage.join(", ")}`)
      }

      if (userPrefs.restrictions.length > 0) {
        features.push(`✓ Excludes: ${userPrefs.restrictions.join(", ")} (as requested)`)
      }
      if (userPrefs.emphasis.length > 0) {
        features.push(`✓ Emphasizes: ${userPrefs.emphasis.join(", ")} (as requested)`)
      }
      if (userPrefs.onlyRequests.length > 0) {
        features.push(`✓ Only includes: ${userPrefs.onlyRequests.join(", ")} (as requested)`)
      }

      features.push(`${numGuests} guests`)
      features.push(`Generation #${generationCount} - Standard structure`)
      features.push(`Fixed structure: exactly 1 main course, 1 pasta, 1 dessert, 1 beverage`)

      return features
    }

    const mockRecommendations = {
      packages: [
        {
          name: `${eventInfo.eventType.charAt(0).toUpperCase() + eventInfo.eventType.slice(1)} Celebration Package`,
          description: `A standard package for your ${eventInfo.eventType} featuring menu selection that follows our fixed structure of exactly 1 main course, 1 pasta, 1 dessert, and 1 beverage.`,
          price: `₱${finalTotalAmount.toLocaleString()}`,
          features: createFallbackPackageFeatures(finalMenu),
          isRecommended: true,
          reasoning: `This package has been customized to follow your preferences: "${formData.preferredMenus}". Your dietary restrictions have been respected while maintaining our standard menu structure of exactly 1 main course, 1 pasta, 1 dessert, and 1 beverage.`,
          menuTotal: finalMenuCost,
          serviceFee: serviceFee,
          serviceFeeInclusions: serviceFeeInclusions,
          weddingPackageInclusions: weddingPackageInclusions,
          debutPackageInclusions: debutPackageInclusions,
          downPayment: finalDownPayment,
          isWeddingEvent: isWeddingEvent,
          isDebutEvent: isDebutEvent,
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
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">AI-Based Event Planning</h3>
              <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Fill in your preferences below and our AI will recommend the perfect menu for your{" "}
                <span className="font-medium text-rose-600">{eventInfo.eventType}</span> event using our standard
                structure:{" "}
                <strong>
                  1 main course from each category (Menu 1: Beef/Pork, Menu 2: Chicken, Menu 3: Seafood/Vegetables), 1
                  pasta, 1 dessert, and 1 beverage
                </strong>
                .
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

                {/* AI Menu Preferences - Moved below guest count */}
                <div className="space-y-3 md:col-span-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-rose-600" />
                    <label htmlFor="preferredMenus" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      AI Menu Preferences & Dietary Restrictions <span className="text-gray-500">(Optional)</span>
                    </label>
                  </div>
                  <Textarea
                    id="preferredMenus"
                    name="preferredMenus"
                    disabled={isFormDisabled}
                    value={formData.preferredMenus}
                    onChange={handleInputChange}
                    placeholder="Tell us about your dietary preferences or restrictions..."
                    className="min-h-[100px] bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                  />
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <h5 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
                      💡 How to use AI Preferences:
                    </h5>
                    <ul className="text-xs text-blue-800 dark:text-blue-200 space-y-1.5">
                      <li>
                        <strong>To exclude items:</strong> "no pork", "no seafood", "halal" (automatically excludes
                        pork)
                      </li>
                      <li>
                        <strong>To emphasize favorites:</strong> "more beef", "lots of chicken", "I love seafood"
                      </li>
                      <li>
                        <strong>For specific diets:</strong> "vegetarian", "pescatarian" (fish only), "only chicken"
                      </li>
                      <li>
                        <strong>Examples:</strong> "halal", "no pork, more beef", "vegetarian options", "only chicken
                        and seafood", "I love pasta"
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Venue Information */}
                <div className="space-y-4 md:col-span-2">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-rose-600" />
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Venue Information</h4>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                    <p className="text-xs text-blue-700 dark:text-blue-300">
                      <strong>📍 Service Area:</strong> Jo Pacheco serves Quezon City, Valenzuela, Malabon, Bulacan
                      (Malolos, Meycauayan, Pandi, Marilao), and nearby areas.
                    </p>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <label htmlFor="venueName" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Venue/Hall Name <span className="text-gray-500">(Optional)</span>
                      </label>
                      <Input
                        id="venueName"
                        name="venueName"
                        disabled={isFormDisabled}
                        value={formData.venueName}
                        onChange={handleInputChange}
                        placeholder="e.g., Garden Palace, Grand Ballroom"
                        className="h-11 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="venueProvince" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Province <span className="text-rose-600">*</span>
                      </label>
                      <Select
                        name="venueProvince"
                        disabled={isFormDisabled}
                        value={formData.venueProvince}
                        onValueChange={(value) => handleSelectChange("venueProvince", value)}
                      >
                        <SelectTrigger className="h-11 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600">
                          <SelectValue placeholder="Select province" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Metro Manila">Metro Manila</SelectItem>
                          <SelectItem value="Bulacan">Bulacan</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="venueCity" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        City/Municipality <span className="text-rose-600">*</span>
                      </label>
                      <Select
                        name="venueCity"
                        disabled={isFormDisabled || !formData.venueProvince}
                        value={formData.venueCity}
                        onValueChange={(value) => handleSelectChange("venueCity", value)}
                      >
                        <SelectTrigger className="h-11 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600">
                          <SelectValue placeholder="Select city" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableCities.map((city) => (
                            <SelectItem key={city} value={city}>
                              {city}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="venueBarangay" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Barangay <span className="text-rose-600">*</span>
                      </label>
                      <Select
                        name="venueBarangay"
                        disabled={isFormDisabled || !formData.venueCity}
                        value={formData.venueBarangay}
                        onValueChange={(value) => handleSelectChange("venueBarangay", value)}
                      >
                        <SelectTrigger className="h-11 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600">
                          <SelectValue placeholder="Select barangay" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableBarangays.map((barangay) => (
                            <SelectItem key={barangay} value={barangay}>
                              {barangay}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <label
                        htmlFor="venueStreetAddress"
                        className="text-sm font-medium text-gray-700 dark:text-gray-300"
                      >
                        Street Address <span className="text-rose-600">*</span>
                      </label>
                      <Input
                        id="venueStreetAddress"
                        name="venueStreetAddress"
                        disabled={isFormDisabled}
                        value={formData.venueStreetAddress}
                        onChange={handleInputChange}
                        placeholder="e.g., 123 Main Street"
                        className="h-11 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="venueZipCode" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Zip Code <span className="text-gray-500">(Optional)</span>
                      </label>
                      <Input
                        id="venueZipCode"
                        name="venueZipCode"
                        disabled={isFormDisabled}
                        value={formData.venueZipCode}
                        onChange={handleInputChange}
                        placeholder="e.g., 1400"
                        maxLength={4}
                        className="h-11 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                      />
                    </div>
                  </div>
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
                  disabled={
                    isFormDisabled ||
                    !formData.guestCount ||
                    !formData.venueProvince ||
                    !formData.venueCity ||
                    !formData.venueBarangay ||
                    !formData.venueStreetAddress ||
                    isGenerating
                  }
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
                        <div className="flex items-start gap-2">
                          <MapPin className="h-4 w-4 text-green-600 mt-0.5" />
                          <div className="flex-1">
                            <span className="text-gray-600 dark:text-gray-400">Venue: </span>
                            <span className="font-medium text-gray-800 dark:text-gray-200">
                              {[
                                formData.venueName,
                                formData.venueStreetAddress,
                                formData.venueBarangay,
                                formData.venueCity,
                                formData.venueProvince,
                                formData.venueZipCode,
                              ]
                                .filter(Boolean)
                                .join(", ")}
                            </span>
                          </div>
                        </div>
                        {formData.theme && (
                          <div className="flex items-center gap-2">
                            <span className="text-gray-600 dark:text-gray-400">Theme:</span>
                            <span className="font-medium text-gray-800 dark:text-gray-200">{formData.theme}</span>
                          </div>
                        )}
                        {formData.colorMotif && (
                          <div className="flex items-center gap-2">
                            <Palette className="h-4 w-4 text-green-600" />
                            <span className="text-gray-600 dark:text-gray-400">Color Motif:</span>
                            <span className="font-medium text-gray-800 dark:text-gray-200">{formData.colorMotif}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

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

                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Package Includes:</h4>
                      <div className="space-y-3">
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

                        <div className="flex items-start space-x-3">
                          <div className="w-2 h-2 bg-rose-500 rounded-full mt-2 flex-shrink-0" />
                          <span className="text-gray-700 dark:text-gray-300">{formData.guestCount} guests</span>
                        </div>
                        <div className="flex items-start space-x-3">
                          <div className="w-2 h-2 bg-rose-500 rounded-full mt-2 flex-shrink-0" />
                          <span className="text-gray-700 dark:text-gray-300">
                            Fixed structure: exactly 1 main course, 1 pasta, 1 dessert, 1 beverage
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

                    {pkg.isWeddingEvent && pkg.weddingPackageInclusions && pkg.weddingPackageInclusions.length > 0 && (
                      <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-lg p-4">
                        <h4 className="text-lg font-semibold text-rose-900 dark:text-rose-100 mb-3">
                          Wedding Package Includes:
                        </h4>
                        <div className="grid gap-2">
                          {pkg.weddingPackageInclusions.map((inclusion: string, inclusionIndex: number) => (
                            <div key={inclusionIndex} className="flex items-start space-x-3">
                              <div className="w-2 h-2 bg-rose-500 rounded-full mt-2 flex-shrink-0" />
                              <span className="text-rose-800 dark:text-rose-200">{inclusion}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {pkg.isDebutEvent && pkg.debutPackageInclusions && pkg.debutPackageInclusions.length > 0 && (
                      <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                        <h4 className="text-lg font-semibold text-purple-900 dark:text-purple-100 mb-3">
                          Debut Package Includes:
                        </h4>
                        <div className="grid gap-2">
                          {pkg.debutPackageInclusions.map((inclusion: string, inclusionIndex: number) => (
                            <div key={inclusionIndex} className="flex items-start space-x-3">
                              <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0" />
                              <span className="text-purple-800 dark:text-purple-200">{inclusion}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {!pkg.isWeddingEvent &&
                      !pkg.isDebutEvent &&
                      pkg.serviceFeeInclusions &&
                      pkg.serviceFeeInclusions.length > 0 && (
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
                        <div className="flex justify-between items-center py-2">
                          <span className="text-gray-600 dark:text-gray-400">
                            {pkg.isWeddingEvent
                              ? "Wedding Package Fee:"
                              : pkg.isDebutEvent
                                ? "Debut Package Fee:"
                                : "Service Fee:"}
                          </span>
                          <span className="font-semibold text-gray-900 dark:text-gray-100">
                            ₱{pkg.serviceFee.toLocaleString()}
                          </span>
                        </div>
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
