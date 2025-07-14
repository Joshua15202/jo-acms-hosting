import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function ServicesPage() {
  return (
    <main className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-rose-50">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl">Our Catering Services</h1>
              <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                From intimate gatherings to grand celebrations, we offer a range of catering services tailored to your
                needs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Wedding Catering Section */}
      <section className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
            <div className="space-y-4">
              <h2 className="text-3xl font-bold tracking-tighter">Wedding Catering</h2>
              <p className="text-gray-500">
                Your wedding day is one of the most important days of your life, and the food should be just as
                memorable. Our wedding catering services are designed to create a culinary experience that complements
                your special day perfectly.
              </p>
              <p className="text-gray-500">
                From elegant plated dinners to lavish buffets, our team works closely with you to design a menu that
                reflects your taste and style. We handle everything from menu planning and food preparation to service
                and cleanup, allowing you to focus on enjoying your celebration.
              </p>
              <div className="space-y-2">
                <h3 className="text-xl font-bold">Our Wedding Packages Include:</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-500">
                  <li>Rice & Drinks</li>
                  <li>Full Skirted Buffet Table w/ Faux Floral Centerpiece</li>
                  <li>Guest Chairs & Tables with Complete Linens & Themed Centerpiece</li>
                  <li>2 (10) Presidential Tables with mix of Artificial & floral runners 
                      + Complete Table  setup & Glasswares + Crystal Chairs</li>
                  <li>Couple’s Table w/ Fresh Floral centerpiece & Couple’s Couch</li>
                  <li>Cake Cylinder Plinth</li>
                  <li>White Carpet Aisle</li>
                  <li>Waiters & Food Attendant in Complete Uniform</li>
                </ul>
              </div>
            </div>
            <div className="flex justify-center">
              <div className="relative w-full max-w-[400px] max-h-[600px] overflow-hidden rounded-xl">
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <img src="wedding picture.jpg" alt="Wedding Image" style={{width: 'auto', height: 'auto'}} />
                  
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Corporate Catering Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-50">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
            <div className="order-2 lg:order-1 flex justify-center">
              <div className="relative w-full max-w-[900px] max-h-[600px] overflow-hidden rounded-xl">
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <img src="corporate image.jpg" alt="Corporate Image" style={{width: 'auto', height: 'auto'}} />
                  
                </div>
              </div>
            </div>
            <div className="order-1 lg:order-2 space-y-4">
              <h2 className="text-3xl font-bold tracking-tighter">Corporate Catering</h2>
              <p className="text-gray-500">
                Make your corporate events, meetings, and conferences more productive and enjoyable with our
                professional catering services. We understand the importance of punctuality, presentation, and quality
                in corporate settings.
              </p>
              <p className="text-gray-500">
                From breakfast meetings and working lunches to formal galas and product launches, we offer a range of
                options to suit your corporate needs. Our efficient service ensures minimal disruption to your schedule
                while providing delicious, professionally presented food.
              </p>
              <div className="space-y-2">
                <h3 className="text-xl font-bold">Our Corporate Services Include:</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-500">
                  <li>Steamed Rice</li>
                  <li>Purified Mineral Water </li>
                  <li>1 Choice of Drink</li>
                  <li>Elegant Buffet Table</li>
                  <li>Guest Chairs & Tables with Complete Setup</li>
                  <li>Table Centerpiece</li>
                  <li>Friendly Waiters & Food Attendant</li>
                  <li>4 Hours Service</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Event Catering Section */}
      <section className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
            <div className="space-y-4">
              <h2 className="text-3xl font-bold tracking-tighter">Social Event Catering</h2>
              <p className="text-gray-500">
                From birthday parties and anniversaries to family reunions and holiday gatherings, our social event
                catering brings people together over delicious food. We create custom menus that match the tone and
                theme of your celebration.
              </p>
              <p className="text-gray-500">
                Our team handles all aspects of food service, allowing you to be a guest at your own event. Whether
                you're planning an intimate dinner party or a large celebration, we ensure your event is memorable for
                all the right reasons.
              </p>
              <div className="space-y-2">
                <h3 className="text-xl font-bold">Perfect For:</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-500">
                  <li>Birthday celebrations</li>
                  <li>Anniversary parties</li>
                  <li>Family reunions</li>
                  <li>Holiday gatherings</li>
                  <li>Graduation parties</li>
                  <li>Housewarming events</li>
                </ul>
              </div>
            </div>
            <div className="flex justify-center">
              <div className="relative w-full max-w-[900px] max-h-[600px] overflow-hidden rounded-xl">
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <img src="birthday image.jpg" alt="Birthday Image" style={{width: 'auto', height: 'auto'}}/>
                  
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Special Occasion Catering Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-50">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
            <div className="order-2 lg:order-1 flex justify-center">
              <div className="relative w-full max-w-[900px] max-h-[600px] overflow-hidden rounded-xl">
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <img src="baptism image.jpg" alt="Baptism Image" style={{width: 'auto', height: 'auto'}}/>
                 
                </div>
              </div>
            </div>
            <div className="order-1 lg:order-2 space-y-4">
              <h2 className="text-3xl font-bold tracking-tighter">Special Occasion Catering</h2>
              <p className="text-gray-500">
                Some moments in life call for extra special celebration. Our special occasion catering services are
                designed for those milestone events that deserve extraordinary culinary experiences.
              </p>
              <p className="text-gray-500">
                From engagement parties and baby showers to retirement celebrations and memorial services, we provide
                thoughtful, customized catering that honors the significance of your special occasion.
              </p>
              <div className="space-y-2">
                <h3 className="text-xl font-bold">We Cater For:</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-500">
                  <li>Engagement parties</li>
                  <li>Baby showers and gender reveals</li>
                  <li>Baptisms and religious celebrations</li>
                  <li>Retirement parties</li>
                  <li>Memorial services</li>
                  <li>Cultural and traditional celebrations</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Menu Options Section */}
      <section className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center mb-8">
            <div className="space-y-2">
              <div className="inline-block rounded-lg bg-rose-100 px-3 py-1 text-sm text-rose-700">Menu Options</div>
              <h2 className="text-3xl font-bold tracking-tighter">How We Serve</h2>
              <p className="max-w-[600px] text-gray-500">
                We offer various serving styles to match the atmosphere and requirements of your event.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Card>
              <CardContent className="p-6">
                <div className="relative w-full max-w-[900px] max-h-[600px] mb-20 overflow-hidden rounded-xl">
                

                 
                  <img src="buffet image.jpg" alt="Buffet Image" style={{width: 'auto', height: 'auto'}}/>
                
                </div>
                <h3 className="text-xl font-bold mb-3">Buffet Service</h3>
                <p className="text-gray-500">
                  Our elegant buffet service allows guests to select from a variety of dishes at their own pace. Perfect
                  for larger gatherings and events where you want to offer multiple options.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="aspect-square w-full bg-gray-200 rounded-lg mb-4 flex items-center justify-center">
                  <img src="plated image.jpg" alt="Plated Image" />
                  
                </div>
                <h3 className="text-xl font-bold mb-2">Plated Service</h3>
                <p className="text-gray-500">
                  For a more formal dining experience, our plated service delivers individually prepared meals directly
                  to your guests. Ideal for weddings, galas, and upscale corporate events.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="aspect-square w-full bg-gray-200 rounded-lg mb-4 flex items-center justify-center round-x1">
                  <img src="family style.jpg" alt="Family Image" />
                  
                </div>
                <h3 className="text-xl font-bold mb-2">Family Style</h3>
                <p className="text-gray-500">
                  Combining the best of both worlds, family-style service places shared platters at each table for
                  guests to serve themselves. Creates a warm, communal dining experience.
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
              <h2 className="text-3xl font-bold tracking-tighter">Ready to Plan Your Event?</h2>
              <p className="max-w-[600px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Contact us today to discuss your catering needs and request a custom quote.
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Link href="/contact">
                <Button className="bg-rose-600 hover:bg-rose-700">Request a Quote</Button>
              </Link>
              <Link href="/book-appointment">
                <Button variant="outline">Book a Consultation</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
