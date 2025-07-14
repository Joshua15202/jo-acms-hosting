"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function DebugAppointmentsPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [tastingToken, setTastingToken] = useState("")

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Debug Appointments</h1>

      <div className="space-y-4">
        <Button
          onClick={async () => {
            setLoading(true)
            try {
              const response = await fetch("/api/debug-tasting-tokens")
              const result = await response.json()
              setResult(result)
            } catch (error) {
              console.error("Error:", error)
              setResult({ error: error.message })
            } finally {
              setLoading(false)
            }
          }}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Check All Tasting Tokens
        </Button>

        <Button
          onClick={async () => {
            setLoading(true)
            try {
              const response = await fetch("/api/debug-tasting-flow")
              const result = await response.json()
              setResult(result)
            } catch (error) {
              console.error("Error:", error)
              setResult({ error: error.message })
            } finally {
              setLoading(false)
            }
          }}
          disabled={loading}
          className="bg-green-600 hover:bg-green-700"
        >
          Check Tasting Flow (Original)
        </Button>

        <div className="flex gap-2">
          <Input
            placeholder="Enter tasting token"
            value={tastingToken}
            onChange={(e) => setTastingToken(e.target.value)}
            className="flex-1"
          />
          <Button
            onClick={async () => {
              if (!tastingToken) {
                alert("Please enter a tasting token")
                return
              }
              setLoading(true)
              try {
                const response = await fetch("/api/confirm-tasting-json", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ tastingToken }),
                })

                if (!response.ok) {
                  throw new Error(`HTTP error! status: ${response.status}`)
                }

                const result = await response.json()
                setResult(result)
              } catch (error) {
                console.error("Error:", error)
                setResult({ error: error.message })
              } finally {
                setLoading(false)
              }
            }}
            disabled={loading}
            className="bg-purple-600 hover:bg-purple-700"
          >
            Confirm Tasting (JSON)
          </Button>
        </div>
      </div>

      {result && (
        <div className="mt-4 p-4 border rounded">
          <h3 className="font-bold">Result:</h3>
          <pre className="text-sm bg-gray-100 p-2 rounded mt-2 overflow-auto max-h-96">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}

      {result?.tastings && result.tastings.length > 0 && (
        <div className="mt-4 p-4 border rounded bg-yellow-50">
          <h3 className="font-bold text-yellow-800">Available Tasting Tokens:</h3>
          <ul className="list-disc list-inside mt-2">
            {result.tastings.map((tasting, index) => (
              <li key={index} className="text-sm">
                <code className="bg-gray-200 px-1 rounded">{tasting.tasting_token}</code> (Status: {tasting.status},
                Date: {tasting.proposed_date})
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
