import { Star } from "lucide-react"

export default function TestimonialsSection() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-white">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">What Our Clients Say</h2>
            <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Don't just take our word for it. Here's what our clients have to say about our services.
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="flex flex-col justify-between space-y-4 rounded-lg border p-6 shadow-sm">
              <div className="space-y-2">
                <div className="flex items-center">
                  {Array(5)
                    .fill(0)
                    .map((_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 ${i < testimonial.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
                      />
                    ))}
                </div>
                <p className="text-gray-500">{testimonial.text}</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="rounded-full bg-gray-100 p-1">
                  <div className="h-8 w-8 rounded-full bg-gray-300" />
                </div>
                <div>
                  <p className="text-sm font-medium">{testimonial.name}</p>
                  <p className="text-xs text-gray-500">{testimonial.event}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

const testimonials = [
  {
    name: "Maria Santos",
    event: "Wedding Reception",
    rating: 5,
    text: "Jo Pacheco Catering made our wedding day perfect! The AI recommendation system suggested the perfect menu for our guests, and the service was impeccable.",
  },
  {
    name: "John Reyes",
    event: "Corporate Event",
    rating: 5,
    text: "The attention to detail was outstanding. Our company event was a huge success thanks to the professional service and delicious food.",
  },
  {
    name: "Sofia Cruz",
    event: "Debut Party",
    rating: 4,
    text: "My daughter's debut was magical. The team was responsive to our needs and the AI chatbot made planning so much easier.",
  },
  {
    name: "Miguel Tan",
    event: "Birthday Celebration",
    rating: 5,
    text: "The food was exceptional and the setup was beautiful. Everyone at my birthday party was impressed with the service.",
  },
  {
    name: "Elena Garcia",
    event: "Anniversary Dinner",
    rating: 5,
    text: "We celebrated our 25th anniversary with Jo Pacheco Catering and it was perfect. The AI recommended menu was exactly what we wanted.",
  },
  {
    name: "David Lim",
    event: "Corporate Lunch",
    rating: 4,
    text: "Professional service and delicious food. The online booking system made organizing our company lunch effortless.",
  },
]
