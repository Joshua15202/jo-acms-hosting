import { type NextRequest, NextResponse } from "next/server"
import { put } from "@vercel/blob"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Validate file type (images and videos)
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp", "video/mp4", "video/quicktime", "video/webm"]
    if (!validTypes.includes(file.type)) {
      return NextResponse.json({ error: "Invalid file type. Only images and videos are allowed." }, { status: 400 })
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: "File size exceeds 10MB limit" }, { status: 400 })
    }

    console.log("[v0] Uploading file:", file.name, file.type, file.size)

    // Upload to Vercel Blob
    const blob = await put(file.name, file, {
      access: "public",
    })

    console.log("[v0] File uploaded successfully:", blob.url)

    return NextResponse.json({ url: blob.url, success: true })
  } catch (error) {
    console.error("[v0] Upload error:", error)
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 })
  }
}
