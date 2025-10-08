"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { MapPin, Phone, Mail, Clock, Send, Loader2, ExternalLink } from "lucide-react"

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle")

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus("idle")

    try {
      const response = await fetch("/api/contact/send-message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (response.ok && result.success) {
        setSubmitStatus("success")
        setFormData({
          name: "",
          email: "",
          phone: "",
          subject: "",
          message: "",
        })
      } else {
        setSubmitStatus("error")
        console.error("Failed to send message:", result.message)
      }
    } catch (error) {
      setSubmitStatus("error")
      console.error("Error sending message:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Google Maps URL for Jo Pacheco Wedding and Events
  const googleMapsUrl = "https://maps.app.goo.gl/bkvHdD7mZi26wDLY7"

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-rose-600 to-pink-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Contact Us</h1>
          <p className="text-xl text-rose-100 max-w-2xl mx-auto">
            Ready to plan your dream event? Get in touch with us today and let's create something magical together.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Get in Touch</h2>
              <p className="text-gray-600 text-lg leading-relaxed">
                We'd love to hear from you! Whether you're planning a wedding, corporate event, or special celebration,
                our team is here to make your vision come to life.
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="bg-rose-100 p-3 rounded-full">
                  <MapPin className="h-6 w-6 text-rose-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Our Location</h3>
                  <p className="text-gray-600">
                    Sullera Street, Meycauyan, Bulacan, Philippines
                    <br />
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-rose-100 p-3 rounded-full">
                  <Phone className="h-6 w-6 text-rose-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Phone</h3>
                  <p className="text-gray-600">0917 854 3221</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-rose-100 p-3 rounded-full">
                  <Mail className="h-6 w-6 text-rose-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Email</h3>
                  <p className="text-gray-600">hello@jopacheco.com</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-rose-100 p-3 rounded-full">
                  <Clock className="h-6 w-6 text-rose-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Business Hours</h3>
                  <div className="text-gray-600">
                    <p>Monday - Friday: 9:00 AM - 6:00 PM</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Interactive Map */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-4 bg-rose-50 border-b">
                <h3 className="font-semibold text-gray-900 flex items-center">
                  <MapPin className="h-5 w-5 text-rose-600 mr-2" />
                  Find Us Here
                </h3>
              </div>
              <div className="relative">
                <a
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block relative group cursor-pointer"
                  aria-label="Open Jo Pacheco Wedding and Events location in Google Maps"
                >
                  <img
                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-6BrsUwyntb77MoXDr4j2ATtpjrUDqB.png"
                    alt="Jo Pacheco Wedding and Events location map showing Sullera Street, Meycauyan, Bulacan"
                    className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                    <div className="bg-white bg-opacity-95 px-6 py-3 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-lg">
                      <div className="flex items-center space-x-2">
                        <ExternalLink className="h-5 w-5 text-rose-600" />
                        <p className="text-sm text-gray-800 font-medium">Open in Google Maps</p>
                      </div>
                    </div>
                  </div>
                </a>
              </div>

              {/* Get Directions Button */}
              <div className="p-4 bg-gray-50 border-t">
                <a
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-medium rounded-lg transition-colors duration-200"
                >
                  <MapPin className="h-4 w-4 mr-2" />
                  Get Directions
                  <ExternalLink className="h-4 w-4 ml-2" />
                </a>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div>
            <Card className="shadow-xl">
              <CardHeader>
                <CardTitle className="text-2xl text-gray-900">Send us a Message</CardTitle>
                <p className="text-gray-600">Fill out the form below and we'll get back to you within 24 hours.</p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name *
                      </label>
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        required
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Your full name"
                        disabled={isSubmitting}
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address *
                      </label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="your.email@example.com"
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+63 917 123 4567"
                      disabled={isSubmitting}
                    />
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                      Subject *
                    </label>
                    <Input
                      id="subject"
                      name="subject"
                      type="text"
                      required
                      value={formData.subject}
                      onChange={handleInputChange}
                      placeholder="What's this about?"
                      disabled={isSubmitting}
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                      Message *
                    </label>
                    <Textarea
                      id="message"
                      name="message"
                      required
                      rows={6}
                      value={formData.message}
                      onChange={handleInputChange}
                      placeholder="Tell us about your event, preferred dates, guest count, and any special requirements..."
                      disabled={isSubmitting}
                    />
                  </div>

                  {/* Status Messages */}
                  {submitStatus === "success" && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <p className="text-green-800 font-medium">✓ Message sent successfully!</p>
                      <p className="text-green-600 text-sm mt-1">
                        Thank you for contacting us. We'll get back to you within 24 hours.
                      </p>
                    </div>
                  )}

                  {submitStatus === "error" && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <p className="text-red-800 font-medium">✗ Failed to send message</p>
                      <p className="text-red-600 text-sm mt-1">
                        Please try again or contact us directly at hello@jopacheco.com
                      </p>
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-rose-600 hover:bg-rose-700 text-white py-3 text-lg font-medium"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="h-5 w-5 mr-2" />
                        Send Message
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Additional Information */}
        <div className="mt-16 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Why Choose Jo Pacheco?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="bg-rose-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎨</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Creative Excellence</h3>
              <p className="text-gray-600">
                Award-winning designs and innovative concepts that bring your vision to life with stunning attention to
                detail.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="bg-rose-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⭐</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Premium Service</h3>
              <p className="text-gray-600">
                Personalized service from initial consultation to event day, ensuring every detail exceeds your
                expectations.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="bg-rose-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🤝</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Trusted Partner</h3>
              <p className="text-gray-600">
                Years of experience creating unforgettable moments for couples and families throughout the Philippines.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
