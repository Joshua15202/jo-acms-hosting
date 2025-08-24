"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Clock, Mail, MapPin, Phone } from "lucide-react"

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch("/api/contact/send-message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (result.success) {
        setIsSubmitted(true)
        setFormData({
          name: "",
          email: "",
          phone: "",
          subject: "",
          message: "",
        })
      } else {
        console.error("Failed to send message:", result.error)
        // You could add error state handling here if needed
      }
    } catch (error) {
      console.error("Error sending message:", error)
      // You could add error state handling here if needed
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-rose-50">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl">Contact Us</h1>
              <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                We'd love to hear from you. Get in touch with our team for inquiries, bookings, or just to say hello.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Information Section */}
      <section className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12">
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold mb-6">Get In Touch</h2>
                <p className="text-gray-500 mb-8">
                  Have questions about our services or want to book an event? Fill out the form and we'll get back to
                  you as soon as possible.
                </p>
              </div>
              <div className="grid gap-6">
                <Card>
                  <CardContent className="p-6 flex items-start">
                    <MapPin className="h-6 w-6 text-rose-600 mr-4 mt-1" />
                    <div>
                      <h3 className="font-bold">Our Location</h3>
                      <p className="text-gray-500 mt-1">Sullera street, Meycauayan, Bulacan, Philippines</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6 flex items-start">
                    <Phone className="h-6 w-6 text-rose-600 mr-4 mt-1" />
                    <div>
                      <h3 className="font-bold">Phone</h3>
                      <p className="text-gray-500 mt-1">0917 854 3221</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6 flex items-start">
                    <Mail className="h-6 w-6 text-rose-600 mr-4 mt-1" />
                    <div>
                      <h3 className="font-bold">Email</h3>
                      <p className="text-gray-500 mt-1">info@jopacheco.com</p>
                      <p className="text-gray-500">bookings@jopacheco.com</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6 flex items-start">
                    <Clock className="h-6 w-6 text-rose-600 mr-4 mt-1" />
                    <div>
                      <h3 className="font-bold">Business Hours</h3>
                      <p className="text-gray-500 mt-1">Monday - Friday: 10:00 AM - 6:30 PM</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
            <div>
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-2xl font-bold mb-6">Send Us a Message</h2>
                  {isSubmitted ? (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                      <h3 className="text-xl font-bold text-green-700 mb-2">Thank You!</h3>
                      <p className="text-green-600 mb-4">
                        Your message has been sent successfully. We'll get back to you soon.
                      </p>
                      <Button onClick={() => setIsSubmitted(false)} variant="outline" className="mt-2">
                        Send Another Message
                      </Button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="name">Full Name</Label>
                          <Input
                            id="name"
                            name="name"
                            placeholder="John Doe"
                            required
                            value={formData.name}
                            onChange={handleChange}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="john@example.com"
                            required
                            value={formData.email}
                            onChange={handleChange}
                          />
                        </div>
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone Number</Label>
                          <Input
                            id="phone"
                            name="phone"
                            placeholder="+63 917 123 4567"
                            value={formData.phone}
                            onChange={handleChange}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="subject">Subject</Label>
                          <Input
                            id="subject"
                            name="subject"
                            placeholder="Event Inquiry"
                            required
                            value={formData.subject}
                            onChange={handleChange}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="message">Message</Label>
                        <Textarea
                          id="message"
                          name="message"
                          placeholder="Tell us about your event and how we can help..."
                          required
                          className="min-h-[150px]"
                          value={formData.message}
                          onChange={handleChange}
                        />
                      </div>
                      <Button type="submit" className="w-full bg-rose-600 hover:bg-rose-700" disabled={isSubmitting}>
                        {isSubmitting ? "Sending..." : "Send Message"}
                      </Button>
                    </form>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-50">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center mb-8">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter">Find Us</h2>
              <p className="max-w-[600px] text-gray-500">Visit our office to discuss your catering needs in person.</p>
            </div>
          </div>
          <div className="aspect-video w-full rounded-xl overflow-hidden border border-gray-200">
            <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500">
              <p className="text-center">Map Embed Would Go Here</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center mb-8">
            <div className="space-y-2">
              <div className="inline-block rounded-lg bg-rose-100 px-3 py-1 text-sm text-rose-700">FAQs</div>
              <h2 className="text-3xl font-bold tracking-tighter">Frequently Asked Questions</h2>
              <p className="max-w-[600px] text-gray-500">
                Find answers to common questions about our catering services.
              </p>
            </div>
          </div>
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-2">How far in advance should I book your catering services?</h3>
                <p className="text-gray-500">
                  We recommend booking at least 2-3 months in advance for large events like weddings, and 2-4 weeks for
                  smaller gatherings. However, we do our best to accommodate last-minute requests when possible.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-2">Do you accommodate dietary restrictions?</h3>
                <p className="text-gray-500">
                  Yes, we can accommodate various dietary needs including vegetarian, vegan, gluten-free, and allergies.
                  Please inform us of any restrictions when planning your menu.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-2">What is your cancellation policy?</h3>
                <p className="text-gray-500">
                  Our cancellation policy varies depending on the size of the event and how far in advance the
                  cancellation is made. Generally, cancellations made 14 days or more before the event receive a full
                  refund of the deposit.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-2">Do you provide tastings before booking?</h3>
                <p className="text-gray-500">
                  Yes, we offer menu tastings for weddings and large events. Tastings are scheduled after an initial
                  consultation and may have a small fee that is credited toward your final bill if you book with us.
                </p>
              </CardContent>
            </Card>
          </div>
          <div className="flex justify-center mt-8">
            <Link href="/book-appointment">
              <Button className="bg-rose-600 hover:bg-rose-700">Book a Consultation</Button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
