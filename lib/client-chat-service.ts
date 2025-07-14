export type ChatSession = {
  id: string
  user_id: string
  title: string
  created_at: string
  updated_at: string
}

export type Message = {
  id: string
  session_id: string
  user_id: string
  content: string
  role: "user" | "assistant"
  created_at: string
  updated_at: string
}

export class ClientChatService {
  static async createChatSession(userId: string, title = "New Chat"): Promise<ChatSession | null> {
    try {
      const response = await fetch("/api/chat/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, title }),
      })

      if (!response.ok) {
        throw new Error("Failed to create chat session")
      }

      const data = await response.json()
      return data.session
    } catch (error) {
      console.error("Error creating chat session:", error)
      return null
    }
  }

  static async getChatSessions(userId: string): Promise<ChatSession[]> {
    try {
      const response = await fetch(`/api/chat/sessions?userId=${encodeURIComponent(userId)}`)

      if (!response.ok) {
        throw new Error("Failed to fetch chat sessions")
      }

      const data = await response.json()
      return data.sessions || []
    } catch (error) {
      console.error("Error fetching chat sessions:", error)
      return []
    }
  }

  static async getMessages(sessionId: string): Promise<Message[]> {
    try {
      const response = await fetch(`/api/chat/messages?sessionId=${encodeURIComponent(sessionId)}`)

      if (!response.ok) {
        throw new Error("Failed to fetch messages")
      }

      const data = await response.json()
      return data.messages || []
    } catch (error) {
      console.error("Error fetching messages:", error)
      return []
    }
  }

  static async saveMessage(
    sessionId: string,
    userId: string,
    content: string,
    role: "user" | "assistant",
  ): Promise<Message | null> {
    try {
      const response = await fetch("/api/chat/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sessionId, userId, content, role }),
      })

      if (!response.ok) {
        throw new Error("Failed to save message")
      }

      const data = await response.json()
      return data.message
    } catch (error) {
      console.error("Error saving message:", error)
      return null
    }
  }

  static async deleteSession(sessionId: string): Promise<boolean> {
    try {
      const response = await fetch(`/api/chat/sessions/${encodeURIComponent(sessionId)}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete session")
      }

      const data = await response.json()
      return data.success
    } catch (error) {
      console.error("Error deleting session:", error)
      return false
    }
  }

  static isAvailable(): boolean {
    return true // API routes are always available
  }
}
