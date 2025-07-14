import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"
import { randomUUID } from "crypto"

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  try {
    const { email, eventType = "Wedding", eventDate } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    // Generate tasting token
    const tastingToken = randomUUID()

    // Calculate proposed tasting date (7 days from now if no event date provided)
    const proposedDate = eventDate
      ? new Date(new Date(eventDate).getTime() - 7 * 24 * 60 * 60 * 1000)
      : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

    // Create test tasting record
    const { data: tastingData, error: tastingError } = await supabaseAdmin
      .from("tbl_food_tastings")
      .insert({
        tasting_token: tastingToken,
        proposed_date: proposedDate.toISOString().split("T")[0],
        proposed_time: "2:00 PM",
        status: "pending",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()

    if (tastingError) {
      console.error("❌ Failed to create test tasting:", tastingError)
      return NextResponse.json({ error: "Failed to create test tasting", details: tastingError }, { status: 500 })
    }

    console.log("✅ Test tasting created:", tastingData)

    return NextResponse.json({
      success: true,
      message: "Test tasting record created successfully",
      tasting: tastingData[0],
      confirmationUrl: `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/tasting/confirm?token=${tastingToken}&action=confirm&email=${encodeURIComponent(email)}`,
    })
  } catch (error) {
    console.error("❌ Error creating test tasting:", error)
    return NextResponse.json(
      {
        error: "Failed to create test tasting",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
