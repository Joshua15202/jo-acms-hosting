"use client"
import { useState, useEffect, useRef } from "react"
import type React from "react"

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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Calendar, Clock, Users, MapPin, CreditCard, Smartphone, Building2, Upload, CheckCircle } from "lucide-react"
import { format } from "date-fns"
import type { User } from "@/app/actions/auth-actions"
import { useToast } from "@/hooks/use-toast"

type Appointment = {
  id: string
  event_type: string
  event_date: string
  event_time: string
  guest_count: number
  venue?: string
  venue_address?: string
  total_package_amount?: number
  down_payment_amount?: number
  remaining_balance?: number
  budget_min?: number
  budget_max?: number
  status: string
  payment_status?: "unpaid" | "pending_payment" | "partially_paid" | "fully_paid" | "refunded"
  created_at: string
  selected_menu_items?: any[]
  contact_first_name: string
  contact_last_name: string
  contact_email: string
  contact_phone?: string
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
  const [loading, setLoading] = useState(true)
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false)
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
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchPaymentReadyAppointments()
  }, [])

  const fetchPaymentReadyAppointments = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/scheduling/appointments")
      if (response.ok) {
        const data = await response.json()
        // Filter appointments that need payment:
        // 1. Status is TASTING_COMPLETED
        // 2. Payment status is NOT fully_paid
        // 3. Payment status is NOT pending_payment (unless they want to resubmit after rejection)
        const appointmentsNeedingPayment =
          data.appointments?.filter(
            (apt: Appointment) =>
              apt.status === "TASTING_COMPLETED" &&
              apt.payment_status !== "fully_paid" &&
              (apt.payment_status === "unpaid" ||
                apt.payment_status === "partially_paid" ||
                apt.payment_status === "pending_payment"),
          ) || []
        setAppointments(appointmentsNeedingPayment)
      } else {
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

  const getDownPayment = (appointment: Appointment) => {
    if (appointment.down_payment_amount && appointment.down_payment_amount > 0) {
      return appointment.down_payment_amount
    }
    const total = getTotalAmount(appointment)
    return Math.round(total * 0.5)
  }

  const getRemainingBalance = (appointment: Appointment) => {
    const total = getTotalAmount(appointment)
    const downPayment = getDownPayment(appointment)
    return total - downPayment
  }

  const getPaymentOptions = (appointment: Appointment) => {
    const paymentStatus = appointment.payment_status
    const total = getTotalAmount(appointment)
    const downPayment = getDownPayment(appointment)
    const remaining = getRemainingBalance(appointment)

    if (paymentStatus === "unpaid" || paymentStatus === "pending_payment") {
      // User hasn't paid anything yet, show both options
      return [
        { type: "down_payment", label: "Down Payment (50%)", amount: downPayment },
        { type: "full_payment", label: "Full Payment (100%)", amount: total },
      ]
    } else if (paymentStatus === "partially_paid") {
      // User has paid down payment, only show remaining balance
      return [
        { type: "remaining_balance", label: "Remaining Balance", amount: remaining },
        { type: "full_payment", label: "Full Payment (100%)", amount: total },
      ]
    }

    return []
  }

  const handlePayment = (appointment: Appointment) => {
    setSelectedAppointment(appointment)
    const paymentOptions = getPaymentOptions(appointment)
    const defaultOption = paymentOptions[0]

    setPaymentData({
      appointmentId: appointment.id,
      amount: defaultOption.amount,
      paymentType: defaultOption.type as "down_payment" | "full_payment" | "remaining_balance",
      paymentMethod: "",
      reference: "",
      notes: "",
      proofImage: null,
    })
    setPreviewImage(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
    setPaymentDialogOpen(true)
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
      const response = await fetch("/api/submit-payment", {
        method: "POST",
        credentials: "include",
        body: formData,
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "Payment Submitted!",
          description: "We will verify your payment and confirm your booking within 24-48 hours.",
        })
        setPaymentDialogOpen(false)
        fetchPaymentReadyAppointments()
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
    return appointment.venue || appointment.venue_address || "Venue to be confirmed"
  }

  const getContactName = (appointment: Appointment) => {
    return `${appointment.contact_first_name || ""} ${appointment.contact_last_name || ""}`.trim() || "Customer"
  }

  const getPaymentStatusDisplay = (appointment: Appointment) => {
    switch (appointment.payment_status) {
      case "unpaid":
        return { text: "Payment Required", color: "bg-red-100 text-red-800 border-red-200" }
      case "pending_payment":
        return { text: "Payment Under Review", color: "bg-orange-100 text-orange-800 border-orange-200" }
      case "partially_paid":
        return { text: "Partially Paid - Balance Due", color: "bg-yellow-100 text-yellow-800 border-yellow-200" }
      case "fully_paid":
        return { text: "Fully Paid", color: "bg-green-100 text-green-800 border-green-200" }
      default:
        return { text: "Payment Required", color: "bg-gray-100 text-gray-800 border-gray-200" }
    }
  }

  const getButtonText = (appointment: Appointment) => {
    if (appointment.payment_status === "pending_payment") {
      return "Payment Under Review"
    } else if (appointment.payment_status === "partially_paid") {
      return "Pay Remaining Balance"
    } else {
      return "Make Payment"
    }
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
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Payment Center</h1>
        <p className="mt-4 text-gray-500 md:text-xl">Complete payments for your confirmed catering appointments.</p>
      </div>

      {appointments.length > 0 ? (
        <div className="grid gap-6">
          {appointments.map((appointment) => {
            const statusDisplay = getPaymentStatusDisplay(appointment)
            const paymentOptions = getPaymentOptions(appointment)

            return (
              <Card key={appointment.id} className="overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-teal-50 to-rose-50 border-b">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl capitalize flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-teal-600" />
                      {appointment.event_type} Event - Payment Required
                    </CardTitle>
                    <Badge className={`capitalize ${statusDisplay.color}`}>{statusDisplay.text}</Badge>
                  </div>
                  <CardDescription>
                    Booking ID: {appointment.id.slice(0, 8)}... • Contact: {getContactName(appointment)}
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
                          {appointment.payment_status === "partially_paid" ? (
                            <>
                              <div className="flex justify-between items-center">
                                <span className="font-medium text-green-700">Down Payment (Paid):</span>
                                <span className="text-lg font-semibold text-green-600">
                                  {formatCurrency(getDownPayment(appointment))}
                                </span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="font-medium text-orange-700">Remaining Balance:</span>
                                <span className="text-xl font-bold text-orange-600">
                                  {formatCurrency(getRemainingBalance(appointment))}
                                </span>
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="flex justify-between items-center">
                                <span className="font-medium text-green-700">Down Payment (50%):</span>
                                <span className="text-xl font-bold text-green-600">
                                  {formatCurrency(getDownPayment(appointment))}
                                </span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="font-medium text-orange-700">Remaining Balance:</span>
                                <span className="text-lg font-semibold text-orange-600">
                                  {formatCurrency(getRemainingBalance(appointment))}
                                </span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                      <Button
                        onClick={() => handlePayment(appointment)}
                        className="w-full bg-rose-600 hover:bg-rose-700 text-white py-3 text-lg"
                        size="lg"
                        disabled={appointment.payment_status === "pending_payment"}
                      >
                        {appointment.payment_status === "pending_payment" ? (
                          <>
                            <Clock className="mr-2 h-5 w-5" />
                            Payment Under Review
                          </>
                        ) : (
                          <>
                            <CreditCard className="mr-2 h-5 w-5" />
                            {getButtonText(appointment)}
                          </>
                        )}
                      </Button>
                      {appointment.payment_status === "pending_payment" && (
                        <p className="text-sm text-center text-orange-600 mt-2">
                          Your previous payment is currently under review. You will be notified once it's processed.
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
              You don't have any appointments ready for payment at this time. Payments become available after your food
              tasting is completed.
            </p>
            <Button asChild variant="outline">
              <a href="/my-appointments">View My Appointments</a>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Payment Dialog */}
      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">Complete Your Payment</DialogTitle>
            <DialogDescription>Secure your booking by submitting your payment.</DialogDescription>
          </DialogHeader>

          {selectedAppointment && (
            <div className="grid gap-6 py-4">
              {/* Payment Type Selection */}
              <div className="space-y-3">
                <Label className="text-base font-medium">Choose Payment Amount</Label>
                <RadioGroup
                  value={paymentData.paymentType}
                  onValueChange={(value: "down_payment" | "full_payment" | "remaining_balance") =>
                    handlePaymentTypeChange(value)
                  }
                  className="grid gap-4"
                >
                  {getPaymentOptions(selectedAppointment).map((option) => (
                    <div key={option.type}>
                      <RadioGroupItem value={option.type} id={option.type} className="peer sr-only" />
                      <Label
                        htmlFor={option.type}
                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                      >
                        <p className="font-semibold">{option.label}</p>
                        <p
                          className={`text-2xl font-bold ${
                            option.type === "down_payment"
                              ? "text-green-600"
                              : option.type === "remaining_balance"
                                ? "text-orange-600"
                                : "text-blue-600"
                          }`}
                        >
                          {formatCurrency(option.amount)}
                        </p>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              {/* Payment Method Selection */}
              <div className="space-y-3">
                <Label htmlFor="paymentMethod" className="text-base font-medium">
                  Select Payment Method
                </Label>
                <Select
                  value={paymentData.paymentMethod}
                  onValueChange={(value) => setPaymentData((prev) => ({ ...prev, paymentMethod: value }))}
                >
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Choose your preferred payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gcash">
                      <div className="flex items-center gap-3 py-1">
                        <Smartphone className="h-5 w-5 text-blue-600" />
                        <p className="font-medium">GCash</p>
                      </div>
                    </SelectItem>
                    <SelectItem value="bank_transfer">
                      <div className="flex items-center gap-3 py-1">
                        <Building2 className="h-5 w-5 text-green-600" />
                        <p className="font-medium">Bank Transfer</p>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Payment Instructions */}
              {paymentData.paymentMethod && (
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h3 className="font-semibold mb-3 text-blue-900">Payment Instructions</h3>
                  <div className="space-y-2 text-sm">
                    <p>
                      <span className="font-medium">Amount to Send:</span>{" "}
                      <span className="font-bold text-rose-600">{formatCurrency(paymentData.amount)}</span>
                    </p>
                    <p>
                      <span className="font-medium">Account Name:</span> Jo Pacheco Catering Services
                    </p>
                    {paymentData.paymentMethod === "gcash" && (
                      <p>
                        <span className="font-medium">GCash Number:</span> 09123456789
                      </p>
                    )}
                    {paymentData.paymentMethod === "bank_transfer" && (
                      <p>
                        <span className="font-medium">BPI Account:</span> 1234-5678-90
                      </p>
                    )}
                    <p className="text-blue-700 mt-2">
                      Send the exact amount and upload the screenshot as proof of payment.
                    </p>
                  </div>
                </div>
              )}

              {/* Payment Details Form */}
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="reference" className="text-base font-medium">
                    Payment Reference/Transaction ID <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="reference"
                    value={paymentData.reference}
                    onChange={(e) => setPaymentData((prev) => ({ ...prev, reference: e.target.value }))}
                    placeholder="Enter transaction reference number"
                    className="mt-1"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="paymentProof" className="text-base font-medium">
                    Upload Payment Proof <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="paymentProof"
                    type="file"
                    accept="image/png, image/jpeg, image/jpg"
                    className="mt-1 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-rose-50 file:text-rose-700 hover:file:bg-rose-100"
                    onChange={handleFileChange}
                    ref={fileInputRef}
                    required
                  />
                  {previewImage && (
                    <div className="mt-2 border rounded-md p-2 max-w-xs">
                      <img
                        src={previewImage || "/placeholder.svg"}
                        alt="Payment proof preview"
                        className="max-h-48 w-auto rounded"
                      />
                    </div>
                  )}
                  <p className="text-xs text-gray-500 mt-1">Max file size: 5MB. Accepted formats: PNG, JPG, JPEG.</p>
                </div>
                <div>
                  <Label htmlFor="notes" className="text-base font-medium">
                    Additional Notes (Optional)
                  </Label>
                  <Textarea
                    id="notes"
                    value={paymentData.notes}
                    onChange={(e) => setPaymentData((prev) => ({ ...prev, notes: e.target.value }))}
                    placeholder="Any additional information about your payment"
                    rows={3}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setPaymentDialogOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button
              onClick={submitPayment}
              className="bg-rose-600 hover:bg-rose-700"
              disabled={
                submitting || !paymentData.paymentMethod || !paymentData.reference.trim() || !paymentData.proofImage
              }
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Submit Payment
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
