import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { supabaseAdmin } from "@/lib/supabase"
import { sendEmail } from "@/lib/email"

interface AppointmentData {
  firstName: string
  lastName: string
  email: string
  phone: string
  eventType: string
  guestCount: number
  eventDate: string
  eventTime: string
  venue: string
  theme?: string
  colorMotif?: string
  celebrantName?: string
  celebrantAge?: number
  celebrantGender?: string
  groomName?: string
  brideName?: string
  mainCourses: string[]
  pasta: string
  dessert: string
  beverage: string
  additionalEventInfo?: string
  additionalRequests?: string
  backdropStyle?: string
  backdropPrice?: number
}

// Helper function to generate tasting token
function generateTastingToken(): string {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9)
}

// Helper function to calculate proposed tasting date (3 days before event)
function calculateTastingDate(eventDate: string): { date: string; time: string } {
  const event = new Date(eventDate)
  const now = new Date()

  // Calculate 7 days before the event
  const sevenDaysBeforeEvent = new Date(event)
  sevenDaysBeforeEvent.setDate(event.getDate() - 7)

  // If 7 days before event is in the past or too soon, use 7 days from now
  const sevenDaysFromNow = new Date()
  sevenDaysFromNow.setDate(now.getDate() + 7)

  // Use whichever is later (but ensure it's before the event)
  let proposedDate = sevenDaysBeforeEvent > sevenDaysFromNow ? sevenDaysBeforeEvent : sevenDaysFromNow

  // Ensure the tasting date is before the event date
  if (proposedDate >= event) {
    // If the calculated date is on or after the event, set it to 1 day before the event
    proposedDate = new Date(event)
    proposedDate.setDate(event.getDate() - 1)

    // If that's still in the past, use tomorrow
    if (proposedDate <= now) {
      proposedDate = new Date(now)
      proposedDate.setDate(now.getDate() + 1)
    }
  }

  return {
    date: proposedDate.toISOString().split("T")[0],
    time: "10:00 AM", // Default tasting time
  }
}

// Enhanced pricing calculation with wedding package support
function calculateFallbackPricing(
  guestCount: number,
  mainCourses: string[],
  pasta: string,
  dessert: string,
  beverage: string,
  eventType?: string,
) {
  console.log("Using fallback pricing calculation...")

  // Wedding package pricing - FIXED PRICES
  if (eventType === "wedding") {
    const weddingPackages: { [key: string]: number } = {
      "50": 56500,
      "100": 63000,
      "150": 74500,
      "200": 86000,
      "300": 109000,
    }

    const packagePrice = weddingPackages[guestCount.toString()] || 0
    const downPayment = Math.round(packagePrice * 0.5)

    return {
      totalAmount: packagePrice,
      downPayment,
      remainingBalance: packagePrice - downPayment,
      serviceFee: packagePrice, // For wedding, the package price is the service fee
      mainCoursesTotal: 0, // Included in package
      pastaTotal: 0,
      dessertTotal: 0,
      beverageTotal: 0,
      isWeddingPackage: true,
      weddingPackagePrice: packagePrice,
    }
  }

  // Regular event pricing
  const basePerGuest = 150 // ₱150 per guest as base

  // Calculate additional costs based on selections
  let additionalCost = 0

  // Main courses (assume ₱50 per guest per additional course beyond 1)
  if (mainCourses && mainCourses.length > 1) {
    additionalCost += (mainCourses.length - 1) * 50 * guestCount
  }

  // Service fee based on guest count
  const serviceFees: { [key: string]: number } = {
    "50": 11500,
    "80": 10400,
    "100": 11000,
    "150": 16500,
    "200": 22000,
  }

  const serviceFee = serviceFees[guestCount.toString()] || 0
  const totalAmount = basePerGuest * guestCount + additionalCost + serviceFee
  const downPayment = Math.round(totalAmount * 0.5)

  return {
    totalAmount,
    downPayment,
    remainingBalance: totalAmount - downPayment,
    serviceFee,
    mainCoursesTotal: basePerGuest * guestCount,
    pastaTotal: 0,
    dessertTotal: 0,
    beverageTotal: 0,
  }
}

export async function POST(request: NextRequest) {
  console.log("=== API POST /api/book-appointment: START ===")

  try {
    console.log("Step 1: Checking authentication...")
    const cookieStore = await cookies()
    const sessionId = cookieStore.get("session-id")?.value

    console.log("Session ID from cookies:", sessionId ? "Present" : "Missing")

    if (!sessionId) {
      const errorResponse = { success: false, error: "Not authenticated: No session ID found.", requiresAuth: true }
      console.error("API POST /api/book-appointment: " + errorResponse.error)
      return NextResponse.json(errorResponse, { status: 401 })
    }

    console.log("Step 2: Fetching session from database...")
    // Get session with user using the same pattern as other API routes
    const { data: session, error: sessionError } = await supabaseAdmin
      .from("tbl_sessions")
      .select(`
        *,
        tbl_users (id, email, first_name, last_name, full_name, role, is_verified, phone)
      `)
      .eq("id", sessionId)
      .gt("expires_at", new Date().toISOString())
      .single()

    if (sessionError || !session) {
      console.error("Session lookup error:", sessionError?.message)
      return NextResponse.json(
        { success: false, error: "Session expired. Please log in again.", sessionExpired: true },
        { status: 401 },
      )
    }

    const user = session.tbl_users
    if (!user) {
      console.error("User not found for session")
      return NextResponse.json(
        { success: false, error: "User not found. Please log in again.", sessionExpired: true },
        { status: 401 },
      )
    }

    console.log("User found:", user.email)

    console.log("Step 3: Parsing request data...")
    const rawAppointmentData = await request.json()
    console.log("Raw appointment data received:", JSON.stringify(rawAppointmentData, null, 2))

    // --- Data Transformation and Validation ---
    const {
      firstName,
      lastName,
      email,
      phone,
      eventType,
      guestCount,
      eventDate,
      eventTime, // This is the descriptive string like "Breakfast (6AM - 10AM)"
      venue,
      theme,
      colorMotif,
      celebrantName,
      celebrantAge,
      celebrantGender,
      debutanteGender,
      groomName,
      brideName,
      additionalEventInfo,
      mainCourses, // Array of strings
      pasta,
      dessert,
      beverage,
      additionalRequests,
      backdropStyle,
      backdropPrice,
    } = rawAppointmentData

    console.log("Step 4: Validating required fields...")
    // Basic validation
    if (
      !firstName ||
      !lastName ||
      !email ||
      !phone ||
      !eventType ||
      !guestCount ||
      !eventDate ||
      !eventTime ||
      !venue
    ) {
      console.error("Missing required fields in appointment data.")
      return NextResponse.json({ success: false, error: "Missing required fields." }, { status: 400 })
    }

    console.log("Step 5: Calculating package pricing...")
    // Calculate pricing with fallback - PASS eventType for wedding package pricing
    let pricingBreakdown
    try {
      // Try to use the pricing calculator
      const { calculatePackagePricing } = await import("@/lib/pricing-calculator")

      const menuSelections = {
        mainCourses: mainCourses || [],
        pasta: pasta || "",
        dessert: dessert || "",
        beverage: beverage || "",
      }

      console.log("Using pricing calculator with menu selections:", menuSelections)
      console.log("Event type for pricing:", eventType)

      // IMPORTANT: Pass eventType to get correct wedding package pricing
      pricingBreakdown = await calculatePackagePricing(Number(guestCount), menuSelections, eventType)
      console.log("Pricing calculator result:", pricingBreakdown)
    } catch (pricingError) {
      console.error("Pricing calculator failed, using fallback:", pricingError)
      // IMPORTANT: Pass eventType to fallback pricing too
      pricingBreakdown = calculateFallbackPricing(
        Number(guestCount),
        mainCourses || [],
        pasta || "",
        dessert || "",
        beverage || "",
        eventType, // Pass eventType here
      )
      console.log("Fallback pricing result:", pricingBreakdown)
    }

    // For wedding events, don't add backdrop price as it's included in the package
    let totalWithBackdrop = pricingBreakdown.totalAmount
    if (eventType !== "wedding" && backdropPrice && backdropPrice > 0) {
      totalWithBackdrop += backdropPrice
    }

    const finalDownPayment = Math.round(totalWithBackdrop * 0.5)

    console.log("Step 6: Preparing appointment data...")
    // Transform mainCourses from string[] to { name: string, category: string }[]
    const transformedMainCourses = (mainCourses || []).map((courseName: string) => {
      return { name: courseName, category: "main_course" }
    })

    // Construct selected_menu JSONB
    const selectedMenu = {
      main_courses: transformedMainCourses,
      pasta: pasta || "",
      dessert: dessert || "",
      beverage: beverage || "",
    }

    // Prepare data for Supabase insertion - use 'standard' as booking_source
    const appointmentDataForDb = {
      user_id: user.id,
      contact_first_name: firstName,
      contact_last_name: lastName,
      contact_email: email,
      contact_phone: phone,
      event_date: eventDate,
      event_time: eventTime,
      time_slot: eventTime,
      event_type: eventType,
      guest_count: Number(guestCount),
      venue_address: venue,
      theme: theme || null,
      color_motif: colorMotif || null,
      celebrant_name: celebrantName || null,
      celebrant_age: celebrantAge && !isNaN(Number(celebrantAge)) ? Number(celebrantAge) : null,
      celebrant_gender: celebrantGender || null,
      debutante_name: eventType === "debut" ? celebrantName : null,
      debutante_gender: debutanteGender || null,
      groom_name: groomName || null,
      bride_name: brideName || null,
      additional_event_info: additionalEventInfo || null,
      main_courses: transformedMainCourses,
      pasta_selection: pasta || null,
      beverage_selection: beverage || null,
      dessert_selection: dessert || null,
      selected_menu: selectedMenu,
      special_requests: additionalRequests || null,
      status: "PENDING_TASTING_CONFIRMATION",
      budget_min: totalWithBackdrop,
      budget_max: totalWithBackdrop,
      total_package_amount: totalWithBackdrop, // This should match what's shown in booking form
      down_payment_amount: finalDownPayment,
      remaining_balance: totalWithBackdrop - finalDownPayment,
      payment_status: "unpaid",
      booking_source: "standard",
      backdrop_style: eventType === "wedding" ? null : backdropStyle || null, // Wedding includes backdrop
      backdrop_price: eventType === "wedding" ? null : backdropPrice || null, // Wedding includes backdrop
    }

    console.log("Step 7: Inserting appointment into database...")
    console.log("Inserting appointment data into Supabase:", JSON.stringify(appointmentDataForDb, null, 2))

    const { data: appointment, error: insertError } = await supabaseAdmin
      .from("tbl_comprehensive_appointments")
      .insert(appointmentDataForDb)
      .select()
      .single()

    if (insertError) {
      console.error("Supabase insert error:", insertError)
      return NextResponse.json(
        {
          success: false,
          error: "Failed to create appointment",
          details: insertError.message,
          suggestion: "Please try again or contact support if the issue persists.",
        },
        { status: 500 },
      )
    }

    console.log(`Step 8: Appointment created successfully with ID: ${appointment.id}`)

    console.log("Step 9: Creating tasting appointment...")
    // --- Create Tasting Appointment ---
    const tastingDetails = calculateTastingDate(eventDate)
    const tastingToken = generateTastingToken()

    console.log("Generated tasting details:", {
      eventDate: eventDate,
      calculatedTastingDate: tastingDetails.date,
      tastingTime: tastingDetails.time,
      token: tastingToken,
    })

    const tastingDataForDb = {
      appointment_id: appointment.id,
      proposed_date: tastingDetails.date,
      proposed_time: tastingDetails.time,
      status: "pending",
      tasting_token: tastingToken,
    }

    console.log("Inserting tasting appointment data into Supabase:", JSON.stringify(tastingDataForDb, null, 2))

    const { data: tastingRecord, error: tastingError } = await supabaseAdmin
      .from("tbl_food_tastings")
      .insert(tastingDataForDb)
      .select()
      .single()

    if (tastingError) {
      console.error("Supabase insert error for tasting appointment:", tastingError)
      // Don't fail the entire request if tasting creation fails
      console.warn("Tasting appointment could not be created, but main appointment was successful.")
    } else {
      console.log(`Step 10: Tasting appointment created with ID: ${tastingRecord.id}`)
    }

    console.log("Step 11: Sending tasting confirmation email...")
    console.log(`Sending email to: ${email} (user's registered email)`)

    // Send tasting confirmation email to the user's registered email
    try {
      const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || "https://jo-acms-git-main-nickoclarkson0624-gmailcoms-projects.vercel.app").replace(/\/+$/, "")
      const confirmationUrl = `${baseUrl}/tasting/confirm?token=${tastingToken}&email=${encodeURIComponent(email)}`

      const emailContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #e11d48;">🎉 Appointment Confirmed!</h2>
          
          <p>Dear ${firstName},</p>
          
          <p>Thank you for booking with <strong>Jo Pacheco Wedding & Events</strong>!</p>
          
          <div style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 16px; margin: 20px 0;">
            <h3 style="color: #dc2626; margin-top: 0;">📅 Food Tasting Appointment</h3>
            <p><strong>Date:</strong> ${tastingDetails.date}</p>
            <p><strong>Time:</strong> ${tastingDetails.time}</p>
            <p><strong>Location:</strong> Jo Pacheco Wedding & Events Office</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${confirmationUrl}" 
               style="background-color: #e11d48; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
              ✅ Confirm This Date
            </a>
          </div>
          
          <div style="background-color: #f3f4f6; border-radius: 8px; padding: 16px; margin: 20px 0;">
            <h4 style="margin-top: 0;">Event Details:</h4>
            <p><strong>Event Type:</strong> ${eventType}</p>
            <p><strong>Guest Count:</strong> ${guestCount}</p>
            <p><strong>Event Date:</strong> ${eventDate}</p>
            <p><strong>Venue:</strong> ${venue}</p>
            ${eventType === "wedding" ? `<p><strong>Wedding Package:</strong> Includes backdrop styling</p>` : backdropStyle ? `<p><strong>Backdrop Style:</strong> ${backdropStyle.replace(/_/g, " ")}</p>` : ""}
            <p><strong>Total Package Amount:</strong> ₱${totalWithBackdrop.toLocaleString()}</p>
            <p><strong>Down Payment Required:</strong> ₱${finalDownPayment.toLocaleString()}</p>
          </div>
          
          <p><strong>Important:</strong> Please click the "Confirm This Date" button above to secure your tasting appointment slot.</p>
          
          <p>If you have any questions, feel free to contact us.</p>
          
          <p>Best regards,<br>Jo Pacheco Wedding & Events Team</p>
        </div>
      `

      await sendEmail({
        to: email, // Send to the user's email from the booking form
        subject: `Confirm Your Food Tasting - ${eventType} on ${new Date(eventDate).toLocaleDateString()}`,
        html: emailContent,
      })

      console.log("✅ Tasting confirmation email sent successfully to:", email)
    } catch (emailError) {
      console.error("❌ Error sending tasting confirmation email:", emailError)
    }

    console.log("Step 12: Returning success response...")
    const successResponse = {
      success: true,
      appointmentId: appointment.id,
      message: "Appointment created successfully! Please check your email to confirm your food tasting date.",
      data: {
        ...appointment,
        tastingDate: tastingDetails.date,
        tastingTime: tastingDetails.time,
        emailSent: true, // Indicate that email was attempted
        pricingBreakdown: pricingBreakdown, // Include pricing details in response
      },
    }

    console.log("=== API POST /api/book-appointment: SUCCESS ===")
    return NextResponse.json(successResponse)
  } catch (error: any) {
    console.error("=== API POST /api/book-appointment: ERROR ===")
    console.error("Error creating appointment:", error)
    console.error("Error stack:", error.stack)

    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        details: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}
