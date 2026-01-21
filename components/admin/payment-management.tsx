"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  CreditCard,
  Calendar,
  Users,
  MapPin,
  Utensils,
  ChefHat,
  Cake,
  Download,
} from "lucide-react"
import { format } from "date-fns"
import { useToast } from "@/hooks/use-toast"

type PaymentTransaction = {
  id: string
  appointment_id: string
  user_id: string | null
  amount: number
  payment_type: "down_payment" | "full_payment" | "remaining_balance" | "cash"
  payment_method: string
  reference_number: string
  proof_image_url: string | null
  notes: string
  status: "pending" | "verified" | "rejected"
  admin_notes: string
  created_at: string
  updated_at: string
  tbl_users: {
    id: string
    full_name: string
    first_name: string
    email: string
    phone?: string
  } | null // Allow tbl_users to be null for walk-in
  tbl_comprehensive_appointments: {
    id: string
    event_type: string
    event_date: string
    event_time: string
    guest_count: number
    venue?: string
    venue_address?: string
    total_package_amount?: number
    down_payment_amount?: number
    payment_status: string
    pasta_selection?: string
    drink_selection?: string
    dessert_selection?: string
    selected_menu_items?: any[]
    event_theme?: string
    color_motif?: string
    total_amount?: number
    remaining_balance?: number
    contact_first_name?: string
    contact_last_name?: string
    contact_email?: string
    contact_phone?: string
  }
  menu_items?: {
    main_courses: Array<{
      id: string
      name: string
      category: string
      description?: string
      price?: number
    }>
    extras: Array<{
      id: string
      name: string
      category: string
      description?: string
      price?: number
    }>
  }
}

export default function PaymentManagement() {
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTransaction, setSelectedTransaction] = useState<PaymentTransaction | null>(null)
  const [verificationDialogOpen, setVerificationDialogOpen] = useState(false)
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)
  const [adminNotes, setAdminNotes] = useState("")
  const [processing, setProcessing] = useState(false)
  const [walkInAppointments, setWalkInAppointments] = useState<any[]>([])
  const [walkInLoading, setWalkInLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<"user-payments" | "walk-in-payments">("user-payments")
  const [downloadingReceipt, setDownloadingReceipt] = useState(false)
  const { toast } = useToast()

  const [walkInPaymentDialogOpen, setWalkInPaymentDialogOpen] = useState(false)
  const [selectedWalkInAppointment, setSelectedWalkInAppointment] = useState<any | null>(null)
  const [walkInPaymentData, setWalkInPaymentData] = useState({
    appointmentId: "",
    amount: 0,
    paymentType: "down_payment" as "down_payment" | "full_payment" | "cash",
    paymentMethod: "cash",
    reference: "",
    notes: "",
  })
  const [submittingWalkInPayment, setSubmittingWalkInPayment] = useState(false)
  const [showQRCode, setShowQRCode] = useState(true)
  // </CHANGE>

  useEffect(() => {
    fetchPaymentTransactions()
    fetchWalkInPayments()
  }, [])

  const fetchPaymentTransactions = async () => {
    try {
      setLoading(true)
      console.log("FRONTEND: Calling payment transactions API...")
      const response = await fetch("/api/admin/payment-transactions")
      console.log("FRONTEND: API response status:", response.status)
      if (response.ok) {
        const data = await response.json()
        console.log("FRONTEND: Received data:", data)
        console.log("FRONTEND: Transactions count:", data.transactions?.length)
        if (data.transactions && data.transactions.length > 0) {
          console.log("FRONTEND: First transaction:", data.transactions[0])
          console.log("FRONTEND: First transaction menu_items:", data.transactions[0].menu_items)
        }
        setTransactions(data.transactions || [])
      } else {
        toast({ title: "Error", description: "Failed to fetch payment transactions.", variant: "destructive" })
      }
    } catch (error) {
      console.error("Error fetching payment transactions:", error)
      toast({ title: "Error", description: "Could not load payment transactions.", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const fetchWalkInPayments = async () => {
    try {
      setWalkInLoading(true)
      // Add timestamp to force cache busting in production
      const timestamp = new Date().getTime()
      const response = await fetch(`/api/admin/walk-in-payments?t=${timestamp}`, {
        cache: "no-store",
        credentials: "include",
      })
      if (response.ok) {
        const data = await response.json()
        setWalkInAppointments(data.appointments || [])
      } else {
        toast({ title: "Error", description: "Failed to fetch walk-in payments.", variant: "destructive" })
      }
    } catch (error) {
      console.error("Error fetching walk-in payments:", error)
      toast({ title: "Error", description: "Could not load walk-in payments.", variant: "destructive" })
    } finally {
      setWalkInLoading(false)
    }
  }

  const handleVerifyPayment = (transaction: PaymentTransaction, action: "verified" | "rejected") => {
    setSelectedTransaction(transaction)
    setAdminNotes("")
    setVerificationDialogOpen(true)
  }

  const handleViewDetails = (transaction: PaymentTransaction) => {
    console.log("=== VIEWING TRANSACTION DETAILS ===")
    console.log("Full transaction:", transaction)
    console.log("Menu items:", transaction.menu_items)
    console.log("Menu items type:", typeof transaction.menu_items)
    console.log("Main courses:", transaction.menu_items?.main_courses)
    console.log("Main courses length:", transaction.menu_items?.main_courses?.length)
    console.log("Extras:", transaction.menu_items?.extras)
    console.log("Extras length:", transaction.menu_items?.extras?.length)
    setSelectedTransaction(transaction)
    setDetailsDialogOpen(true)
  }

  const submitVerification = async (action: "verified" | "rejected") => {
    if (!selectedTransaction) return

    setProcessing(true)
    try {
      const response = await fetch(`/api/admin/payment-transactions/${selectedTransaction.id}/verify`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action,
          notes: adminNotes,
          appointmentId: selectedTransaction.appointment_id,
          paymentType: selectedTransaction.payment_type,
        }),
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "Success",
          description: `Payment ${action} successfully!`,
        })
        setVerificationDialogOpen(false)
        fetchPaymentTransactions()
      } else {
        throw new Error(result.message || `Failed to ${action} payment`)
      }
    } catch (error: any) {
      console.error(`Error ${action} payment:`, error)
      toast({
        title: "Error",
        description: `Failed to ${action} payment: ${error.message}`,
        variant: "destructive",
      })
    } finally {
      setProcessing(false)
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending_verification":
        return (
          <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-200">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        )
      case "verified":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            Verified
          </Badge>
        )
      case "rejected":
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">
            <XCircle className="h-3 w-3 mr-1" />
            Rejected
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getPaymentTypeBadge = (type: string, appointmentPaymentStatus?: string) => {
    const typeLabel =
      type === "down_payment" ? "Down Payment" : type === "remaining_balance" ? "Remaining Balance" : "Full Payment"

    let color = "bg-blue-100 text-blue-800 border-blue-200"
    if (type === "down_payment") {
      color = "bg-green-100 text-green-800 border-green-200"
    } else if (type === "remaining_balance") {
      color = "bg-orange-100 text-orange-800 border-orange-200"
    } else if (type === "cash") {
      color = "bg-purple-100 text-purple-800 border-purple-200"
    }

    return (
      <div className="flex flex-col gap-1">
        <Badge variant="outline" className={color}>
          {typeLabel}
        </Badge>
        {appointmentPaymentStatus && (
          <Badge variant="outline" className="bg-gray-100 text-gray-600 border-gray-200 text-xs">
            Was: {appointmentPaymentStatus}
          </Badge>
        )}
      </div>
    )
  }

  const getVenueDisplay = (appointment: PaymentTransaction["tbl_comprehensive_appointments"]) => {
    return appointment.venue || appointment.venue_address || "Venue to be confirmed"
  }

  const getCategoryBadgeColor = (category: string) => {
    const categoryLower = category.toLowerCase()
    if (categoryLower.includes("beef")) return "bg-red-100 text-red-800 border-red-200"
    if (categoryLower.includes("pork")) return "bg-pink-100 text-pink-800 border-pink-200"
    if (categoryLower.includes("chicken")) return "bg-yellow-100 text-yellow-800 border-yellow-200"
    if (categoryLower.includes("fish") || categoryLower.includes("seafood"))
      return "bg-blue-100 text-blue-800 border-blue-200"
    if (categoryLower.includes("vegetable")) return "bg-green-100 text-green-800 border-green-200"
    if (categoryLower.includes("pasta")) return "bg-orange-100 text-orange-800 border-orange-200"
    if (categoryLower.includes("dessert")) return "bg-purple-100 text-purple-800 border-purple-200"
    if (categoryLower.includes("beverage") || categoryLower.includes("drink"))
      return "bg-cyan-100 text-cyan-800 border-cyan-200"
    return "bg-gray-100 text-gray-800 border-gray-200"
  }

  const hasMenuItems = (transaction: PaymentTransaction | null) => {
    console.log("=== CHECKING hasMenuItems ===")
    console.log("Transaction:", transaction?.id)
    console.log("menu_items exists:", !!transaction?.menu_items)
    console.log("menu_items:", transaction?.menu_items)

    if (!transaction?.menu_items) {
      console.log("No menu_items object")
      return false
    }

    const hasMain =
      transaction.menu_items.main_courses &&
      Array.isArray(transaction.menu_items.main_courses) &&
      transaction.menu_items.main_courses.length > 0

    const hasExtras =
      transaction.menu_items.extras &&
      Array.isArray(transaction.menu_items.extras) &&
      transaction.menu_items.extras.length > 0

    console.log("hasMain:", hasMain, "count:", transaction.menu_items.main_courses?.length)
    console.log("hasExtras:", hasExtras, "count:", transaction.menu_items.extras?.length)
    console.log("Result:", hasMain || hasExtras)

    return hasMain || hasExtras
  }

  const handleDownloadReceipt = async (transaction: PaymentTransaction) => {
    if (downloadingReceipt) {
      toast({
        title: "Download in Progress",
        description: "Please wait for the current download to complete.",
        variant: "destructive",
      })
      return
    }

    try {
      setDownloadingReceipt(true)

      toast({
        title: "Generating Receipt",
        description: "Please wait while we generate your receipt...",
      })

      const appointment = transaction.tbl_comprehensive_appointments

      // Get customer name from walk-in contact fields or user fields
      const customerName =
        appointment.contact_first_name && appointment.contact_last_name
          ? `${appointment.contact_first_name} ${appointment.contact_last_name}`.trim()
          : transaction.tbl_users?.full_name || "Walk-In Customer"

      const customerEmail = appointment.contact_email || transaction.tbl_users?.email || "N/A"

      await new Promise((resolve) => requestAnimationFrame(resolve))

      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d", { alpha: false })
      if (!ctx) throw new Error("Could not get canvas context")

      canvas.width = 800
      canvas.height = 1400

      ctx.fillStyle = "#ffffff"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      const logo = new Image()
      logo.crossOrigin = "anonymous"

      await new Promise((resolve) => {
        logo.onload = resolve
        logo.onerror = () => {
          console.warn("Logo failed to load")
          resolve(null)
        }
        logo.src = "/images/New Logo.png"
        setTimeout(() => resolve(null), 2000)
      })

      let currentY = 30

      if (logo.complete && logo.naturalWidth > 0) {
        const logoWidth = 80
        const logoHeight = 80
        ctx.drawImage(logo, 30, currentY, logoWidth, logoHeight)
        currentY += logoHeight + 20
      } else {
        currentY += 20
      }

      ctx.fillStyle = "#1f2937"
      ctx.font = "bold 28px Arial"
      ctx.textAlign = "center"
      ctx.fillText("Jo Pacheco Catering Services", canvas.width / 2, currentY)
      currentY += 35

      ctx.font = "20px Arial"
      ctx.fillStyle = "#6b7280"
      ctx.fillText("Payment Receipt", canvas.width / 2, currentY)
      currentY += 25

      ctx.font = "12px Arial"
      ctx.fillStyle = "#9ca3af"
      ctx.fillText(`Receipt ID: ${transaction.id.slice(0, 16)}`, canvas.width / 2, currentY)
      currentY += 18
      ctx.fillText(
        `Date: ${format(new Date(transaction.created_at), "MMM d, yyyy 'at' h:mm a")}`,
        canvas.width / 2,
        currentY,
      )
      currentY += 35

      ctx.strokeStyle = "#e5e7eb"
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(40, currentY)
      ctx.lineTo(canvas.width - 40, currentY)
      ctx.stroke()
      currentY += 35

      ctx.textAlign = "left"
      ctx.font = "bold 16px Arial"
      ctx.fillStyle = "#374151"
      ctx.fillText("Customer Information", 50, currentY)
      currentY += 25

      ctx.font = "14px Arial"
      ctx.fillStyle = "#4b5563"
      ctx.fillText(`Name: ${customerName}`, 50, currentY)
      currentY += 20
      ctx.fillText(`Email: ${customerEmail}`, 50, currentY)
      currentY += 20
      if (appointment.contact_phone) {
        ctx.fillText(`Phone: ${appointment.contact_phone}`, 50, currentY)
        currentY += 20
      }
      currentY += 15

      ctx.font = "bold 16px Arial"
      ctx.fillStyle = "#374151"
      ctx.fillText("Event Details", 50, currentY)
      currentY += 25

      ctx.font = "14px Arial"
      ctx.fillStyle = "#4b5563"
      ctx.fillText(
        `Event Type: ${appointment.event_type.charAt(0).toUpperCase() + appointment.event_type.slice(1)}`,
        50,
        currentY,
      )
      currentY += 20
      ctx.fillText(`Date: ${format(new Date(appointment.event_date), "MMM d, yyyy")}`, 50, currentY)
      currentY += 20
      ctx.fillText(`Guest Count: ${appointment.guest_count}`, 50, currentY)
      currentY += 35

      ctx.font = "bold 16px Arial"
      ctx.fillStyle = "#374151"
      ctx.fillText("Payment Details", 50, currentY)
      currentY += 25

      ctx.font = "14px Arial"
      ctx.fillStyle = "#4b5563"
      const paymentType =
        transaction.payment_type === "down_payment"
          ? "Down Payment"
          : transaction.payment_type === "full_payment"
            ? "Full Payment"
            : transaction.payment_type === "cash"
              ? "Cash Payment"
              : "Remaining Balance"
      ctx.fillText(`Payment Type: ${paymentType}`, 50, currentY)
      currentY += 20
      ctx.font = "bold 16px Arial"
      ctx.fillStyle = "#16a34a"
      ctx.fillText(`Amount Paid: ${formatCurrency(transaction.amount)}`, 50, currentY)
      currentY += 20
      ctx.font = "14px Arial"
      ctx.fillStyle = "#4b5563"
      ctx.fillText(`Payment Method: ${transaction.payment_method.toUpperCase()}`, 50, currentY)
      currentY += 20
      ctx.fillText(`Reference: ${transaction.reference_number}`, 50, currentY)
      currentY += 35

      ctx.font = "bold 16px Arial"
      ctx.fillStyle = "#374151"
      ctx.fillText("Package Summary", 50, currentY)
      currentY += 25

      ctx.font = "14px Arial"
      ctx.fillStyle = "#4b5563"
      if (appointment.total_package_amount) {
        ctx.fillText(`Total Package: ${formatCurrency(appointment.total_package_amount)}`, 50, currentY)
        currentY += 20
      }
      if (appointment.down_payment_amount) {
        ctx.fillText(`Down Payment: ${formatCurrency(appointment.down_payment_amount)}`, 50, currentY)
        currentY += 20
      }
      if (appointment.remaining_balance) {
        ctx.fillText(`Remaining Balance: ${formatCurrency(appointment.remaining_balance)}`, 50, currentY)
        currentY += 20
      }
      currentY += 35

      ctx.strokeStyle = "#e5e7eb"
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(40, currentY)
      ctx.lineTo(canvas.width - 40, currentY)
      ctx.stroke()
      currentY += 25

      ctx.font = "12px Arial"
      ctx.fillStyle = "#9ca3af"
      ctx.textAlign = "center"
      ctx.fillText("Thank you for choosing Jo Pacheco Catering Services!", canvas.width / 2, currentY)
      currentY += 18
      ctx.fillText(`Generated on: ${format(new Date(), "MMM d, yyyy 'at' h:mm a")}`, canvas.width / 2, currentY)

      const link = document.createElement("a")
      link.download = `Receipt-${appointment.event_type}-${transaction.id.slice(0, 8)}.png`
      link.href = canvas.toDataURL("image/png")
      link.click()

      toast({
        title: "Receipt Downloaded",
        description: "Your payment receipt has been downloaded successfully.",
      })
    } catch (error) {
      console.error("[v0] Error generating receipt:", error)
      toast({
        title: "Download Failed",
        description: "Failed to generate receipt. Please try again.",
        variant: "destructive",
      })
    } finally {
      setDownloadingReceipt(false)
    }
  }

  const handleMakeWalkInPayment = (appointment: any) => {
    setSelectedWalkInAppointment(appointment)
    
    // Set initial payment type based on current payment status
    const initialPaymentType = appointment.payment_status === "partially_paid" ? "remaining_balance" : "down_payment"
    const initialAmount = appointment.payment_status === "partially_paid" 
      ? appointment.remaining_balance 
      : appointment.down_payment_amount || 0
    
    setWalkInPaymentData({
      appointmentId: appointment.id,
      amount: initialAmount,
      paymentType: initialPaymentType,
      paymentMethod: "cash",
      reference: "",
      notes: "",
    })
    setWalkInPaymentDialogOpen(true)
  }

  const handleWalkInPaymentTypeChange = (type: "down_payment" | "full_payment" | "remaining_balance" | "cash") => {
    if (!selectedWalkInAppointment) return

    let amount = 0
    if (type === "down_payment") {
      amount = selectedWalkInAppointment.down_payment_amount
    } else if (type === "full_payment") {
      amount = selectedWalkInAppointment.total_package_amount
    } else if (type === "remaining_balance") {
      amount = selectedWalkInAppointment.remaining_balance
    } else if (type === "cash") {
      // For cash, amount is typically custom, so we can set it to 0 or the down payment as a default
      // and let the user input the exact amount if needed, or keep it open.
      // For now, let's set it to 0 and rely on other fields if cash is chosen.
      amount = 0
    }

    setWalkInPaymentData((prev) => ({
      ...prev,
      paymentType: type,
      amount: amount || 0, // Ensure amount is always a number
    }))
  }

  const submitWalkInPayment = async () => {
    if (!walkInPaymentData.paymentMethod) {
      toast({ title: "Missing Payment Method", description: "Please select a payment method.", variant: "destructive" })
      return
    }
    if (walkInPaymentData.paymentType !== "cash" && !walkInPaymentData.reference.trim()) {
      toast({
        title: "Missing Reference ID",
        description: "Please enter the payment reference/transaction ID.",
        variant: "destructive",
      })
      return
    }
    if (walkInPaymentData.paymentType === "cash" && walkInPaymentData.amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount for cash payments.",
        variant: "destructive",
      })
      return
    }

    setSubmittingWalkInPayment(true)
    try {
      const response = await fetch("/api/admin/walk-in-payments/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(walkInPaymentData),
      })

      const result = await response.json()

      if (result.success) {
        console.log("[v0] Walk-in payment submitted successfully, refreshing lists...")
        toast({
          title: "Payment Recorded!",
          description: "Walk-in payment has been successfully recorded and sent to User Payments for verification.",
        })
        setWalkInPaymentDialogOpen(false)
        
        // Add delay to ensure database updates are complete before refetching
        await new Promise((resolve) => setTimeout(resolve, 1500))
        
        await fetchWalkInPayments()
        await fetchPaymentTransactions()
        console.log("[v0] Walk-in payment lists refreshed")
        // </CHANGE>
      } else {
        throw new Error(result.message || "Failed to record payment")
      }
    } catch (error: any) {
      console.error("Error submitting walk-in payment:", error)
      toast({
        title: "Error",
        description: `Failed to submit payment: ${error.message}`,
        variant: "destructive",
      })
    } finally {
      setSubmittingWalkInPayment(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-600"></div>
        <p className="mt-2 text-gray-500">Loading payment transactions...</p>
      </div>
    )
  }

  const pendingTransactions = transactions.filter((t) => t.status === "pending_verification")
  const processedTransactions = transactions.filter((t) => t.status !== "pending_verification")

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Payment Management</h2>
          <p className="text-muted-foreground">Review and verify customer payment submissions</p>
        </div>
        <Button
          onClick={() => {
            fetchPaymentTransactions()
            fetchWalkInPayments()
          }}
          variant="outline"
        >
          Refresh
        </Button>
      </div>

      <div className="flex gap-2 border-b">
        <button
          onClick={() => setActiveTab("user-payments")}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === "user-payments"
              ? "border-b-2 border-rose-600 text-rose-600"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          User Payments
        </button>
        <button
          onClick={() => setActiveTab("walk-in-payments")}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === "walk-in-payments"
              ? "border-b-2 border-rose-600 text-rose-600"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Walk-In Payments
          {walkInAppointments.length > 0 && <Badge className="ml-2 bg-rose-600">{walkInAppointments.length}</Badge>}
        </button>
      </div>

      {activeTab === "user-payments" ? (
        <>
          {/* Pending Payments Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-orange-600">
              Pending Verification ({pendingTransactions.length})
            </h3>
            {pendingTransactions.length > 0 ? (
              <div className="grid gap-4">
                {pendingTransactions.map((transaction) => (
                  <Card key={transaction.id} className="border-orange-200">
                    <CardHeader className="bg-orange-50">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <CreditCard className="h-5 w-5" />
                          {transaction.tbl_users?.full_name || "Walk-In Customer"}
                        </CardTitle>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(transaction.status)}
                          {getPaymentTypeBadge(transaction.payment_type, transaction.appointment_payment_status)}
                        </div>
                      </div>
                      <CardDescription>
                        Transaction ID: {transaction.id.slice(0, 8)}... • {formatCurrency(transaction.amount)} •{" "}
                        {transaction.payment_method}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="grid gap-6 lg:grid-cols-2">
                        {/* Customer & Payment Info */}
                        <div className="space-y-4">
                          <h4 className="font-semibold text-rose-600 border-b pb-2">Payment Details</h4>
                          <div className="space-y-3">
                            <div>
                              <p className="font-medium">Customer</p>
                              <p className="text-sm text-gray-600">
                                {transaction.tbl_users?.full_name || "Walk-In Customer"} (
                                {transaction.tbl_users?.email || "N/A"})
                              </p>
                            </div>
                            <div>
                              <p className="font-medium">Amount</p>
                              <p className="text-lg font-bold text-green-600">{formatCurrency(transaction.amount)}</p>
                            </div>
                            <div>
                              <p className="font-medium">Reference Number</p>
                              <p className="text-sm text-gray-600">{transaction.reference_number}</p>
                            </div>
                            <div>
                              <p className="font-medium">Appointment Status When Submitted</p>
                              <Badge variant="outline" className="bg-gray-100 text-gray-600 border-gray-200">
                                {transaction.appointment_payment_status || "Unknown"}
                              </Badge>
                            </div>
                            {transaction.notes && (
                              <div>
                                <p className="font-medium">Customer Notes</p>
                                <p className="text-sm text-gray-600">{transaction.notes}</p>
                              </div>
                            )}
                            <div>
                              <p className="font-medium">Submitted</p>
                              <p className="text-sm text-gray-600">
                                {format(new Date(transaction.created_at), "PPP 'at' p")}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Event Information */}
                        <div className="space-y-4">
                          <h4 className="font-semibold text-rose-600 border-b pb-2">Event Details</h4>
                          <div className="space-y-3">
                            <div className="flex items-center gap-3">
                              <Calendar className="h-4 w-4 text-gray-500" />
                              <div>
                                <p className="font-medium">{transaction.tbl_comprehensive_appointments.event_type}</p>
                                <p className="text-sm text-gray-600">
                                  {formatEventDate(transaction.tbl_comprehensive_appointments.event_date)} at{" "}
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
                                  {getVenueDisplay(transaction.tbl_comprehensive_appointments)}
                                </p>
                              </div>
                            </div>
                            <div>
                              <p className="font-medium">Current Payment Status</p>
                              <Badge variant="outline" className="bg-blue-100 text-blue-600 border-blue-200">
                                {transaction.tbl_comprehensive_appointments.payment_status}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-between items-center mt-6 pt-4 border-t">
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            onClick={() => window.open(transaction.proof_image_url, "_blank")}
                            className="flex items-center gap-2"
                          >
                            <Eye className="h-4 w-4" />
                            View Proof
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => handleViewDetails(transaction)}
                            className="flex items-center gap-2"
                          >
                            <Calendar className="h-4 w-4" />
                            View Event Details
                          </Button>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            onClick={() => handleVerifyPayment(transaction, "rejected")}
                            className="text-red-600 border-red-200 hover:bg-red-50"
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Reject
                          </Button>
                          <Button
                            onClick={() => handleVerifyPayment(transaction, "verified")}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Verify
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">All Caught Up!</h3>
                  <p className="text-gray-500">No pending payment verifications at this time.</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Processed Payments Section */}
          {processedTransactions.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-600">
                Recent Processed Payments ({processedTransactions.length})
              </h3>
              <div className="grid gap-4">
                {processedTransactions.slice(0, 5).map((transaction) => (
                  <Card key={transaction.id} className="border-gray-200">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div>
                            <p className="font-medium">{transaction.tbl_users?.full_name || "Walk-In Customer"}</p>
                            <p className="text-sm text-gray-500">
                              {formatCurrency(transaction.amount)} • {transaction.payment_method} •{" "}
                              {format(new Date(transaction.updated_at), "MMM d, yyyy")}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewDetails(transaction)}
                            className="flex items-center gap-2"
                          >
                            <Eye className="h-4 w-4" />
                            View Details
                          </Button>
                          <div className="flex items-center gap-2">
                            {getStatusBadge(transaction.status)}
                            {getPaymentTypeBadge(transaction.payment_type, transaction.appointment_payment_status)}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        <>
          {/* Walk-In Payments Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-rose-600">
              Walk-In Customers Ready for Payment ({walkInAppointments.length})
            </h3>
            <p className="text-sm text-gray-600">
              Walk-in customers who have confirmed their food tasting appointment and are ready to make payment.
            </p>

            {walkInLoading ? (
              <Card>
                <CardContent className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-600 mx-auto"></div>
                  <p className="mt-2 text-gray-500">Loading walk-in payments...</p>
                </CardContent>
              </Card>
            ) : walkInAppointments.length > 0 ? (
              <div className="grid gap-4">
                {walkInAppointments.map((appointment) => (
                  <Card key={appointment.id} className="border-rose-200">
                    <CardHeader className="bg-rose-50">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg flex items-center gap-2">{appointment.event_type}</CardTitle>
                        <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                          Payment Required
                        </Badge>
                      </div>
                      <CardDescription>
                        Booking ID: {appointment.id.slice(0, 8)}... • Contact: {appointment.contact_first_name}{" "}
                        {appointment.contact_last_name} • Updated: {new Date(appointment.updated_at).toLocaleString()}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="grid gap-6 lg:grid-cols-2">
                        {/* Event Details */}
                        <div className="space-y-4">
                          <h4 className="font-semibold text-rose-600 border-b pb-2">Event Details</h4>
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
                                <p className="text-sm text-gray-600">
                                  {appointment.venue}, {appointment.venue_address}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Payment Breakdown */}
                        <div className="space-y-4">
                          <h4 className="font-semibold text-rose-600 border-b pb-2">Payment Breakdown</h4>
                          <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="font-medium text-gray-700">Total Package Amount:</span>
                              <span className="text-xl font-bold text-gray-900">
                                {formatCurrency(appointment.total_package_amount || 0)}
                              </span>
                            </div>
                            <div className="border-t pt-3 space-y-2">
                              <div className="flex justify-between items-center">
                                <span className="font-medium text-green-700">Down Payment (50%):</span>
                                <span className="text-lg font-semibold text-green-600">
                                  {formatCurrency(appointment.down_payment_amount || 0)}
                                </span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="font-medium text-orange-700">Remaining Balance:</span>
                                <span className="text-xl font-bold text-orange-600">
                                  {formatCurrency(appointment.remaining_balance || 0)}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <div className="bg-blue-50 p-3 rounded-lg">
                              <p className="text-sm text-blue-800">
                                <strong>Contact:</strong> {appointment.contact_first_name}{" "}
                                {appointment.contact_last_name}
                                <br />
                                <strong>Email:</strong> {appointment.contact_email}
                                <br />
                                <strong>Phone:</strong> {appointment.contact_phone}
                              </p>
                            </div>

                            <Button
                              className="w-full bg-rose-600 hover:bg-rose-700 text-white"
                              size="lg"
                              onClick={() => handleMakeWalkInPayment(appointment)}
                            >
                              <CreditCard className="h-4 w-4 mr-2" />
                              {appointment.payment_status === "partially_paid"
                                ? "Pay Remaining Balance"
                                : "Make Payment"}
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
                <CardContent className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Walk-In Payments Pending</h3>
                  <p className="text-gray-500">
                    Walk-in customers will appear here once they confirm their food tasting appointment.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </>
      )}

      {/* Verification Dialog */}
      <Dialog open={verificationDialogOpen} onOpenChange={setVerificationDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Payment Verification</DialogTitle>
            <DialogDescription>
              {selectedTransaction && (
                <>
                  Verify {selectedTransaction.tbl_users?.full_name || "Walk-In Customer"}'s{" "}
                  {selectedTransaction.payment_type === "down_payment"
                    ? "down payment"
                    : selectedTransaction.payment_type === "remaining_balance"
                      ? "remaining balance"
                      : "full payment"}{" "}
                  of {formatCurrency(selectedTransaction.amount)}
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="adminNotes">Admin Notes (Optional)</Label>
              <Textarea
                id="adminNotes"
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Add any notes about this verification..."
                rows={3}
                className="mt-1"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setVerificationDialogOpen(false)} disabled={processing}>
              Cancel
            </Button>
            <Button
              variant="outline"
              onClick={() => submitVerification("rejected")}
              disabled={processing}
              className="text-red-600 border-red-200 hover:bg-red-50"
            >
              {processing ? "Processing..." : "Reject"}
            </Button>
            <Button
              onClick={() => submitVerification("verified")}
              disabled={processing}
              className="bg-green-600 hover:bg-green-700"
            >
              {processing ? "Processing..." : "Verify"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Event Details Dialog */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Complete Event & Payment Details
            </DialogTitle>
            <DialogDescription>
              {selectedTransaction && (
                <>
                  Full details for {selectedTransaction.tbl_users?.full_name || "Walk-In Customer"}'s{" "}
                  {selectedTransaction.payment_type === "down_payment"
                    ? "down payment"
                    : selectedTransaction.payment_type === "remaining_balance"
                      ? "remaining balance"
                      : "full payment"}{" "}
                  of {formatCurrency(selectedTransaction.amount)}
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          {selectedTransaction && (
            <div className="space-y-6 py-4">
              {/* Payment Information */}
              <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <CreditCard className="h-5 w-5" />
                      Payment Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="font-medium">Amount:</span>
                      <span className="text-lg font-bold text-green-600">
                        {formatCurrency(selectedTransaction.amount)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Payment Type:</span>
                      {getPaymentTypeBadge(selectedTransaction.payment_type)}
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Status:</span>
                      {getStatusBadge(selectedTransaction.status)}
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Method:</span>
                      <span>{selectedTransaction.payment_method}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Reference:</span>
                      <span className="text-sm">{selectedTransaction.reference_number}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Submitted:</span>
                      <span className="text-sm">
                        {format(new Date(selectedTransaction.created_at), "MMM d, yyyy 'at' h:mm a")}
                      </span>
                    </div>
                    {selectedTransaction.admin_notes && (
                      <div className="pt-2 border-t">
                        <span className="font-medium">Admin Notes:</span>
                        <p className="text-sm text-gray-600 mt-1">{selectedTransaction.admin_notes}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Customer Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Customer Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <span className="font-medium">Name:</span>
                      <p className="text-sm">
                        {selectedTransaction.tbl_comprehensive_appointments.contact_first_name &&
                        selectedTransaction.tbl_comprehensive_appointments.contact_last_name
                          ? `${selectedTransaction.tbl_comprehensive_appointments.contact_first_name} ${selectedTransaction.tbl_comprehensive_appointments.contact_last_name}`.trim()
                          : selectedTransaction.tbl_users?.full_name || "Walk-In Customer"}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium">Email:</span>
                      <p className="text-sm">
                        {selectedTransaction.tbl_comprehensive_appointments.contact_email ||
                          selectedTransaction.tbl_users?.email ||
                          "N/A"}
                      </p>
                    </div>
                    {(selectedTransaction.tbl_comprehensive_appointments.contact_phone ||
                      selectedTransaction.tbl_users?.phone) && (
                      <div>
                        <span className="font-medium">Phone:</span>
                        <p className="text-sm">
                          {selectedTransaction.tbl_comprehensive_appointments.contact_phone ||
                            selectedTransaction.tbl_users?.phone}
                        </p>
                      </div>
                    )}
                    {selectedTransaction.notes && (
                      <div className="pt-2 border-t">
                        <span className="font-medium">Customer Notes:</span>
                        <p className="text-sm text-gray-600 mt-1">{selectedTransaction.notes}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Menu Selection */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Utensils className="h-5 w-5" />
                    Menu Selection
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {hasMenuItems(selectedTransaction) ? (
                    <div className="space-y-6">
                      {/* Main Courses */}
                      {selectedTransaction.menu_items?.main_courses &&
                        selectedTransaction.menu_items.main_courses.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-sm text-gray-700 mb-3 flex items-center gap-2">
                              <ChefHat className="h-4 w-4" />
                              Main Courses
                            </h4>
                            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                              {selectedTransaction.menu_items.main_courses.map((item, index) => (
                                <div
                                  key={`main-${index}`}
                                  className="p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-100 transition-all"
                                >
                                  <div className="flex items-start justify-between gap-2">
                                    <span className="font-medium text-sm">{item.name}</span>
                                  </div>
                                  <p className="text-xs text-gray-500 mt-1 capitalize">{item.category}</p>
                                  {item.description && <p className="text-xs text-gray-400 mt-1">{item.description}</p>}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                      {/* Extras */}
                      {selectedTransaction.menu_items?.extras && selectedTransaction.menu_items.extras.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-sm text-gray-700 mb-3 flex items-center gap-2">
                            <Cake className="h-4 w-4" />
                            Extras
                          </h4>
                          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                            {selectedTransaction.menu_items.extras.map((item, index) => (
                              <div
                                key={`extra-${index}`}
                                className="p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-100 transition-all"
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <span className="font-medium text-sm">{item.name}</span>
                                </div>
                                <p className="text-xs text-gray-500 mt-1 capitalize">{item.category}</p>
                                {item.description && <p className="text-xs text-gray-400 mt-1">{item.description}</p>}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 italic">No menu items selected for this appointment</p>
                  )}
                </CardContent>
              </Card>

              {/* Pricing Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Pricing Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {selectedTransaction.tbl_comprehensive_appointments.total_package_amount && (
                      <div className="flex justify-between">
                        <span className="font-medium">Total Package Amount:</span>
                        <span className="font-bold">
                          {formatCurrency(selectedTransaction.tbl_comprehensive_appointments.total_package_amount)}
                        </span>
                      </div>
                    )}
                    {selectedTransaction.tbl_comprehensive_appointments.down_payment_amount && (
                      <div className="flex justify-between">
                        <span className="font-medium">Down Payment Amount:</span>
                        <span className="text-green-600">
                          {formatCurrency(selectedTransaction.tbl_comprehensive_appointments.down_payment_amount)}
                        </span>
                      </div>
                    )}
                    {selectedTransaction.tbl_comprehensive_appointments.remaining_balance && (
                      <div className="flex justify-between">
                        <span className="font-medium">Remaining Balance:</span>
                        <span className="text-orange-600">
                          {formatCurrency(selectedTransaction.tbl_comprehensive_appointments.remaining_balance)}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Payment Proof */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Eye className="h-5 w-5" />
                    Payment Proof
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Proof Image:</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          selectedTransaction && window.open(selectedTransaction.proof_image_url, "_blank")
                        }
                        className="flex items-center gap-2"
                      >
                        <Eye className="h-4 w-4" />
                        Open in New Tab
                      </Button>
                    </div>
                    <div className="border rounded-lg overflow-hidden bg-gray-50">
                      <img
                        src={selectedTransaction.proof_image_url || "/placeholder.svg"}
                        alt="Payment Proof"
                        className="w-full max-h-96 object-contain"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.style.display = "none"
                          const parent = target.parentElement
                          if (parent) {
                            parent.innerHTML = `
                              <div class="flex flex-col items-center justify-center h-32 text-gray-500">
                                <p>Unable to load image</p>
                                <p class="text-sm">Click "Open in New Tab" to view</p>
                              </div>
                            `
                          }
                        }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <DialogFooter className="flex justify-between items-center">
            <Button
              variant="outline"
              onClick={() => selectedTransaction && handleDownloadReceipt(selectedTransaction)}
              disabled={downloadingReceipt}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              {downloadingReceipt ? "Generating..." : "Download Receipt"}
            </Button>
            <Button variant="outline" onClick={() => setDetailsDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={walkInPaymentDialogOpen} onOpenChange={setWalkInPaymentDialogOpen}>
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Submit Payment for {selectedWalkInAppointment?.event_type} Event
            </DialogTitle>
            <DialogDescription>
              Record the walk-in customer's payment. This payment will be sent to User Payments for verification.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-4">
            {/* Payment Type Selection */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Payment Type</Label>
              <RadioGroup
                value={walkInPaymentData.paymentType}
                onValueChange={(value: "down_payment" | "full_payment" | "remaining_balance") => handleWalkInPaymentTypeChange(value)}
              >
                {/* Show Down Payment option only if not partially paid */}
                {selectedWalkInAppointment?.payment_status !== "partially_paid" && (
                  <div className="flex items-center justify-between space-x-2 border rounded-lg p-4 hover:bg-gray-50 cursor-pointer">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="down_payment" id="down" />
                      <Label htmlFor="down" className="cursor-pointer font-medium">
                        Down Payment (50%)
                      </Label>
                    </div>
                    <span className="text-lg font-bold text-green-600">
                      {formatCurrency(selectedWalkInAppointment?.down_payment_amount || 0)}
                    </span>
                  </div>
                )}
                
                {/* Show Remaining Balance option only if partially paid */}
                {selectedWalkInAppointment?.payment_status === "partially_paid" && (
                  <div className="flex items-center justify-between space-x-2 border rounded-lg p-4 hover:bg-gray-50 cursor-pointer">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="remaining_balance" id="remaining" />
                      <Label htmlFor="remaining" className="cursor-pointer font-medium">
                        Pay Remaining Balance
                      </Label>
                    </div>
                    <span className="text-lg font-bold text-orange-600">
                      {formatCurrency(selectedWalkInAppointment?.remaining_balance || 0)}
                    </span>
                  </div>
                )}
                
                {/* Show Full Payment option only if not partially paid */}
                {selectedWalkInAppointment?.payment_status !== "partially_paid" && (
                  <div className="flex items-center justify-between space-x-2 border rounded-lg p-4 hover:bg-gray-50 cursor-pointer">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="full_payment" id="full" />
                      <Label htmlFor="full" className="cursor-pointer font-medium">
                        Full Payment (100%)
                      </Label>
                    </div>
                    <span className="text-lg font-bold text-rose-600">
                      {formatCurrency(selectedWalkInAppointment?.total_package_amount || 0)}
                    </span>
                  </div>
                )}
              </RadioGroup>
            </div>

            {/* Payment Method Selection */}
            <div className="space-y-2">
              <Label htmlFor="paymentMethod" className="text-base font-semibold">
                Payment Method <span className="text-red-500">*</span>
              </Label>
              <Select
                value={walkInPaymentData.paymentMethod}
                onValueChange={(value) => {
                  setWalkInPaymentData((prev) => ({ ...prev, paymentMethod: value }))
                  setShowQRCode(true)
                }}
              >
                <SelectTrigger id="paymentMethod" className="h-12">
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">💵 Cash</SelectItem>
                  <SelectItem value=" GCash">📱 GCash</SelectItem>
                  <SelectItem value="bank_transfer">🏦 Bank Transfer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Dynamic Payment Details based on selected method */}
            {walkInPaymentData.paymentType === "cash" && (
              <div className="space-y-2">
                <Label htmlFor="amount" className="text-base font-semibold">
                  Amount to Pay <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="Enter amount"
                  value={walkInPaymentData.amount}
                  onChange={(e) =>
                    setWalkInPaymentData((prev) => ({
                      ...prev,
                      amount: Number.parseFloat(e.target.value) || 0,
                    }))
                  }
                  className="h-12"
                />
              </div>
            )}

            {walkInPaymentData.paymentMethod === " GCash" && (
              <div className="border rounded-lg p-4 bg-blue-50 border-blue-200 space-y-3">
                <h4 className="font-semibold text-blue-900">Payment Details for GCash</h4>
                <div className="space-y-1">
                  <p className="text-sm">
                    <strong>Account Name:</strong> Jonel Ray Pacheco
                  </p>
                  <p className="text-sm">
                    <strong>GCash Number:</strong> 0921-218-3558
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowQRCode(!showQRCode)}
                  className="text-blue-700 border-blue-300 hover:bg-blue-100"
                >
                  {showQRCode ? "Hide" : "Show"} QR Code
                </Button>
                {showQRCode && (
                  <div className="text-center space-y-2">
                    <img
                      src="/qrcodeko.jpg"
                      alt="GCash QR Code"
                      className="mx-auto w-48 h-48 border-2 border-blue-300 rounded-lg"
                    />
                    <p className="text-xs text-blue-700 italic">
                      (This is a placeholder QR code. In a real app, a dynamic QR code would be generated.)
                    </p>
                  </div>
                )}
              </div>
            )}

            {walkInPaymentData.paymentMethod === "bank_transfer" && (
              <div className="border rounded-lg p-4 bg-green-50 border-green-200 space-y-2">
                <h4 className="font-semibold text-green-900">Payment Details for Bank Transfer</h4>
                <div className="space-y-1">
                  <p className="text-sm">
                    <strong>Account Name:</strong> Jonel Ray Pacheco
                  </p>
                  <p className="text-sm">
                    <strong>Bank Account Number:</strong> 987-654-3210 (Dummy)
                  </p>
                </div>
              </div>
            )}

            {/* Reference/Transaction ID */}
            {walkInPaymentData.paymentType !== "cash" && (
              <div className="space-y-2">
                <Label htmlFor="reference" className="text-base font-semibold">
                  Reference/Transaction ID <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="reference"
                  placeholder="Enter transaction ID or reference number"
                  value={walkInPaymentData.reference}
                  onChange={(e) => setWalkInPaymentData((prev) => ({ ...prev, reference: e.target.value }))}
                  className="h-12"
                />
              </div>
            )}

            {/* Additional Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes" className="text-base font-semibold">
                Additional Notes (Optional)
              </Label>
              <Textarea
                id="notes"
                placeholder="Any additional information about this payment..."
                value={walkInPaymentData.notes}
                onChange={(e) => setWalkInPaymentData((prev) => ({ ...prev, notes: e.target.value }))}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setWalkInPaymentDialogOpen(false)}
              disabled={submittingWalkInPayment}
            >
              Cancel
            </Button>
            <Button
              onClick={submitWalkInPayment}
              disabled={submittingWalkInPayment}
              className="bg-rose-600 hover:bg-rose-700"
            >
              <CreditCard className="h-4 w-4 mr-2" />
              {submittingWalkInPayment ? "Submitting..." : "Submit Payment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* </CHANGE> */}
    </div>
  )
}
