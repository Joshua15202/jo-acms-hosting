import { type NextRequest, NextResponse } from "next/server"
import { MySQLChatService } from "@/lib/mysql-chat"

export async function DELETE(request: NextRequest, { params }: { params: { sessionId: string } }) {
  try {
    const { sessionId } = params

    const success = await MySQLChatService.deleteSession(sessionId)
    return NextResponse.json({ success })
  } catch (error) {
    console.error("Error deleting chat session:", error)
    return NextResponse.json({ error: "Failed to delete chat session" }, { status: 500 })
  }
}
