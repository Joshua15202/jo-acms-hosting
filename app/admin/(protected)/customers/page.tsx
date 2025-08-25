"use client"

import { useState, useEffect } from "react"
import {
  Search,
  Download,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Users,
  UserCheck,
  UserPlus,
  DollarSign,
  Mail,
  Phone,
  Calendar,
  Loader2,
  CreditCard,
  CheckCircle,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface Customer {
  id: string
  email: string
  full_name: string
  phone: string | null
  created_at: string
  updated_at: string
  status: "active" | "inactive"
  totalAppointments: number
  completedAppointments: number
  totalSpent: number
  lastLogin: string | null
  paymentCount: number
}

interface CustomerStats {
  totalCustomers: number
  activeCustomers: number
  newThisMonth: number
  totalRevenue: number
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [stats, setStats] = useState<CustomerStats>({
    totalCustomers: 0,
    activeCustomers: 0,
    newThisMonth: 0,
    totalRevenue: 0,
  })
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all")

  useEffect(() => {
    fetchCustomers()
  }, [])

  const fetchCustomers = async () => {
    try {
      setLoading(true)
      console.log("Fetching customers with accurate spending data...")

      const response = await fetch("/api/admin/customers")
      const data = await response.json()

      console.log("API Response:", data)

      if (data.success && data.customers) {
        setCustomers(data.customers)
        setStats(data.stats)
      } else {
        console.error("Failed to fetch customers:", data)
      }
    } catch (error) {
      console.error("Error fetching customers:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch =
      customer.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (customer.phone && customer.phone.includes(searchTerm))

    const matchesFilter = filterStatus === "all" || customer.status === filterStatus

    return matchesSearch && matchesFilter
  })

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-PH", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-PH", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const exportCustomerData = () => {
    const csvContent = [
      // CSV Header
      [
        "Name",
        "Email",
        "Phone",
        "Status",
        "Total Spent",
        "Appointments",
        "Completed",
        "Payments",
        "Joined",
        "Last Activity",
      ].join(","),
      // CSV Data
      ...filteredCustomers.map((customer) =>
        [
          `"${customer.full_name}"`,
          `"${customer.email}"`,
          `"${customer.phone || "N/A"}"`,
          customer.status,
          customer.totalSpent,
          customer.totalAppointments,
          customer.completedAppointments,
          customer.paymentCount,
          `"${formatDate(customer.created_at)}"`,
          `"${customer.lastLogin ? formatDate(customer.lastLogin) : "Never"}"`,
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `customers-${new Date().toISOString().split("T")[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin text-rose-600" />
            <span className="text-gray-600">Loading customers...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Customers</h1>
          <p className="text-gray-600">Manage and view all registered customers with accurate spending data</p>
        </div>
        <Button onClick={exportCustomerData} className="bg-rose-600 hover:bg-rose-700">
          <Download className="h-4 w-4 mr-2" />
          Export Data
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCustomers}</div>
            <p className="text-xs text-muted-foreground">All registered users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.activeCustomers}</div>
            <p className="text-xs text-muted-foreground">Recent activity (6 months)</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New This Month</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.newThisMonth}</div>
            <p className="text-xs text-muted-foreground">Recent registrations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-rose-600">{formatCurrency(stats.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">From verified payments</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search customers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={filterStatus === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterStatus("all")}
          >
            All ({customers.length})
          </Button>
          <Button
            variant={filterStatus === "active" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterStatus("active")}
          >
            Active ({customers.filter((c) => c.status === "active").length})
          </Button>
          <Button
            variant={filterStatus === "inactive" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterStatus("inactive")}
          >
            Inactive ({customers.filter((c) => c.status === "inactive").length})
          </Button>
        </div>
      </div>

      {/* Customers Table */}
      <Card>
        <CardHeader>
          <CardTitle>Customer List ({filteredCustomers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredCustomers.length > 0 ? (
            <div className="space-y-4">
              {filteredCustomers.map((customer) => (
                <div key={customer.id} className="flex items-center justify-between py-4 border-b last:border-b-0">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center">
                      <span className="text-rose-600 font-medium text-lg">
                        {customer.full_name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{customer.full_name}</h3>
                      <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                        <Mail className="h-3 w-3" />
                        {customer.email}
                      </div>
                      {customer.phone && (
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <Phone className="h-3 w-3" />
                          {customer.phone}
                        </div>
                      )}
                      <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                        <Calendar className="h-3 w-3" />
                        Joined {formatDate(customer.created_at)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <Badge
                        variant={customer.status === "active" ? "default" : "secondary"}
                        className={customer.status === "active" ? "bg-green-100 text-green-800" : ""}
                      >
                        {customer.status}
                      </Badge>
                      <div className="mt-2">
                        <p className="text-sm font-medium text-rose-600">{formatCurrency(customer.totalSpent)}</p>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span>{customer.totalAppointments} appointments</span>
                          {customer.paymentCount > 0 && (
                            <>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <CreditCard className="h-3 w-3" />
                                {customer.paymentCount} payments
                              </span>
                            </>
                          )}
                        </div>
                        {customer.completedAppointments > 0 && (
                          <div className="flex items-center gap-1 text-xs text-green-600 mt-1">
                            <CheckCircle className="h-3 w-3" />
                            {customer.completedAppointments} completed
                          </div>
                        )}
                      </div>
                    </div>

                    <Dialog>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DialogTrigger asChild>
                            <DropdownMenuItem onClick={() => setSelectedCustomer(customer)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                          </DialogTrigger>
                          <DropdownMenuItem>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Customer
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Customer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>

                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Customer Details</DialogTitle>
                        </DialogHeader>
                        {selectedCustomer && (
                          <div className="space-y-6">
                            {/* Customer Info */}
                            <div className="grid grid-cols-2 gap-6">
                              <div>
                                <h3 className="font-medium text-gray-900 mb-3">Contact Information</h3>
                                <div className="space-y-2 text-sm">
                                  <p>
                                    <span className="font-medium">Name:</span> {selectedCustomer.full_name}
                                  </p>
                                  <p>
                                    <span className="font-medium">Email:</span> {selectedCustomer.email}
                                  </p>
                                  <p>
                                    <span className="font-medium">Phone:</span>{" "}
                                    {selectedCustomer.phone || "Not provided"}
                                  </p>
                                  <p className="flex items-center gap-2">
                                    <span className="font-medium">Status:</span>
                                    <Badge
                                      variant={selectedCustomer.status === "active" ? "default" : "secondary"}
                                      className={
                                        selectedCustomer.status === "active" ? "bg-green-100 text-green-800" : ""
                                      }
                                    >
                                      {selectedCustomer.status}
                                    </Badge>
                                  </p>
                                </div>
                              </div>
                              <div>
                                <h3 className="font-medium text-gray-900 mb-3">Account Details</h3>
                                <div className="space-y-2 text-sm">
                                  <p>
                                    <span className="font-medium">Customer ID:</span> {selectedCustomer.id.slice(0, 8)}
                                    ...
                                  </p>
                                  <p>
                                    <span className="font-medium">Joined:</span>{" "}
                                    {formatDateTime(selectedCustomer.created_at)}
                                  </p>
                                  <p>
                                    <span className="font-medium">Last Updated:</span>{" "}
                                    {formatDateTime(selectedCustomer.updated_at)}
                                  </p>
                                  <p>
                                    <span className="font-medium">Last Activity:</span>{" "}
                                    {selectedCustomer.lastLogin ? formatDateTime(selectedCustomer.lastLogin) : "Never"}
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                              <div className="text-center">
                                <p className="text-2xl font-bold text-rose-600">{selectedCustomer.totalAppointments}</p>
                                <p className="text-sm text-gray-600">Total Appointments</p>
                              </div>
                              <div className="text-center">
                                <p className="text-2xl font-bold text-green-600">
                                  {selectedCustomer.completedAppointments}
                                </p>
                                <p className="text-sm text-gray-600">Completed</p>
                              </div>
                              <div className="text-center">
                                <p className="text-2xl font-bold text-blue-600">{selectedCustomer.paymentCount}</p>
                                <p className="text-sm text-gray-600">Payments Made</p>
                              </div>
                              <div className="text-center">
                                <p className="text-2xl font-bold text-purple-600">
                                  {formatCurrency(selectedCustomer.totalSpent)}
                                </p>
                                <p className="text-sm text-gray-600">Total Spent</p>
                              </div>
                            </div>

                            {/* Average per event */}
                            {selectedCustomer.totalAppointments > 0 && (
                              <div className="text-center p-3 bg-rose-50 rounded-lg">
                                <p className="text-lg font-semibold text-rose-600">
                                  {formatCurrency(selectedCustomer.totalSpent / selectedCustomer.totalAppointments)}
                                </p>
                                <p className="text-sm text-gray-600">Average Spending per Event</p>
                              </div>
                            )}

                            {/* Payment Status */}
                            <div>
                              <h3 className="font-medium text-gray-900 mb-3">Payment Summary</h3>
                              <div className="grid grid-cols-2 gap-4">
                                <div className="p-3 bg-green-50 rounded-lg">
                                  <p className="text-lg font-semibold text-green-600">
                                    {formatCurrency(selectedCustomer.totalSpent)}
                                  </p>
                                  <p className="text-sm text-gray-600">Total Verified Payments</p>
                                </div>
                                <div className="p-3 bg-blue-50 rounded-lg">
                                  <p className="text-lg font-semibold text-blue-600">{selectedCustomer.paymentCount}</p>
                                  <p className="text-sm text-gray-600">Payment Transactions</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">
                {searchTerm ? `No customers found matching "${searchTerm}"` : "No customers found"}
              </p>
              {searchTerm && (
                <Button variant="outline" onClick={() => setSearchTerm("")} className="mt-4">
                  Clear Search
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
