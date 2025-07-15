export default function AdminDashboard() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
      <p className="text-gray-600 mb-8">Welcome to the Jo-ACMS admin dashboard.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Registered Customers</p>
              <p className="text-2xl font-bold text-gray-900">248</p>
            </div>
            <div className="h-8 w-8 bg-rose-100 rounded-full flex items-center justify-center">
              <span className="text-rose-600 text-sm">👥</span>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">+12% from last month</p>
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
    </div>
  )
}
