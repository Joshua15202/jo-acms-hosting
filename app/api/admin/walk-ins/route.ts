import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { supabaseAdmin } from "@/lib/supabase"
import { sendEmail } from "@/lib/email"
import { createAdminNotification } from "@/lib/admin-notifications"

function generateTastingToken(): string {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9)
}

function calculateTastingDate(eventDate: string): { date: string; time: string } {
  const event = new Date(eventDate)
  const now = new Date()

  const threeDaysBeforeEvent = new Date(event)
  threeDaysBeforeEvent.setDate(event.getDate() - 3)

  const threeDaysFromNow = new Date()
  threeDaysFromNow.setDate(now.getDate() + 3)

  let proposedDate = threeDaysBeforeEvent > threeDaysFromNow ? threeDaysBeforeEvent : threeDaysFromNow

  if (proposedDate >= event) {
    proposedDate = new Date(event)
    proposedDate.setDate(event.getDate() - 1)

    if (proposedDate <= now) {
      proposedDate = new Date(now)
      proposedDate.setDate(now.getDate() + 1)
    }
  }

  return {
    date: proposedDate.toISOString().split("T")[0],
    time: "10:00 AM",
  }
}

function generateAdminWalkInTastingEmailHTML(
  firstName: string,
  eventType: string,
  eventDate: string,
  proposedTastingDate: string,
  proposedTastingTime: string,
  tastingToken: string,
  totalPackageAmount: number,
  downPayment: number,
): string {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
  const confirmUrl = `${baseUrl}/api/tasting/confirm?token=${tastingToken}&action=confirm`

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
      <div style="background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        <div style="background: linear-gradient(135deg, #e11d48 0%, #be185d 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">🎉 Appointment Confirmed!</h1>
          <p style="color: rgba(255, 255, 255, 0.9); margin: 5px 0 0 0; font-size: 16px;">Jo Pacheco Wedding & Events</p>
        </div>
        
        <div style="padding: 40px 30px;">
          <p style="color: #1f2937; margin: 0 0 20px 0; font-size: 16px;">Dear ${firstName},</p>
          
          <p style="color: #6b7280; margin: 0 0 30px 0; font-size: 16px; line-height: 1.5;">
            Thank you for booking with Jo Pacheco Wedding & Events! We're excited to cater your ${eventType} on ${new Date(eventDate).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}.
          </p>
          
          <div style="background: #fef2f2; border: 2px solid #fecaca; border-radius: 12px; padding: 30px; text-align: center; margin: 30px 0;">
            <h3 style="color: #dc2626; margin: 0 0 15px 0; font-size: 20px;">📅 Food Tasting Appointment</h3>
            <p style="color: #991b1b; margin: 0 0 20px 0; font-size: 16px;">
              We've scheduled your tasting session for:
            </p>
            <div style="background: white; border-radius: 8px; padding: 20px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); margin-bottom: 20px;">
              <div style="color: #e11d48; font-size: 24px; font-weight: bold; margin-bottom: 5px;">
                ${new Date(proposedTastingDate).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
              </div>
              <div style="color: #6b7280; font-size: 18px;">
                ${proposedTastingTime}
              </div>
              <div style="color: #9ca3af; font-size: 14px; margin-top: 10px;">
                Jo Pacheco Wedding & Events Office
              </div>
            </div>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${confirmUrl}" 
               style="display: inline-block; background: #10b981; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
              ✅ Confirm This Date
            </a>
          </div>
          
          <div style="background: #f3f4f6; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h4 style="margin-top: 0; color: #374151;">Event Details:</h4>
            <p style="margin: 5px 0;"><strong>Event Type:</strong> ${eventType}</p>
            <p style="margin: 5px 0;"><strong>Event Date:</strong> ${new Date(eventDate).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>
            <p style="margin: 5px 0;"><strong>Total Package Amount:</strong> ₱${totalPackageAmount.toLocaleString()}</p>
            <p style="margin: 5px 0;"><strong>Down Payment Required:</strong> ₱${downPayment.toLocaleString()}</p>
          </div>
          
          <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; margin: 20px 0; border-radius: 4px;">
            <h4 style="color: #92400e; margin: 0 0 10px 0; font-size: 16px;">What to Expect at Your Tasting:</h4>
            <ul style="color: #92400e; margin: 0; padding-left: 20px; font-size: 14px; line-height: 1.6;">
              <li>Sample portions of your selected menu items</li>
              <li>Opportunity to make adjustments to your menu</li>
              <li>Discussion of final event details</li>
              <li>Finalization of your catering package</li>
            </ul>
          </div>
          
          <p style="color: #6b7280; font-size: 14px; line-height: 1.6; text-align: center; margin: 20px 0;">
            <strong>Important:</strong> Please click the "Confirm This Date" button above to secure your tasting appointment slot.
          </p>
        </div>
        
        <div style="background: #f9fafb; padding: 25px 30px; border-top: 1px solid #e5e7eb;">
          <div style="text-align: center;">
            <h3 style="color: #e11d48; margin: 0 0 10px 0; font-size: 18px;">Contact Us</h3>
            <p style="color: #6b7280; margin: 0; font-size: 14px; line-height: 1.6;">
              📍 Sullera St. Pandayan, Bulacan<br>
              📞 Phone: (044) 308 3396<br>
              📱 Mobile: 0917-8543221
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #9ca3af; font-size: 12px; margin: 0;">
              © 2025 Jo Pacheco Wedding & Events. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  `
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies()
    const allCookies = cookieStore.getAll()
    const adminAuthenticated = cookieStore.get("adminAuthenticated")?.value
    const adminUserCookie = cookieStore.get("adminUser")?.value

    console.log("[v0] Admin walk-ins API - All cookies:", allCookies.map(c => ({ name: c.name, value: c.value.substring(0, 20) })))
    console.log("[v0] Admin walk-ins API - adminAuthenticated:", adminAuthenticated)
    console.log("[v0] Admin walk-ins API - Has adminUser:", !!adminUserCookie)
    console.log("[v0] Admin walk-ins API - Request headers:", {
      host: request.headers.get("host"),
      origin: request.headers.get("origin"),
      cookie: request.headers.get("cookie")?.substring(0, 50),
    })

    if (adminAuthenticated !== "true" || !adminUserCookie) {
      console.error("[v0] Admin walk-ins API - Authorization failed. adminAuthenticated:", adminAuthenticated, "hasAdminUser:", !!adminUserCookie)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log("[v0] Admin walk-ins API - Authorization successful")

    const body = await request.json()
    const {
      firstName,
      lastName,
      email,
      phone,
      eventDate,
      eventTime,
      eventType,
      celebrantName,
      celebrantAge,
      celebrantGender,
      groomName,
      brideName,
      debutanteName,
      debutanteGender,
      eventDetails: eventDetailsStr,
      guestCount,
      venueName,
      venueProvince,
      venueCity,
      venueBarangay,
      streetAddress,
      postalCode,
      eventTheme,
      colorMotif,
      selectedMenus,
      backdropOption,
      additionalRequests,
      includeTasting,
      pricingData,
    } = body

    console.log("[v0] Walk-in data received:", {
      firstName,
      lastName,
      email,
      eventType,
      includeTasting,
    })

    const venueAddress = [venueName, streetAddress, venueBarangay, venueCity, venueProvince, postalCode]
      .filter(Boolean)
      .join(", ")

    const mainCourses = [...(selectedMenus.menu1 || []), ...(selectedMenus.menu2 || []), ...(selectedMenus.menu3 || [])]

    const { data: menuItemsData } = await supabaseAdmin
      .from("tbl_menu_items")
      .select("id, name, category")
      .in("id", [
        ...mainCourses,
        ...(selectedMenus.pasta || []),
        ...(selectedMenus.dessert || []),
        ...(selectedMenus.beverage || []),
      ])

    const menuItemsMap = new Map((menuItemsData || []).map((item) => [item.id, item]))

    let totalPackageAmount = 0
    const guestCountNum = Number.parseInt(guestCount) || 0

    // Menu selections total
    selectedMenus.menu1?.forEach(() => {
      totalPackageAmount += 70 * guestCountNum
    })
    selectedMenus.menu2?.forEach(() => {
      totalPackageAmount += 60 * guestCountNum
    })
    selectedMenus.menu3?.forEach(() => {
      totalPackageAmount += 50 * guestCountNum
    })
    selectedMenus.pasta?.forEach(() => {
      totalPackageAmount += 40 * guestCountNum
    })
    selectedMenus.dessert?.forEach(() => {
      totalPackageAmount += 25 * guestCountNum
    })
    selectedMenus.beverage?.forEach(() => {
      totalPackageAmount += 25 * guestCountNum
    })

    // Service fee
    if (eventType === "debut") {
      if (guestCountNum === 50) totalPackageAmount += 21500
      else if (guestCountNum === 80) totalPackageAmount += 26400
      else if (guestCountNum === 100) totalPackageAmount += 28000
      else if (guestCountNum === 150) totalPackageAmount += 36500
      else if (guestCountNum === 200) totalPackageAmount += 36000
    } else if (eventType === "wedding") {
      if (guestCountNum === 50) totalPackageAmount += 56500
      else if (guestCountNum === 100) totalPackageAmount += 63000
      else if (guestCountNum === 150) totalPackageAmount += 74500
      else if (guestCountNum === 200) totalPackageAmount += 86000
      else if (guestCountNum === 300) totalPackageAmount += 109000
    } else {
      if (guestCountNum === 50) totalPackageAmount += 11500
      else if (guestCountNum === 80) totalPackageAmount += 10400
      else if (guestCountNum === 100) totalPackageAmount += 11000
      else if (guestCountNum === 150) totalPackageAmount += 16500
      else if (guestCountNum === 200) totalPackageAmount += 22000
    }

    // Backdrop styling for birthday
    if (eventType === "birthday" && backdropOption) {
      if (backdropOption === "single") totalPackageAmount += 7000
      else if (backdropOption === "double") totalPackageAmount += 8000
      else if (backdropOption === "triple") totalPackageAmount += 10000
    }

    const downPayment = Math.round(totalPackageAmount * 0.5)

    const appointmentStatus = includeTasting ? "PENDING_TASTING_CONFIRMATION" : "pending"

    const { data, error } = await supabaseAdmin
      .from("tbl_comprehensive_appointments")
      .insert({
        contact_first_name: firstName,
        contact_last_name: lastName,
        contact_email: email,
        contact_phone: phone,
        event_date: eventDate,
        event_time: eventTime,
        time_slot: eventTime,
        event_type: eventType,
        guest_count: guestCountNum,
        venue_address: venueAddress,
        theme: eventTheme || null,
        color_motif: colorMotif || null,
        celebrant_name: celebrantName || null,
        celebrant_age: celebrantAge ? Number.parseInt(celebrantAge) : null,
        celebrant_gender: celebrantGender || null,
        debutante_name: debutanteName || null,
        debutante_gender: debutanteGender || null,
        groom_name: groomName || null,
        bride_name: brideName || null,
        additional_event_info: eventDetailsStr || null,
        main_courses: mainCourses.map((id) => {
          const menuItem = menuItemsMap.get(id)
          return { name: menuItem?.name || id, category: "main_course" }
        }),
        pasta_selection: selectedMenus.pasta?.[0]
          ? menuItemsMap.get(selectedMenus.pasta[0])?.name || selectedMenus.pasta[0]
          : null,
        dessert_selection: selectedMenus.dessert?.[0]
          ? menuItemsMap.get(selectedMenus.dessert[0])?.name || selectedMenus.dessert[0]
          : null,
        beverage_selection: selectedMenus.beverage?.[0]
          ? menuItemsMap.get(selectedMenus.beverage[0])?.name || selectedMenus.beverage[0]
          : null,
        backdrop_style: backdropOption || null,
        special_requests: additionalRequests || null,
        status: appointmentStatus,
        total_package_amount: totalPackageAmount,
        down_payment_amount: downPayment,
        remaining_balance: totalPackageAmount - downPayment,
        payment_status: "unpaid",
        booking_source: "admin",
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating walk-in appointment:", error)
      return NextResponse.json({ error: "Failed to create walk-in appointment" }, { status: 500 })
    }

    console.log("[v0] Walk-in appointment created:", data.id)

    await createAdminNotification({
      appointmentId: data.id,
      title: "New Walk-In Appointment",
      message: `Walk-in ${eventType} appointment created by admin
Customer: ${firstName} ${lastName}
Email: ${email}
Phone: ${phone}
Event Date: ${new Date(eventDate).toLocaleDateString()}
Guests: ${guestCount}
Total: ₱${totalPackageAmount.toLocaleString()}
${includeTasting ? "Food tasting scheduled" : "Direct to payment"}`,
      type: "new_appointment",
    })

    if (includeTasting) {
      console.log("[v0] Creating tasting appointment for walk-in...")

      const tastingDetails = calculateTastingDate(eventDate)
      const tastingToken = generateTastingToken()

      const { data: tastingRecord, error: tastingError } = await supabaseAdmin
        .from("tbl_food_tastings")
        .insert({
          appointment_id: data.id,
          proposed_date: tastingDetails.date,
          proposed_time: tastingDetails.time,
          status: "pending",
          tasting_token: tastingToken,
        })
        .select()
        .single()

      if (tastingError) {
        console.error("[v0] Error creating tasting appointment:", tastingError)
      } else {
        console.log("[v0] Tasting appointment created:", tastingRecord.id)

        try {
          const emailHTML = generateAdminWalkInTastingEmailHTML(
            firstName,
            eventType,
            eventDate,
            tastingDetails.date,
            tastingDetails.time,
            tastingToken,
            totalPackageAmount,
            downPayment,
          )

          await sendEmail({
            to: email,
            subject: `Confirm Your Food Tasting - ${eventType} on ${new Date(eventDate).toLocaleDateString()}`,
            html: emailHTML,
          })

          console.log("[v0] Tasting confirmation email sent to:", email)
        } catch (emailError) {
          console.error("[v0] Error sending tasting email:", emailError)
        }
      }
    } else {
      console.log("[v0] Creating payment transaction for walk-in (skip to payment)...")

      try {
        // Generate a unique payment reference
        const paymentReference = `${Date.now()}${Math.floor(Math.random() * 10000)}`

        // Insert payment transaction as unpaid - admin will record actual payment later
        const { data: paymentData, error: paymentError } = await supabaseAdmin
          .from("tbl_payment_transactions")
          .insert({
            appointment_id: data.id,
            amount: downPayment,
            payment_type: "down_payment",
            payment_method: null, // Will be filled when admin records payment
            payment_status: "pending",
            reference_number: paymentReference,
            admin_notes: "Walk-in customer - awaiting payment processing",
          })
          .select()
          .single()

        if (paymentError) {
          console.error("[v0] Error creating payment transaction:", paymentError)
        } else {
          console.log("[v0] Payment transaction created:", paymentData.id)
        }
      } catch (paymentCreationError) {
        console.error("[v0] Error in payment creation:", paymentCreationError)
      }
    }

    return NextResponse.json({ success: true, appointment: data }, { status: 201 })
  } catch (error) {
    console.error("Error in walk-ins API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
