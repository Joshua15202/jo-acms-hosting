import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { supabaseAdmin } from "@/lib/supabase"

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies()
    const adminAuthenticated = cookieStore.get("adminAuthenticated")?.value

    if (adminAuthenticated !== "true") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const {
      firstName,
      lastName,
      email,
      phone,
      eventDate,
      timeSlot,
      eventType,
      celebrantName,
      celebrantAge,
      celebrantGender,
      groomName,
      brideName,
      backdropStyle,
      additionalEventInfo,
    } = body

    const { data, error } = await supabaseAdmin
      .from("tbl_comprehensive_appointments")
      .insert({
        contact_full_name: `${firstName} ${lastName}`,
        contact_email: email,
        contact_phone: phone,
        event_date: eventDate,
        event_time: timeSlot,
        event_type: eventType,
        celebrant_name: celebrantName || null,
        celebrant_age: celebrantAge ? Number.parseInt(celebrantAge) : null,
        celebrant_gender: celebrantGender || null,
        groom_name: groomName || null,
        bride_name: brideName || null,
        backdrop_style: backdropStyle || null,
        additional_event_info: additionalEventInfo || null,
        status: "pending",
        is_walk_in: true,
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating walk-in appointment:", error)
      return NextResponse.json({ error: "Failed to create walk-in appointment" }, { status: 500 })
    }

    return NextResponse.json({ success: true, appointment: data }, { status: 201 })
  } catch (error) {
    console.error("Error in walk-ins API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
