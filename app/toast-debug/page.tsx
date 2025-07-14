"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"

export default function ToastDebugPage() {
  const [diagnostics, setDiagnostics] = useState<string[]>([])
  const { toast } = useToast() // ✅ Now properly called inside component

  const addDiagnostic = (message: string) => {
    console.log(message)
    setDiagnostics((prev) => [...prev, message])
  }

  const runDiagnostics = () => {
    setDiagnostics([])

    addDiagnostic("=== TOAST DIAGNOSTICS ===")
    addDiagnostic(`useToast hook works: ✅ YES`)
    addDiagnostic(`Toast function available: ${toast ? "✅ YES" : "❌ NO"}`)

    // Check DOM for toaster
    setTimeout(() => {
      const toasterElement =
        document.querySelector("[data-sonner-toaster]") ||
        document.querySelector(".toaster") ||
        document.querySelector('[role="region"]') ||
        document.querySelector("[data-radix-toast-viewport]")

      addDiagnostic(`Toaster in DOM: ${toasterElement ? "✅ YES" : "❌ NO"}`)

      if (toasterElement) {
        addDiagnostic(`Toaster element: ${toasterElement.tagName} with classes: ${toasterElement.className}`)
      }
    }, 100)
  }

  const testBasicToast = () => {
    addDiagnostic("=== TESTING TOAST ===")

    try {
      toast({
        title: "Test Toast",
        description: "This is a test toast message",
      })
      addDiagnostic("Toast function called successfully ✅")
    } catch (error) {
      addDiagnostic(`Toast function error: ❌ ${error}`)
    }
  }

  const testErrorToast = () => {
    try {
      toast({
        title: "Error Toast",
        description: "This is an error toast",
        variant: "destructive",
      })
      addDiagnostic("Error toast called successfully ✅")
    } catch (error) {
      addDiagnostic(`Error toast error: ❌ ${error}`)
    }
  }

  const testAlert = () => {
    alert("Alert works! This means JavaScript is working.")
  }

  // Auto-run diagnostics on mount
  useEffect(() => {
    setTimeout(runDiagnostics, 500)
  }, [])

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Toast Diagnostics - Fixed Version</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Button onClick={runDiagnostics} className="w-full">
                Run Diagnostics
              </Button>
              <Button onClick={testBasicToast} className="w-full">
                Test Basic Toast
              </Button>
              <Button onClick={testErrorToast} variant="destructive" className="w-full">
                Test Error Toast
              </Button>
              <Button onClick={testAlert} variant="outline" className="w-full">
                Test Alert
              </Button>
            </div>

            {diagnostics.length > 0 && (
              <div className="bg-gray-100 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Diagnostic Results:</h3>
                <div className="font-mono text-sm space-y-1">
                  {diagnostics.map((diagnostic, index) => (
                    <div
                      key={index}
                      className={
                        diagnostic.includes("✅")
                          ? "text-green-600"
                          : diagnostic.includes("❌")
                            ? "text-red-600"
                            : "text-gray-700"
                      }
                    >
                      {diagnostic}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-yellow-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Expected Results:</h3>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>✅ useToast hook works: YES</li>
                <li>✅ Toast function available: YES</li>
                <li>✅ Toaster in DOM: YES</li>
                <li>✅ Toast should appear in top-right corner when clicked</li>
              </ul>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">If toasts still don't appear:</h3>
              <ol className="list-decimal list-inside space-y-1 text-sm">
                <li>Check browser console for CSS/styling errors</li>
                <li>Look for toast container with very high z-index</li>
                <li>Try inspecting the DOM after clicking test buttons</li>
                <li>Check if toasts are being rendered but positioned off-screen</li>
              </ol>
            </div>
          </CardContent>
        </Card>

        {/* This Toaster should now work */}
        <Toaster />
      </div>
    </div>
  )
}
