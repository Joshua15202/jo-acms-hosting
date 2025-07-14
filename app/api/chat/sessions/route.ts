import { type NextRequest, NextResponse } from "next/server"
import { MySQLChatService } from "@/lib/mysql-chat"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    const sessions = await MySQLChatService.getChatSessions(userId)
    return NextResponse.json({ sessions })
  } catch (error) {
    console.error("Error fetching chat sessions:", error)
    return NextResponse.json({ error: "Failed to fetch chat sessions" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, title } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    const session = await MySQLChatService.createChatSession(userId, title)
    return NextResponse.json({ session })
  } catch (error) {
    console.error("Error creating chat session:", error)
    return NextResponse.json({ error: "Failed to create chat session" }, { status: 500 })
  }
}
