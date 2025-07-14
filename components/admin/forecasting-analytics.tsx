"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowUpRight, TrendingUp, ShoppingCart, Calendar, AlertTriangle } from "lucide-react"

export default function ForecastingAnalytics() {
  const [timeframe, setTimeframe] = useState("month")
  const [eventType, setEventType] = useState("all")

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
        <div className="space-y-1">
          <h3 className="text-xl font-medium">AI-Powered Inventory Management</h3>
          <p className="text-sm text-gray-500">
            Optimize inventory, forecast demand, and get smart reordering recommendations
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Next 7 Days</SelectItem>
              <SelectItem value="month">Next 30 Days</SelectItem>
              <SelectItem value="quarter">Next 90 Days</SelectItem>
            </SelectContent>
          </Select>
          <Select value={eventType} onValueChange={setEventType}>
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
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Predicted Events</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-500 inline-flex items-center">
                +12% <ArrowUpRight className="ml-1 h-3 w-3" />
              </span>{" "}
              from previous period
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estimated Servings</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2,450</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-500 inline-flex items-center">
                +18% <ArrowUpRight className="ml-1 h-3 w-3" />
              </span>{" "}
              from previous period
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reorder Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">Items requiring immediate attention</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estimated Costs</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₱185,400</div>
            <p className="text-xs text-muted-foreground">For upcoming inventory needs</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="demand-forecast">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="demand-forecast">Demand Forecast</TabsTrigger>
          <TabsTrigger value="inventory-optimization">Inventory Optimization</TabsTrigger>
          <TabsTrigger value="reordering">Reordering</TabsTrigger>
        </TabsList>
        <TabsContent value="demand-forecast" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Demand Forecast</CardTitle>
              <CardDescription>
                AI-generated predictions based on historical data, seasonal trends, and upcoming events
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center justify-center bg-gray-50 rounded-md">
                {/* In a real application, this would be a chart component */}
                <div className="text-center">
                  <p className="text-gray-500">Demand Forecast Chart</p>
                  <p className="text-sm text-gray-400">
                    (This would display a line chart showing predicted demand over time)
                  </p>
                </div>
              </div>
              <div className="mt-6">
                <h4 className="text-sm font-medium mb-3">Key Insights</h4>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <span className="bg-green-100 text-green-800 p-1 rounded-full mr-2">
                      <TrendingUp className="h-3 w-3" />
                    </span>
                    <span className="text-sm">
                      <span className="font-medium">Peak demand expected</span> during the last two weeks of December
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-blue-100 text-blue-800 p-1 rounded-full mr-2">
                      <Calendar className="h-3 w-3" />
                    </span>
                    <span className="text-sm">
                      <span className="font-medium">Wedding season</span> will require 30% more chicken and beef dishes
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-yellow-100 text-yellow-800 p-1 rounded-full mr-2">
                      <AlertTriangle className="h-3 w-3" />
                    </span>
                    <span className="text-sm">
                      <span className="font-medium">Potential shortage</span> of seafood items in the next 14 days
                    </span>
                  </li>
                </ul>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                View Detailed Forecast
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="inventory-optimization" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Inventory Optimization</CardTitle>
              <CardDescription>
                Precise calculations of required inventory based on upcoming events and guest counts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-medium mb-3">Upcoming Events Inventory Requirements</h4>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Event Date</TableHead>
                        <TableHead>Event Type</TableHead>
                        <TableHead>Guests</TableHead>
                        <TableHead>Required Servings</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell>Dec 15, 2023</TableCell>
                        <TableCell>Wedding</TableCell>
                        <TableCell>150</TableCell>
                        <TableCell>450 servings</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            Prepared
                          </Badge>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Dec 18, 2023</TableCell>
                        <TableCell>Corporate</TableCell>
                        <TableCell>80</TableCell>
                        <TableCell>240 servings</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            Prepared
                          </Badge>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Dec 20, 2023</TableCell>
                        <TableCell>Birthday</TableCell>
                        <TableCell>50</TableCell>
                        <TableCell>150 servings</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                            Partial
                          </Badge>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Dec 23, 2023</TableCell>
                        <TableCell>Debut</TableCell>
                        <TableCell>100</TableCell>
                        <TableCell>300 servings</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                            Attention
                          </Badge>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-3">Optimized Ingredient Requirements</h4>
                  <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                    <Card>
                      <CardHeader className="py-3">
                        <CardTitle className="text-sm">Main Ingredients</CardTitle>
                      </CardHeader>
                      <CardContent className="py-2">
                        <ul className="space-y-1">
                          <li className="text-sm flex justify-between">
                            <span>Chicken</span>
                            <span className="font-medium">85 kg</span>
                          </li>
                          <li className="text-sm flex justify-between">
                            <span>Beef</span>
                            <span className="font-medium">65 kg</span>
                          </li>
                          <li className="text-sm flex justify-between">
                            <span>Pork</span>
                            <span className="font-medium">50 kg</span>
                          </li>
                          <li className="text-sm flex justify-between">
                            <span>Seafood</span>
                            <span className="font-medium">40 kg</span>
                          </li>
                          <li className="text-sm flex justify-between">
                            <span>Rice</span>
                            <span className="font-medium">120 kg</span>
                          </li>
                        </ul>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="py-3">
                        <CardTitle className="text-sm">Additional Items</CardTitle>
                      </CardHeader>
                      <CardContent className="py-2">
                        <ul className="space-y-1">
                          <li className="text-sm flex justify-between">
                            <span>Pasta</span>
                            <span className="font-medium">30 kg</span>
                          </li>
                          <li className="text-sm flex justify-between">
                            <span>Vegetables</span>
                            <span className="font-medium">75 kg</span>
                          </li>
                          <li className="text-sm flex justify-between">
                            <span>Fruits</span>
                            <span className="font-medium">45 kg</span>
                          </li>
                          <li className="text-sm flex justify-between">
                            <span>Desserts</span>
                            <span className="font-medium">200 servings</span>
                          </li>
                          <li className="text-sm flex justify-between">
                            <span>Beverages</span>
                            <span className="font-medium">500 servings</span>
                          </li>
                        </ul>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                Generate Detailed Requirements
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="reordering" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>AI Reordering System</CardTitle>
              <CardDescription>
                Smart recommendations for when and what to reorder based on current inventory and forecasted demand
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-medium mb-3">Urgent Reorder Recommendations</h4>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item</TableHead>
                        <TableHead>Current Stock</TableHead>
                        <TableHead>Recommended Order</TableHead>
                        <TableHead>Urgency</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-medium">Beef</TableCell>
                        <TableCell>5 kg</TableCell>
                        <TableCell>60 kg</TableCell>
                        <TableCell>
                          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Critical</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" variant="outline">
                            Order Now
                          </Button>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Chicken</TableCell>
                        <TableCell>10 kg</TableCell>
                        <TableCell>75 kg</TableCell>
                        <TableCell>
                          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Critical</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" variant="outline">
                            Order Now
                          </Button>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Pasta</TableCell>
                        <TableCell>0 kg</TableCell>
                        <TableCell>30 kg</TableCell>
                        <TableCell>
                          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Critical</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" variant="outline">
                            Order Now
                          </Button>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Table Cloths</TableCell>
                        <TableCell>10 pcs</TableCell>
                        <TableCell>20 pcs</TableCell>
                        <TableCell>
                          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">High</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" variant="outline">
                            Order Now
                          </Button>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-3">Upcoming Reorder Needs</h4>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item</TableHead>
                        <TableHead>Current Stock</TableHead>
                        <TableHead>Recommended Order</TableHead>
                        <TableHead>Order By</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-medium">Rice</TableCell>
                        <TableCell>50 kg</TableCell>
                        <TableCell>70 kg</TableCell>
                        <TableCell>Dec 10, 2023</TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" variant="outline">
                            Schedule
                          </Button>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Vegetables</TableCell>
                        <TableCell>25 kg</TableCell>
                        <TableCell>50 kg</TableCell>
                        <TableCell>Dec 12, 2023</TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" variant="outline">
                            Schedule
                          </Button>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Beverages</TableCell>
                        <TableCell>200 servings</TableCell>
                        <TableCell>300 servings</TableCell>
                        <TableCell>Dec 15, 2023</TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" variant="outline">
                            Schedule
                          </Button>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">View All Recommendations</Button>
              <Button className="bg-rose-600 hover:bg-rose-700">Create Purchase Order</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
