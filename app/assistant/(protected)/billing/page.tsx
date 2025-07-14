"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Search, Plus, FileText, Download, Printer, CreditCard, Check } from "lucide-react"

export default function BillingPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null)
  const [showPaymentDialog, setShowPaymentDialog] = useState(false)
  const [showInvoiceDetails, setShowInvoiceDetails] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentSuccess, setPaymentSuccess] = useState(false)

  // Mock data for invoices
  const invoices = [
    {
      id: "INV-2025-001",
      customer: "Maria Santos",
      date: "2025-04-25",
      dueDate: "2025-05-10",
      amount: 85000,
      status: "unpaid",
      service: "Wedding Catering",
      items: [
        { description: "Catering Package (150 guests)", quantity: 1, unitPrice: 75000, total: 75000 },
        { description: "Additional Dessert Station", quantity: 1, unitPrice: 10000, total: 10000 },
      ],
    },
    {
      id: "INV-2025-002",
      customer: "Juan Dela Cruz",
      date: "2025-04-26",
      dueDate: "2025-05-10",
      amount: 35000,
      status: "paid",
      service: "Birthday Party",
      items: [
        { description: "Birthday Package (50 guests)", quantity: 1, unitPrice: 30000, total: 30000 },
        { description: "Cake and Desserts", quantity: 1, unitPrice: 5000, total: 5000 },
      ],
    },
    {
      id: "INV-2025-003",
      customer: "Ana Reyes",
      date: "2025-04-27",
      dueDate: "2025-05-12",
      amount: 50000,
      status: "partial",
      amountPaid: 25000,
      service: "Corporate Event",
      items: [
        { description: "Corporate Package (100 guests)", quantity: 1, unitPrice: 45000, total: 45000 },
        { description: "Coffee Station", quantity: 1, unitPrice: 5000, total: 5000 },
      ],
    },
    {
      id: "INV-2025-004",
      customer: "Pedro Lim",
      date: "2025-04-28",
      dueDate: "2025-05-13",
      amount: 30000,
      status: "unpaid",
      service: "Anniversary Celebration",
      items: [
        { description: "Anniversary Package (30 guests)", quantity: 1, unitPrice: 25000, total: 25000 },
        { description: "Wine and Beverages", quantity: 1, unitPrice: 5000, total: 5000 },
      ],
    },
  ]

  const filteredInvoices = invoices.filter((invoice) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return (
        invoice.customer.toLowerCase().includes(query) ||
        invoice.id.toLowerCase().includes(query) ||
        invoice.service.toLowerCase().includes(query)
      )
    }
    return true
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Paid
          </Badge>
        )
      case "unpaid":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            Unpaid
          </Badge>
        )
      case "partial":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            Partial
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const handleViewInvoice = (invoice: any) => {
    setSelectedInvoice(invoice)
    setShowInvoiceDetails(true)
  }

  const handlePayment = (invoice: any) => {
    setSelectedInvoice(invoice)
    setShowPaymentDialog(true)
  }

  const processPayment = () => {
    setIsProcessing(true)
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false)
      setPaymentSuccess(true)
      // Reset after showing success message
      setTimeout(() => {
        setPaymentSuccess(false)
        setShowPaymentDialog(false)
      }, 2000)
    }, 1500)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(amount)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Billing</h1>
          <p className="text-gray-500">Manage invoices and process payments</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-rose-600 hover:bg-rose-700">
              <Plus className="mr-2 h-4 w-4" />
              New Invoice
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Create New Invoice</DialogTitle>
              <DialogDescription>Create a new invoice for a customer</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="customerName">Customer Name</Label>
                  <Input id="customerName" placeholder="Enter customer name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="invoiceDate">Invoice Date</Label>
                  <Input id="invoiceDate" type="date" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="service">Service</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select service" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="wedding">Wedding Catering</SelectItem>
                      <SelectItem value="birthday">Birthday Party</SelectItem>
                      <SelectItem value="corporate">Corporate Event</SelectItem>
                      <SelectItem value="anniversary">Anniversary</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input id="dueDate" type="date" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Items</Label>
                <div className="border rounded-md p-4">
                  <div className="grid grid-cols-12 gap-2 mb-2 font-medium text-sm">
                    <div className="col-span-6">Description</div>
                    <div className="col-span-2">Quantity</div>
                    <div className="col-span-2">Unit Price</div>
                    <div className="col-span-2">Total</div>
                  </div>
                  <div className="grid grid-cols-12 gap-2 mb-2">
                    <div className="col-span-6">
                      <Input placeholder="Item description" />
                    </div>
                    <div className="col-span-2">
                      <Input type="number" min="1" placeholder="Qty" />
                    </div>
                    <div className="col-span-2">
                      <Input type="number" min="0" placeholder="Price" />
                    </div>
                    <div className="col-span-2">
                      <Input type="number" disabled placeholder="0.00" />
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="mt-2">
                    <Plus className="h-4 w-4 mr-1" /> Add Item
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea id="notes" placeholder="Enter any additional notes" rows={3} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline">Cancel</Button>
              <Button className="bg-rose-600 hover:bg-rose-700">Create Invoice</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="all">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="all">All Invoices</TabsTrigger>
            <TabsTrigger value="unpaid">Unpaid</TabsTrigger>
            <TabsTrigger value="paid">Paid</TabsTrigger>
          </TabsList>

          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search invoices..."
              className="w-[250px] pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <TabsContent value="all" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Invoices</CardTitle>
              <CardDescription>Manage and process customer invoices</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <Checkbox />
                    </TableHead>
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInvoices.length > 0 ? (
                    filteredInvoices.map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell>
                          <Checkbox />
                        </TableCell>
                        <TableCell className="font-medium">{invoice.id}</TableCell>
                        <TableCell>{invoice.customer}</TableCell>
                        <TableCell>{invoice.service}</TableCell>
                        <TableCell>{new Date(invoice.date).toLocaleDateString()}</TableCell>
                        <TableCell>{formatCurrency(invoice.amount)}</TableCell>
                        <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => handleViewInvoice(invoice)}
                            >
                              <FileText className="h-4 w-4" />
                              <span className="sr-only">View</span>
                            </Button>
                            {invoice.status !== "paid" && (
                              <Button
                                size="sm"
                                className="h-8 w-8 p-0 bg-rose-600 hover:bg-rose-700"
                                onClick={() => handlePayment(invoice)}
                              >
                                <CreditCard className="h-4 w-4" />
                                <span className="sr-only">Pay</span>
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="h-24 text-center">
                        No invoices found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="unpaid" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Unpaid Invoices</CardTitle>
              <CardDescription>Invoices that require payment</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <Checkbox />
                    </TableHead>
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInvoices
                    .filter((invoice) => invoice.status === "unpaid" || invoice.status === "partial")
                    .map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell>
                          <Checkbox />
                        </TableCell>
                        <TableCell className="font-medium">{invoice.id}</TableCell>
                        <TableCell>{invoice.customer}</TableCell>
                        <TableCell>{invoice.service}</TableCell>
                        <TableCell>{new Date(invoice.dueDate).toLocaleDateString()}</TableCell>
                        <TableCell>{formatCurrency(invoice.amount)}</TableCell>
                        <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => handleViewInvoice(invoice)}
                            >
                              <FileText className="h-4 w-4" />
                              <span className="sr-only">View</span>
                            </Button>
                            <Button
                              size="sm"
                              className="h-8 w-8 p-0 bg-rose-600 hover:bg-rose-700"
                              onClick={() => handlePayment(invoice)}
                            >
                              <CreditCard className="h-4 w-4" />
                              <span className="sr-only">Pay</span>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="paid" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Paid Invoices</CardTitle>
              <CardDescription>Completed payments</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <Checkbox />
                    </TableHead>
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Date Paid</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInvoices
                    .filter((invoice) => invoice.status === "paid")
                    .map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell>
                          <Checkbox />
                        </TableCell>
                        <TableCell className="font-medium">{invoice.id}</TableCell>
                        <TableCell>{invoice.customer}</TableCell>
                        <TableCell>{invoice.service}</TableCell>
                        <TableCell>{new Date(invoice.date).toLocaleDateString()}</TableCell>
                        <TableCell>{formatCurrency(invoice.amount)}</TableCell>
                        <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => handleViewInvoice(invoice)}
                            >
                              <FileText className="h-4 w-4" />
                              <span className="sr-only">View</span>
                            </Button>
                            <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                              <Download className="h-4 w-4" />
                              <span className="sr-only">Download</span>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Invoice Details Dialog */}
      <Dialog open={showInvoiceDetails} onOpenChange={setShowInvoiceDetails}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Invoice Details</DialogTitle>
            <DialogDescription>Invoice #{selectedInvoice?.id}</DialogDescription>
          </DialogHeader>
          {selectedInvoice && (
            <div className="space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-bold">Jo Pacheco Catering</h3>
                  <p className="text-sm text-gray-500">123 Main Street, Quezon City</p>
                  <p className="text-sm text-gray-500">contact@jopacheco.com</p>
                  <p className="text-sm text-gray-500">+63 912 345 6789</p>
                </div>
                <div className="text-right">
                  <h3 className="text-lg font-bold">Invoice #{selectedInvoice.id}</h3>
                  <p className="text-sm text-gray-500">Date: {new Date(selectedInvoice.date).toLocaleDateString()}</p>
                  <p className="text-sm text-gray-500">Due: {new Date(selectedInvoice.dueDate).toLocaleDateString()}</p>
                  <div className="mt-2">{getStatusBadge(selectedInvoice.status)}</div>
                </div>
              </div>

              <div className="border-t border-b py-4">
                <h4 className="font-medium mb-2">Bill To:</h4>
                <p>{selectedInvoice.customer}</p>
                <p className="text-sm text-gray-500">Service: {selectedInvoice.service}</p>
              </div>

              <div>
                <h4 className="font-medium mb-2">Items:</h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Quantity</TableHead>
                      <TableHead className="text-right">Unit Price</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedInvoice.items.map((item: any, index: number) => (
                      <TableRow key={index}>
                        <TableCell>{item.description}</TableCell>
                        <TableCell className="text-right">{item.quantity}</TableCell>
                        <TableCell className="text-right">{formatCurrency(item.unitPrice)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(item.total)}</TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell colSpan={3} className="text-right font-medium">
                        Total:
                      </TableCell>
                      <TableCell className="text-right font-bold">{formatCurrency(selectedInvoice.amount)}</TableCell>
                    </TableRow>
                    {selectedInvoice.status === "partial" && (
                      <>
                        <TableRow>
                          <TableCell colSpan={3} className="text-right font-medium">
                            Amount Paid:
                          </TableCell>
                          <TableCell className="text-right">{formatCurrency(selectedInvoice.amountPaid)}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell colSpan={3} className="text-right font-medium">
                            Balance Due:
                          </TableCell>
                          <TableCell className="text-right font-bold">
                            {formatCurrency(selectedInvoice.amount - selectedInvoice.amountPaid)}
                          </TableCell>
                        </TableRow>
                      </>
                    )}
                  </TableBody>
                </Table>
              </div>

              <div className="flex justify-between">
                <div>
                  <h4 className="font-medium mb-2">Payment Terms:</h4>
                  <p className="text-sm text-gray-500">Payment due within 15 days of invoice date.</p>
                </div>
                <div className="space-x-2">
                  <Button variant="outline" size="sm">
                    <Printer className="mr-2 h-4 w-4" />
                    Print
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowInvoiceDetails(false)}>
              Close
            </Button>
            {selectedInvoice && selectedInvoice.status !== "paid" && (
              <Button
                className="bg-rose-600 hover:bg-rose-700"
                onClick={() => {
                  setShowInvoiceDetails(false)
                  handlePayment(selectedInvoice)
                }}
              >
                <CreditCard className="mr-2 h-4 w-4" />
                Process Payment
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payment Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Process Payment</DialogTitle>
            <DialogDescription>
              {paymentSuccess
                ? "Payment processed successfully!"
                : `Process payment for invoice #${selectedInvoice?.id}`}
            </DialogDescription>
          </DialogHeader>
          {selectedInvoice && !paymentSuccess && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">Customer:</span>
                  <span>{selectedInvoice.customer}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Invoice Amount:</span>
                  <span>{formatCurrency(selectedInvoice.amount)}</span>
                </div>
                {selectedInvoice.status === "partial" && (
                  <div className="flex justify-between">
                    <span className="font-medium">Balance Due:</span>
                    <span>{formatCurrency(selectedInvoice.amount - selectedInvoice.amountPaid)}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="paymentMethod">Payment Method</Label>
                <Select defaultValue="cash">
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="card">Credit/Debit Card</SelectItem>
                    <SelectItem value="bank">Bank Transfer</SelectItem>
                    <SelectItem value="gcash">GCash</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="paymentAmount">Payment Amount</Label>
                <Input
                  id="paymentAmount"
                  type="number"
                  defaultValue={
                    selectedInvoice.status === "partial"
                      ? selectedInvoice.amount - selectedInvoice.amountPaid
                      : selectedInvoice.amount
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="paymentDate">Payment Date</Label>
                <Input id="paymentDate" type="date" defaultValue={new Date().toISOString().split("T")[0]} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="paymentReference">Reference Number</Label>
                <Input id="paymentReference" placeholder="Enter reference number (optional)" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="paymentNotes">Notes</Label>
                <Textarea id="paymentNotes" placeholder="Enter any additional notes" rows={2} />
              </div>
            </div>
          )}
          {paymentSuccess && (
            <div className="py-6 flex flex-col items-center justify-center">
              <div className="rounded-full bg-green-100 p-3 mb-4">
                <Check className="h-6 w-6 text-green-600" />
              </div>
              <p className="text-center">Payment has been successfully processed!</p>
            </div>
          )}
          <DialogFooter>
            {!paymentSuccess && (
              <>
                <Button variant="outline" onClick={() => setShowPaymentDialog(false)}>
                  Cancel
                </Button>
                <Button className="bg-rose-600 hover:bg-rose-700" onClick={processPayment} disabled={isProcessing}>
                  {isProcessing ? "Processing..." : "Complete Payment"}
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
