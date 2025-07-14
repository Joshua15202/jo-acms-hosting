"use client"

import { useState } from "react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Search, MoreVertical, AlertTriangle, BarChart } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

type InventoryItem = {
  id: string
  name: string
  category: "food" | "equipment"
  quantity: number
  unit: string
  status: "in-stock" | "low-stock" | "out-of-stock"
  lastUpdated: string
  reorderPoint: number
  optimalStock: number
  usageRate: string
}

export default function InventoryManagement() {
  const [activeTab, setActiveTab] = useState<string>("food")
  const [searchQuery, setSearchQuery] = useState("")
  const [showAIInsights, setShowAIInsights] = useState(false)
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null)

  // Mock data
  const inventoryItems: InventoryItem[] = [
    {
      id: "INV-F-001",
      name: "Rice",
      category: "food",
      quantity: 50,
      unit: "kg",
      status: "in-stock",
      lastUpdated: "2023-11-15",
      reorderPoint: 30,
      optimalStock: 100,
      usageRate: "15 kg/week",
    },
    {
      id: "INV-F-002",
      name: "Chicken",
      category: "food",
      quantity: 20,
      unit: "kg",
      status: "in-stock",
      lastUpdated: "2023-11-16",
      reorderPoint: 25,
      optimalStock: 80,
      usageRate: "20 kg/week",
    },
    {
      id: "INV-F-003",
      name: "Beef",
      category: "food",
      quantity: 5,
      unit: "kg",
      status: "low-stock",
      lastUpdated: "2023-11-14",
      reorderPoint: 15,
      optimalStock: 60,
      usageRate: "12 kg/week",
    },
    {
      id: "INV-F-004",
      name: "Pasta",
      category: "food",
      quantity: 0,
      unit: "kg",
      status: "out-of-stock",
      lastUpdated: "2023-11-10",
      reorderPoint: 10,
      optimalStock: 30,
      usageRate: "8 kg/week",
    },
    {
      id: "INV-E-001",
      name: "Round Tables",
      category: "equipment",
      quantity: 25,
      unit: "pcs",
      status: "in-stock",
      lastUpdated: "2023-10-20",
      reorderPoint: 10,
      optimalStock: 30,
      usageRate: "15 pcs/month",
    },
    {
      id: "INV-E-002",
      name: "Chairs",
      category: "equipment",
      quantity: 200,
      unit: "pcs",
      status: "in-stock",
      lastUpdated: "2023-10-20",
      reorderPoint: 100,
      optimalStock: 250,
      usageRate: "150 pcs/month",
    },
    {
      id: "INV-E-003",
      name: "Table Cloths",
      category: "equipment",
      quantity: 10,
      unit: "pcs",
      status: "low-stock",
      lastUpdated: "2023-11-05",
      reorderPoint: 15,
      optimalStock: 30,
      usageRate: "10 pcs/month",
    },
    {
      id: "INV-E-004",
      name: "Serving Trays",
      category: "equipment",
      quantity: 15,
      unit: "pcs",
      status: "in-stock",
      lastUpdated: "2023-11-01",
      reorderPoint: 10,
      optimalStock: 25,
      usageRate: "12 pcs/month",
    },
  ]

  const filteredItems = inventoryItems.filter((item) => {
    // Filter by category
    if (item.category !== activeTab) {
      return false
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return item.name.toLowerCase().includes(query) || item.id.toLowerCase().includes(query)
    }

    return true
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "in-stock":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            In Stock
          </Badge>
        )
      case "low-stock":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            Low Stock
          </Badge>
        )
      case "out-of-stock":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            Out of Stock
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const viewItemDetails = (item: InventoryItem) => {
    setSelectedItem(item)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <Tabs defaultValue="food" onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="food">Food Service</TabsTrigger>
            <TabsTrigger value="equipment">Catering Equipment</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowAIInsights(true)}>
            <BarChart className="mr-2 h-4 w-4" />
            AI Insights
          </Button>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search inventory..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Unit</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Reorder Point</TableHead>
              <TableHead>Last Updated</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredItems.length > 0 ? (
              filteredItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.id}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      {item.status === "low-stock" && <AlertTriangle className="h-4 w-4 text-yellow-500 mr-2" />}
                      {item.name}
                    </div>
                  </TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>{item.unit}</TableCell>
                  <TableCell>{getStatusBadge(item.status)}</TableCell>
                  <TableCell>{item.reorderPoint}</TableCell>
                  <TableCell>{item.lastUpdated}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => viewItemDetails(item)}>View Details</DropdownMenuItem>
                        <DropdownMenuItem>Edit</DropdownMenuItem>
                        <DropdownMenuItem>Update Stock</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  No items found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Item Details Dialog */}
      {selectedItem && (
        <Dialog open={!!selectedItem} onOpenChange={(open) => !open && setSelectedItem(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Inventory Item Details</DialogTitle>
              <DialogDescription>Detailed information about {selectedItem.name}</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Item ID</p>
                  <p>{selectedItem.id}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Name</p>
                  <p>{selectedItem.name}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Category</p>
                  <p className="capitalize">{selectedItem.category}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Status</p>
                  <p>{getStatusBadge(selectedItem.status)}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Current Quantity</p>
                  <p>
                    {selectedItem.quantity} {selectedItem.unit}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Optimal Stock</p>
                  <p>
                    {selectedItem.optimalStock} {selectedItem.unit}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Reorder Point</p>
                  <p>
                    {selectedItem.reorderPoint} {selectedItem.unit}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Usage Rate</p>
                  <p>{selectedItem.usageRate}</p>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Last Updated</p>
                <p>{selectedItem.lastUpdated}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">AI Recommendation</p>
                <p className="text-sm">
                  {selectedItem.status === "low-stock" || selectedItem.status === "out-of-stock"
                    ? `Order ${selectedItem.optimalStock - selectedItem.quantity} ${selectedItem.unit} to reach optimal stock level.`
                    : "Current stock levels are adequate based on forecasted demand."}
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedItem(null)}>
                Close
              </Button>
              <Button className="bg-rose-600 hover:bg-rose-700">Update Stock</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* AI Insights Dialog */}
      <Dialog open={showAIInsights} onOpenChange={setShowAIInsights}>
        <DialogContent className="sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>AI Inventory Insights</DialogTitle>
            <DialogDescription>
              Smart analysis of your inventory data to optimize stock levels and reduce waste
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Stock Optimization</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[200px] bg-gray-50 rounded-md flex items-center justify-center">
                    <p className="text-sm text-gray-500">(Stock optimization chart)</p>
                  </div>
                </CardContent>
                <CardFooter>
                  <p className="text-xs text-gray-500">Based on historical usage patterns and upcoming events</p>
                </CardFooter>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Usage Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[200px] bg-gray-50 rounded-md flex items-center justify-center">
                    <p className="text-sm text-gray-500">(Usage trends chart)</p>
                  </div>
                </CardContent>
                <CardFooter>
                  <p className="text-xs text-gray-500">Consumption patterns over the last 90 days</p>
                </CardFooter>
              </Card>
            </div>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">AI Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="text-sm flex items-start">
                    <span className="bg-yellow-100 text-yellow-800 p-1 rounded-full mr-2">
                      <AlertTriangle className="h-3 w-3" />
                    </span>
                    <span>
                      <span className="font-medium">Beef stock is critically low.</span> Order at least 55kg to meet
                      upcoming demand for the next 14 days.
                    </span>
                  </li>
                  <li className="text-sm flex items-start">
                    <span className="bg-yellow-100 text-yellow-800 p-1 rounded-full mr-2">
                      <AlertTriangle className="h-3 w-3" />
                    </span>
                    <span>
                      <span className="font-medium">Pasta is out of stock.</span> Order 30kg immediately to fulfill
                      upcoming orders.
                    </span>
                  </li>
                  <li className="text-sm flex items-start">
                    <span className="bg-green-100 text-green-800 p-1 rounded-full mr-2">
                      <BarChart className="h-3 w-3" />
                    </span>
                    <span>
                      <span className="font-medium">Rice consumption has increased by 20%</span> in the last month.
                      Consider adjusting your reorder point.
                    </span>
                  </li>
                  <li className="text-sm flex items-start">
                    <span className="bg-green-100 text-green-800 p-1 rounded-full mr-2">
                      <BarChart className="h-3 w-3" />
                    </span>
                    <span>
                      <span className="font-medium">Table cloths are below optimal levels.</span> Current stock will be
                      insufficient for December events.
                    </span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAIInsights(false)}>
              Close
            </Button>
            <Button className="bg-rose-600 hover:bg-rose-700">Generate Full Report</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
