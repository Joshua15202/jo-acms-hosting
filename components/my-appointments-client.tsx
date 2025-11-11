"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, Users, MapPin, Utensils, Edit, X, CreditCard, RefreshCw, Pencil } from "lucide-react"
import { format } from "date-fns"
import { useAuth } from "@/components/user-auth-provider"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn, getTimeRange } from "@/lib/utils"
// Remove: import { put } from "@vercel/blob"

interface Appointment {
  id: string
  event_type: string
  event_date: string
  event_time: string
  guest_count: number
  venue_address: string
  theme?: string
  color_motif?: string
  celebrant_name?: string
  celebrant_age?: number
  celebrant_gender?: string
  groom_name?: string
  bride_name?: string
  main_courses?: string[] | string
  pasta?: string[] | string
  dessert?: string[] | string
  beverage?: string[] | string
  // Add the new column names from the database
  pasta_selection?: string[] | string
  dessert_selection?: string[] | string
  beverage_selection?: string[] | string
  additional_event_info?: string
  special_requests?: string
  status:
    | "PENDING_TASTING_CONFIRMATION"
    | "TASTING_CONFIRMED"
    | "TASTING_COMPLETED"
    | "confirmed"
    | "cancelled"
    | "completed"
  created_at: string
  budget_min?: number
  budget_max?: number
  total_package_amount?: number
  down_payment_amount?: number
  total_amount?: number
  deposit_amount?: number
  payment_status?: "unpaid" | "deposit_paid" | "fully_paid"
  updated_at?: string
  admin_notes?: string
}

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
      "Santo Nino",
      "Santo Rosario",
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
      "Ubihan",
      "Zamora",
    ],
    Pandi: [
      "Bagbaguin",
      "Bagong Barrio",
      "Baka-Bakahan",
      "Bunsuran 1st",
      "Bunsuran 2nd",
      "Bunsuran 3rd",
      "Cacarong Bata",
      "Cacarong Matanda",
      "Cupang",
      "Malibo",
      "Manatal",
      "Mapulang Lupa",
      "Masagana",
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
      "Burgos",
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
      "San Jose Patag",
      "Santa Rosa I",
      "Santa Rosa II",
      "Saog",
      "Tabing-Ilog",
    ],
  },
}

export default function MyAppointmentsClient() {
  const { user } = useAuth()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Cancel dialog state
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [cancelReason, setCancelReason] = useState("")
  const [cancelAttachment, setCancelAttachment] = useState<File | null>(null) // New state for cancellation attachment
  const [cancelAttachmentUrl, setCancelAttachmentUrl] = useState("") // New state for cancellation attachment URL
  const [uploadingAttachment, setUploadingAttachment] = useState(false) // New state for attachment upload progress
  const [cancelLoading, setCancelLoading] = useState(false)

  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editLoading, setEditLoading] = useState(false)
  const [menuItems, setMenuItems] = useState<Record<string, any[]>>({})
  const [loadingMenuItems, setLoadingMenuItems] = useState(false)
  const [editFormData, setEditFormData] = useState({
    venueName: "",
    venueProvince: "",
    venueCity: "",
    venueBarangay: "",
    venueStreet: "",
    venuePostalCode: "",
    guest_count: 0,
    main_courses: [] as string[],
    pasta_selection: [] as string[],
    dessert_selection: [] as string[],
    beverage_selection: [] as string[],
    theme: "",
    color_motif: "",
    special_requests: "",
    additional_event_info: "",
  })

  const [availableCities, setAvailableCities] = useState<string[]>([])
  const [availableBarangays, setAvailableBarangays] = useState<string[]>([])

  const timeSlots = [
    "6:00 AM",
    "7:00 AM",
    "8:00 AM",
    "9:00 AM",
    "10:00 AM",
    "11:00 AM",
    "12:00 PM",
    "1:00 PM",
    "2:00 PM",
    "3:00 PM",
    "4:00 PM",
    "5:00 PM",
    "6:00 PM",
    "7:00 PM",
    "8:00 PM",
    "9:00 PM",
    "10:00 PM",
  ]

  const fetchAppointments = async (showRefreshIndicator = false) => {
    if (!user?.id) {
      console.log("No user ID available for fetching appointments")
      setLoading(false)
      return
    }

    if (showRefreshIndicator) {
      setRefreshing(true)
    }

    try {
      console.log("Fetching appointments for user:", user.id)
      console.log("User object:", user)

      const response = await fetch("/api/scheduling/appointments", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        // Add cache busting to ensure fresh data
        cache: "no-cache",
      })

      console.log("API response status:", response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("API response error:", response.status, errorText)
        throw new Error(`Failed to fetch appointments: ${response.status} - ${errorText}`)
      }

      const data = await response.json()
      console.log("Appointments API response:", data)

      if (data.success) {
        console.log("Successfully fetched appointments:", data.appointments?.length || 0)
        setAppointments(data.appointments || [])
        setError(null)
      } else {
        console.error("API returned error:", data.error)
        throw new Error(data.error || "Failed to fetch appointments")
      }
    } catch (err) {
      console.error("Error fetching appointments:", err)
      setError(err instanceof Error ? err.message : "Failed to load appointments")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchAppointments()
  }, [user?.id])

  useEffect(() => {
    if (editDialogOpen && Object.keys(menuItems).length === 0) {
      fetchMenuItems()
    }
  }, [editDialogOpen])

  useEffect(() => {
    if (editFormData.venueProvince) {
      const cities = Object.keys(addressData[editFormData.venueProvince as keyof typeof addressData] || {})
      setAvailableCities(cities)
      if (!cities.includes(editFormData.venueCity)) {
        setEditFormData((prev) => ({ ...prev, venueCity: "", venueBarangay: "" }))
        setAvailableBarangays([])
      }
    } else {
      setAvailableCities([])
      setAvailableBarangays([])
      setEditFormData((prev) => ({ ...prev, venueCity: "", venueBarangay: "" }))
    }
  }, [editFormData.venueProvince])

  useEffect(() => {
    if (editFormData.venueProvince && editFormData.venueCity) {
      const barangays =
        addressData[editFormData.venueProvince as keyof typeof addressData]?.[
          editFormData.venueCity as keyof (typeof addressData)[keyof typeof addressData]
        ] || []
      setAvailableBarangays(barangays)
      if (!barangays.includes(editFormData.venueBarangay)) {
        setEditFormData((prev) => ({ ...prev, venueBarangay: "" }))
      }
    } else {
      setAvailableBarangays([])
      setEditFormData((prev) => ({ ...prev, venueBarangay: "" }))
    }
  }, [editFormData.venueProvince, editFormData.venueCity])

  const fetchMenuItems = async () => {
    setLoadingMenuItems(true)
    try {
      const response = await fetch("/api/menu-items/all")
      const data = await response.json()
      if (data.success) {
        setMenuItems(data.menuItems)
      }
    } catch (error) {
      console.error("Error fetching menu items:", error)
    } finally {
      setLoadingMenuItems(false)
    }
  }

  const handleRefresh = () => {
    fetchAppointments(true)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "TASTING_CONFIRMED":
        return "bg-green-100 text-green-800 border-green-200"
      case "PENDING_TASTING_CONFIRMATION":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "confirmed":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200"
      case "completed":
        return "bg-purple-100 text-purple-800 border-purple-200"
      case "TASTING_COMPLETED":
        return "bg-teal-100 text-teal-800 border-teal-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "PENDING_TASTING_CONFIRMATION":
        return "Pending Tasting"
      case "TASTING_CONFIRMED":
        return "Tasting Confirmed"
      case "confirmed":
        return "Confirmed"
      case "cancelled":
        return "Cancelled"
      case "completed":
        return "Completed"
      case "TASTING_COMPLETED":
        return "Tasting Completed"
      default:
        return status.charAt(0).toUpperCase() + status.slice(1)
    }
  }

  const formatEventDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "EEEE, MMMM d, yyyy")
    } catch {
      return dateString
    }
  }

  const formatCreatedDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM d, yyyy 'at' h:mm a")
    } catch {
      return dateString
    }
  }

  const formatUpdatedDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM d, yyyy 'at' h:mm a")
    } catch {
      return dateString
    }
  }

  // Helper function to safely render arrays or strings - Updated to handle both old and new column names
  const renderMenuItems = (items: string[] | string | undefined, itemName: string) => {
    if (!items) return null

    let itemsArray: string[] = []

    if (typeof items === "string") {
      try {
        // Try to parse as JSON first (in case it's a JSON string)
        const parsed = JSON.parse(items)
        if (Array.isArray(parsed)) {
          itemsArray = parsed.map((item) => (typeof item === "object" ? item.name || String(item) : String(item)))
        } else {
          // Handle comma-separated strings
          itemsArray = items
            .split(",")
            .map((item) => item.trim())
            .filter((item) => item.length > 0)
        }
      } catch {
        // If JSON parsing fails, treat as comma-separated string
        itemsArray = items
          .split(",")
          .map((item) => item.trim())
          .filter((item) => item.length > 0)
      }
    } else if (Array.isArray(items)) {
      // Handle arrays - make sure all items are strings
      itemsArray = items
        .map((item) => {
          if (typeof item === "object" && item !== null) {
            // If it's an object, try to extract meaningful text
            if ("name" in item) return String(item.name)
            if ("category" in item) return String(item.category)
            return JSON.stringify(item)
          }
          return String(item)
        })
        .filter((item) => item.length > 0)
    }

    if (itemsArray.length === 0) return null

    return (
      <div className="mb-3">
        <p className="font-medium text-sm text-gray-500 mb-2">{itemName}</p>
        <div className="space-y-1">
          {itemsArray.map((item, index) => (
            <div key={index} className="flex items-center gap-2 text-sm text-gray-900">
              <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const handleReschedule = (appointment: Appointment) => {
    // Navigate to dedicated reschedule page with smart calendar
    window.location.href = `/my-appointments/reschedule?id=${appointment.id}`
  }

  // Handle attachment change and upload
  const handleAttachmentChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("File size must be less than 5MB")
      return
    }

    setCancelAttachment(file)
  }

  const handleOpenCancelDialog = (appointment: Appointment) => {
    setSelectedAppointment(appointment)
    setCancelDialogOpen(true)
    setCancelReason("")
    setCancelAttachment(null)
    setCancelAttachmentUrl("")
  }

  const handleCancelAppointment = async (appointmentToProcess?: Appointment) => {
    const appointment = appointmentToProcess || selectedAppointment
    if (!appointment) return

    // Check against corrected payment status values
    const isPaid = appointment.payment_status === "deposit_paid" || appointment.payment_status === "fully_paid"

    console.log("[v0] Canceling appointment:", {
      id: appointment.id,
      isPaid,
      payment_status: appointment.payment_status,
    })

    // For paid appointments, create a cancellation request
    if (isPaid) {
      if (!cancelReason.trim()) {
        alert("Please provide a reason for cancellation")
        return
      }

      console.log("[v0] Submitting cancellation request with reason:", cancelReason)

      setCancelLoading(true)
      try {
        let attachmentUrl = null
        if (cancelAttachment) {
          setUploadingAttachment(true) // Indicate upload in progress
          const formData = new FormData()
          formData.append("file", cancelAttachment)
          formData.append("appointmentId", appointment.id.toString())

          console.log("[v0] Uploading attachment:", cancelAttachment.name)

          const uploadResponse = await fetch("/api/upload-cancellation-attachment", {
            method: "POST",
            body: formData,
          })

          if (!uploadResponse.ok) {
            const errorText = await uploadResponse.text()
            console.error("[v0] Upload error:", uploadResponse.status, errorText)
            setUploadingAttachment(false)
            throw new Error(`Failed to upload attachment: ${errorText}`)
          }

          const uploadData = await uploadResponse.json()
          attachmentUrl = uploadData.url
          console.log("[v0] Attachment uploaded successfully:", attachmentUrl)
          setUploadingAttachment(false) // Upload complete
        }

        console.log("[v0] Submitting cancellation request to API:", {
          appointmentId: appointment.id,
          reason: cancelReason,
          attachmentUrl,
        })

        const response = await fetch("/api/cancellation-requests", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            appointmentId: appointment.id,
            reason: cancelReason,
            attachmentUrl,
          }),
        })

        let data
        const contentType = response.headers.get("content-type")
        if (contentType && contentType.includes("application/json")) {
          data = await response.json()
        } else {
          const text = await response.text()
          console.error("[v0] Non-JSON response:", text)
          data = { success: false, error: text || "Unexpected response from server" }
        }

        console.log("[v0] Cancellation request response:", { status: response.status, data })

        if (response.ok && data.success) {
          alert("Cancellation request submitted successfully. Admin will review your request.")
          await fetchAppointments()
          setCancelDialogOpen(false)
          setCancelReason("")
          setCancelAttachment(null)
          setCancelAttachmentUrl("") // Clear URL as well
          setSelectedAppointment(null) // Clear selected appointment
        } else {
          const errorMessage = data.error || `Server error: ${response.status}`
          console.error("[v0] Cancellation request failed:", errorMessage)
          alert(`Failed to submit cancellation request: ${errorMessage}`)
        }
      } catch (error) {
        console.error("[v0] Error submitting cancellation request:", error)
        alert(
          `Failed to submit cancellation request. Please try again. Error: ${error instanceof Error ? error.message : "Unknown error"}`,
        )
      } finally {
        setCancelLoading(false)
        setUploadingAttachment(false) // Ensure this is false if error occurs
      }
    } else {
      // For unpaid appointments, cancel directly
      setCancelLoading(true)
      try {
        const response = await fetch(`/api/scheduling/appointments/${appointment.id}/cancel`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            reason: "User cancelled unpaid appointment",
          }),
        })

        if (response.ok) {
          alert("Appointment cancelled successfully.")
          await fetchAppointments()
          setCancelDialogOpen(false)
          setCancelReason("")
          setSelectedAppointment(null)
        } else {
          const errorText = await response.text()
          console.error("API cancel error:", response.status, errorText)
          alert("Failed to cancel appointment. Please try again.")
        }
      } catch (error) {
        console.error("Error cancelling appointment:", error)
        alert("Failed to cancel appointment. Please try again.")
      } finally {
        setCancelLoading(false)
      }
    }
  }

  const handleEdit = (appointment: Appointment) => {
    setSelectedAppointment(appointment)

    // Parse menu items
    const parseMenuItems = (items: string[] | string | undefined): string[] => {
      if (!items) return []
      if (typeof items === "string") {
        try {
          const parsed = JSON.parse(items)
          if (Array.isArray(parsed)) {
            return parsed.map((item) => (typeof item === "object" ? item.name || String(item) : String(item)))
          }
          return items
            .split(",")
            .map((item) => item.trim())
            .filter((item) => item.length > 0)
        } catch {
          return items
            .split(",")
            .map((item) => item.trim())
            .filter((item) => item.length > 0)
        }
      } else if (Array.isArray(items)) {
        return items.map((item) => {
          if (typeof item === "object" && item !== null) {
            if ("name" in item) return String(item.name)
            if ("item_name" in item) return String(item.item_name)
            if ("category" in item) return String(item.category)
            return JSON.stringify(item)
          }
          return String(item)
        })
      }
      return []
    }

    const venueAddress = appointment.venue_address || ""
    const venueParts = venueAddress.split(", ").map((part) => part.trim())

    // Order: Venue Name, Street, Barangay, City, Province, Postal Code
    const province = venueParts[4] || ""
    const city = venueParts[3] || ""
    const barangay = venueParts[2] || ""

    // Pre-populate cascading dropdowns
    if (province && addressData[province as keyof typeof addressData]) {
      const cities = Object.keys(addressData[province as keyof typeof addressData])
      setAvailableCities(cities)

      if (
        city &&
        addressData[province as keyof typeof addressData]?.[
          city as keyof (typeof addressData)[keyof typeof addressData]
        ]
      ) {
        const barangays =
          addressData[province as keyof typeof addressData][
            city as keyof (typeof addressData)[keyof typeof addressData]
          ] || []
        setAvailableBarangays(barangays)
      }
    }

    setEditFormData({
      venueName: venueParts[0] || "",
      venueStreet: venueParts[1] || "",
      venueBarangay: barangay,
      venueCity: city,
      venueProvince: province,
      venuePostalCode: venueParts[5] || "",
      guest_count: appointment.guest_count || 0,
      main_courses: parseMenuItems(appointment.main_courses),
      pasta_selection: parseMenuItems(appointment.pasta || appointment.pasta_selection),
      dessert_selection: parseMenuItems(appointment.dessert || appointment.dessert_selection),
      beverage_selection: parseMenuItems(appointment.beverage || appointment.beverage_selection),
      theme: appointment.theme || "",
      color_motif: appointment.color_motif || "",
      special_requests: appointment.special_requests || "",
      additional_event_info: appointment.additional_event_info || "",
    })
    setEditDialogOpen(true)
  }

  const getGuestCountOptions = () => {
    if (!selectedAppointment) return [50, 80, 100, 150, 200] // Default

    const eventType = selectedAppointment.event_type
    if (eventType === "wedding") {
      return [50, 100, 150, 200, 300]
    } else if (eventType === "debut") {
      return [50, 80, 100, 150, 200]
    } else {
      return [50, 80, 100, 150, 200]
    }
  }

  const toggleMenuItem = (category: string, itemName: string) => {
    const categoryKey =
      category === "beef" || category === "pork"
        ? "main_courses"
        : category === "chicken"
          ? "main_courses"
          : category === "seafood" || category === "vegetables"
            ? "main_courses"
            : category === "pasta"
              ? "pasta_selection"
              : category === "dessert"
                ? "dessert_selection"
                : "beverage_selection"

    setEditFormData((prev) => {
      const currentItems = prev[categoryKey]
      if (currentItems.includes(itemName)) {
        return {
          ...prev,
          [categoryKey]: currentItems.filter((item) => item !== itemName),
        }
      } else {
        return {
          ...prev,
          [categoryKey]: [...currentItems, itemName],
        }
      }
    })
  }

  const calculateTotalAmount = () => {
    if (!selectedAppointment) return 0

    const guestCount = editFormData.guest_count
    const eventType = selectedAppointment.event_type
    let menuTotal = 0

    const allSelectedItems = [
      ...editFormData.main_courses,
      ...editFormData.pasta_selection,
      ...editFormData.dessert_selection,
      ...editFormData.beverage_selection,
    ]

    // Find prices from menu items
    Object.values(menuItems)
      .flat()
      .forEach((item) => {
        if (allSelectedItems.includes(item.item_name || item.name)) {
          const pricePerGuest = item.price_per_guest || item.price || 0
          menuTotal += pricePerGuest * guestCount
        }
      })

    let serviceFee = 0

    if (eventType === "wedding") {
      // Wedding package pricing
      const weddingPrices: Record<number, number> = {
        50: 56500,
        100: 63000,
        150: 74500,
        200: 86000,
        300: 109000,
      }
      serviceFee = weddingPrices[guestCount] || 0
    } else if (eventType === "debut") {
      // Debut package pricing
      const debutPrices: Record<number, number> = {
        50: 21500,
        80: 26400,
        100: 28000,
        150: 36500,
        200: 36000,
      }
      serviceFee = debutPrices[guestCount] || 0
    } else {
      // Standard service fee for other events (corporate, birthday, etc.)
      const standardServiceFees: Record<number, number> = {
        50: 11500,
        80: 10400,
        100: 11000,
        150: 16500,
        200: 22000,
      }
      serviceFee = standardServiceFees[guestCount] || 0
    }

    return menuTotal + serviceFee
  }

  const getServiceFeeInfo = () => {
    if (!selectedAppointment) return null

    const eventType = selectedAppointment.event_type
    const guestCount = editFormData.guest_count

    if (eventType === "wedding") {
      const weddingPrices: Record<number, number> = {
        50: 56500,
        100: 63000,
        150: 74500,
        200: 86000,
        300: 109000,
      }
      return {
        fee: weddingPrices[guestCount] || 0,
        title: "Wedding Package Fee",
        items: [
          "Rice & Drinks",
          "Full Skirted Buffet Table w/ Faux Floral Centerpiece",
          "Guest Chairs & Tables with Complete Linens & Themed Centerpiece",
          "2 (10) Presidential Tables with mix of Artificial & floral runners + Complete Table setup & Glasswares + Crystal Chairs",
          "Couple's Table w/ Fresh Floral centerpiece & Couple's Couch",
          "Cake Cylinder Plinth",
          "White Carpet Aisle",
          "Waiters & Food Attendant in Complete Uniform",
          "Semi Customized Backdrop Styling with full faux Flower design, Couples Couch + 6x6 Round Flatform Stage with decor + Thematic Tunnel Entrance",
        ],
      }
    } else if (eventType === "debut") {
      const debutPrices: Record<number, number> = {
        50: 21500,
        80: 26400,
        100: 28000,
        150: 36500,
        200: 36000,
      }
      return {
        fee: debutPrices[guestCount] || 0,
        title: "Debut Package Fee",
        items: [
          "Rice & Drinks",
          "Buffet Table with Complete Set-up",
          "Tables & Chairs with Complete Linens & Covers",
          "Themed Table Centerpiece",
          "Basic Backdrop Styling (Free: Letter Cut)",
          "Waiters & Food Attendant in complete Uniforms",
          "4 Hours Service Time",
          "Free Fresh 18 Red Roses & 18 Candles",
        ],
      }
    } else {
      const standardServiceFees: Record<number, number> = {
        50: 11500,
        80: 10400,
        100: 11000,
        150: 16500,
        200: 22000,
      }
      return {
        fee: standardServiceFees[guestCount] || 0,
        title: "Service Fee",
        items: [
          "Steamed Rice",
          "Purified Mineral Water",
          "1 Choice of Drink",
          "Elegant Buffet Table",
          "Guest Chairs & Tables",
          "With Complete Setup",
          "Table Centerpiece",
          "Friendly Waiters & Food Attendant",
          "4 Hours Service",
        ],
      }
    }
  }

  const getMenuTotal = () => {
    if (!selectedAppointment) return 0

    const guestCount = editFormData.guest_count
    let menuTotal = 0

    const allSelectedItems = [
      ...editFormData.main_courses,
      ...editFormData.pasta_selection,
      ...editFormData.dessert_selection,
      ...editFormData.beverage_selection,
    ]

    Object.values(menuItems)
      .flat()
      .forEach((item) => {
        if (allSelectedItems.includes(item.item_name || item.name)) {
          const pricePerGuest = item.price_per_guest || item.price || 0
          menuTotal += pricePerGuest * guestCount
        }
      })

    return menuTotal
  }

  const submitEdit = async () => {
    if (!selectedAppointment) return

    const venueAddress = [
      editFormData.venueName,
      editFormData.venueStreet,
      editFormData.venueBarangay,
      editFormData.venueCity,
      editFormData.venueProvince,
      editFormData.venuePostalCode,
    ]
      .filter(Boolean)
      .join(", ")

    const totalAmount = calculateTotalAmount()

    setEditLoading(true)
    try {
      const response = await fetch(`/api/appointments/${selectedAppointment.id}/update`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          venue_address: venueAddress,
          guest_count: editFormData.guest_count,
          main_courses: editFormData.main_courses,
          pasta_selection: editFormData.pasta_selection,
          dessert_selection: editFormData.dessert_selection,
          beverage_selection: editFormData.beverage_selection,
          theme: editFormData.theme,
          color_motif: editFormData.color_motif,
          special_requests: editFormData.special_requests,
          additional_event_info: editFormData.additional_event_info,
          total_package_amount: totalAmount,
          down_payment_amount: Math.round(totalAmount * 0.5),
        }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        await fetchAppointments()
        setEditDialogOpen(false)
      } else {
        alert(data.error || "Failed to update appointment. Please try again.")
      }
    } catch (error) {
      console.error("Error updating appointment:", error)
      alert("Failed to update appointment. Please try again.")
    } finally {
      setEditLoading(false)
    }
  }

  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)

  if (loading) {
    return (
      <div className="container mx-auto py-10 px-4 md:px-6">
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rose-600"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto py-10 px-4 md:px-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">My Appointments</h1>
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <p className="text-red-600">Error: {error}</p>
            <p className="text-sm text-gray-500 mt-2">
              Please try refreshing the page or contact support if the issue persists.
            </p>
            <Button onClick={handleRefresh} className="mt-4 bg-transparent" variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10 px-4 md:px-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">My Appointments</h1>
          <p className="text-gray-600">View and manage your catering appointments</p>
        </div>
        <Button onClick={handleRefresh} variant="outline" disabled={refreshing}>
          <RefreshCw className={cn("h-4 w-4 mr-2", refreshing && "animate-spin")} />
          {refreshing ? "Refreshing..." : "Refresh"}
        </Button>
      </div>

      {appointments.length === 0 ? (
        <div className="text-center py-12">
          <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No appointments yet</h3>
          <p className="text-gray-500 mb-6">You haven't booked any appointments with us yet.</p>
          <a
            href="/book-appointment"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-rose-600 hover:bg-rose-700"
          >
            Book Your First Appointment
          </a>
        </div>
      ) : (
        <div className="space-y-8">
          {appointments.map((appointment) => {
            // Check for menu items in both old and new column names
            const mainCourses = appointment.main_courses
            const pasta = appointment.pasta || appointment.pasta_selection
            const dessert = appointment.dessert || appointment.dessert_selection
            const beverage = appointment.beverage || appointment.beverage_selection

            return (
              <Card key={appointment.id} className="overflow-hidden shadow-lg">
                <CardHeader className="border-b bg-white">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl capitalize text-gray-900">{appointment.event_type} Event</CardTitle>
                    <Badge className={getStatusColor(appointment.status)}>{getStatusLabel(appointment.status)}</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>Booked on {formatCreatedDate(appointment.created_at)}</span>
                    {appointment.updated_at && appointment.updated_at !== appointment.created_at && (
                      <span className="text-blue-600">Updated {formatUpdatedDate(appointment.updated_at)}</span>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid gap-8 lg:grid-cols-2">
                    {/* Left Column - Event Details */}
                    <div className="space-y-6">
                      {/* Event Information */}
                      <div className="border rounded-lg p-4">
                        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          Event Details
                        </h4>

                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <div>
                              <p className="font-medium text-sm text-gray-500">Event Date</p>
                              <p className="text-gray-900">{formatEventDate(appointment.event_date)}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <div>
                              <p className="font-medium text-sm text-gray-500">Time Slot</p>
                              <p className="text-gray-900">{getTimeRange(appointment.event_time)}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <Users className="h-4 w-4 text-gray-400" />
                            <div>
                              <p className="font-medium text-sm text-gray-500">Guest Count</p>
                              <p className="text-gray-900">{appointment.guest_count} guests</p>
                            </div>
                          </div>

                          <div className="flex items-start gap-3">
                            <MapPin className="h-4 w-4 text-gray-400 mt-1" />
                            <div>
                              <p className="font-medium text-sm text-gray-500">Venue</p>
                              <p className="text-gray-900">{appointment.venue_address}</p>
                            </div>
                          </div>

                          {appointment.theme && (
                            <div className="flex items-center gap-3">
                              <div className="h-3 w-3 bg-gray-300 rounded-full" />
                              <div>
                                <p className="font-medium text-sm text-gray-500">Theme</p>
                                <p className="text-gray-900">{appointment.theme}</p>
                              </div>
                            </div>
                          )}

                          {appointment.color_motif && (
                            <div className="flex items-center gap-3">
                              <div className="h-3 w-3 bg-gray-300 rounded-full" />
                              <div>
                                <p className="font-medium text-sm text-gray-500">Color Motif</p>
                                <p className="text-gray-900">{appointment.color_motif}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Celebrant/Couple Information */}
                      {(appointment.celebrant_name || appointment.groom_name || appointment.bride_name) && (
                        <div className="border rounded-lg p-4">
                          <h5 className="text-lg font-semibold text-gray-900 mb-4">
                            {appointment.event_type === "wedding" ? "Couple Information" : "Celebrant Information"}
                          </h5>
                          {appointment.event_type === "wedding" ? (
                            <div className="space-y-3">
                              {appointment.groom_name && (
                                <div>
                                  <p className="font-medium text-sm text-gray-500">Groom</p>
                                  <p className="text-gray-900">{appointment.groom_name}</p>
                                </div>
                              )}
                              {appointment.bride_name && (
                                <div>
                                  <p className="font-medium text-sm text-gray-500">Bride</p>
                                  <p className="text-gray-900">{appointment.bride_name}</p>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="space-y-3">
                              <div>
                                <p className="font-medium text-sm text-gray-500">Name</p>
                                <p className="text-gray-900">{appointment.celebrant_name}</p>
                              </div>
                              {appointment.celebrant_age && (
                                <div>
                                  <p className="font-medium text-sm text-gray-500">Age</p>
                                  <p className="text-gray-900">{appointment.celebrant_age} years old</p>
                                </div>
                              )}
                              {appointment.celebrant_gender && (
                                <div>
                                  <p className="font-medium text-sm text-gray-500">Gender</p>
                                  <p className="text-gray-900 capitalize">
                                    {appointment.celebrant_gender === "other"
                                      ? "Rather not say"
                                      : appointment.celebrant_gender}
                                  </p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Right Column - Menu & Package */}
                    <div className="space-y-6">
                      {/* Menu Information */}
                      <div className="border rounded-lg p-4">
                        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                          <Utensils className="h-4 w-4" />
                          Menu Selection
                        </h4>

                        <div className="space-y-4">
                          {renderMenuItems(mainCourses, "Main Courses")}
                          {renderMenuItems(pasta, "Pasta")}
                          {renderMenuItems(dessert, "Dessert")}
                          {renderMenuItems(beverage, "Beverages")}

                          {/* Show message if no menu items are selected */}
                          {!mainCourses && !pasta && !dessert && !beverage && (
                            <div className="text-center py-6">
                              <Utensils className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                              <p className="text-gray-500 text-sm">No menu items selected yet</p>
                              <p className="text-gray-400 text-xs mt-1">Menu will be finalized during tasting</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Package Information */}
                      <div className="border rounded-lg p-4">
                        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                          <CreditCard className="h-4 w-4" />
                          Package Information
                        </h4>

                        <div className="space-y-3">
                          {/* Total Package Amount */}
                          {(appointment.total_package_amount || appointment.total_amount || appointment.budget_min) && (
                            <div className="flex justify-between items-center py-2 border-b border-gray-100">
                              <span className="text-sm text-gray-500">Total Package Amount</span>
                              <span className="font-semibold text-gray-900">
                                ₱
                                {(
                                  appointment.total_package_amount ||
                                  appointment.total_amount ||
                                  appointment.budget_min ||
                                  0
                                ).toLocaleString()}
                              </span>
                            </div>
                          )}

                          {/* Down Payment */}
                          {(appointment.down_payment_amount ||
                            appointment.deposit_amount ||
                            (appointment.total_package_amount &&
                              Math.round(appointment.total_package_amount * 0.5))) && (
                            <div className="flex justify-between items-center py-2 border-b border-gray-100">
                              <span className="text-sm text-gray-500">Down Payment (50%)</span>
                              <span className="font-medium text-gray-900">
                                ₱
                                {(
                                  appointment.down_payment_amount ||
                                  appointment.deposit_amount ||
                                  (appointment.total_package_amount
                                    ? Math.round(appointment.total_package_amount * 0.5)
                                    : 0)
                                ).toLocaleString()}
                              </span>
                            </div>
                          )}

                          {/* Payment Status */}
                          <div className="flex justify-between items-center py-2">
                            <span className="text-sm text-gray-500">Payment Status</span>
                            <div className="flex items-center gap-2">
                              <div
                                className={`w-2 h-2 rounded-full ${
                                  appointment.payment_status === "unpaid"
                                    ? "bg-red-400"
                                    : appointment.payment_status === "deposit_paid"
                                      ? "bg-yellow-400"
                                      : appointment.payment_status === "fully_paid"
                                        ? "bg-green-400"
                                        : "bg-gray-400"
                                }`}
                              />
                              <span className="text-sm font-medium text-gray-900">
                                {(appointment.status === "TASTING_COMPLETED" || appointment.status === "confirmed") &&
                                appointment.payment_status === "unpaid"
                                  ? "Ready for Payment"
                                  : appointment.payment_status === "deposit_paid"
                                    ? "Down Payment Received"
                                    : appointment.payment_status === "fully_paid"
                                      ? "Fully Paid"
                                      : "Awaiting Tasting"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Additional Information */}
                  {(appointment.additional_event_info || appointment.special_requests || appointment.admin_notes) && (
                    <div className="mt-8 border rounded-lg p-4 md:col-span-2">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h4>
                      <div className="grid gap-4 md:grid-cols-2">
                        {appointment.additional_event_info && (
                          <div>
                            <p className="font-medium text-sm text-gray-500 mb-2">Event Information</p>
                            <p className="text-gray-900 text-sm">{appointment.additional_event_info}</p>
                          </div>
                        )}
                        {appointment.special_requests && (
                          <div>
                            <p className="font-medium text-sm text-gray-500 mb-2">Special Requests</p>
                            <p className="text-gray-900 text-sm">{appointment.special_requests}</p>
                          </div>
                        )}
                        {appointment.admin_notes && (
                          <div className="md:col-span-2">
                            <p className="font-medium text-sm text-gray-500 mb-2">Admin Notes</p>
                            <div className="text-gray-900 text-sm whitespace-pre-line bg-gray-50 p-3 rounded">
                              {appointment.admin_notes}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="mt-8 flex flex-col gap-3 pt-6 border-t md:col-span-2">
                    {appointment.payment_status === "unpaid" &&
                      appointment.status !== "cancelled" &&
                      appointment.status !== "completed" && (
                        <Button
                          variant="outline"
                          onClick={() => handleEdit(appointment)}
                          className="w-full border-blue-300 text-blue-600 hover:bg-blue-50"
                        >
                          <Pencil className="h-4 w-4 mr-2" />
                          Edit Event Details
                        </Button>
                      )}

                    {(appointment.status === "TASTING_COMPLETED" || appointment.status === "confirmed") &&
                    appointment.payment_status === "unpaid" ? (
                      <>
                        {/* Primary Payment Button */}
                        <Button asChild className="w-full bg-green-600 hover:bg-green-700 text-white">
                          <a href="/payment" className="flex items-center justify-center gap-2">
                            <CreditCard className="h-4 w-4 mr-2" />
                            Proceed to Payment
                          </a>
                        </Button>

                        {/* Secondary Action Buttons */}
                        <div className="flex gap-3">
                          <Button
                            variant="outline"
                            onClick={() => handleReschedule(appointment)}
                            className="flex-1 border-gray-300 hover:bg-gray-50"
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Reschedule
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => handleOpenCancelDialog(appointment)}
                            className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
                          >
                            <X className="h-4 w-4 mr-2" />
                            Cancel
                          </Button>
                        </div>
                      </>
                    ) : appointment.status !== "cancelled" && appointment.status !== "completed" ? (
                      <div className="flex gap-3">
                        <Button
                          variant="outline"
                          onClick={() => handleReschedule(appointment)}
                          className="flex-1 border-gray-300 hover:bg-gray-50"
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Reschedule
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => handleOpenCancelDialog(appointment)}
                          className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
                        >
                          <X className="h-4 w-4 mr-2" />
                          Cancel
                        </Button>
                      </div>
                    ) : null}
                  </div>

                  {/* Status Messages */}
                  {(appointment.status === "TASTING_COMPLETED" || appointment.status === "confirmed") &&
                    appointment.payment_status === "unpaid" && (
                      <div className="mt-6 p-4 border border-gray-200 rounded-lg md:col-span-2">
                        <p className="font-medium text-gray-900">
                          {appointment.status === "confirmed"
                            ? "Tasting Skipped - Ready for Payment!"
                            : "Tasting Complete - Ready for Payment!"}
                        </p>
                        <p className="text-gray-600 text-sm mt-1">
                          {appointment.status === "confirmed"
                            ? "You've chosen to skip the food tasting. Please proceed to payment to finalize your booking. You can still reschedule or cancel if needed."
                            : "Your tasting session is complete! Please proceed to payment to finalize your booking. You can still reschedule or cancel if needed."}
                        </p>
                      </div>
                    )}
                  {appointment.payment_status === "deposit_paid" && appointment.status !== "confirmed" && (
                    <div className="mt-6 p-4 border border-gray-200 rounded-lg md:col-span-2">
                      <p className="font-medium text-gray-900">Payment Under Review</p>
                      <p className="text-gray-600 text-sm mt-1">
                        Your down payment is being verified by our team. We'll notify you once it's confirmed.
                      </p>
                    </div>
                  )}
                  {appointment.payment_status === "fully_paid" && appointment.status !== "confirmed" && (
                    <div className="mt-6 p-4 border border-gray-200 rounded-lg md:col-span-2">
                      <p className="font-medium text-gray-900">Payment Under Review</p>
                      <p className="text-gray-600 text-sm mt-1">
                        Your full payment is being verified by our team. We'll notify you once it's confirmed.
                      </p>
                    </div>
                  )}
                  {appointment.status === "confirmed" && (
                    <div className="mt-6 p-4 border border-gray-200 rounded-lg md:col-span-2">
                      <p className="font-medium text-gray-900">Booking Confirmed!</p>
                      <p className="text-gray-600 text-sm mt-1">
                        Your payment has been verified and your event is locked in. We're excited to be part of your
                        special day!
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Cancel Dialog */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedAppointment?.payment_status === "deposit_paid" ||
              selectedAppointment?.payment_status === "fully_paid"
                ? "Request Cancellation"
                : "Cancel Appointment"}
            </DialogTitle>
            <DialogDescription>
              {selectedAppointment?.payment_status === "deposit_paid" ||
              selectedAppointment?.payment_status === "fully_paid"
                ? "Since payment has been made, your cancellation will need admin approval. Please provide a detailed reason."
                : "Are you sure you want to cancel this appointment? This action cannot be undone."}
            </DialogDescription>
          </DialogHeader>
          {(selectedAppointment?.payment_status === "deposit_paid" ||
            selectedAppointment?.payment_status === "fully_paid") && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="cancelReason">
                  Reason for Cancellation <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="cancelReason"
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Please provide a detailed reason for cancelling your appointment"
                  rows={4}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="cancelAttachment">Attachment (Optional)</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="cancelAttachment"
                    type="file"
                    onChange={handleAttachmentChange}
                    accept="image/*,.pdf"
                    disabled={uploadingAttachment}
                    className="cursor-pointer"
                  />
                  {uploadingAttachment && <span className="text-sm text-muted-foreground">Uploading...</span>}
                </div>
                {cancelAttachment && <p className="text-sm text-muted-foreground">Selected: {cancelAttachment.name}</p>}
                <p className="text-xs text-muted-foreground">Upload supporting documents if applicable (max 5MB)</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCancelDialogOpen(false)}
              disabled={cancelLoading || uploadingAttachment}
            >
              Go Back
            </Button>
            <Button
              onClick={() => handleCancelAppointment()}
              variant="destructive"
              disabled={
                cancelLoading ||
                uploadingAttachment ||
                ((selectedAppointment?.payment_status === "deposit_paid" ||
                  selectedAppointment?.payment_status === "fully_paid") &&
                  !cancelReason.trim())
              }
            >
              {cancelLoading
                ? "Processing..."
                : selectedAppointment?.payment_status === "deposit_paid" ||
                    selectedAppointment?.payment_status === "fully_paid"
                  ? "Submit Request"
                  : "Cancel Appointment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Event Details</DialogTitle>
            <DialogDescription>
              Update your event information. Changes can only be made before payment.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            {/* Venue Address Section */}
            <div className="space-y-4">
              <h4 className="font-semibold text-sm">Venue Address</h4>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="venueName">Venue/Hall Name</Label>
                  <Input
                    id="venueName"
                    value={editFormData.venueName}
                    onChange={(e) => setEditFormData({ ...editFormData, venueName: e.target.value })}
                    placeholder="e.g., Blessed Hall, Garden Pavilion"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="venueProvince">Province *</Label>
                    <Select
                      value={editFormData.venueProvince}
                      onValueChange={(value) =>
                        setEditFormData({ ...editFormData, venueProvince: value, venueCity: "", venueBarangay: "" })
                      }
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

                  <div className="grid gap-2">
                    <Label htmlFor="venueCity">City/Municipality *</Label>
                    <Select
                      value={editFormData.venueCity}
                      onValueChange={(value) =>
                        setEditFormData({ ...editFormData, venueCity: value, venueBarangay: "" })
                      }
                      disabled={!editFormData.venueProvince}
                    >
                      <SelectTrigger>
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
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="venueBarangay">Barangay *</Label>
                    <Select
                      value={editFormData.venueBarangay}
                      onValueChange={(value) => setEditFormData({ ...editFormData, venueBarangay: value })}
                      disabled={!editFormData.venueCity}
                    >
                      <SelectTrigger>
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

                  <div className="grid gap-2">
                    <Label htmlFor="venuePostalCode">Postal Code</Label>
                    <Input
                      id="venuePostalCode"
                      value={editFormData.venuePostalCode}
                      onChange={(e) => setEditFormData({ ...editFormData, venuePostalCode: e.target.value })}
                      placeholder="e.g., 1400"
                      maxLength={4}
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="venueStreet">Street Address *</Label>
                  <Input
                    id="venueStreet"
                    value={editFormData.venueStreet}
                    onChange={(e) => setEditFormData({ ...editFormData, venueStreet: e.target.value })}
                    placeholder="e.g., 123 Main Street"
                  />
                </div>
              </div>
            </div>

            {/* Guest Count */}
            <div className="grid gap-2">
              <Label htmlFor="guest_count">Guest Count *</Label>
              <Select
                value={editFormData.guest_count.toString()}
                onValueChange={(value) => setEditFormData({ ...editFormData, guest_count: Number.parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select guest count" />
                </SelectTrigger>
                <SelectContent>
                  {getGuestCountOptions().map((count) => (
                    <SelectItem key={count} value={count.toString()}>
                      {count} guests
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Menu Composition & Selection</h3>
                <div className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
                  Structured Menu System
                </div>
              </div>

              {loadingMenuItems ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-rose-600 mx-auto"></div>
                  <p className="text-sm text-gray-500 mt-2">Loading menu items...</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Menu 1: Beef, Pork */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-base font-medium">🥩 Menu 1: Beef, Pork</label>
                      <span className="text-sm text-gray-500">
                        {
                          editFormData.main_courses.filter((item) =>
                            [...(menuItems.beef || []), ...(menuItems.pork || [])].some(
                              (menuItem) => (menuItem.item_name || menuItem.name) === item,
                            ),
                          ).length
                        }{" "}
                        selected
                      </span>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                      {["beef", "pork"].map((category) => (
                        <div key={category} className="space-y-3 border rounded-lg p-4">
                          <h4 className="font-medium capitalize text-gray-700 dark:text-gray-300 border-b pb-2">
                            {category}
                          </h4>
                          <div className="space-y-2">
                            {menuItems[category] && menuItems[category].length > 0 ? (
                              menuItems[category].map((item) => {
                                const itemName = item.item_name || item.name
                                return (
                                  <label
                                    key={item.id}
                                    className="flex items-start space-x-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 p-1 rounded"
                                  >
                                    <input
                                      type="checkbox"
                                      checked={editFormData.main_courses.includes(itemName)}
                                      onChange={() => toggleMenuItem(category, itemName)}
                                      className="mt-1 rounded border-gray-300 text-rose-600 focus:ring-rose-500 flex-shrink-0"
                                    />
                                    <div className="flex-1">
                                      <span className="text-sm leading-tight">{itemName}</span>
                                    </div>
                                  </label>
                                )
                              })
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
                      <span className="text-sm text-gray-500">
                        {
                          editFormData.main_courses.filter((item) =>
                            (menuItems.chicken || []).some(
                              (menuItem) => (menuItem.item_name || menuItem.name) === item,
                            ),
                          ).length
                        }{" "}
                        selected
                      </span>
                    </div>

                    <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
                      <div className="space-y-3 border rounded-lg p-4">
                        <h4 className="font-medium capitalize text-gray-700 dark:text-gray-300">Chicken</h4>
                        <div className="space-y-2">
                          {menuItems.chicken && menuItems.chicken.length > 0 ? (
                            menuItems.chicken.map((item) => {
                              const itemName = item.item_name || item.name
                              return (
                                <label
                                  key={item.id}
                                  className="flex items-start space-x-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 p-1 rounded"
                                >
                                  <input
                                    type="checkbox"
                                    checked={editFormData.main_courses.includes(itemName)}
                                    onChange={() => toggleMenuItem("chicken", itemName)}
                                    className="mt-1 rounded border-gray-300 text-rose-600 focus:ring-rose-500 flex-shrink-0"
                                  />
                                  <div className="flex-1">
                                    <span className="text-sm leading-tight">{itemName}</span>
                                  </div>
                                </label>
                              )
                            })
                          ) : (
                            <div className="text-sm text-gray-500 italic">No items available in this category</div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Menu 3: Seafood, Vegetables */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-base font-medium">🐟 Menu 3: Seafood, Vegetables</label>
                      <span className="text-sm text-gray-500">
                        {
                          editFormData.main_courses.filter((item) =>
                            [...(menuItems.seafood || []), ...(menuItems.vegetables || [])].some(
                              (menuItem) => (menuItem.item_name || menuItem.name) === item,
                            ),
                          ).length
                        }{" "}
                        selected
                      </span>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                      {["seafood", "vegetables"].map((category) => (
                        <div key={category} className="space-y-3 border rounded-lg p-4">
                          <h4 className="font-medium capitalize text-gray-700 dark:text-gray-300 border-b pb-2">
                            {category === "seafood" ? "Seafood" : "Vegetables"}
                          </h4>
                          <div className="space-y-2">
                            {menuItems[category] && menuItems[category].length > 0 ? (
                              menuItems[category].map((item) => {
                                const itemName = item.item_name || item.name
                                return (
                                  <label
                                    key={item.id}
                                    className="flex items-start space-x-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 p-1 rounded"
                                  >
                                    <input
                                      type="checkbox"
                                      checked={editFormData.main_courses.includes(itemName)}
                                      onChange={() => toggleMenuItem(category, itemName)}
                                      className="mt-1 rounded border-gray-300 text-rose-600 focus:ring-rose-500 flex-shrink-0"
                                    />
                                    <div className="flex-1">
                                      <span className="text-sm leading-tight">{itemName}</span>
                                    </div>
                                  </label>
                                )
                              })
                            ) : (
                              <div className="text-sm text-gray-500 italic">No items available in this category</div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Extras: Pasta, Dessert, Beverage */}
                  <div className="border-t pt-6">
                    <h4 className="text-base font-medium mb-4">🍽️ Extras: Pasta, Dessert, Beverage</h4>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                      {/* Pasta */}
                      <div className="space-y-3 border rounded-lg p-4">
                        <div className="flex items-center justify-between border-b pb-2">
                          <h4 className="font-medium text-gray-700 dark:text-gray-300">🍝 Pasta</h4>
                          <span className="text-xs text-gray-500">{editFormData.pasta_selection.length} selected</span>
                        </div>
                        <div className="space-y-2">
                          {menuItems.pasta && menuItems.pasta.length > 0 ? (
                            menuItems.pasta.map((item) => {
                              const itemName = item.item_name || item.name
                              return (
                                <label
                                  key={item.id}
                                  className="flex items-start space-x-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 p-1 rounded"
                                >
                                  <input
                                    type="checkbox"
                                    checked={editFormData.pasta_selection.includes(itemName)}
                                    onChange={() => toggleMenuItem("pasta", itemName)}
                                    className="mt-1 rounded border-gray-300 text-rose-600 focus:ring-rose-500 flex-shrink-0"
                                  />
                                  <div className="flex-1">
                                    <span className="text-sm leading-tight">{itemName}</span>
                                  </div>
                                </label>
                              )
                            })
                          ) : (
                            <div className="text-sm text-gray-500 italic">No pasta items available</div>
                          )}
                        </div>
                      </div>

                      {/* Dessert */}
                      <div className="space-y-3 border rounded-lg p-4">
                        <div className="flex items-center justify-between border-b pb-2">
                          <h4 className="font-medium text-gray-700 dark:text-gray-300">🍰 Dessert</h4>
                          <span className="text-xs text-gray-500">
                            {editFormData.dessert_selection.length} selected
                          </span>
                        </div>
                        <div className="space-y-2">
                          {menuItems.dessert && menuItems.dessert.length > 0 ? (
                            menuItems.dessert.map((item) => {
                              const itemName = item.item_name || item.name
                              return (
                                <label
                                  key={item.id}
                                  className="flex items-start space-x-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 p-1 rounded"
                                >
                                  <input
                                    type="checkbox"
                                    checked={editFormData.dessert_selection.includes(itemName)}
                                    onChange={() => toggleMenuItem("dessert", itemName)}
                                    className="mt-1 rounded border-gray-300 text-rose-600 focus:ring-rose-500 flex-shrink-0"
                                  />
                                  <div className="flex-1">
                                    <span className="text-sm leading-tight">{itemName}</span>
                                  </div>
                                </label>
                              )
                            })
                          ) : (
                            <div className="text-sm text-gray-500 italic">No dessert items available</div>
                          )}
                        </div>
                      </div>

                      {/* Beverage */}
                      <div className="space-y-3 border rounded-lg p-4">
                        <div className="flex items-center justify-between border-b pb-2">
                          <h4 className="font-medium text-gray-700 dark:text-gray-300">🥤 Beverage</h4>
                          <span className="text-xs text-gray-500">
                            {editFormData.beverage_selection.length} selected
                          </span>
                        </div>
                        <div className="space-y-2">
                          {menuItems.beverage && menuItems.beverage.length > 0 ? (
                            menuItems.beverage.map((item) => {
                              const itemName = item.item_name || item.name
                              return (
                                <label
                                  key={item.id}
                                  className="flex items-start space-x-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 p-1 rounded"
                                >
                                  <input
                                    type="checkbox"
                                    checked={editFormData.beverage_selection.includes(itemName)}
                                    onChange={() => toggleMenuItem("beverage", itemName)}
                                    className="mt-1 rounded border-gray-300 text-rose-600 focus:ring-rose-500 flex-shrink-0"
                                  />
                                  <div className="flex-1">
                                    <span className="text-sm leading-tight">{itemName}</span>
                                  </div>
                                </label>
                              )
                            })
                          ) : (
                            <div className="text-sm text-gray-500 italic">No beverage items available</div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Theme and Color */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="theme">Theme</Label>
                <Input
                  id="theme"
                  value={editFormData.theme}
                  onChange={(e) => setEditFormData({ ...editFormData, theme: e.target.value })}
                  placeholder="Enter event theme"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="color_motif">Color Motif</Label>
                <Input
                  id="color_motif"
                  value={editFormData.color_motif}
                  onChange={(e) => setEditFormData({ ...editFormData, color_motif: e.target.value })}
                  placeholder="Enter color motif"
                />
              </div>
            </div>

            {/* Special Requests */}
            <div className="grid gap-2">
              <Label htmlFor="special_requests">Special Requests</Label>
              <Textarea
                id="special_requests"
                value={editFormData.special_requests}
                onChange={(e) => setEditFormData({ ...editFormData, special_requests: e.target.value })}
                placeholder="Any special requests"
                rows={3}
              />
            </div>

            {/* Additional Info */}
            <div className="grid gap-2">
              <Label htmlFor="additional_event_info">Additional Event Information</Label>
              <Textarea
                id="additional_event_info"
                value={editFormData.additional_event_info}
                onChange={(e) => setEditFormData({ ...editFormData, additional_event_info: e.target.value })}
                placeholder="Any additional information about your event"
                rows={3}
              />
            </div>

            {/* Total Amount Display */}
            {calculateTotalAmount() > 0 && (
              <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                {(() => {
                  const serviceFeeInfo = getServiceFeeInfo()
                  return serviceFeeInfo ? (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-sm">
                        <span className="font-medium">Menu Selections Total:</span>
                        <span className="font-semibold">₱{getMenuTotal().toLocaleString()}</span>
                      </div>

                      <div className="border-t pt-3">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium">{serviceFeeInfo.title}:</span>
                          <span className="font-semibold text-rose-600">₱{serviceFeeInfo.fee.toLocaleString()}</span>
                        </div>
                        <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                          <div className="font-medium text-blue-800 text-sm mb-2">{serviceFeeInfo.title} Includes:</div>
                          <ul className="text-xs text-blue-700 space-y-1 list-disc list-inside">
                            {serviceFeeInfo.items.map((item, index) => (
                              <li key={index}>{item}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  ) : null
                })()}

                <div className="border-t pt-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-lg">Total Package Amount:</span>
                    <span className="text-xl font-bold text-green-600">₱{calculateTotalAmount().toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm text-gray-600">
                    <span>Down Payment (50%):</span>
                    <span className="font-medium text-green-600">
                      ₱{Math.round(calculateTotalAmount() * 0.5).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)} disabled={editLoading}>
              Cancel
            </Button>
            <Button onClick={submitEdit} disabled={editLoading}>
              {editLoading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
