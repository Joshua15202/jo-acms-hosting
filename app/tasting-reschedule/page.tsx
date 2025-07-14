"use client"

import { useSearchParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function TastingReschedulePage() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardContent className="p-8 text-center">
          <div className="mb-6">
            <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Reschedule Request Received 📅</h1>
            <p className="text-gray-600 text-lg">We've received your request to reschedule your tasting appointment.</p>
          </div>

          <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-amber-800 mb-2">What Happens Next</h2>
            <p className="text-amber-700">
              Our team will contact you within 24 hours to arrange a new tasting date that works better for your
              schedule.
            </p>
          </div>

          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6 text-left">
            <h3 className="font-semibold text-blue-800 mb-2">In the meantime:</h3>
            <ul className="text-blue-700 text-sm space-y-1">
              <li>• Keep your phone handy - we'll call you soon</li>
              <li>• Think about your preferred dates and times</li>
              <li>• Consider any scheduling conflicts you might have</li>
              <li>• Prepare any questions about your menu</li>
            </ul>
          </div>

          <div className="space-y-4">
            <p className="text-gray-600">
              Thank you for your patience. We want to make sure the tasting works perfectly with your schedule!
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/">
                <Button variant="outline" className="w-full sm:w-auto">
                  Return to Home
                </Button>
              </Link>
              <Link href="/contact">
                <Button className="w-full sm:w-auto bg-rose-600 hover:bg-rose-700">Contact Us Directly</Button>
              </Link>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="text-sm text-gray-500">
              <p className="font-semibold">Jo Pacheco Wedding & Event</p>
              <p>📍 Sullera St. Pandayan, Bulacan</p>
              <p>📞 (044) 308 3396 | 📱 0917-8543221</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
