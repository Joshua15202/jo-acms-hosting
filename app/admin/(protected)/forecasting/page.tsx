"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { TrendingUp, Calendar, BarChart, Brain, Target, Clock, Database, AlertCircle, Crown } from "lucide-react"
import { useAdminAuth } from "@/components/admin/admin-auth-provider"

interface MonthlyAnalysis {
  totalAppointments: number
  monthlyBookings: { [key: number]: number }
  quarterlyBookings: { [key: string]: number }
  analysis: {
    peakMonth: { month: number; count: number }
    peakQuarter: { quarter: string; count: number }
    topMonths: { month: number; count: number }[]
    insights: string[]
    weddingSeasonBookings: number
    holidaySeasonBookings: number
  }
  forecasts: {
    month: number
    monthName: string
    confidence: number
    reason: string
    expectedBookings: number
    peakIndicator: "high" | "medium" | "low"
  }[]
  lastUpdated: string
  dataSource?: string
  isDemo?: boolean
  message?: string
}

export default function ForecastingPage() {
  const router = useRouter()
  const { isAuthenticated } = useAdminAuth()
  const [monthlyData, setMonthlyData] = useState<MonthlyAnalysis | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/admin/login")
      return
    }

    fetchMonthlyPatterns()
  }, [isAuthenticated, router])

  const fetchMonthlyPatterns = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/admin/booking-patterns")
      const result = await response.json()

      if (result.success) {
        setMonthlyData(result.data)
      } else {
        setError(result.error || "Failed to fetch monthly patterns")
      }
    } catch (err) {
      setError("Network error while fetching data")
      console.error("Error fetching monthly patterns:", err)
    } finally {
      setLoading(false)
    }
  }

  if (!isAuthenticated) {
    return null
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI Forecasting & Optimization</h1>
          <p className="text-gray-500">Loading monthly pattern analysis...</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI Forecasting & Optimization</h1>
          <p className="text-red-500">Error: {error}</p>
        </div>
        <Card>
          <CardContent className="p-6">
            <Button onClick={fetchMonthlyPatterns} variant="outline">
              Retry Loading Data
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return "bg-green-100 text-green-800 border-green-200"
    if (confidence >= 60) return "bg-yellow-100 text-yellow-800 border-yellow-200"
    return "bg-red-100 text-red-800 border-red-200"
  }

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 80) return "High Confidence"
    if (confidence >= 60) return "Medium Confidence"
    return "Low Confidence"
  }

  const getPeakIndicatorColor = (indicator: string) => {
    if (indicator === "high") return "bg-red-100 text-red-800 border-red-200"
    if (indicator === "medium") return "bg-yellow-100 text-yellow-800 border-yellow-200"
    return "bg-blue-100 text-blue-800 border-blue-200"
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">AI Forecasting & Optimization</h1>
        <p className="text-gray-500">Monthly booking patterns and peak period analysis</p>
      </div>

      {/* Data Source Indicator */}
      {monthlyData && (
        <Card className={monthlyData.isDemo ? "border-amber-200 bg-amber-50" : "border-green-200 bg-green-50"}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              {monthlyData.isDemo ? (
                <AlertCircle className="h-5 w-5 text-amber-600" />
              ) : (
                <Database className="h-5 w-5 text-green-600" />
              )}
              <div>
                <p className={`text-sm font-medium ${monthlyData.isDemo ? "text-amber-800" : "text-green-800"}`}>
                  {monthlyData.isDemo ? "Demo Data Mode" : "Real Data Analysis"}
                </p>
                <p className={`text-xs ${monthlyData.isDemo ? "text-amber-700" : "text-green-700"}`}>
                  {monthlyData.message}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
        <div className="flex flex-col sm:flex-row gap-2">
          <Select defaultValue="monthly">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select view" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="monthly">Monthly View</SelectItem>
              <SelectItem value="quarterly">Quarterly View</SelectItem>
            </SelectContent>
          </Select>
          <Select defaultValue="all">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select event type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Events</SelectItem>
              <SelectItem value="wedding">Weddings</SelectItem>
              <SelectItem value="corporate">Corporate</SelectItem>
              <SelectItem value="birthday">Birthdays</SelectItem>
              <SelectItem value="debut">Debuts</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchMonthlyPatterns}>
            <BarChart className="mr-2 h-4 w-4" />
            Refresh Analysis
          </Button>
          <Button className="bg-rose-600 hover:bg-rose-700">
            <Brain className="mr-2 h-4 w-4" />
            Update Forecasts
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Appointments</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{monthlyData?.totalAppointments || 0}</div>
            <p className="text-xs text-muted-foreground">Historical bookings analyzed</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Peak Month</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {monthlyData?.analysis.peakMonth
                ? new Date(2024, monthlyData.analysis.peakMonth.month - 1).toLocaleDateString("en-US", {
                    month: "short",
                  })
                : "N/A"}
            </div>
            <p className="text-xs text-muted-foreground">{monthlyData?.analysis.peakMonth?.count || 0} appointments</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Peak Quarter</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{monthlyData?.analysis.peakQuarter?.quarter || "N/A"}</div>
            <p className="text-xs text-muted-foreground">
              {monthlyData?.analysis.peakQuarter?.count || 0} appointments
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Wedding Season</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{monthlyData?.analysis.weddingSeasonBookings || 0}</div>
            <p className="text-xs text-muted-foreground">May-October bookings</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="monthly-forecasts">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="monthly-forecasts">Monthly Forecasts</TabsTrigger>
          <TabsTrigger value="pattern-analysis">Pattern Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="monthly-forecasts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Peak Months Analysis
                {monthlyData?.isDemo && (
                  <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300">
                    Demo Mode
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                {monthlyData?.isDemo
                  ? "Demo analysis showing monthly booking patterns"
                  : "Based on your actual appointment history, here are your peak booking months"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Key Monthly Insights */}
                <div>
                  <h4 className="text-sm font-medium mb-3">🌟 Key Monthly Insights</h4>
                  <div className="space-y-2">
                    {monthlyData?.analysis.insights.map((insight, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200"
                      >
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <p className="text-sm text-blue-800">{insight}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Most Event-Appointed Months */}
                <div>
                  <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                    <Crown className="h-4 w-4 text-yellow-600" />
                    Most Event-Appointed Months
                  </h4>
                  <div className="grid gap-3 grid-cols-1 md:grid-cols-5">
                    {monthlyData?.analysis.topMonths.map((monthData, index) => {
                      const monthNames = [
                        "",
                        "January",
                        "February",
                        "March",
                        "April",
                        "May",
                        "June",
                        "July",
                        "August",
                        "September",
                        "October",
                        "November",
                        "December",
                      ]

                      const getRankColor = (rank: number) => {
                        if (rank === 0) return "border-yellow-300 bg-gradient-to-br from-yellow-50 to-yellow-100"
                        if (rank === 1) return "border-gray-300 bg-gradient-to-br from-gray-50 to-gray-100"
                        if (rank === 2) return "border-orange-300 bg-gradient-to-br from-orange-50 to-orange-100"
                        return "border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100"
                      }

                      const getRankIcon = (rank: number) => {
                        if (rank === 0) return "🥇"
                        if (rank === 1) return "🥈"
                        if (rank === 2) return "🥉"
                        return `#${rank + 1}`
                      }

                      return (
                        <Card key={index} className={`p-4 ${getRankColor(index)}`}>
                          <div className="text-center">
                            <div className="text-lg font-bold text-gray-800 flex items-center justify-center gap-1 mb-1">
                              <span className="text-xl">{getRankIcon(index)}</span>
                            </div>
                            <div className="text-sm font-semibold text-gray-700 mb-1">
                              {monthNames[monthData.month]}
                            </div>
                            <div className="text-2xl font-bold text-rose-600">{monthData.count}</div>
                            <div className="text-xs text-gray-600">appointments</div>
                          </div>
                        </Card>
                      )
                    })}
                  </div>
                </div>

                {/* Peak Months Forecast */}
                <div>
                  <h4 className="text-sm font-medium mb-3">📈 Your Peak Booking Months</h4>
                  <div className="space-y-4">
                    {monthlyData?.forecasts
                      .filter((f) => f.peakIndicator === "high" || f.confidence >= 80)
                      .slice(0, 4)
                      .map((forecast, index) => (
                        <Card
                          key={index}
                          className="border-l-4 border-l-rose-500 bg-gradient-to-r from-rose-50 to-pink-50"
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <h5 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                                  {forecast.monthName}
                                  {forecast.peakIndicator === "high" && (
                                    <Badge className="bg-red-100 text-red-800 hover:bg-red-100">🔥 Peak Month</Badge>
                                  )}
                                </h5>
                                <p className="text-sm text-gray-600 font-medium">
                                  Expected:{" "}
                                  <span className="text-rose-600">{forecast.expectedBookings} appointments</span>
                                </p>
                              </div>
                              <div className="text-right">
                                <Badge variant="outline" className={getConfidenceColor(forecast.confidence)}>
                                  {forecast.confidence}% Confidence
                                </Badge>
                                <p className="text-xs text-gray-500 mt-1">{getConfidenceLabel(forecast.confidence)}</p>
                              </div>
                            </div>
                            <div className="bg-white p-3 rounded border border-rose-100">
                              <p className="text-sm text-gray-700">
                                <strong>Why this month?</strong> {forecast.reason}
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                </div>

                {/* Monthly Breakdown */}
                <div>
                  <h4 className="text-sm font-medium mb-3">📅 Monthly Booking Breakdown</h4>
                  <div className="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                    {Object.entries(monthlyData?.monthlyBookings || {}).map(([month, count]: [string, any]) => {
                      const monthNames = [
                        "",
                        "Jan",
                        "Feb",
                        "Mar",
                        "Apr",
                        "May",
                        "Jun",
                        "Jul",
                        "Aug",
                        "Sep",
                        "Oct",
                        "Nov",
                        "Dec",
                      ]
                      const monthNum = Number.parseInt(month)
                      const isPeak = monthlyData?.analysis.peakMonth?.month === monthNum

                      return (
                        <Card key={month} className={`p-3 ${isPeak ? "border-red-200 bg-red-50" : ""}`}>
                          <div className="text-center">
                            <div className="text-lg font-bold flex items-center justify-center gap-1">
                              {monthNames[monthNum]}
                              {isPeak && <span className="text-red-500">🔥</span>}
                            </div>
                            <div className="text-2xl font-bold text-rose-600">{count}</div>
                            <div className="text-xs text-gray-500">appointments</div>
                          </div>
                        </Card>
                      )
                    })}
                  </div>
                </div>

                {/* Business Planning Summary */}
                <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
                  <h5 className="font-medium text-green-900 mb-2">🎯 Business Planning Summary</h5>
                  <div className="grid gap-2 md:grid-cols-2">
                    <p className="text-sm text-green-800">
                      <strong>Peak Month:</strong>{" "}
                      {monthlyData?.analysis.peakMonth
                        ? new Date(2024, monthlyData.analysis.peakMonth.month - 1).toLocaleDateString("en-US", {
                            month: "long",
                          })
                        : "Not identified"}{" "}
                      ({monthlyData?.analysis.peakMonth?.count || 0} appointments)
                    </p>
                    <p className="text-sm text-green-800">
                      <strong>Peak Quarter:</strong> {monthlyData?.analysis.peakQuarter?.quarter || "Not identified"} (
                      {monthlyData?.analysis.peakQuarter?.count || 0} appointments)
                    </p>
                    <p className="text-sm text-green-800">
                      <strong>Wedding Season:</strong> {monthlyData?.analysis.weddingSeasonBookings || 0} appointments
                      (May-Oct)
                    </p>
                    <p className="text-sm text-green-800">
                      <strong>Holiday Season:</strong> {monthlyData?.analysis.holidaySeasonBookings || 0} appointments
                      (Nov-Jan)
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <div className="flex justify-between w-full">
                <p className="text-xs text-gray-500">
                  Last updated:{" "}
                  {monthlyData?.lastUpdated ? new Date(monthlyData.lastUpdated).toLocaleString() : "Never"}
                </p>
                <Button variant="outline" size="sm" onClick={fetchMonthlyPatterns}>
                  <Clock className="mr-2 h-4 w-4" />
                  Refresh Analysis
                </Button>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="pattern-analysis" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Pattern Analysis</CardTitle>
              <CardDescription>
                Detailed breakdown of {monthlyData?.isDemo ? "sample" : "your actual"} monthly booking patterns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Quarterly Trends */}
                <div>
                  <h4 className="text-sm font-medium mb-3">Quarterly Performance</h4>
                  <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
                    {Object.entries(monthlyData?.quarterlyBookings || {}).map(([quarter, count]: [string, any]) => {
                      const isPeak = monthlyData?.analysis.peakQuarter?.quarter === quarter

                      return (
                        <Card key={quarter} className={`p-3 ${isPeak ? "border-red-200 bg-red-50" : ""}`}>
                          <div className="text-center">
                            <div className="text-lg font-bold flex items-center justify-center gap-1">
                              {quarter}
                              {isPeak && <span className="text-red-500">🔥</span>}
                            </div>
                            <div className="text-2xl font-bold text-rose-600">{count}</div>
                            <div className="text-xs text-gray-500">appointments</div>
                          </div>
                        </Card>
                      )
                    })}
                  </div>
                </div>

                {/* All Monthly Forecasts Table */}
                <div>
                  <h4 className="text-sm font-medium mb-3">Complete Monthly Forecast Overview</h4>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Month</TableHead>
                        <TableHead>Expected Bookings</TableHead>
                        <TableHead>Confidence</TableHead>
                        <TableHead>Peak Level</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {monthlyData?.forecasts.map((forecast, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{forecast.monthName}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="bg-blue-100 text-blue-800">
                              {forecast.expectedBookings}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={getConfidenceColor(forecast.confidence)}>
                              {forecast.confidence}%
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={getPeakIndicatorColor(forecast.peakIndicator)}>
                              {forecast.peakIndicator}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Top Performing Months - Detailed View */}
                <div>
                  <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                    <Crown className="h-4 w-4 text-yellow-600" />
                    Top Performing Months (Detailed)
                  </h4>
                  <div className="space-y-3">
                    {monthlyData?.analysis.topMonths.map((monthData, index) => {
                      const monthNames = [
                        "",
                        "January",
                        "February",
                        "March",
                        "April",
                        "May",
                        "June",
                        "July",
                        "August",
                        "September",
                        "October",
                        "November",
                        "December",
                      ]

                      const getRankBadge = (rank: number) => {
                        if (rank === 0) return "🥇 #1 Most Appointed"
                        if (rank === 1) return "🥈 #2 Most Appointed"
                        if (rank === 2) return "🥉 #3 Most Appointed"
                        return `#${rank + 1} Most Appointed`
                      }

                      return (
                        <Card key={index} className="p-4 border-l-4 border-l-yellow-400 bg-yellow-50">
                          <div className="flex items-center justify-between">
                            <div>
                              <h5 className="font-bold text-lg text-gray-900">{monthNames[monthData.month]}</h5>
                              <p className="text-sm text-yellow-800 font-medium">{getRankBadge(index)}</p>
                            </div>
                            <div className="text-right">
                              <div className="text-3xl font-bold text-yellow-600">{monthData.count}</div>
                              <div className="text-sm text-yellow-700">appointments</div>
                            </div>
                          </div>
                        </Card>
                      )
                    })}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
