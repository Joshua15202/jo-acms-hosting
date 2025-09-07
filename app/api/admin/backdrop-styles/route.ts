import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET() {
  try {
    const { data: backdropStyles, error } = await supabase
      .from("tbl_backdrop_styles")
      .select("*")
      .order("price", { ascending: true })

    if (error) {
      console.error("Error fetching backdrop styles:", error)
      return NextResponse.json(
        { success: false, message: "Failed to fetch backdrop styles", error: error.message },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      backdropStyles: backdropStyles || [],
      message: "Backdrop styles fetched successfully",
    })
  } catch (error) {
    console.error("Error in backdrop styles API:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { style_name, description, price, inclusions, image_url } = body

    if (!style_name || !price) {
      return NextResponse.json({ success: false, message: "Name and price are required" }, { status: 400 })
    }

    const { data: newBackdropStyle, error } = await supabase
      .from("tbl_backdrop_styles")
      .insert([
        {
          style_name,
          description,
          price: Number.parseFloat(price),
          inclusions: inclusions || [],
          image_url,
        },
      ])
      .select()
      .single()

    if (error) {
      console.error("Error creating backdrop style:", error)
      return NextResponse.json(
        { success: false, message: "Failed to create backdrop style", error: error.message },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      backdropStyle: newBackdropStyle,
      message: "Backdrop style created successfully",
    })
  } catch (error) {
    console.error("Error in backdrop styles POST API:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}
