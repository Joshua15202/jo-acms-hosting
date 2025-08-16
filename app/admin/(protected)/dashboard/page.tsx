"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Loader2, User, Mail, Calendar } from "lucide-react"

interface Customer {
  id: string
  email: string
  full_name: string
  created_at: string
}

export default function AdminDashboard() {
  const [showCustomers, setShowCustomers] = useState(false)
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(false)
  const [totalCustomers, setTotalCustomers] = useState(248) // Default value

  const fetchCustomers = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/debug-all-users")
      const data = await response.json()

      if (data.users) {
        setCustomers(data.users)
        setTotalCustomers(data.totalUsers || data.users.length)
      }
    } catch (error) {
      console.error("Error fetching customers:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCustomersClick = () => {
    setShowCustomers(true)
    if (customers.length === 0) {
      fetchCustomers()
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
      <p className="text-gray-600 mb-8">Welcome to the Jo-AIMS admin dashboard.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Clickable Registered Customers Card */}
        <div
          className="bg-white p-6 rounded-lg shadow border cursor-pointer hover:shadow-lg transition-shadow duration-200 hover:bg-gray-50"
          onClick={handleCustomersClick}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Registered Customers</p>
              <p className="text-2xl font-bold text-gray-900">{totalCustomers}</p>
            </div>
            <div className="h-8 w-8 bg-rose-100 rounded-full flex items-center justify-center">
              <span className="text-rose-600 text-sm">👥</span>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">Click to view all customers</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Upcoming Events</p>
              <p className="text-2xl font-bold text-gray-900">42</p>
            </div>
            <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 text-sm">📅</span>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">+8% from last month</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Low Stock Items</p>
              <p className="text-2xl font-bold text-gray-900">8</p>
            </div>
            <div className="h-8 w-8 bg-orange-100 rounded-full flex items-center justify-center">
              <span className="text-orange-600 text-sm">📦</span>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">-2 from last week</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
              <p className="text-2xl font-bold text-gray-900">₱245,000</p>
            </div>
            <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-green-600 text-sm">💰</span>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">+15% from last month</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-semibold mb-4">Upcoming Events</h3>
          <p className="text-sm text-gray-600 mb-4">Events scheduled for the next 30 days</p>
          <div className="h-48 bg-gray-50 rounded-md flex items-center justify-center">
            <p className="text-gray-500">Events chart will be displayed here</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-semibold mb-4">Inventory Status</h3>
          <p className="text-sm text-gray-600 mb-4">Current inventory levels by category</p>
          <div className="h-48 bg-gray-50 rounded-md flex items-center justify-center">
            <p className="text-gray-500">Inventory chart will be displayed here</p>
          </div>
        </div>
      </div>

      {/* Customers Modal */}
      <Dialog open={showCustomers} onOpenChange={setShowCustomers}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Registered Customers ({totalCustomers})
            </DialogTitle>
          </DialogHeader>

          <div className="overflow-y-auto max-h-[60vh]">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-rose-600" />
                <span className="ml-2">Loading customers...</span>
              </div>
            ) : customers.length > 0 ? (
              <div className="space-y-4">
                {customers.map((customer) => (
                  <div key={customer.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="h-10 w-10 bg-rose-100 rounded-full flex items-center justify-center">
                            <User className="h-5 w-5 text-rose-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">{customer.full_name || "No name provided"}</h4>
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                              <Mail className="h-4 w-4" />
                              {customer.email}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            Joined: {formatDate(customer.created_at)}
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            ID: {customer.id.slice(0, 8)}...
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No customers found</p>
              </div>
            )}
          </div>

          <div className="flex justify-end pt-4 border-t">
            <Button variant="outline" onClick={() => setShowCustomers(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
