import { GoogleGenerativeAI } from "@google/generative-ai"
import { type NextRequest, NextResponse } from "next/server"

// Initialize the Google Generative AI client
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || "")

export async function POST(req: NextRequest) {
  try {
    // Check if API key is configured
    if (!process.env.GOOGLE_GEMINI_API_KEY) {
      return NextResponse.json({ error: "GOOGLE_GEMINI_API_KEY is not configured." }, { status: 500 })
    }

    // Parse the request body
    const { messages } = await req.json()

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Messages array is required" }, { status: 400 })
    }

    // Use the correct model name
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash-latest",
      generationConfig: {
        maxOutputTokens: 1000,
        temperature: 0.7,
      },
    })

    // Get the last user message
    const lastMessage = messages[messages.length - 1]

    if (!lastMessage?.content) {
      return NextResponse.json({ error: "No message content provided" }, { status: 400 })
    }

    let result

    // For single message, use generateContent directly
    if (messages.length === 1 || messages.filter((m) => m.role === "assistant").length === 0) {
      result = await model.generateContent(lastMessage.content)
    } else {
      // For conversation with history
      const chatHistory = messages
        .slice(0, -1)
        .filter((message: any) => message.role === "user" || message.role === "assistant")
        .map((message: any) => ({
          role: message.role === "assistant" ? "model" : "user",
          parts: [{ text: message.content }],
        }))

      const chat = model.startChat({ history: chatHistory })
      result = await chat.sendMessage(lastMessage.content)
    }

    const response = await result.response
    const text = response.text()

    // Return in the format expected by the useChat hook
    return NextResponse.json({
      id: Date.now().toString(),
      role: "assistant",
      content: text,
    })
  } catch (error: any) {
    console.error("Error in chat API:", error)

    let errorMessage = "An error occurred during the request to Gemini API"
    let statusCode = 500

    if (error.message) {
      errorMessage = error.message

      if (
        error.message.includes("API_KEY_INVALID") ||
        error.message.includes("invalid API key") ||
        error.message.includes("PERMISSION_DENIED")
      ) {
        errorMessage = "Invalid or unauthorized Google Gemini API Key."
        statusCode = 401
      }
    }

    return NextResponse.json({ error: errorMessage }, { status: statusCode })
  }
}
