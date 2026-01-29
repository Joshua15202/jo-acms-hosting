"use client"

import { WalkInTastingConfirmationEmail } from "@/components/emails/walk-in-tasting-confirmation"

export default function EmailPreviewPage() {
  const mockData = {
    firstName: "Maria",
    eventType: "Wedding",
    eventDate: "2026-03-15",
    proposedTastingDate: "2026-02-20",
    proposedTastingTime: "2:00 PM",
    confirmationUrl: "https://jo-acms.vercel.app/api/tasting/confirm?token=example123&action=confirm",
    totalPackageAmount: 125000,
    downPayment: 62500,
  }

  return (
    <div className="min-h-screen bg-gray-900 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-white text-3xl font-bold mb-8 text-center">Walk-In Tasting Confirmation Email</h1>

        <WalkInTastingConfirmationEmail {...mockData} />

        <div className="mt-8 bg-gray-800 text-gray-100 p-6 rounded-lg max-w-4xl mx-auto">
          <h2 className="text-lg font-semibold mb-4">Preview Information</h2>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="font-medium">Customer Name:</dt>
              <dd>{mockData.firstName}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="font-medium">Event Type:</dt>
              <dd>{mockData.eventType}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="font-medium">Event Date:</dt>
              <dd>{mockData.eventDate}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="font-medium">Tasting Date:</dt>
              <dd>{mockData.proposedTastingDate}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="font-medium">Tasting Time:</dt>
              <dd>{mockData.proposedTastingTime}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="font-medium">Package Amount:</dt>
              <dd>₱{mockData.totalPackageAmount.toLocaleString()}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="font-medium">Down Payment:</dt>
              <dd>₱{mockData.downPayment.toLocaleString()}</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  )
}
