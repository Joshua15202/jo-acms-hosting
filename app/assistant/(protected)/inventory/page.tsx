"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Search, AlertTriangle } from "lucide-react"

export default function AssistantInventoryPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedItem, setSelectedItem] = useState<any | null>(null)
  const [viewDetailsOpen, setViewDetailsOpen] = useState(false)

  // Mock data for inventory items
  const inventoryItems = [
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
  ]

  const filteredItems = inventoryItems.filter((item) => {
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

  const viewDetails = (item: any) => {
    setSelectedItem(item)
    setViewDetailsOpen(true)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Inventory</h1>
        <p className="text-gray-500">View and monitor inventory levels</p>
      </div>

      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search inventory..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Tabs defaultValue="all">
            <TabsList>
              <TabsTrigger value="all">All Items</TabsTrigger>
              <TabsTrigger value="low">Low Stock</TabsTrigger>
              <TabsTrigger value="out">Out of Stock</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Inventory Items</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead>Status</TableHead>
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
                        {(item.status === "low-stock" || item.status === "out-of-stock") && (
                          <AlertTriangle className="h-4 w-4 text-yellow-500 mr-2" />
                        )}
                        {item.name}
                      </div>
                    </TableCell>
                    <TableCell className="capitalize">{item.category}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>{item.unit}</TableCell>
                    <TableCell>{getStatusBadge(item.status)}</TableCell>
                    <TableCell>{item.lastUpdated}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" onClick={() => viewDetails(item)}>
                        View Details
                      </Button>
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
        </CardContent>
      </Card>

      {/* Item Details Dialog */}
      <Dialog open={viewDetailsOpen} onOpenChange={setViewDetailsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Inventory Item Details</DialogTitle>
            <DialogDescription>Detailed information about {selectedItem?.name}</DialogDescription>
          </DialogHeader>
          {selectedItem && (
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
              {(selectedItem.status === "low-stock" || selectedItem.status === "out-of-stock") && (
                <div className="bg-yellow-50 p-3 rounded-md border border-yellow-200">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-yellow-800">Inventory Alert</p>
                      <p className="text-sm text-yellow-700">
                        This item is {selectedItem.status === "out-of-stock" ? "out of stock" : "running low"}. Please
                        notify the administrator to restock.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDetailsOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
