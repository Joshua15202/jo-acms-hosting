import AppointmentsList from "@/components/admin/appointments-list"

export default function AdminAppointmentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Appointments</h1>
        <p className="text-gray-600">Manage and track all client appointments</p>
      </div>

      <AppointmentsList />
    </div>
  )
}
