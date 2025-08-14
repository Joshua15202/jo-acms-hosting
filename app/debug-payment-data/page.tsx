"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { RefreshCw, Database, AlertTriangle, Wrench } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function DebugPaymentDataPage() {
  const [debugData, setDebugData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [fixing, setFixing] = useState(false)
  const { toast } = useToast()

  const fetchDebugData = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/debug-all-payment-data")
      if (response.ok) {
        const data = await response.json()
        setDebugData(data)
        console.log("Debug data:", data)
      } else {
        toast({ title: "Error", description: "Failed to fetch debug data.", variant: "destructive" })
      }
    } catch (error) {
      console.error("Error fetching debug data:", error)
      toast({ title: "Error", description: "Could not load debug data.", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const fixPaymentTransactionStatus = async () => {
    try {
      setFixing(true)
      const response = await fetch("/api/fix-payment-transaction-status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const result = await response.json()
      console.log("Fix result:", result)

      if (result.success) {
        toast({
          title: "Success",
          description: `Updated ${result.updated} payment transactions with correct appointment status.`,
        })
        // Refresh debug data
        fetchDebugData()
      } else {
        throw new Error(result.message || "Failed to fix payment transaction status")
      }
    } catch (error: any) {
      console.error("Error fixing payment transaction status:", error)
      toast({
        title: "Error",
        description: `Failed to fix payment transaction status: ${error.message}`,
        variant: "destructive",
      })
    } finally {
      setFixing(false)
    }
  }

  return (
    <div className="container mx-auto py-10 px-4 md:px-6">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Payment Data Debug</h1>
          <p className="mt-4 text-gray-500 md:text-xl">Debug and fix payment data inconsistencies.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchDebugData} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Load Debug Data
          </Button>
          {debugData?.summary?.mismatchedTransactionsCount > 0 && (
            <Button
              onClick={fixPaymentTransactionStatus}
              disabled={fixing}
              className="bg-orange-600 hover:bg-orange-700"
            >
              <Wrench className={`mr-2 h-4 w-4 ${fixing ? "animate-spin" : ""}`} />
              Fix Mismatched Status
            </Button>
          )}
        </div>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-600"></div>
          <p className="mt-2 text-gray-500">Loading debug data...</p>
        </div>
      )}

      {debugData && (
        <div className="space-y-6">
          {/* Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Data Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{debugData.summary.totalAppointments}</p>
                  <p className="text-sm text-gray-600">Total Appointments</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{debugData.summary.totalTransactions}</p>
                  <p className="text-sm text-gray-600">Total Transactions</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600">{debugData.summary.uniqueUsers}</p>
                  <p className="text-sm text-gray-600">Unique Users</p>
                </div>
                <div className="text-center">
                  <p
                    className={`text-2xl font-bold ${
                      debugData.summary.mismatchedTransactionsCount > 0 ? "text-red-600" : "text-green-600"
                    }`}
                  >
                    {debugData.summary.mismatchedTransactionsCount}
                  </p>
                  <p className="text-sm text-gray-600">Mismatched Status</p>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Appointment Payment Statuses:</h4>
                  <div className="flex flex-wrap gap-2">
                    {debugData.summary.uniqueAppointmentStatuses.map((status: string) => (
                      <Badge key={status} variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
                        {status}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Transaction Statuses:</h4>
                  <div className="flex flex-wrap gap-2">
                    {debugData.summary.uniqueTransactionStatuses.map((status: string) => (
                      <Badge key={status} variant="outline" className="bg-green-100 text-green-800 border-green-200">
                        {status}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Transaction Appointment Payment Statuses:</h4>
                  <div className="flex flex-wrap gap-2">
                    {debugData.summary.uniqueAppointmentPaymentStatuses.map((status: string) => (
                      <Badge key={status} variant="outline" className="bg-orange-100 text-orange-800 border-orange-200">
                        {status}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Mismatched Transactions */}
          {debugData.summary.mismatchedTransactionsCount > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  Mismatched Transaction Status ({debugData.summary.mismatchedTransactionsCount})
                </CardTitle>
                <CardDescription>
                  These transactions have appointment_payment_status that doesn't match the current appointment
                  payment_status.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {debugData.mismatchedTransactions.slice(0, 10).map((mismatch: any) => (
                    <div key={mismatch.transactionId} className="border rounded-lg p-4">
                      <div className="grid gap-2 md:grid-cols-2">
                        <div>
                          <p className="font-medium">Transaction ID: {mismatch.transactionId.slice(0, 8)}...</p>
                          <p className="text-sm text-gray-600">
                            Appointment ID: {mismatch.appointmentId.slice(0, 8)}...
                          </p>
                          <p className="text-sm text-gray-600">Amount: ₱{mismatch.amount.toLocaleString()}</p>
                          <p className="text-sm text-gray-600">Payment Type: {mismatch.paymentType}</p>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">Transaction Status:</span>
                            <Badge
                              variant="outline"
                              className={
                                mismatch.transactionStatus === "verified"
                                  ? "bg-green-100 text-green-800 border-green-200"
                                  : "bg-orange-100 text-orange-800 border-orange-200"
                              }
                            >
                              {mismatch.transactionStatus}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">Transaction Appointment Status:</span>
                            <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">
                              {mismatch.transactionAppointmentStatus}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">Actual Appointment Status:</span>
                            <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                              {mismatch.actualAppointmentStatus}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Users Data */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Appointments by User */}
            <Card>
              <CardHeader>
                <CardTitle>Appointments by User</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {Object.entries(debugData.appointmentsByUser).map(([userId, data]: [string, any]) => (
                    <div key={userId} className="border rounded-lg p-3">
                      <p className="font-medium">User: {userId}</p>
                      <p className="text-sm text-gray-600">Appointments: {data.count}</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {data.statuses.map((status: string) => (
                          <Badge key={status} variant="outline" className="text-xs">
                            {status}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Transactions by User */}
            <Card>
              <CardHeader>
                <CardTitle>Transactions by User</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {Object.entries(debugData.transactionsByUser).map(([userId, data]: [string, any]) => (
                    <div key={userId} className="border rounded-lg p-3">
                      <p className="font-medium">User: {userId}</p>
                      <p className="text-sm text-gray-600">Transactions: {data.count}</p>
                      <div className="space-y-1 mt-2">
                        <div className="flex flex-wrap gap-1">
                          <span className="text-xs font-medium">Transaction Status:</span>
                          {data.statuses.map((status: string) => (
                            <Badge key={status} variant="outline" className="text-xs">
                              {status}
                            </Badge>
                          ))}
                        </div>
                        <div className="flex flex-wrap gap-1">
                          <span className="text-xs font-medium">Appointment Status:</span>
                          {data.appointmentStatuses.map((status: string) => (
                            <Badge key={status} variant="outline" className="text-xs">
                              {status}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sample Data */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Sample Appointments */}
            <Card>
              <CardHeader>
                <CardTitle>Sample Appointments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {debugData.sampleAppointments.map((apt: any) => (
                    <div key={apt.id} className="text-xs border rounded p-2">
                      <p>
                        <strong>ID:</strong> {apt.id.slice(0, 8)}...
                      </p>
                      <p>
                        <strong>User:</strong> {apt.user_id}
                      </p>
                      <p>
                        <strong>Event:</strong> {apt.event_type}
                      </p>
                      <p>
                        <strong>Payment Status:</strong> {apt.payment_status}
                      </p>
                      <p>
                        <strong>Total:</strong> ₱{apt.total_package_amount?.toLocaleString() || "N/A"}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Sample Transactions */}
            <Card>
              <CardHeader>
                <CardTitle>Sample Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {debugData.sampleTransactions.map((txn: any) => (
                    <div key={txn.id} className="text-xs border rounded p-2">
                      <p>
                        <strong>ID:</strong> {txn.id.slice(0, 8)}...
                      </p>
                      <p>
                        <strong>User:</strong> {txn.user_id}
                      </p>
                      <p>
                        <strong>Appointment:</strong> {txn.appointment_id.slice(0, 8)}...
                      </p>
                      <p>
                        <strong>Amount:</strong> ₱{txn.amount.toLocaleString()}
                      </p>
                      <p>
                        <strong>Status:</strong> {txn.status}
                      </p>
                      <p>
                        <strong>Appointment Status:</strong> {txn.appointment_payment_status}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {!debugData && !loading && (
        <Card>
          <CardContent className="text-center py-12">
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Database className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Debug Data Loaded</h3>
            <p className="text-gray-500 mb-6">Click "Load Debug Data" to analyze payment data inconsistencies.</p>
            <Button onClick={fetchDebugData}>
              <Database className="mr-2 h-4 w-4" />
              Load Debug Data
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
