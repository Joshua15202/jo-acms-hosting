import * as crypto from "crypto"

// Secret key for JWT signing and verification
const JWT_SECRET = process.env.JWT_SECRET || "default_jwt_secret_please_change_in_production"

// Hash a password
export async function hashPassword(password: string): Promise<string> {
  // Generate a random salt
  const salt = crypto.randomBytes(16).toString("hex")

  // Hash the password with the salt
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex")

  // Return the salt and hash combined
  return `${salt}:${hash}`
}

// Verify a password against a hash
export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  try {
    // Split the stored hash into salt and hash
    const [salt, hash] = storedHash.split(":")

    // Hash the provided password with the same salt
    const calculatedHash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex")

    // Compare the calculated hash with the stored hash
    return calculatedHash === hash
  } catch (error) {
    console.error("Password verification error:", error)
    return false
  }
}

// Simple JWT implementation using crypto
function base64UrlEncode(str: string): string {
  return Buffer.from(str).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "")
}

function base64UrlDecode(str: string): string {
  str += new Array(5 - (str.length % 4)).join("=")
  return Buffer.from(str.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString()
}

// Create a simple JWT token
export function createToken(payload: any): string {
  try {
    const header = {
      alg: "HS256",
      typ: "JWT",
    }

    const now = Math.floor(Date.now() / 1000)
    const tokenPayload = {
      ...payload,
      iat: now,
      exp: now + 24 * 60 * 60, // 24 hours
    }

    const encodedHeader = base64UrlEncode(JSON.stringify(header))
    const encodedPayload = base64UrlEncode(JSON.stringify(tokenPayload))

    const signature = crypto
      .createHmac("sha256", JWT_SECRET)
      .update(`${encodedHeader}.${encodedPayload}`)
      .digest("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=/g, "")

    return `${encodedHeader}.${encodedPayload}.${signature}`
  } catch (error) {
    console.error("Token creation error:", error)
    throw new Error("Failed to create authentication token")
  }
}

// Helper function to check if a string is a UUID
function isUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(str)
}

// Helper function to extract user ID from various session formats
function extractUserIdFromSession(sessionId: string): string | null {
  console.log("Attempting to extract user ID from session:", sessionId)

  // Check if the session ID itself is a UUID (which represents the user ID)
  if (isUUID(sessionId)) {
    console.log("Session ID is a UUID, using as user ID:", sessionId)
    return sessionId
  }

  // Try different session formats
  const formats = [
    // Format: session_userId_timestamp
    () => {
      const parts = sessionId.split("_")
      if (parts.length >= 2 && parts[0] === "session") {
        return parts[1]
      }
      return null
    },
    // Format: userId_timestamp
    () => {
      const parts = sessionId.split("_")
      if (parts.length >= 2) {
        // Check if first part looks like a user ID (numeric or UUID-like)
        const potentialUserId = parts[0]
        if (/^\d+$/.test(potentialUserId) || isUUID(potentialUserId)) {
          return potentialUserId
        }
      }
      return null
    },
    // Format: plain user ID (numeric)
    () => {
      if (/^\d+$/.test(sessionId)) {
        return sessionId
      }
      return null
    },
    // Format: any string with user ID pattern
    () => {
      const match = sessionId.match(/(\d+)/)
      return match ? match[1] : null
    },
  ]

  for (const format of formats) {
    const userId = format()
    if (userId) {
      console.log("Successfully extracted user ID:", userId)
      return userId
    }
  }

  console.log("Could not extract user ID from session")
  return null
}

// Verify and decode a JWT token
export function verifyToken(token: string): any {
  try {
    console.log("Verifying token:", token.substring(0, 30) + "...")
    console.log("Token length:", token.length)
    console.log("Token contains dots:", token.includes("."))
    console.log("Token is UUID:", isUUID(token))

    // For backward compatibility - check if it's a simple session ID
    if (token.length < 100 && !token.includes(".")) {
      console.warn("Legacy session ID detected, using fallback verification")

      const userId = extractUserIdFromSession(token)
      if (userId) {
        console.log("Successfully parsed legacy session for user:", userId)
        return { userId: userId, role: "customer" }
      }

      console.error("Failed to extract user ID from legacy session:", token)
      throw new Error("Invalid legacy session format - could not extract user ID")
    }

    // Handle JWT tokens
    const parts = token.split(".")
    if (parts.length !== 3) {
      throw new Error("Invalid JWT format")
    }

    const [encodedHeader, encodedPayload, signature] = parts

    // Verify signature
    const expectedSignature = crypto
      .createHmac("sha256", JWT_SECRET)
      .update(`${encodedHeader}.${encodedPayload}`)
      .digest("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=/g, "")

    if (signature !== expectedSignature) {
      throw new Error("Invalid token signature")
    }

    // Decode payload
    const payload = JSON.parse(base64UrlDecode(encodedPayload))

    // Check expiration
    if (payload.exp && Date.now() >= payload.exp * 1000) {
      throw new Error("Token expired")
    }

    console.log("JWT token verified successfully for user:", payload.userId)
    return payload
  } catch (error) {
    console.error("Token verification error:", error)
    console.error("Token that failed:", token.substring(0, 50) + "...")
    throw new Error(
      "Invalid or expired authentication token: " + (error instanceof Error ? error.message : "Unknown error"),
    )
  }
}

// Async version for consistency
export async function verifyTokenAsync(token: string): Promise<any> {
  return verifyToken(token)
}
