import { AlertCircle, Calendar, Clock, CheckCircle } from "lucide-react"

interface WalkInTastingConfirmationEmailProps {
  firstName: string
  eventType: string
  eventDate: string
  proposedTastingDate: string
  proposedTastingTime: string
  confirmationUrl: string
  totalPackageAmount: number
  downPayment: number
  companyName?: string
  companyPhone?: string
  companyMobile?: string
  companyAddress?: string
}

export function WalkInTastingConfirmationEmail({
  firstName,
  eventType,
  eventDate,
  proposedTastingDate,
  proposedTastingTime,
  confirmationUrl,
  totalPackageAmount,
  downPayment,
  companyName = "Jo Pacheco Wedding & Events",
  companyPhone = "(044) 308 3396",
  companyMobile = "0917-8543221",
  companyAddress = "Sullera St. Pandayan, Bulacan",
}: WalkInTastingConfirmationEmailProps) {
  const formattedEventDate = new Date(eventDate).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  const formattedTastingDate = new Date(proposedTastingDate).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return (
    <div className="w-full max-w-2xl mx-auto bg-gray-50 p-4">
      {/* Email Container */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-rose-600 to-rose-700 px-8 py-12 text-center">
          <div className="text-5xl mb-4">🎉</div>
          <h1 className="text-white text-4xl font-bold mb-2">Appointment Confirmed!</h1>
          <p className="text-rose-100 text-lg">{companyName}</p>
        </div>

        {/* Content */}
        <div className="px-8 py-10">
          {/* Greeting */}
          <p className="text-gray-900 font-semibold mb-6">Dear {firstName},</p>

          <p className="text-gray-600 leading-relaxed mb-8">
            Thank you for booking with {companyName}! We're excited to cater your {eventType} on{" "}
            <span className="font-semibold text-gray-900">{formattedEventDate}</span>.
          </p>

          {/* Tasting Confirmation Box */}
          <div className="bg-rose-50 border-2 border-rose-200 rounded-xl p-8 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <CheckCircle className="h-6 w-6 text-rose-600" />
              <h3 className="text-rose-700 text-xl font-bold">📅 Food Tasting Appointment</h3>
            </div>

            <p className="text-rose-900 mb-6 font-medium">We've scheduled your tasting session for:</p>

            {/* Date and Time Card */}
            <div className="bg-white rounded-lg p-6 mb-6 border border-rose-200">
              <div className="flex items-center gap-3 mb-4">
                <Calendar className="h-5 w-5 text-rose-600" />
                <div className="text-2xl font-bold text-rose-600">{formattedTastingDate}</div>
              </div>
              <div className="flex items-center gap-3 mb-3">
                <Clock className="h-5 w-5 text-rose-600" />
                <div className="text-xl text-gray-700">{proposedTastingTime}</div>
              </div>
              <p className="text-gray-500 text-sm ml-8">{companyName} Office</p>
            </div>
          </div>

          {/* Confirmation Button */}
          <div className="text-center mb-8">
            <a
              href={confirmationUrl}
              className="inline-block bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 px-8 rounded-lg text-lg transition-colors"
            >
              ✅ Confirm This Date
            </a>
          </div>

          {/* Event Details Box */}
          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <h4 className="text-gray-900 font-semibold mb-4">Event Details:</h4>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="font-medium text-gray-700">Event Type:</span>
                <span className="text-gray-900">{eventType}</span>
              </div>
              <div className="flex justify-between border-t pt-3">
                <span className="font-medium text-gray-700">Event Date:</span>
                <span className="text-gray-900">{formattedEventDate}</span>
              </div>
              <div className="flex justify-between border-t pt-3">
                <span className="font-medium text-gray-700">Total Package Amount:</span>
                <span className="text-gray-900 font-semibold">₱{totalPackageAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between border-t pt-3">
                <span className="font-medium text-gray-700">Down Payment Required:</span>
                <span className="text-rose-600 font-semibold">₱{downPayment.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* What to Expect Box */}
          <div className="bg-amber-50 border-l-4 border-amber-400 rounded p-6 mb-8">
            <h4 className="text-amber-900 font-semibold mb-4 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              What to Expect at Your Tasting:
            </h4>
            <ul className="text-amber-900 space-y-2 text-sm ml-7">
              <li className="list-disc">Sample portions of your selected menu items</li>
              <li className="list-disc">Opportunity to make adjustments to your menu</li>
              <li className="list-disc">Discussion of final event details</li>
              <li className="list-disc">Finalization of your catering package</li>
            </ul>
          </div>

          {/* Important Note */}
          <p className="text-gray-600 text-center text-sm leading-relaxed mb-8">
            <span className="font-semibold">Important:</span> Please click the "Confirm This Date" button above to
            secure your tasting appointment slot.
          </p>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-8 py-8 border-t border-gray-200">
          <div className="text-center mb-8">
            <h3 className="text-rose-600 font-bold text-lg mb-3">Contact Us</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              📍 {companyAddress}
              <br />
              📞 Phone: {companyPhone}
              <br />
              📱 Mobile: {companyMobile}
            </p>
          </div>

          <div className="text-center pt-6 border-t border-gray-200">
            <p className="text-gray-400 text-xs">© 2025 {companyName}. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
