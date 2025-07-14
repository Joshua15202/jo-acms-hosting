import { type NextRequest, NextResponse } from "next/server"
import { MySQLChatService } from "@/lib/mysql-chat"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get("sessionId")

    if (!sessionId) {
      return NextResponse.json({ error: "Session ID is required" }, { status: 400 })
    }

    const messages = await MySQLChatService.getMessages(sessionId)
    return NextResponse.json({ messages })
  } catch (error) {
    console.error("Error fetching messages:", error)
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { sessionId, userId, content, role } = await request.json()

    if (!sessionId || !userId || !content || !role) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const message = await MySQLChatService.saveMessage(sessionId, userId, content, role)
    return NextResponse.json({ message })
  } catch (error) {
    console.error("Error saving message:", error)
    return NextResponse.json({ error: "Failed to save message" }, { status: 500 })
  }
}
