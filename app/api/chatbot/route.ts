import { NextResponse } from "next/server"
import { generateChatbotResponse } from "@/lib/chatbot-prompt"

export async function POST(request: Request) {
  try {
    const { message, history } = await request.json()

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 })
    }

    const response = await generateChatbotResponse(message, history || [])

    return NextResponse.json({ response })
  } catch (error) {
    console.error("Chatbot API error:", error)
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 })
  }
}
