import { NextResponse } from "next/server"
import { del } from "@vercel/blob"

export async function DELETE(request: Request) {
  try {
    const { backupUrl } = await request.json()

    if (!backupUrl) {
      return NextResponse.json({ error: "Backup URL is required" }, { status: 400 })
    }

    // Delete the backup file from Vercel Blob
    await del(backupUrl)

    return NextResponse.json({ success: true, message: "Backup deleted successfully" })
  } catch (error) {
    console.error("Error deleting backup:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete backup" },
      { status: 500 },
    )
  }
}
