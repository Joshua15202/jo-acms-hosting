import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Call our menu items API
    const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/menu-items`)
    const data = await response.json()

    console.log("Menu API Response:", JSON.stringify(data, null, 2))

    return NextResponse.json({
      success: true,
      debug: {
        apiResponse: data,
        menuItemsKeys: data.menuItems ? Object.keys(data.menuItems) : [],
        beefItems: data.menuItems?.beef || [],
        beefCount: data.menuItems?.beef?.length || 0,
      },
    })
  } catch (error) {
    console.error("Debug menu error:", error)
    return NextResponse.json({
      success: false,
      error: error.message,
    })
  }
}
