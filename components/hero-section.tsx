import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChevronRight } from "lucide-react"

export default function HeroSection() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-gradient-to-b from-rose-50 to-white">
      <div className="container px-4 md:px-6">
        <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
          <div className="flex flex-col justify-center space-y-4">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                Jo Pacheco Wedding & Event Catering
              </h1>
              <p className="max-w-[600px] text-gray-500 md:text-xl">
                Creating unforgettable culinary experiences for your special occasions. Let our AI-powered system help
                you plan the perfect event.
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Link href="/book-appointment">
                <Button size="lg" className="bg-rose-600 hover:bg-rose-700">
                  Book Appointment <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/about">
                <Button size="lg" variant="outline">
                  Learn More <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
          <div className="relative overflow-hidden rounded-lg shadow-lg">
            <img
              alt="Jo Pacheco Catering Office"
              className="object-cover w-full h-full"
              height="700"
              src="/images/jo-pacheco-office.jpeg"
              width="1000"
            />
          </div>
        </div>
      </div>
    </section>
  )
}

