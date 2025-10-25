import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function AboutPage() {
  return (
    <main className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-rose-50">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
            <div className="space-y-4">
              <div className="inline-block rounded-lg bg-rose-100 px-3 py-1 text-sm text-rose-700">Est. 2018</div>
              <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl">About Jo Pacheco Wedding & Event</h1>
              <p className="max-w-[600px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Crafting memorable culinary experiences for your special occasions since 2018.
              </p>
            </div>
            <div className="flex justify-center">
              <div className="relative w-full aspect-video overflow-hidden rounded-xl">
                <img src="/New Logo.png" alt="logo" style={{ width: "400px", height: "auto" }} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
            <div className="order-2 lg:order-1">
              <div className="relative w-full overflow-hidden rounded-xl">
                <img src="/room logo.jpg" alt="room logo" />
              </div>
            </div>
            <div className="space-y-4 order-1 lg:order-2">
              <div className="inline-block rounded-lg bg-rose-100 px-3 py-1 text-sm text-rose-700">Our Story</div>
              <h2 className="text-3xl font-bold tracking-tighter">A Passion for Culinary Excellence</h2>
              <p className="text-gray-500">
                Jo Pacheco Wedding & Event began in 2018 as a small family business with a big dream: to create
                memorable dining experiences that bring people together. What started as a passion project between two
                friends with a love for food has grown into one of the most trusted catering services in the
                Philippines.
              </p>
              <p className="text-gray-500">
                Our journey has been defined by a commitment to quality, creativity, and exceptional service. From
                intimate family gatherings to grand corporate events and dream weddings, we've had the privilege of
                being part of thousands of special moments, creating culinary experiences that leave lasting
                impressions.
              </p>
              <p className="text-gray-500">
                Today, Jo Jo Pacheco Wedding & Event continues to be guided by the same principles that inspired its
                founding: using the freshest ingredients, crafting dishes with care and creativity, and delivering
                service that exceeds expectations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-50">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
            <div className="space-y-2">
              <div className="inline-block rounded-lg bg-rose-100 px-3 py-1 text-sm text-rose-700">Our Team</div>
              <h2 className="text-3xl font-bold tracking-tighter">Meet the People Behind the Magic</h2>
              <p className="max-w-[600px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Our dedicated team of culinary professionals is passionate about creating exceptional dining
                experiences.
              </p>
            </div>
          </div>

          {/* Centered Team Member Profile */}
          <div className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-12 max-w-4xl mx-auto">
            {/* Photo Container */}
            <div className="flex-shrink-0">
              <Card className="overflow-hidden">
                <div className="aspect-square w-80 relative">
                  <Image
                    src="/ownerpic.jpg"
                    alt="Jonel Ray Pacheco - Event Planner & Owner"
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
              </Card>
            </div>

            {/* Description Container */}
            <div className="flex-1 space-y-4 text-center lg:text-left">
              <h3 className="text-3xl font-bold tracking-tighter">Jonel Ray Pacheco</h3>
              <p className="text-rose-600 font-medium">Event Planner & Owner</p>
              <p className="text-gray-500 leading-relaxed">
                Jo Pacheco Wedding & Event began in 2018 as a small family business with a big dream: to create
                memorable dining experiences that bring people together. What started as a passion project between two
                friends with a love for food has grown into one of the most trusted catering services in the
                Philippines.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <div className="inline-block rounded-lg bg-rose-100 px-3 py-1 text-sm text-rose-700">Our Values</div>
              <h2 className="text-3xl font-bold tracking-tighter">What Drives Us</h2>
              <p className="max-w-[600px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Our core values guide everything we do, from food preparation to customer service.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-rose-100">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-8 w-8 text-rose-600"
                  >
                    <path d="M19.5 12.572l-7.5 7.428l-7.5 -7.428a5 5 0 1 1 7.5 -6.566a5 5 0 1 1 7.5 6.572"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-bold">Passion</h3>
                <p className="text-gray-500 mt-2">
                  We're passionate about food and creating memorable experiences. This passion drives us to continuously
                  innovate and exceed expectations.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-rose-100">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-8 w-8 text-rose-600"
                  >
                    <path d="M12 20h9"></path>
                    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-bold">Quality</h3>
                <p className="text-gray-500 mt-2">
                  We never compromise on quality. From ingredient selection to presentation, excellence is our standard
                  in everything we do.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-rose-100">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-8 w-8 text-rose-600"
                  >
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-bold">Service</h3>
                <p className="text-gray-500 mt-2">
                  We believe in personalized service that makes every client feel special. Your satisfaction is our
                  ultimate goal.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-rose-50">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter">Ready to Create Memorable Experiences?</h2>
              <p className="max-w-[600px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Let us help you plan your next event with delicious food and impeccable service.
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Link href="/book-appointment">
                <Button className="bg-rose-600 hover:bg-rose-700">Book a Consultation</Button>
              </Link>
              <Link href="/contact">
                <Button variant="outline">Contact Us</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
