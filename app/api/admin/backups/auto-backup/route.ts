import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { enabled } = await request.json()

    console.log("[v0] Auto-backup setting updated:", enabled)

    // In a production environment, you would configure a cron job here
    // For example, using Vercel Cron Jobs in vercel.json:
    // {
    //   "crons": [{
    //     "path": "/api/admin/backups/create",
    //     "schedule": "0 0 * * *"
    //   }]
    // }

    return NextResponse.json({
      success: true,
      message: enabled ? "Auto-backup enabled" : "Auto-backup disabled",
    })
  } catch (error) {
    console.error("[v0] Error updating auto-backup:", error)
    return NextResponse.json({ error: "Failed to update auto-backup setting" }, { status: 500 })
  }
}
