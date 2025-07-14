"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/hooks/use-toast"
import { Loader2, Plus, Edit, Trash2, Package, DollarSign, TrendingUp, AlertCircle, Database } from "lucide-react"

interface MenuItem {
  id: number
  name: string
  category: string
  price: number
  description?: string
  created_at?: string
  updated_at?: string
}

interface CategoryStats {
  count: number
  totalValue: number
  avgPrice: number
}

interface MenuData {
  menuItems: MenuItem[]
  categoryStats: Record<string, CategoryStats>
  totalItems: number
}

const CATEGORIES = [
  { value: "beef", label: "Beef", color: "bg-red-100 text-red-800" },
  { value: "chicken", label: "Chicken", color: "bg-yellow-100 text-yellow-800" },
  { value: "pork", label: "Pork", color: "bg-pink-100 text-pink-800" },
  { value: "seafood", label: "Seafood", color: "bg-blue-100 text-blue-800" },
  { value: "vegetables", label: "Vegetables", color: "bg-green-100 text-green-800" },
  { value: "pasta", label: "Pasta", color: "bg-orange-100 text-orange-800" },
  { value: "dessert", label: "Dessert", color: "bg-purple-100 text-purple-800" },
  { value: "beverage", label: "Beverage", color: "bg-cyan-100 text-cyan-800" },
]

export default function InventoryPage() {
  const [menuData, setMenuData] = useState<MenuData>({ menuItems: [], categoryStats: {}, totalItems: 0 })
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [isPopulating, setIsPopulating] = useState(false)

  // Dialog states
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isPriceUpdateDialogOpen, setIsPriceUpdateDialogOpen] = useState(false)

  // Form states
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null)
  const [selectedCategoryForPriceUpdate, setSelectedCategoryForPriceUpdate] = useState("")
  const [newCategoryPrice, setNewCategoryPrice] = useState("")
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    price: "",
    description: "",
  })

  // Fetch menu items
  const fetchMenuItems = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/admin/menu-items")
      const result = await response.json()

      if (result.success && result.data) {
        setMenuData(result.data)
      } else {
        // Initialize with empty data structure if no data
        setMenuData({ menuItems: [], categoryStats: {}, totalItems: 0 })
        toast({
          title: "Error",
          description: result.error || "Failed to fetch menu items",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching menu items:", error)
      // Initialize with empty data structure on error
      setMenuData({ menuItems: [], categoryStats: {}, totalItems: 0 })
      toast({
        title: "Error",
        description: "Failed to fetch menu items",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMenuItems()
  }, [])

  // Handle populate menu items
  const handlePopulateMenuItems = async () => {
    if (!confirm("This will populate the database with default menu items. Continue?")) return

    try {
      setIsPopulating(true)
      const response = await fetch("/api/admin/menu-items/populate", {
        method: "POST",
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "Success",
          description: result.message,
        })
        fetchMenuItems()
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to populate menu items",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error populating menu items:", error)
      toast({
        title: "Error",
        description: "Failed to populate menu items",
        variant: "destructive",
      })
    } finally {
      setIsPopulating(false)
    }
  }

  // Handle add item
  const handleAddItem = async () => {
    if (!formData.name || !formData.category || !formData.price) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetch("/api/admin/menu-items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "Success",
          description: "Menu item added successfully",
        })
        setIsAddDialogOpen(false)
        setFormData({ name: "", category: "", price: "", description: "" })
        fetchMenuItems()
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to add menu item",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error adding menu item:", error)
      toast({
        title: "Error",
        description: "Failed to add menu item",
        variant: "destructive",
      })
    }
  }

  // Handle edit item
  const handleEditItem = async () => {
    if (!editingItem || !formData.name || !formData.category || !formData.price) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetch("/api/admin/menu-items", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingItem.id,
          ...formData,
        }),
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "Success",
          description: "Menu item updated successfully",
        })
        setIsEditDialogOpen(false)
        setEditingItem(null)
        setFormData({ name: "", category: "", price: "", description: "" })
        fetchMenuItems()
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to update menu item",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error updating menu item:", error)
      toast({
        title: "Error",
        description: "Failed to update menu item",
        variant: "destructive",
      })
    }
  }

  // Handle delete item
  const handleDeleteItem = async (id: number) => {
    if (!confirm("Are you sure you want to delete this menu item?")) return

    try {
      const response = await fetch(`/api/admin/menu-items?id=${id}`, {
        method: "DELETE",
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "Success",
          description: "Menu item deleted successfully",
        })
        fetchMenuItems()
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to delete menu item",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error deleting menu item:", error)
      toast({
        title: "Error",
        description: "Failed to delete menu item",
        variant: "destructive",
      })
    }
  }

  // Handle category price update
  const handleUpdateCategoryPrice = async () => {
    if (!selectedCategoryForPriceUpdate || !newCategoryPrice) {
      toast({
        title: "Error",
        description: "Please enter a valid price",
        variant: "destructive",
      })
      return
    }

    const price = Number.parseFloat(newCategoryPrice)
    if (isNaN(price) || price <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid positive number",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetch("/api/admin/menu-items/update-category-price", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: selectedCategoryForPriceUpdate,
          price: price,
        }),
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "Success",
          description: `Updated ${result.updatedCount} items in ${selectedCategoryForPriceUpdate} category`,
        })
        setIsPriceUpdateDialogOpen(false)
        setSelectedCategoryForPriceUpdate("")
        setNewCategoryPrice("")
        fetchMenuItems()
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to update category prices",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error updating category prices:", error)
      toast({
        title: "Error",
        description: "Failed to update category prices",
        variant: "destructive",
      })
    }
  }

  // Open edit dialog
  const openEditDialog = (item: MenuItem) => {
    setEditingItem(item)
    setFormData({
      name: item.name,
      category: item.category,
      price: item.price.toString(),
      description: item.description || "",
    })
    setIsEditDialogOpen(true)
  }

  // Open price update dialog
  const openPriceUpdateDialog = (category: string) => {
    const categoryData = CATEGORIES.find((cat) => cat.value === category)
    const stats = menuData.categoryStats[category]

    setSelectedCategoryForPriceUpdate(category)
    setNewCategoryPrice(stats?.avgPrice?.toFixed(2) || "0")
    setIsPriceUpdateDialogOpen(true)
  }

  // Filter items by category
  const filteredItems = menuData?.menuItems
    ? selectedCategory === "all"
      ? menuData.menuItems
      : menuData.menuItems.filter((item) => item.category === selectedCategory)
    : []

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Inventory Management</h1>
          <p className="text-muted-foreground">Manage your menu items and pricing</p>
        </div>
        <div className="flex gap-2">
          {menuData.totalItems === 0 && (
            <Button onClick={handlePopulateMenuItems} disabled={isPopulating} variant="outline">
              {isPopulating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Database className="h-4 w-4 mr-2" />}
              Populate Menu Items
            </Button>
          )}
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{menuData?.totalItems || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Object.keys(menuData?.categoryStats || {}).length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Price</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₱
              {menuData?.menuItems && menuData.menuItems.length > 0
                ? (menuData.menuItems.reduce((sum, item) => sum + item.price, 0) / menuData.menuItems.length).toFixed(2)
                : "0.00"}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₱{menuData?.menuItems ? menuData.menuItems.reduce((sum, item) => sum + item.price, 0).toFixed(2) : "0.00"}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Category Overview</CardTitle>
          <CardDescription>Manage pricing by category</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {CATEGORIES.map((category) => {
              const stats = menuData.categoryStats[category.value]
              if (!stats) return null

              return (
                <Card key={category.value} className="relative">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <Badge className={category.color}>{category.label}</Badge>
                      <Button variant="ghost" size="sm" onClick={() => openPriceUpdateDialog(category.value)}>
                        <Edit className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="text-sm text-muted-foreground">{stats.count} items</div>
                    <div className="text-lg font-semibold">₱{stats.avgPrice.toFixed(2)} avg</div>
                    <div className="text-sm text-muted-foreground">Total: ₱{stats.totalValue.toFixed(2)}</div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Menu Items */}
      <Card>
        <CardHeader>
          <CardTitle>Menu Items</CardTitle>
          <CardDescription>View and manage individual menu items</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
            <TabsList className="grid w-full grid-cols-5 lg:grid-cols-9">
              <TabsTrigger value="all">All</TabsTrigger>
              {CATEGORIES.map((category) => (
                <TabsTrigger key={category.value} value={category.value}>
                  {category.label}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value={selectedCategory} className="mt-4">
              {filteredItems.length === 0 ? (
                <div className="text-center py-8">
                  <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No items found in this category</p>
                  {menuData.totalItems === 0 && (
                    <div className="mt-4">
                      <Button onClick={handlePopulateMenuItems} disabled={isPopulating}>
                        {isPopulating ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Database className="h-4 w-4 mr-2" />
                        )}
                        Populate Menu Items
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredItems.map((item) => {
                    const category = CATEGORIES.find((cat) => cat.value === item.category)
                    return (
                      <Card key={item.id}>
                        <CardHeader className="pb-2">
                          <div className="flex items-start justify-between">
                            <div className="space-y-1">
                              <CardTitle className="text-base">{item.name}</CardTitle>
                              {category && (
                                <Badge className={category.color} variant="secondary">
                                  {category.label}
                                </Badge>
                              )}
                            </div>
                            <div className="flex space-x-1">
                              <Button variant="ghost" size="sm" onClick={() => openEditDialog(item)}>
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => handleDeleteItem(item.id)}>
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="text-lg font-semibold">₱{item.price.toFixed(2)}</div>
                            {item.description && <p className="text-sm text-muted-foreground">{item.description}</p>}
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Add Item Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Menu Item</DialogTitle>
            <DialogDescription>Add a new item to your menu inventory</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter item name"
              />
            </div>
            <div>
              <Label htmlFor="category">Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="price">Price *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="0.00"
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter item description (optional)"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddItem}>Add Item</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Item Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Menu Item</DialogTitle>
            <DialogDescription>Update the details of this menu item</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Name *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter item name"
              />
            </div>
            <div>
              <Label htmlFor="edit-category">Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit-price">Price *</Label>
              <Input
                id="edit-price"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="0.00"
              />
            </div>
            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter item description (optional)"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditItem}>Update Item</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Price Update Dialog */}
      <Dialog open={isPriceUpdateDialogOpen} onOpenChange={setIsPriceUpdateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Category Price</DialogTitle>
            <DialogDescription>
              {selectedCategoryForPriceUpdate && (
                <>
                  Update the price for all items in the{" "}
                  <strong>{CATEGORIES.find((cat) => cat.value === selectedCategoryForPriceUpdate)?.label}</strong>{" "}
                  category.
                  <br />
                  This will affect{" "}
                  <strong>{menuData.categoryStats[selectedCategoryForPriceUpdate]?.count || 0} items</strong>.
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="category-price">New Price (₱) *</Label>
              <Input
                id="category-price"
                type="number"
                step="0.01"
                min="0"
                value={newCategoryPrice}
                onChange={(e) => setNewCategoryPrice(e.target.value)}
                placeholder="0.00"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPriceUpdateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateCategoryPrice}>Update All Items</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
