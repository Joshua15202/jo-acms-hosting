"use client"
import { useState, useEffect, useRef } from "react"
import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Calendar,
  Clock,
  Users,
  MapPin,
  CreditCard,
  Smartphone,
  Building2,
  Upload,
  CheckCircle,
  RefreshCw,
  Download,
  Receipt,
  History,
  FileText,
  Utensils,
  Palette,
} from "lucide-react"
import { format } from "date-fns"
import type { User } from "@/app/actions/auth-actions"
import { useToast } from "@/hooks/use-toast"

type Appointment = {
  id: string
  event_type: string
  event_date: string
  event_time: string
  guest_count: number
  venue_address?: string
  total_package_amount?: number
  down_payment_amount?: number
  budget_min?: number
  budget_max?: number
  status: string
  payment_status?: "unpaid" | "pending_payment" | "partially_paid" | "fully_paid" | "refunded"
  pending_payment_type?: "down_payment" | "full_payment" | "remaining_balance"
  created_at: string
  updated_at: string
  selected_menu?: any[]
  contact_first_name: string
  contact_last_name: string
  contact_email: string
  contact_phone?: string
  theme?: string
}

type PaymentTransaction = {
  id: string
  appointment_id: string
  amount: number
  payment_type: "down_payment" | "full_payment" | "remaining_balance"
  payment_method: string
  reference_number: string
  notes?: string
  status: "verified"
  created_at: string
  updated_at: string
  tbl_comprehensive_appointments: {
    id: string
    event_type: string
    event_date: string
    event_time: string
    guest_count: number
    venue_address?: string
    total_package_amount?: number
    down_payment_amount?: number
    remaining_balance?: number
    payment_status: string
    pasta_selection?: string
    beverage_selection?: string
    dessert_selection?: string
    selected_menu?: any[]
    theme?: string
    color_motif?: string
    contact_first_name: string
    contact_last_name: string
    contact_email: string
    contact_phone?: string
    special_requests?: string
    created_at: string
    updated_at: string
  }
}

type PaymentFormData = {
  appointmentId: string
  amount: number
  paymentType: "down_payment" | "full_payment" | "remaining_balance"
  paymentMethod: string
  reference: string
  notes: string
  proofImage?: File | null
}

interface EnhancedPaymentClientProps {
  user: User
}

export default function EnhancedPaymentClient({ user }: EnhancedPaymentClientProps) {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [paymentHistory, setPaymentHistory] = useState<PaymentTransaction[]>([])
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [historyDebugInfo, setHistoryDebugInfo] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [historyLoading, setHistoryLoading] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false)
  const [receiptDialogOpen, setReceiptDialogOpen] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState<PaymentTransaction | null>(null)
  const [showDebug, setShowDebug] = useState(true)
  const [activeTab, setActiveTab] = useState("payments")
  const [paymentData, setPaymentData] = useState<PaymentFormData>({
    appointmentId: "",
    amount: 0,
    paymentType: "down_payment",
    paymentMethod: "",
    reference: "",
    notes: "",
    proofImage: null,
  })
  const [submitting, setSubmitting] = useState(false)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [showQrCode, setShowQrCode] = useState(false) // New state for QR code visibility
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchPaymentReadyAppointments()
    fetchDebugInfo()
    fetchPaymentHistory()
    fetchHistoryDebugInfo()
  }, [])

  const fetchDebugInfo = async () => {
    try {
      const response = await fetch("/api/debug-payment-appointments")
      if (response.ok) {
        const data = await response.json()
        setDebugInfo(data)
        console.log("Debug info:", data)
      }
    } catch (error) {
      console.error("Error fetching debug info:", error)
    }
  }

  const fetchHistoryDebugInfo = async () => {
    try {
      console.log("=== FETCHING PAYMENT HISTORY DEBUG INFO ===")
      const response = await fetch("/api/debug-payment-history", {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      })

      console.log("Debug payment history response status:", response.status)

      if (response.ok) {
        const data = await response.json()
        setHistoryDebugInfo(data)
        console.log("Payment history debug info:", data)
      } else {
        console.error("Failed to fetch payment history debug info:", response.status)
        const errorText = await response.text()
        console.error("Debug error response:", errorText)
      }
    } catch (error) {
      console.error("Error fetching payment history debug info:", error)
    }
  }

  const fetchPaymentHistory = async () => {
    try {
      setHistoryLoading(true)
      console.log("=== FETCHING PAYMENT HISTORY ===")

      const response = await fetch("/api/user/payment-history", {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      })

      console.log("Payment history API response status:", response.status)

      if (response.ok) {
        const data = await response.json()
        console.log("Payment history data:", data)
        setPaymentHistory(data.transactions || [])

        if (data.debug) {
          console.log("Payment history debug data:", data.debug)
        }
      } else {
        console.error("Failed to fetch payment history:", response.status, response.statusText)
        const errorText = await response.text()
        console.error("Error response:", errorText)

        // Show error in toast
        toast({
          title: "Payment History Error",
          description: `Failed to load payment history: ${response.status}`,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching payment history:", error)
      toast({
        title: "Network Error",
        description: "Could not connect to payment history service",
        variant: "destructive",
      })
    } finally {
      setHistoryLoading(false)
    }
  }

  const fetchPaymentReadyAppointments = async () => {
    try {
      setLoading(true)
      console.log("=== FETCHING APPOINTMENTS ===")

      const response = await fetch("/api/scheduling/appointments")
      console.log("API Response status:", response.status)

      if (response.ok) {
        const data = await response.json()
        console.log("Raw API response:", data)
        console.log("All appointments from API:", data.appointments)

        if (!data.appointments) {
          console.error("No appointments array in response")
          setAppointments([])
          return
        }

        const appointmentsNeedingPayment = data.appointments.filter((apt: Appointment) => {
          const isStatusReady = apt.status === "TASTING_COMPLETED" || apt.status === "confirmed"
          const needsPayment = apt.payment_status !== "fully_paid" && apt.payment_status !== "refunded"

          console.log(`Appointment ${apt.id.slice(0, 8)}:`, {
            status: apt.status,
            payment_status: apt.payment_status,
            pending_payment_type: apt.pending_payment_type,
            isStatusReady,
            needsPayment,
            willShow: isStatusReady && needsPayment,
            updated_at: apt.updated_at,
          })

          return isStatusReady && needsPayment
        })

        console.log("Filtered appointments needing payment:", appointmentsNeedingPayment.length)
        console.log("Appointments that will be shown:", appointmentsNeedingPayment)

        setAppointments(appointmentsNeedingPayment)

        // Check if user has any fully paid appointments to show history tab
        const hasFullyPaidAppointments = data.appointments.some(
          (apt: Appointment) => apt.payment_status === "fully_paid",
        )
        if (hasFullyPaidAppointments && appointmentsNeedingPayment.length === 0) {
          setActiveTab("history")
        }
      } else {
        console.error("Failed to fetch appointments:", response.status, response.statusText)
        const errorData = await response.text()
        console.error("Error response:", errorData)
        toast({ title: "Error", description: "Failed to fetch appointments.", variant: "destructive" })
      }
    } catch (error) {
      console.error("Error fetching appointments:", error)
      toast({ title: "Error", description: "Could not load appointments.", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const getTotalAmount = (appointment: Appointment) => {
    return appointment.total_package_amount || appointment.budget_max || appointment.budget_min || 0
  }

  const getDownPaymentAmount = (appointment: Appointment) => {
    return appointment.down_payment_amount || Math.round(getTotalAmount(appointment) * 0.5)
  }

  const getCalculatedRemainingBalance = (appointment: Appointment) => {
    const total = getTotalAmount(appointment)
    const downPayment = getDownPaymentAmount(appointment)
    return total - downPayment
  }

  const getPaymentOptions = (appointment: Appointment) => {
    const paymentStatus = appointment.payment_status
    const total = getTotalAmount(appointment)
    const downPayment = getDownPaymentAmount(appointment)
    const remaining = getCalculatedRemainingBalance(appointment)

    const options: { type: "down_payment" | "full_payment" | "remaining_balance"; label: string; amount: number }[] = []

    console.log(
      `Getting payment options for appointment ${appointment.id.slice(0, 8)}: payment_status=${paymentStatus}, pending_payment_type=${appointment.pending_payment_type}`,
    )

    if (paymentStatus === "unpaid") {
      options.push({ type: "down_payment", label: "Down Payment (50%)", amount: downPayment })
      options.push({ type: "full_payment", label: "Full Payment (100%)", amount: total })
    } else if (paymentStatus === "pending_payment") {
      if (appointment.pending_payment_type === "down_payment") {
        options.push({ type: "down_payment", label: "Down Payment (Under Review)", amount: downPayment })
      } else if (appointment.pending_payment_type === "full_payment") {
        options.push({ type: "full_payment", label: "Full Payment (Under Review)", amount: total })
      } else if (appointment.pending_payment_type === "remaining_balance") {
        options.push({ type: "remaining_balance", label: "Remaining Balance (Under Review)", amount: remaining })
      }
    } else if (paymentStatus === "partially_paid") {
      options.push({ type: "remaining_balance", label: "Pay Remaining Balance", amount: remaining })
    }

    console.log("Payment options:", options)
    return options
  }

  const handlePayment = (appointment: Appointment) => {
    setSelectedAppointment(appointment)
    const paymentOptions = getPaymentOptions(appointment)

    if (paymentOptions.length === 0) {
      toast({
        title: "No Payment Options",
        description: "This appointment may be pending review or fully paid.",
        variant: "destructive",
      })
      return
    }

    let defaultOption = paymentOptions[0]
    if (appointment.payment_status === "partially_paid") {
      const remainingBalanceOption = paymentOptions.find((opt) => opt.type === "remaining_balance")
      if (remainingBalanceOption) {
        defaultOption = remainingBalanceOption
      }
    }

    setPaymentData({
      appointmentId: appointment.id,
      amount: defaultOption.amount,
      paymentType: defaultOption.type,
      paymentMethod: "",
      reference: "",
      notes: "",
      proofImage: null,
    })
    setPreviewImage(null)
    setShowQrCode(false) // Reset QR code visibility
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
    setPaymentDialogOpen(true)
  }

  const handleViewReceipt = (transaction: PaymentTransaction) => {
    setSelectedTransaction(transaction)
    setReceiptDialogOpen(true)
  }

  const handleDownloadReceipt = (transaction: PaymentTransaction) => {
    const receiptContent = generateReceiptContent(transaction)
    const blob = new Blob([receiptContent], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `Receipt-${transaction.tbl_comprehensive_appointments.event_type}-${transaction.id.slice(0, 8)}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      title: "Receipt Downloaded",
      description: "Your receipt has been downloaded successfully.",
    })
  }

  const generateReceiptContent = (transaction: PaymentTransaction): string => {
    const appointment = transaction.tbl_comprehensive_appointments
    const contactName = `${appointment.contact_first_name} ${appointment.contact_last_name}`.trim()

    return `
═══════════════════════════════════════════════════════
                    PAYMENT RECEIPT
                Jo Pacheco Catering Services
═══════════════════════════════════════════════════════

Receipt ID: ${transaction.id}
Date: ${format(new Date(transaction.created_at), "MMMM d, yyyy 'at' h:mm a")}

───────────────────────────────────────────────────────
                   CUSTOMER INFORMATION
───────────────────────────────────────
Name: ${contactName}
Email: ${appointment.contact_email}
Phone: ${appointment.contact_phone || "Not provided"}

───────────────────────────────────────────────────────
                    EVENT DETAILS
───────────────────────────────────────────────────────
Event Type: ${appointment.event_type.charAt(0).toUpperCase() + appointment.event_type.slice(1)}
Date: ${formatEventDate(appointment.event_date)}
Time: ${appointment.event_time}
Venue: ${appointment.venue_address || "To be confirmed"}
Guest Count: ${appointment.guest_count} guests
Theme: ${appointment.theme || "Not specified"}
Color Motif: ${appointment.color_motif || "Not specified"}

───────────────────────────────────────────────────────
                    MENU SELECTION
───────────────────────────────────────────────────────
${appointment.pasta_selection ? `Pasta: ${appointment.pasta_selection}` : ""}
${appointment.beverage_selection ? `Beverage: ${appointment.beverage_selection}` : ""}
${appointment.dessert_selection ? `Dessert: ${appointment.dessert_selection}` : ""}

${
  appointment.selected_menu
    ? `Additional Items:\n${parseMenuItems(appointment.selected_menu)
        .map((item: any) => `• ${item.name || item}`)
        .join("\n")}`
    : ""
}

${appointment.special_requests ? `Special Requests:\n${appointment.special_requests}` : ""}

───────────────────────────────────────────────────────
                   PAYMENT DETAILS
───────────────────────────────────────
Payment Type: ${
      transaction.payment_type === "down_payment"
        ? "Down Payment"
        : transaction.payment_type === "remaining_balance"
          ? "Remaining Balance"
          : "Full Payment"
    }
Amount Paid: ${formatCurrency(transaction.amount)}
Payment Method: ${transaction.payment_method.toUpperCase()}
Reference Number: ${transaction.reference_number}
Payment Date: ${format(new Date(transaction.created_at), "MMMM d, yyyy")}

───────────────────────────────────────────────────────
                   PACKAGE SUMMARY
───────────────────────────────────────
Total Package Amount: ${formatCurrency(appointment.total_package_amount || 0)}
Down Payment: ${formatCurrency(appointment.down_payment_amount || 0)}
Remaining Balance: ${formatCurrency(appointment.remaining_balance || 0)}
Payment Status: ${appointment.payment_status.replace("_", " ").toUpperCase()}

───────────────────────────────────────────────────────
                      NOTES
───────────────────────────────────────────────────────
${transaction.notes || "No additional notes"}

═══════════════════════════════════════════════════════
Thank you for choosing Jo Pacheco Catering Services!
For inquiries, please contact us at your convenience.
═══════════════════════════════════════════════════════

Generated on: ${format(new Date(), "MMMM d, yyyy 'at' h:mm a")}
    `.trim()
  }

  const handlePaymentTypeChange = (type: "down_payment" | "full_payment" | "remaining_balance") => {
    if (!selectedAppointment) return
    const paymentOptions = getPaymentOptions(selectedAppointment)
    const selectedOption = paymentOptions.find((option) => option.type === type)

    if (selectedOption) {
      setPaymentData((prev) => ({
        ...prev,
        paymentType: type,
        amount: selectedOption.amount,
      }))
    }
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please upload an image smaller than 5MB.",
          variant: "destructive",
        })
        setPaymentData((prev) => ({ ...prev, proofImage: null }))
        setPreviewImage(null)
        if (fileInputRef.current) fileInputRef.current.value = ""
        return
      }
      setPaymentData((prev) => ({ ...prev, proofImage: file }))
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewImage(reader.result as string)
      }
      reader.readAsDataURL(file)
    } else {
      setPaymentData((prev) => ({ ...prev, proofImage: null }))
      setPreviewImage(null)
    }
  }

  const submitPayment = async () => {
    if (!paymentData.proofImage) {
      toast({ title: "Missing Proof", description: "Please upload proof of payment.", variant: "destructive" })
      return
    }
    if (!paymentData.paymentMethod) {
      toast({ title: "Missing Payment Method", description: "Please select a payment method.", variant: "destructive" })
      return
    }
    if (!paymentData.reference.trim()) {
      toast({
        title: "Missing Reference ID",
        description: "Please enter the payment reference/transaction ID.",
        variant: "destructive",
      })
      return
    }

    setSubmitting(true)
    const formData = new FormData()
    formData.append("appointmentId", paymentData.appointmentId)
    formData.append("amount", paymentData.amount.toString())
    formData.append("paymentType", paymentData.paymentType)
    formData.append("paymentMethod", paymentData.paymentMethod)
    formData.append("reference", paymentData.reference)
    formData.append("notes", paymentData.notes)
    if (paymentData.proofImage) {
      formData.append("proofImage", paymentData.proofImage)
    }

    try {
      console.log("=== SUBMITTING PAYMENT ===")
      const response = await fetch("/api/submit-payment", {
        method: "POST",
        credentials: "include",
        body: formData,
      })

      const result = await response.json()
      console.log("Payment submission result:", result)

      if (result.success) {
        toast({
          title: "Payment Submitted!",
          description: "We will verify your payment and update your booking status within 24-48 hours.",
        })
        setPaymentDialogOpen(false)

        console.log("=== REFRESHING AFTER PAYMENT SUBMISSION ===")
        setTimeout(() => {
          fetchPaymentReadyAppointments()
          fetchDebugInfo()
          fetchPaymentHistory()
          fetchHistoryDebugInfo()
        }, 1000)
      } else {
        throw new Error(result.error || "Payment submission failed")
      }
    } catch (error: any) {
      console.error("Error submitting payment:", error)
      toast({
        title: "Error",
        description: `Error submitting payment: ${error.message}. Please try again.`,
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(amount)
  }

  const formatEventDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "EEEE, MMMM d, yyyy")
    } catch {
      return dateString
    }
  }

  const getVenueDisplay = (appointment: Appointment) => {
    return appointment.venue_address || "Venue to be confirmed"
  }

  const getContactName = (appointment: Appointment) => {
    return `${appointment.contact_first_name || ""} ${appointment.contact_last_name || ""}`.trim() || "Customer"
  }

  const parseMenuItems = (menuItems: any) => {
    if (typeof menuItems === "string") {
      try {
        return JSON.parse(menuItems)
      } catch {
        return []
      }
    }
    return Array.isArray(menuItems) ? menuItems : []
  }

  const getPaymentStatusDisplayInfo = (appointment: Appointment) => {
    switch (appointment.payment_status) {
      case "unpaid":
        return {
          text: "Payment Required",
          color: "bg-red-100 text-red-800 border-red-200",
          icon: <CreditCard className="h-4 w-4" />,
        }
      case "pending_payment":
        const pendingType = appointment.pending_payment_type
        const pendingText =
          pendingType === "down_payment"
            ? "Down Payment Under Review"
            : pendingType === "remaining_balance"
              ? "Remaining Balance Under Review"
              : "Payment Under Review"
        return {
          text: pendingText,
          color: "bg-orange-100 text-orange-800 border-orange-200",
          icon: <Clock className="h-4 w-4" />,
        }
      case "partially_paid":
        return {
          text: "Partially Paid - Balance Due",
          color: "bg-yellow-100 text-yellow-800 border-yellow-200",
          icon: <CreditCard className="h-4 w-4" />,
        }
      case "fully_paid":
        return {
          text: "Fully Paid",
          color: "bg-green-100 text-green-800 border-green-200",
          icon: <CheckCircle className="h-4 w-4" />,
        }
      default:
        return {
          text: "Status Unknown",
          color: "bg-gray-100 text-gray-800 border-gray-200",
          icon: <CreditCard className="h-4 w-4" />,
        }
    }
  }

  const getMakePaymentButtonText = (appointment: Appointment) => {
    if (appointment.payment_status === "pending_payment") {
      const pendingType = appointment.pending_payment_type
      if (pendingType === "down_payment") {
        return "Down Payment Under Review"
      } else if (pendingType === "remaining_balance") {
        return "Remaining Balance Under Review"
      } else {
        return "Payment Under Review"
      }
    } else if (appointment.payment_status === "partially_paid") {
      return "Pay Remaining Balance"
    } else {
      return "Make Payment"
    }
  }

  const isPaymentButtonDisabled = (appointment: Appointment) => {
    return appointment.payment_status === "pending_payment"
  }

  const getPaymentTypeBadge = (type: string) => {
    const typeLabel =
      type === "down_payment" ? "Down Payment" : type === "remaining_balance" ? "Remaining Balance" : "Full Payment"

    let color = "bg-blue-100 text-blue-800 border-blue-200"
    if (type === "down_payment") {
      color = "bg-green-100 text-green-800 border-green-200"
    } else if (type === "remaining_balance") {
      color = "bg-orange-100 text-orange-800 border-orange-200"
    }

    return (
      <Badge variant="outline" className={color}>
        {typeLabel}
      </Badge>
    )
  }

  if (loading) {
    return (
      <div className="container mx-auto py-10 px-4 md:px-6">
        <div className="flex flex-col items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-600"></div>
          <p className="mt-2 text-gray-500">Loading payment information...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10 px-4 md:px-6">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Payment Center</h1>
          <p className="mt-4 text-gray-500 md:text-xl">Complete payments for your confirmed catering appointments.</p>
        </div>
        <div className="flex gap-2">
          {/* ADD THE REFRESH BUTTON HERE */}
          <Button
            variant="outline"
            onClick={() => {
              fetchPaymentReadyAppointments()
              fetchDebugInfo()
              fetchPaymentHistory()
              fetchHistoryDebugInfo()
            }}
            disabled={loading}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh Payments
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="payments" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Pending Payments
            {appointments.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {appointments.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            Payment History
            {paymentHistory.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {paymentHistory.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="payments" className="mt-6">
          {appointments.length > 0 ? (
            <div className="grid gap-6">
              {appointments.map((appointment) => {
                const statusInfo = getPaymentStatusDisplayInfo(appointment)
                const paymentOptions = getPaymentOptions(appointment)

                return (
                  <Card key={appointment.id} className="overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-teal-50 to-rose-50 border-b">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-xl capitalize flex items-center gap-2">
                          {statusInfo.icon}
                          {appointment.event_type} Event
                        </CardTitle>
                        <Badge className={`capitalize ${statusInfo.color}`}>{statusInfo.text}</Badge>
                      </div>
                      <CardDescription>
                        Booking ID: {appointment.id.slice(0, 8)}... • Contact: {getContactName(appointment)} • Updated:{" "}
                        {new Date(appointment.updated_at).toLocaleString()}
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="p-6">
                      <div className="grid gap-6 lg:grid-cols-2">
                        {/* Event Information */}
                        <div className="space-y-4">
                          <h4 className="font-semibold text-rose-600 border-b pb-2 flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            Event Details
                          </h4>
                          <div className="space-y-3">
                            <div className="flex items-center gap-3">
                              <Calendar className="h-4 w-4 text-gray-500" />
                              <div>
                                <p className="font-medium">Event Date</p>
                                <p className="text-sm text-gray-600">{formatEventDate(appointment.event_date)}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <Clock className="h-4 w-4 text-gray-500" />
                              <div>
                                <p className="font-medium">Time Slot</p>
                                <p className="text-sm text-gray-600">{appointment.event_time}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <Users className="h-4 w-4 text-gray-500" />
                              <div>
                                <p className="font-medium">Guest Count</p>
                                <p className="text-sm text-gray-600">{appointment.guest_count} guests</p>
                              </div>
                            </div>
                            <div className="flex items-start gap-3">
                              <MapPin className="h-4 w-4 text-gray-500 mt-1" />
                              <div>
                                <p className="font-medium">Venue</p>
                                <p className="text-sm text-gray-600">{getVenueDisplay(appointment)}</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Payment Information */}
                        <div className="space-y-4">
                          <h4 className="font-semibold text-rose-600 border-b pb-2 flex items-center gap-2">
                            <CreditCard className="h-4 w-4" />
                            Payment Breakdown
                          </h4>
                          <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="font-medium text-gray-700">Total Package Amount:</span>
                              <span className="text-xl font-bold text-gray-900">
                                {formatCurrency(getTotalAmount(appointment))}
                              </span>
                            </div>
                            <div className="border-t pt-3 space-y-2">
                              <div className="flex justify-between items-center">
                                <span className="font-medium text-green-700">Down Payment (50%):</span>
                                <span
                                  className={`text-lg font-semibold ${
                                    appointment.payment_status === "partially_paid" ||
                                    appointment.payment_status === "fully_paid"
                                      ? "text-green-600"
                                      : appointment.payment_status === "pending_payment" &&
                                          appointment.pending_payment_type === "down_payment"
                                        ? "text-orange-600"
                                        : "text-gray-700"
                                  }`}
                                >
                                  {formatCurrency(getDownPaymentAmount(appointment))}
                                  {appointment.payment_status === "partially_paid" && (
                                    <Badge
                                      variant="outline"
                                      className="ml-2 bg-green-100 text-green-700 border-green-300"
                                    >
                                      Paid
                                    </Badge>
                                  )}
                                  {appointment.payment_status === "pending_payment" &&
                                    appointment.pending_payment_type === "down_payment" && (
                                      <Badge
                                        variant="outline"
                                        className="ml-2 bg-orange-100 text-orange-700 border-orange-300"
                                      >
                                        Under Review
                                      </Badge>
                                    )}
                                </span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="font-medium text-orange-700">Remaining Balance:</span>
                                <span
                                  className={`text-xl font-bold ${
                                    appointment.payment_status === "pending_payment" &&
                                    appointment.pending_payment_type === "remaining_balance"
                                      ? "text-orange-600"
                                      : "text-orange-600"
                                  }`}
                                >
                                  {formatCurrency(getCalculatedRemainingBalance(appointment))}
                                  {appointment.payment_status === "pending_payment" &&
                                    appointment.pending_payment_type === "remaining_balance" && (
                                      <Badge
                                        variant="outline"
                                        className="ml-2 bg-orange-100 text-orange-700 border-orange-300"
                                      >
                                        Under Review
                                      </Badge>
                                    )}
                                </span>
                              </div>
                            </div>
                          </div>
                          <Button
                            onClick={() => handlePayment(appointment)}
                            className="w-full bg-rose-600 hover:bg-rose-700 text-white py-3 text-lg"
                            size="lg"
                            disabled={isPaymentButtonDisabled(appointment) || paymentOptions.length === 0}
                          >
                            {isPaymentButtonDisabled(appointment) ? (
                              <>
                                <Clock className="mr-2 h-5 w-5" />
                                {getMakePaymentButtonText(appointment)}
                              </>
                            ) : (
                              <>
                                <CreditCard className="mr-2 h-5 w-5" />
                                {getMakePaymentButtonText(appointment)}
                              </>
                            )}
                          </Button>
                          {appointment.payment_status === "pending_payment" && (
                            <p className="text-sm text-center text-orange-600 mt-2">
                              Your payment is currently under review. You will be notified once it's processed.
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <CreditCard className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Payments Required</h3>
                <p className="text-gray-500 mb-6">
                  You don't have any appointments ready for payment at this time, or all your payments are complete.
                  Payments become available after your food tasting is completed.
                </p>
                <div className="flex justify-center gap-2">
                  {" "}
                  {/* Added this div for buttons */}
                  <Button asChild variant="outline">
                    <a href="/my-appointments">View My Appointments</a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          {historyLoading ? (
            <div className="flex flex-col items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-600"></div>
              <p className="mt-2 text-gray-500">Loading payment history...</p>
            </div>
          ) : paymentHistory.length > 0 ? (
            <div className="grid gap-6">
              {paymentHistory.map((transaction) => (
                <Card key={transaction.id} className="overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50 border-b">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl capitalize flex items-center gap-2">
                        <Receipt className="h-5 w-5" />
                        {transaction.tbl_comprehensive_appointments.event_type} Event Payment
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-green-100 text-green-800 border-green-200">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                        {getPaymentTypeBadge(transaction.payment_type)}
                      </div>
                    </div>
                    <CardDescription>
                      Transaction ID: {transaction.id.slice(0, 8)}... • Paid on{" "}
                      {format(new Date(transaction.created_at), "MMMM d, yyyy")} • {formatCurrency(transaction.amount)}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="p-6">
                    <div className="grid gap-6 lg:grid-cols-2">
                      {/* Event Information */}
                      <div className="space-y-4">
                        <h4 className="font-semibold text-rose-600 border-b pb-2 flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          Event Details
                        </h4>
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <Calendar className="h-4 w-4 text-gray-500" />
                            <div>
                              <p className="font-medium">Event Date</p>
                              <p className="text-sm text-gray-600">
                                {formatEventDate(transaction.tbl_comprehensive_appointments.event_date)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Clock className="h-4 w-4 text-gray-500" />
                            <div>
                              <p className="font-medium">Time Slot</p>
                              <p className="text-sm text-gray-600">
                                {transaction.tbl_comprehensive_appointments.event_time}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Users className="h-4 w-4 text-gray-500" />
                            <div>
                              <p className="font-medium">Guest Count</p>
                              <p className="text-sm text-gray-600">
                                {transaction.tbl_comprehensive_appointments.guest_count} guests
                              </p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <MapPin className="h-4 w-4 text-gray-500 mt-1" />
                            <div>
                              <p className="font-medium">Venue</p>
                              <p className="text-sm text-gray-600">
                                {transaction.tbl_comprehensive_appointments.venue_address || "To be confirmed"}
                              </p>
                            </div>
                          </div>
                          {transaction.tbl_comprehensive_appointments.theme && (
                            <div className="flex items-center gap-3">
                              <Palette className="h-4 w-4 text-gray-500" />
                              <div>
                                <p className="font-medium">Theme & Color</p>
                                <p className="text-sm text-gray-600">
                                  {transaction.tbl_comprehensive_appointments.theme}
                                  {transaction.tbl_comprehensive_appointments.color_motif &&
                                    ` • ${transaction.tbl_comprehensive_appointments.color_motif}`}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Payment Information */}
                      <div className="space-y-4">
                        <h4 className="font-semibold text-rose-600 border-b pb-2 flex items-center gap-2">
                          <CreditCard className="h-4 w-4" />
                          Payment Information
                        </h4>
                        <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-700">Amount Paid:</span>
                            <span className="text-xl font-bold text-green-600">
                              {formatCurrency(transaction.amount)}
                            </span>
                          </div>
                          <div className="border-t pt-3 space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="font-medium">Payment Method:</span>
                              <span className="text-sm">{transaction.payment_method.toUpperCase()}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="font-medium">Reference Number:</span>
                              <span className="text-sm font-mono">{transaction.reference_number}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="font-medium">Payment Date:</span>
                              <span className="text-sm">
                                {format(new Date(transaction.created_at), "MMM d, yyyy 'at' h:mm a")}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="font-medium">Total Package:</span>
                              <span className="text-sm">
                                {formatCurrency(transaction.tbl_comprehensive_appointments.total_package_amount || 0)}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="font-medium">Payment Status:</span>
                              <Badge className="bg-blue-100 text-blue-600 border-blue-200">
                                {transaction.tbl_comprehensive_appointments.payment_status
                                  .replace("_", " ")
                                  .toUpperCase()}
                              </Badge>
                            </div>
                          </div>
                        </div>

                        {/* Menu Selection */}
                        {(transaction.tbl_comprehensive_appointments.pasta_selection ||
                          transaction.tbl_comprehensive_appointments.beverage_selection ||
                          transaction.tbl_comprehensive_appointments.dessert_selection ||
                          transaction.tbl_comprehensive_appointments.selected_menu) && (
                          <div className="space-y-2">
                            <h5 className="font-medium text-gray-700 flex items-center gap-2">
                              <Utensils className="h-4 w-4" />
                              Menu Selection
                            </h5>
                            <div className="text-sm text-gray-600 space-y-1">
                              {transaction.tbl_comprehensive_appointments.pasta_selection && (
                                <p>• Pasta: {transaction.tbl_comprehensive_appointments.pasta_selection}</p>
                              )}
                              {transaction.tbl_comprehensive_appointments.beverage_selection && (
                                <p>• Beverage: {transaction.tbl_comprehensive_appointments.beverage_selection}</p>
                              )}
                              {transaction.tbl_comprehensive_appointments.dessert_selection && (
                                <p>• Dessert: {transaction.tbl_comprehensive_appointments.dessert_selection}</p>
                              )}
                              {transaction.tbl_comprehensive_appointments.selected_menu &&
                                parseMenuItems(transaction.tbl_comprehensive_appointments.selected_menu).map(
                                  (item: any, index: number) => <p key={index}>• {item.name || item}</p>,
                                )}
                            </div>
                          </div>
                        )}

                        <div className="flex gap-2 pt-4">
                          <Button variant="outline" onClick={() => handleViewReceipt(transaction)} className="flex-1">
                            <FileText className="mr-2 h-4 w-4" />
                            View Receipt
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => handleDownloadReceipt(transaction)}
                            className="flex-1"
                          >
                            <Download className="mr-2 h-4 w-4" />
                            Download
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <History className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Payment History</h3>
                <p className="text-gray-500 mb-6">
                  You don't have any verified payment transactions yet. Once your payments are processed and verified,
                  they will appear here with downloadable receipts.
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    fetchPaymentHistory()
                    fetchHistoryDebugInfo()
                  }}
                  disabled={historyLoading}
                >
                  <RefreshCw className={`mr-2 h-4 w-4 ${historyLoading ? "animate-spin" : ""}`} />
                  Refresh History
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Payment Dialog */}
      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Submit Payment for {selectedAppointment?.event_type} Event
            </DialogTitle>
            <DialogDescription>
              Please provide your payment details and upload proof of payment. We'll verify your payment within 24-48
              hours.
            </DialogDescription>
          </DialogHeader>

          {selectedAppointment && (
            <div className="space-y-6">
              {/* Payment Type Selection */}
              <div className="space-y-3">
                <Label className="text-base font-medium">Payment Type</Label>
                <RadioGroup
                  value={paymentData.paymentType}
                  onValueChange={handlePaymentTypeChange}
                  className="space-y-2"
                >
                  {getPaymentOptions(selectedAppointment).map((option) => (
                    <div key={option.type} className="flex items-center space-x-2">
                      <RadioGroupItem value={option.type} id={option.type} />
                      <Label htmlFor={option.type} className="flex-1 cursor-pointer">
                        <div className="flex justify-between items-center">
                          <span>{option.label}</span>
                          <span className="font-semibold text-rose-600">{formatCurrency(option.amount)}</span>
                        </div>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              {/* Payment Method */}
              <div className="space-y-3">
                <Label htmlFor="paymentMethod" className="text-base font-medium">
                  Payment Method *
                </Label>
                <Select
                  value={paymentData.paymentMethod}
                  onValueChange={(value) => {
                    setPaymentData((prev) => ({ ...prev, paymentMethod: value }))
                    setShowQrCode(false) // Hide QR code when method changes
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gcash">
                      <div className="flex items-center gap-2">
                        <Smartphone className="h-4 w-4" />
                        GCash
                      </div>
                    </SelectItem>
                    <SelectItem value="bank_transfer">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        Bank Transfer
                      </div>
                    </SelectItem>
                    <SelectItem value="cash">
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4" />
                        Cash
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Payment Information based on method */}
              {(paymentData.paymentMethod === "gcash" || paymentData.paymentMethod === "bank_transfer") && (
                <div className="space-y-2 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <h5 className="font-semibold text-gray-700">
                    Payment Details for {paymentData.paymentMethod === "gcash" ? "GCash" : "Bank Transfer"}
                  </h5>
                  <div className="text-sm text-gray-600">
                    <p>
                      <strong>Account Name:</strong> Jonel Ray Pacheco
                    </p>
                    {paymentData.paymentMethod === "gcash" && (
                      <>
                        <p>
                          <strong>GCash Number:</strong> 0917-854-3221
                        </p>
                        <Button variant="outline" size="sm" onClick={() => setShowQrCode(!showQrCode)} className="mt-2">
                          {showQrCode ? "Hide QR Code" : "Generate QR Code"}
                        </Button>
                        {showQrCode && (
                          <div className="mt-4 flex flex-col items-center">
                            <img src="randomqr.png" alt="GCash QR Code" className="w-48 h-48 border rounded-lg p-2" />
                            <p className="text-xs text-gray-500 mt-2">
                              (This is a placeholder QR code. In a real app, a dynamic QR code would be generated.)
                            </p>
                          </div>
                        )}
                      </>
                    )}
                    {paymentData.paymentMethod === "bank_transfer" && (
                      <p>
                        <strong>Bank Account Number:</strong> 987-654-3210 (Dummy)
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Reference Number */}
              <div className="space-y-3">
                <Label htmlFor="reference" className="text-base font-medium">
                  Reference/Transaction ID *
                </Label>
                <Input
                  id="reference"
                  value={paymentData.reference}
                  onChange={(e) => setPaymentData((prev) => ({ ...prev, reference: e.target.value }))}
                  placeholder="Enter transaction ID or reference number"
                  required
                />
              </div>

              {/* Proof of Payment */}
              <div className="space-y-3">
                <Label htmlFor="proofImage" className="text-base font-medium">
                  Proof of Payment *
                </Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  <input
                    ref={fileInputRef}
                    type="file"
                    id="proofImage"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <div className="text-center">
                    {previewImage ? (
                      <div className="space-y-2">
                        <img
                          src={previewImage || "/placeholder.svg"}
                          alt="Payment proof preview"
                          className="mx-auto max-h-32 rounded"
                        />
                        <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                          Change Image
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Upload className="mx-auto h-8 w-8 text-gray-400" />
                        <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                          Upload Screenshot/Photo
                        </Button>
                        <p className="text-sm text-gray-500">PNG, JPG up to 5MB</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-3">
                <Label htmlFor="notes" className="text-base font-medium">
                  Additional Notes (Optional)
                </Label>
                <Textarea
                  id="notes"
                  value={paymentData.notes}
                  onChange={(e) => setPaymentData((prev) => ({ ...prev, notes: e.target.value }))}
                  placeholder="Any additional information about your payment..."
                  rows={3}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setPaymentDialogOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button onClick={submitPayment} disabled={submitting} className="bg-rose-600 hover:bg-rose-700">
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <CreditCard className="mr-2 h-4 w-4" />
                  Submit Payment
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Receipt Dialog */}
      <Dialog open={receiptDialogOpen} onOpenChange={setReceiptDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              Payment Receipt
            </DialogTitle>
            <DialogDescription>
              Complete receipt for your {selectedTransaction?.tbl_comprehensive_appointments.event_type} event payment
            </DialogDescription>
          </DialogHeader>

          {selectedTransaction && (
            <div className="space-y-6">
              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="text-center border-b pb-4 mb-4">
                  <h3 className="text-xl font-bold">Jo Pacheco Catering Services</h3>
                  <p className="text-gray-600">Payment Receipt</p>
                  <p className="text-sm text-gray-500">Receipt ID: {selectedTransaction.id}</p>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  {/* Customer Information */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Customer Information</h4>
                    <div className="space-y-2 text-sm">
                      <p>
                        <strong>Name:</strong>{" "}
                        {`${selectedTransaction.tbl_comprehensive_appointments.contact_first_name} ${selectedTransaction.tbl_comprehensive_appointments.contact_last_name}`.trim()}
                      </p>
                      <p>
                        <strong>Email:</strong> {selectedTransaction.tbl_comprehensive_appointments.contact_email}
                      </p>
                      <p>
                        <strong>Phone:</strong>{" "}
                        {selectedTransaction.tbl_comprehensive_appointments.contact_phone || "Not provided"}
                      </p>
                    </div>
                  </div>

                  {/* Event Information */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Event Details</h4>
                    <div className="space-y-2 text-sm">
                      <p>
                        <strong>Event Type:</strong>{" "}
                        {selectedTransaction.tbl_comprehensive_appointments.event_type.charAt(0).toUpperCase() +
                          selectedTransaction.tbl_comprehensive_appointments.event_type.slice(1)}
                      </p>
                      <p>
                        <strong>Date:</strong>{" "}
                        {formatEventDate(selectedTransaction.tbl_comprehensive_appointments.event_date)}
                      </p>
                      <p>
                        <strong>Time:</strong> {selectedTransaction.tbl_comprehensive_appointments.event_time}
                      </p>
                      <p>
                        <strong>Guests:</strong> {selectedTransaction.tbl_comprehensive_appointments.guest_count}
                      </p>
                      <p>
                        <strong>Venue:</strong>{" "}
                        {selectedTransaction.tbl_comprehensive_appointments.venue_address || "To be confirmed"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Menu Selection */}
                {(selectedTransaction.tbl_comprehensive_appointments.pasta_selection ||
                  selectedTransaction.tbl_comprehensive_appointments.beverage_selection ||
                  selectedTransaction.tbl_comprehensive_appointments.dessert_selection ||
                  selectedTransaction.tbl_comprehensive_appointments.selected_menu) && (
                  <div className="mt-6">
                    <h4 className="font-semibold text-gray-900 mb-3">Menu Selection</h4>
                    <div className="space-y-1 text-sm">
                      {selectedTransaction.tbl_comprehensive_appointments.pasta_selection && (
                        <p>• Pasta: {selectedTransaction.tbl_comprehensive_appointments.pasta_selection}</p>
                      )}
                      {selectedTransaction.tbl_comprehensive_appointments.beverage_selection && (
                        <p>• Beverage: {selectedTransaction.tbl_comprehensive_appointments.beverage_selection}</p>
                      )}
                      {selectedTransaction.tbl_comprehensive_appointments.dessert_selection && (
                        <p>• Dessert: {selectedTransaction.tbl_comprehensive_appointments.dessert_selection}</p>
                      )}
                      {selectedTransaction.tbl_comprehensive_appointments.selected_menu &&
                        parseMenuItems(selectedTransaction.tbl_comprehensive_appointments.selected_menu).map(
                          (item: any, index: number) => <p key={index}>• {item.name || item}</p>,
                        )}
                    </div>
                  </div>
                )}

                {/* Payment Details */}
                <div className="mt-6 border-t pt-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Payment Details</h4>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2 text-sm">
                      <p>
                        <strong>Payment Type:</strong>{" "}
                        {selectedTransaction.payment_type === "down_payment"
                          ? "Down Payment"
                          : selectedTransaction.payment_type === "remaining_balance"
                            ? "Remaining Balance"
                            : "Full Payment"}
                      </p>
                      <p>
                        <strong>Amount Paid:</strong>{" "}
                        <span className="text-lg font-bold text-green-600">
                          {formatCurrency(selectedTransaction.amount)}
                        </span>
                      </p>
                      <p>
                        <strong>Payment Method:</strong> {selectedTransaction.payment_method.toUpperCase()}
                      </p>
                      <p>
                        <strong>Reference Number:</strong> {selectedTransaction.reference_number}
                      </p>
                    </div>
                    <div className="space-y-2 text-sm">
                      <p>
                        <strong>Payment Date:</strong>{" "}
                        {format(new Date(selectedTransaction.created_at), "MMMM d, yyyy")}
                      </p>
                      <p>
                        <strong>Total Package:</strong>{" "}
                        {formatCurrency(selectedTransaction.tbl_comprehensive_appointments.total_package_amount || 0)}
                      </p>
                      <p>
                        <strong>Down Payment:</strong>{" "}
                        {formatCurrency(selectedTransaction.tbl_comprehensive_appointments.down_payment_amount || 0)}
                      </p>
                      <p>
                        <strong>Remaining Balance:</strong>{" "}
                        {formatCurrency(selectedTransaction.tbl_comprehensive_appointments.remaining_balance || 0)}
                      </p>
                    </div>
                  </div>
                </div>

                {selectedTransaction.notes && (
                  <div className="mt-6 border-t pt-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Notes</h4>
                    <p className="text-sm text-gray-600">{selectedTransaction.notes}</p>
                  </div>
                )}

                <div className="mt-6 border-t pt-4 text-center text-xs text-gray-500">
                  <p>Thank you for choosing Jo Pacheco Catering Services!</p>
                  <p>Generated on: ${format(new Date(), "MMMM d, yyyy 'at' h:mm a")}</p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setReceiptDialogOpen(false)}>
              Close
            </Button>
            <Button
              onClick={() => selectedTransaction && handleDownloadReceipt(selectedTransaction)}
              className="bg-rose-600 hover:bg-rose-700"
            >
              <Download className="mr-2 h-4 w-4" />
              Download Receipt
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
