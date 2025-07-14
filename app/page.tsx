"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ChevronRight, Calendar, Users, Utensils, MessageSquare } from "lucide-react"
import HeroSection from "@/components/hero-section"
import FeaturesSection from "@/components/features-section"
import TestimonialsSection from "@/components/testimonials-section"
import AIChatbot from "@/components/ai-chatbot"
import { Toaster } from "@/components/ui/toaster"
import { useToast } from "@/components/ui/use-toast"
import { useEffect } from "react"

export default function Home() {
  const { toast } = useToast() // ✅ Properly called inside component

  // Check for booking success message
  useEffect(() => {
    const bookingSuccess = localStorage.getItem("bookingSuccess")
    if (bookingSuccess === "true") {
      // Clear the flag
      localStorage.removeItem("bookingSuccess")

      // Show success toast
      toast({
        title: "🎉 Appointment Booked Successfully!",
        description:
          "Thank you for booking with Jo Pacheco Wedding & Events. Please wait for the admin's response regarding your food tasting date.",
        duration: 8000, // Show for 8 seconds
      })
    }
  }, [toast])

  const testToast = () => {
    console.log("Testing toast from homepage...")
    toast({
      title: "Homepage Test Toast",
      description: "This toast is working from the homepage!",
    })
  }

  return (
    <div className="flex min-h-screen flex-col">
      <HeroSection />

      <section className="w-full py-12 md:py-24 lg:py-32 bg-white">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Exceptional Catering Services</h2>
              <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                From intimate gatherings to grand celebrations, we provide personalized catering services that exceed
                expectations.
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Link href="/book-appointment">
                <Button className="bg-rose-600 hover:bg-rose-700">
                  Book Appointment <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/services">
                <Button variant="outline">
                  View Services <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Jo Pacheco Wedding Event Catering Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-rose-50">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Wedding Event Catering</h2>
                <p className="text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Make your special day unforgettable with our premium wedding catering services. Since 2018, Jo Pacheco Wedding & Event has been creating magical culinary experiences for couples on their most
                  important day.
                </p>
                <p className="text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Our dedicated team works closely with you to design a custom menu that reflects your taste and style.
                  From elegant plated dinners to lavish buffets, we handle every detail with care and precision.
                </p>
              </div>
              <div>
                <Link href="/wedding-catering">
                  <Button className="mt-4 bg-rose-600 hover:bg-rose-700">
                    Explore Wedding Packages <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative overflow-hidden rounded-lg shadow-lg">
              <Image
                src="/images/jo-pacheco-office.jpeg"
                alt="Jo Pacheco's Office with Jo Pacheco Wedding & Event logo"
                width={800}
                height={600}
                className="object-cover w-full h-full"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
                <div className="text-white">
                  <p className="text-sm font-medium">Est. 2018</p>
                  <h3 className="text-xl font-bold">Jo Pacheco Wedding & Event</h3>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <FeaturesSection />

      <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-50">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">AI-Powered Event Planning</h2>
                <p className="max-w-[600px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Our intelligent system helps you plan the perfect event by recommending packages and menus based on
                  your preferences and budget.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Link href="/book-appointment?tab=ai">
                  <Button className="bg-rose-600 hover:bg-rose-700">
                    Try AI Recommendations <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <div className="rounded-lg border bg-white p-8 shadow-lg">
                <div className="grid gap-4">
                  <div className="flex items-center gap-4">
                    <Calendar className="h-8 w-8 text-rose-600" />
                    <div>
                      <h3 className="text-xl font-bold">Smart Scheduling</h3>
                      <p className="text-sm text-gray-500">AI suggests the best available time slots</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Users className="h-8 w-8 text-rose-600" />
                    <div>
                      <h3 className="text-xl font-bold">Personalized Packages</h3>
                      <p className="text-sm text-gray-500">Tailored recommendations for your event</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Utensils className="h-8 w-8 text-rose-600" />
                    <div>
                      <h3 className="text-xl font-bold">Menu Suggestions</h3>
                      <p className="text-sm text-gray-500">Curated food options based on your preferences</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <MessageSquare className="h-8 w-8 text-rose-600" />
                    <div>
                      <h3 className="text-xl font-bold">AI Chatbot</h3>
                      <p className="text-sm text-gray-500">Get instant answers to your questions</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <TestimonialsSection />

      <AIChatbot />

      {/* Add Toaster component */}
      <Toaster />
    </div>
  )
}
