"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useCustomToast } from "@/components/custom-toast"

export default function CustomToastTestPage() {
  const { toast } = useCustomToast()

  const testBasicToast = () => {
    console.log("Testing basic custom toast")
    toast({
      title: "Success!",
      description: "This is a basic custom toast that should definitely work!",
    })
  }

  const testErrorToast = () => {
    console.log("Testing error custom toast")
    toast({
      title: "Error Toast",
      description: "This is an error toast with red styling",
      variant: "destructive",
    })
  }

  const testMenuLimitToast = () => {
    console.log("Testing menu limit toast")
    toast({
      title: "Selection Limit Reached",
      description: "Main courses are already at maximum quantity (3). Click the +1 More button to add more selections.",
      variant: "destructive",
    })
  }

  const testMultipleToasts = () => {
    toast({ title: "Toast 1", description: "First toast" })
    setTimeout(() => toast({ title: "Toast 2", description: "Second toast" }), 500)
    setTimeout(() => toast({ title: "Toast 3", description: "Third toast", variant: "destructive" }), 1000)
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Custom Toast Test - This WILL Work!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button onClick={testBasicToast} className="w-full">
                Test Basic Toast
              </Button>
              <Button onClick={testErrorToast} variant="destructive" className="w-full">
                Test Error Toast
              </Button>
              <Button onClick={testMenuLimitToast} variant="outline" className="w-full">
                Test Menu Limit Toast
              </Button>
              <Button onClick={testMultipleToasts} variant="secondary" className="w-full">
                Test Multiple Toasts
              </Button>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2 text-green-800">What to expect:</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-green-700">
                <li>Toasts should appear in the top-right corner</li>
                <li>They should slide in from the right</li>
                <li>They should auto-dismiss after 5 seconds</li>
                <li>You can manually close them with the X button</li>
                <li>Error toasts should have red styling</li>
              </ul>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2 text-blue-800">This custom toast system:</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-blue-700">
                <li>✅ Doesn't depend on shadcn/ui</li>
                <li>✅ Uses simple React state management</li>
                <li>✅ Has proper positioning and styling</li>
                <li>✅ Works with any React setup</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
