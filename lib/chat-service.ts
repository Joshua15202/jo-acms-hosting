import { db } from "./db"

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

export class ChatService {
  static async createChatSession(userId: string, title = "New Chat"): Promise<ChatSession | null> {
    try {
      const connection = await db()
      const id = `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      const now = new Date().toISOString()

      await connection.execute(
        "INSERT INTO chat_sessions (id, user_id, title, created_at, updated_at) VALUES (?, ?, ?, ?, ?)",
        [id, userId, title, now, now],
      )

      return {
        id,
        user_id: userId,
        title,
        created_at: now,
        updated_at: now,
      }
    } catch (error) {
      console.error("Error creating chat session:", error)
      return null
    }
  }

  static async getChatSessions(userId: string): Promise<ChatSession[]> {
    try {
      const connection = await db()
      const [rows] = await connection.execute(
        "SELECT * FROM chat_sessions WHERE user_id = ? ORDER BY updated_at DESC",
        [userId],
      )

      return rows as ChatSession[]
    } catch (error) {
      console.error("Error fetching chat sessions:", error)
      return []
    }
  }

  static async getMessages(sessionId: string): Promise<Message[]> {
    try {
      const connection = await db()
      const [rows] = await connection.execute("SELECT * FROM messages WHERE session_id = ? ORDER BY created_at ASC", [
        sessionId,
      ])

      return rows as Message[]
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
      const connection = await db()
      const id = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      const now = new Date().toISOString()

      await connection.execute(
        "INSERT INTO messages (id, session_id, user_id, content, role, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [id, sessionId, userId, content, role, now, now],
      )

      // Update session timestamp
      await connection.execute("UPDATE chat_sessions SET updated_at = ? WHERE id = ?", [now, sessionId])

      return {
        id,
        session_id: sessionId,
        user_id: userId,
        content,
        role,
        created_at: now,
        updated_at: now,
      }
    } catch (error) {
      console.error("Error saving message:", error)
      return null
    }
  }

  static async deleteSession(sessionId: string): Promise<boolean> {
    try {
      const connection = await db()
      await connection.execute("DELETE FROM chat_sessions WHERE id = ?", [sessionId])
      return true
    } catch (error) {
      console.error("Error deleting session:", error)
      return false
    }
  }

  static isAvailable(): boolean {
    return true // Since we're using the existing db connection
  }
}
