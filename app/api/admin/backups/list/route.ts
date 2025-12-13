import { NextResponse } from "next/server"
import { list } from "@vercel/blob"

export async function GET() {
  try {
    const { blobs } = await list({
      prefix: "backup-",
    })

    const backups = blobs
      .filter((blob) => blob.pathname.endsWith(".json"))
      .map((blob) => ({
        name: blob.pathname,
        url: blob.url,
        size: blob.size,
        createdAt: blob.uploadedAt,
      }))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    return NextResponse.json({ backups })
  } catch (error) {
    console.error("[v0] Error listing backups:", error)
    return NextResponse.json({ error: "Failed to list backups" }, { status: 500 })
  }
}
