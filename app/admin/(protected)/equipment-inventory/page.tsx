"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import InventoryManagement from "@/components/admin/inventory-management"
import EquipmentNeedsForecast from "@/components/admin/equipment-needs-forecast"

export default function EquipmentInventoryPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Equipment Management</h1>
        <p className="text-gray-600">Manage your catering equipment and forecast needs for upcoming events</p>
      </div>

      <Tabs defaultValue="inventory" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="inventory">Equipment Inventory</TabsTrigger>
          <TabsTrigger value="forecast">Equipment Needs Forecast</TabsTrigger>
        </TabsList>

        <TabsContent value="inventory" className="mt-6">
          <InventoryManagement />
        </TabsContent>

        <TabsContent value="forecast" className="mt-6">
          <EquipmentNeedsForecast />
        </TabsContent>
      </Tabs>
    </div>
  )
}
