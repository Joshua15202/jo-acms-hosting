"use client"

import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"

export default function ToastTest() {
  const { toast } = useToast()

  const testBasicToast = () => {
    console.log("Basic toast test clicked")
    toast({
      title: "Test Toast",
      description: "This is a basic test toast",
    })
  }

  const testErrorToast = () => {
    console.log("Error toast test clicked")
    toast({
      title: "Error Test",
      description: "This is an error toast test",
      variant: "destructive",
    })
  }

  const testMenuLimitToast = () => {
    console.log("Menu limit toast test clicked")
    toast({
      title: "Selection Limit Reached",
      description: "Main courses are already at maximum quantity (3). Click the +1 More button to add more selections.",
      variant: "destructive",
    })
  }

  return (
    <div className="p-8 space-y-4 border rounded-lg">
      <h2 className="text-xl font-bold">Toast Test Component</h2>
      <p className="text-gray-600">Use this to test if toasts are working on your website</p>

      <div className="space-y-2">
        <Button onClick={testBasicToast} className="w-full">
          Test Basic Toast
        </Button>
        <Button onClick={testErrorToast} variant="destructive" className="w-full">
          Test Error Toast
        </Button>
        <Button onClick={testMenuLimitToast} variant="outline" className="w-full">
          Test Menu Limit Toast (Same as booking form)
        </Button>
      </div>

      <div className="bg-gray-100 p-4 rounded text-sm">
        <p>
          <strong>Instructions:</strong>
        </p>
        <ol className="list-decimal list-inside space-y-1">
          <li>Click each button above</li>
          <li>Check browser console for logs</li>
          <li>Look for toast notifications (usually top-right corner)</li>
          <li>If no toasts appear, there's a setup issue</li>
        </ol>
      </div>

      {/* Include Toaster here for testing */}
      <Toaster />
    </div>
  )
}
