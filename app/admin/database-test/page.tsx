"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { testDatabaseConnection } from "@/app/actions/db-actions"

export default function DatabaseTestPage() {
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleTestConnection() {
    setLoading(true)
    setError(null)

    try {
      const response = await testDatabaseConnection()
      setResult(response)

      if (!response.success) {
        setError(response.message)
      }
    } catch (err) {
      setError("An unexpected error occurred")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Database Connection Test</CardTitle>
          <CardDescription>Test the connection to your MySQL database</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {error && <div className="p-4 bg-red-50 text-red-600 rounded-md">{error}</div>}

            {result && result.success && (
              <div className="p-4 bg-green-50 text-green-600 rounded-md">Connection successful!</div>
            )}

            <div className="text-sm text-gray-500">
              <p>This will test the connection to your MySQL database using the environment variables:</p>
              <ul className="list-disc pl-5 mt-2">
                <li>MYSQL_HOST</li>
                <li>MYSQL_PORT</li>
                <li>MYSQL_USER</li>
                <li>MYSQL_PASSWORD</li>
                <li>MYSQL_DATABASE</li>
              </ul>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleTestConnection} disabled={loading} className="w-full">
            {loading ? "Testing Connection..." : "Test Connection"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
