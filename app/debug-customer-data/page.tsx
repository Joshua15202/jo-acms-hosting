"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function DebugCustomerDataPage() {
  const [email, setEmail] = useState("blacksights99@gmail.com")
  const [debugData, setDebugData] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const fetchDebugData = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/debug-customer-data?email=${encodeURIComponent(email)}`)
      const data = await response.json()
      setDebugData(data)
      console.log("Debug data:", data)
    } catch (error) {
      console.error("Error fetching debug data:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDebugData()
  }, [])

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Debug Customer Data</h1>
          <Button onClick={fetchDebugData} disabled={loading}>
            {loading ? "Loading..." : "Refresh"}
          </Button>
        </div>

        <div className="flex gap-4">
          <Input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter customer email"
            className="flex-1"
          />
          <Button onClick={fetchDebugData} disabled={loading}>
            Debug This Email
          </Button>
        </div>

        {debugData && (
          <div className="space-y-6">
            {/* Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Debug Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{debugData.debug?.userFound ? "✓" : "✗"}</div>
                    <div className="text-sm text-gray-600">User Found</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{debugData.debug?.paymentsCount || 0}</div>
                    <div className="text-sm text-gray-600">Payments</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{debugData.debug?.appointmentsCount || 0}</div>
                    <div className="text-sm text-gray-600">Basic Appointments</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {debugData.debug?.comprehensiveAppointmentsCount || 0}
                    </div>
                    <div className="text-sm text-gray-600">Comprehensive Appointments</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* User Data */}
            {debugData.debug?.userData && (
              <Card>
                <CardHeader>
                  <CardTitle>User Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p>
                      <strong>ID:</strong> {debugData.debug.userData.id}
                    </p>
                    <p>
                      <strong>Email:</strong> {debugData.debug.userData.email}
                    </p>
                    <p>
                      <strong>Name:</strong> {debugData.debug.userData.full_name}
                    </p>
                    <p>
                      <strong>Phone:</strong> {debugData.debug.userData.phone || "Not provided"}
                    </p>
                    <p>
                      <strong>Created:</strong> {new Date(debugData.debug.userData.created_at).toLocaleString()}
                    </p>
                    <p>
                      <strong>ID Type:</strong> {debugData.debug.userIdType}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Payments */}
            {debugData.debug?.paymentsData && debugData.debug.paymentsData.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Payment Transactions ({debugData.debug.paymentsData.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {debugData.debug.paymentsData.map((payment: any, index: number) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">Transaction {index + 1}</span>
                          <Badge variant={payment.status === "verified" ? "default" : "secondary"}>
                            {payment.status}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <p>
                            <strong>Amount:</strong> ₱{payment.amount}
                          </p>
                          <p>
                            <strong>Type:</strong> {payment.payment_type}
                          </p>
                          <p>
                            <strong>Method:</strong> {payment.payment_method}
                          </p>
                          <p>
                            <strong>Reference:</strong> {payment.reference_number}
                          </p>
                          <p>
                            <strong>Created:</strong> {new Date(payment.created_at).toLocaleString()}
                          </p>
                          <p>
                            <strong>User ID:</strong> {payment.user_id}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Comprehensive Appointments */}
            {debugData.debug?.comprehensiveAppointmentsData &&
              debugData.debug.comprehensiveAppointmentsData.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>
                      Comprehensive Appointments ({debugData.debug.comprehensiveAppointmentsData.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {debugData.debug.comprehensiveAppointmentsData.map((appointment: any, index: number) => (
                        <div key={index} className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">{appointment.event_type}</span>
                            <Badge variant="outline">{appointment.status}</Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <p>
                              <strong>Date:</strong> {appointment.event_date}
                            </p>
                            <p>
                              <strong>Time:</strong> {appointment.event_time}
                            </p>
                            <p>
                              <strong>Guests:</strong> {appointment.guest_count}
                            </p>
                            <p>
                              <strong>Payment Status:</strong> {appointment.payment_status}
                            </p>
                            <p>
                              <strong>Created:</strong> {new Date(appointment.created_at).toLocaleString()}
                            </p>
                            <p>
                              <strong>User ID:</strong> {appointment.user_id}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

            {/* Sample Data */}
            <Card>
              <CardHeader>
                <CardTitle>Sample System Data</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Sample Payments in System:</h4>
                    <div className="text-sm space-y-1">
                      {debugData.debug?.samplePayments?.map((payment: any, index: number) => (
                        <p key={index}>
                          User ID: {payment.user_id} | Amount: ₱{payment.amount} | Status: {payment.status}
                        </p>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Sample Appointments in System:</h4>
                    <div className="text-sm space-y-1">
                      {debugData.debug?.sampleAppointments?.map((appointment: any, index: number) => (
                        <p key={index}>
                          User ID: {appointment.user_id} | Event: {appointment.event_type} | Status:{" "}
                          {appointment.status}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Raw Debug Data */}
            <Card>
              <CardHeader>
                <CardTitle>Raw Debug Data</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-xs bg-gray-100 p-4 rounded overflow-auto max-h-96">
                  {JSON.stringify(debugData, null, 2)}
                </pre>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
