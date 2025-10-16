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
} from "lucide-react"
import { format } from "date-fns"
import { useToast } from "@/hooks/use-toast"

type PaymentTransaction = {
  id: string
  appointment_id: string
  user_id: string
  amount: number
  payment_type: "down_payment" | "full_payment" | "remaining_balance"
  payment_method: string
  reference_number: string
  notes?: string
  proof_image_url: string
  status: "pending_verification" | "verified" | "rejected"
  appointment_payment_status?: string
  admin_notes?: string
  created_at: string
  updated_at: string
  tbl_users: {
    id: string
    full_name: string
    first_name: string
    email: string
    phone?: string
  }
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
  const { toast } = useToast()

  useEffect(() => {
    fetchPaymentTransactions()
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Payment Management</h2>
          <p className="text-muted-foreground">Review and verify customer payment submissions</p>
        </div>
        <Button onClick={fetchPaymentTransactions} variant="outline">
          Refresh
        </Button>
      </div>

      {/* Pending Payments Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-orange-600">Pending Verification ({pendingTransactions.length})</h3>
        {pendingTransactions.length > 0 ? (
          <div className="grid gap-4">
            {pendingTransactions.map((transaction) => (
              <Card key={transaction.id} className="border-orange-200">
                <CardHeader className="bg-orange-50">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <CreditCard className="h-5 w-5" />
                      {transaction.tbl_users.full_name}
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
                            {transaction.tbl_users.full_name} ({transaction.tbl_users.email})
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
                        <p className="font-medium">{transaction.tbl_users.full_name}</p>
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

      {/* Verification Dialog */}
      <Dialog open={verificationDialogOpen} onOpenChange={setVerificationDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Payment Verification</DialogTitle>
            <DialogDescription>
              {selectedTransaction && (
                <>
                  Verify {selectedTransaction.tbl_users.full_name}'s{" "}
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
                  Full details for {selectedTransaction.tbl_users.full_name}'s{" "}
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
                      <p className="text-sm">{selectedTransaction.tbl_users.full_name}</p>
                    </div>
                    <div>
                      <span className="font-medium">Email:</span>
                      <p className="text-sm">{selectedTransaction.tbl_users.email}</p>
                    </div>
                    {selectedTransaction.tbl_users.phone && (
                      <div>
                        <span className="font-medium">Phone:</span>
                        <p className="text-sm">{selectedTransaction.tbl_users.phone}</p>
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

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => selectedTransaction && window.open(selectedTransaction.proof_image_url, "_blank")}
              className="flex items-center gap-2"
            >
              <Eye className="h-4 w-4" />
              View Payment Proof
            </Button>
            <Button variant="outline" onClick={() => setDetailsDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
