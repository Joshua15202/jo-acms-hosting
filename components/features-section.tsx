import { Calendar, Users, Utensils, Clock } from "lucide-react"

export default function FeaturesSection() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-white">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Our Services</h2>
            <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              We offer a wide range of catering services for all types of events.
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
            <Calendar className="h-12 w-12 text-rose-600" />
            <h3 className="text-xl font-bold">Weddings</h3>
            <p className="text-center text-sm text-gray-500">
              Make your special day memorable with our exquisite wedding catering services.
            </p>
          </div>
          <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
            <Users className="h-12 w-12 text-rose-600" />
            <h3 className="text-xl font-bold">Corporate Events</h3>
            <p className="text-center text-sm text-gray-500">
              Impress your clients and colleagues with professional catering for your business events.
            </p>
          </div>
          <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
            <Utensils className="h-12 w-12 text-rose-600" />
            <h3 className="text-xl font-bold">Birthdays & Debuts</h3>
            <p className="text-center text-sm text-gray-500">
              Celebrate life's milestones with delicious food and impeccable service.
            </p>
          </div>
          <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
            <Clock className="h-12 w-12 text-rose-600" />
            <h3 className="text-xl font-bold">Special Occasions</h3>
            <p className="text-center text-sm text-gray-500">
              From anniversaries to graduations, we cater to all your special moments.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
