"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function TestEmailPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const sendTestEmail = async () => {
    if (!email) {
      alert("Please enter an email address")
      return
    }

    setIsLoading(true)
    setResult(null)

    try {
      const response = await fetch("/api/test-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({
        success: false,
        message: "Network error",
        error: String(error),
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-8 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Email Test - Jo Pacheco Wedding & Event</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Input
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <Button onClick={sendTestEmail} disabled={isLoading} className="w-full bg-rose-600 hover:bg-rose-700">
            {isLoading ? "Sending..." : "Send Test Email"}
          </Button>

          {result && (
            <div className="mt-4 p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">Result: {result.success ? "✅ Success" : "❌ Failed"}</h3>
              <pre className="text-sm bg-gray-100 p-2 rounded overflow-auto">{JSON.stringify(result, null, 2)}</pre>
            </div>
          )}

          <div className="text-sm text-gray-600 space-y-2">
            <p>
              <strong>Instructions:</strong>
            </p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Enter your Gmail address above</li>
              <li>Click "Send Test Email"</li>
              <li>Check the result below</li>
              <li>Check your Gmail inbox AND spam folder</li>
              <li>Also check your browser's developer console (F12) for logs</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
