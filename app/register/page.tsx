"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/user-auth-provider"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"

export default function RegisterPage() {
  const router = useRouter()
  const { setUser } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [verificationStep, setVerificationStep] = useState(false)
  const [verificationCode, setVerificationCode] = useState("")
  const [timeLeft, setTimeLeft] = useState(1800) // 30 minutes in seconds
  const [registeredEmail, setRegisteredEmail] = useState("")
  const [showTerms, setShowTerms] = useState(false)
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [pendingFormData, setPendingFormData] = useState<FormData | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError("")

    const formData = new FormData(e.currentTarget)
    const password = formData.get("password") as string
    const confirmPassword = formData.get("confirmPassword") as string

    // Validate passwords match
    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    // Store form data and show terms dialog
    setPendingFormData(formData)
    setShowTerms(true)
  }

  const handleAcceptTerms = async () => {
    if (!agreedToTerms || !pendingFormData) {
      setError("You must agree to the terms and conditions")
      return
    }

    setIsLoading(true)
    setError("")
    setShowTerms(false)

    try {
      const email = pendingFormData.get("email") as string
      const firstName = pendingFormData.get("firstName") as string
      const lastName = pendingFormData.get("lastName") as string
      const phone = pendingFormData.get("phone") as string
      const password = pendingFormData.get("password") as string
      const addressLine1 = pendingFormData.get("addressLine1") as string
      const addressLine2 = pendingFormData.get("addressLine2") as string
      const city = pendingFormData.get("city") as string
      const province = pendingFormData.get("province") as string
      const postalCode = pendingFormData.get("postalCode") as string

      // Create new FormData with the correct field names for the API
      const apiFormData = new FormData()
      apiFormData.set("firstName", firstName)
      apiFormData.set("lastName", lastName)
      apiFormData.set("email", email)
      apiFormData.set("phone", phone || "")
      apiFormData.set("password", password)
      apiFormData.set("addressLine1", addressLine1)
      apiFormData.set("addressLine2", addressLine2 || "")
      apiFormData.set("city", city)
      apiFormData.set("province", province)
      apiFormData.set("postalCode", postalCode)
      apiFormData.set("agreedToTerms", "true")

      console.log("Sending registration data:", {
        firstName,
        lastName,
        email,
        phone: phone || "",
        hasPassword: !!password,
        addressLine1,
        city,
        province,
        postalCode,
      })

      const response = await fetch("/api/auth/register", {
        method: "POST",
        body: apiFormData,
      })

      const result = await response.json()
      console.log("Registration result:", result)

      if (result.success) {
        if (result.requiresVerification) {
          // Show verification step
          setRegisteredEmail(email)
          setVerificationStep(true)

          // Start countdown timer
          const timer = setInterval(() => {
            setTimeLeft((prev) => {
              if (prev <= 1) {
                clearInterval(timer)
                return 0
              }
              return prev - 1
            })
          }, 1000)
        } else {
          // Direct login (if verification not required)
          if (result.user) {
            setUser(result.user)
          }
          router.push("/")
        }
      } else {
        setError(result.message || "Registration failed")
      }
    } catch (error) {
      console.error("Registration error:", error)
      setError("An unexpected error occurred")
    } finally {
      setIsLoading(false)
      setPendingFormData(null)
    }
  }

  const handleVerification = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/auth/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: registeredEmail,
          code: verificationCode,
        }),
      })

      const result = await response.json()

      if (result.success) {
        // Set user in auth context for immediate login
        if (result.user) {
          setUser(result.user)
        }
        // Redirect to dashboard or home page
        router.push("/")
      } else {
        setError(result.message || "Verification failed")
      }
    } catch (error) {
      console.error("Verification error:", error)
      setError("An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const resendCode = async () => {
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/auth/resend-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: registeredEmail,
        }),
      })

      const result = await response.json()

      if (result.success) {
        setTimeLeft(1800) // Reset to 30 minutes
        setError("")

        // Start countdown timer
        const timer = setInterval(() => {
          setTimeLeft((prev) => {
            if (prev <= 1) {
              clearInterval(timer)
              return 0
            }
            return prev - 1
          })
        }, 1000)
      } else {
        setError(result.message || "Failed to resend code")
      }
    } catch (error) {
      console.error("Resend error:", error)
      setError("An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`
  }

  if (verificationStep) {
    return (
      <div className="container flex h-screen w-screen flex-col items-center justify-center">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">Verify your email</h1>
            <p className="text-sm text-gray-500">We&apos;ve sent a 6-digit verification code to {registeredEmail}</p>
          </div>
          <Card>
            <form onSubmit={handleVerification}>
              <CardContent className="pt-6">
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="verificationCode">Verification Code</Label>
                    <Input
                      id="verificationCode"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      placeholder="Enter the 6-digit code"
                      maxLength={6}
                      className="text-center text-lg tracking-widest"
                      required
                    />
                  </div>
                  <div className="text-center text-sm">
                    {timeLeft > 0 ? (
                      <p className="text-gray-500">Code expires in {formatTime(timeLeft)}</p>
                    ) : (
                      <p className="text-red-500">Code expired</p>
                    )}
                  </div>
                  {error && <p className="text-sm text-red-500">{error}</p>}
                </div>
              </CardContent>
              <CardFooter className="flex flex-col space-y-4">
                <Button
                  className="w-full bg-rose-600 hover:bg-rose-700"
                  type="submit"
                  disabled={isLoading || !verificationCode || verificationCode.length !== 6}
                >
                  {isLoading ? "Verifying..." : "Verify Email"}
                </Button>
                <Button
                  variant="link"
                  type="button"
                  onClick={resendCode}
                  disabled={timeLeft > 60 || isLoading}
                  className="text-rose-600 hover:text-rose-700"
                >
                  {timeLeft > 60 ? `Resend available in ${formatTime(timeLeft - 60)}` : "Resend Code"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="container flex min-h-screen w-screen flex-col items-center justify-center py-12">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[450px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Create an account</h1>
          <p className="text-sm text-gray-500">Enter your information to create an account</p>
        </div>
        <Card>
          <form onSubmit={handleSubmit}>
            <CardContent className="pt-6">
              <div className="grid gap-4">
                {/* Personal Information */}
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold">Personal Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input id="firstName" name="firstName" placeholder="John" required />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input id="lastName" name="lastName" placeholder="Doe" required />
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold">Contact Information</h3>
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" name="email" type="email" placeholder="name@example.com" required />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" name="phone" type="tel" placeholder="+63 912 345 6789" required />
                  </div>
                </div>

                {/* Address Information */}
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold">Address</h3>
                  <div className="grid gap-2">
                    <Label htmlFor="addressLine1">Street Address</Label>
                    <Input id="addressLine1" name="addressLine1" placeholder="123 Main Street, Barangay" required />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="addressLine2">
                      Apartment, Suite, etc. <span className="text-gray-400">(Optional)</span>
                    </Label>
                    <Input id="addressLine2" name="addressLine2" placeholder="Apt 4B, Building 2" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="city">City</Label>
                      <Input id="city" name="city" placeholder="Manila" required />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="province">Province</Label>
                      <Input id="province" name="province" placeholder="Metro Manila" required />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="postalCode">Postal Code</Label>
                    <Input id="postalCode" name="postalCode" placeholder="1000" required />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold">Security</h3>
                  <div className="grid gap-2">
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" name="password" type="password" required />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input id="confirmPassword" name="confirmPassword" type="password" required />
                  </div>
                </div>

                {error && <p className="text-sm text-red-500">{error}</p>}
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full bg-rose-600 hover:bg-rose-700" type="submit" disabled={isLoading}>
                {isLoading ? "Creating account..." : "Create Account"}
              </Button>
            </CardFooter>
          </form>
        </Card>
        <p className="text-center text-sm text-gray-500">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-rose-600 hover:text-rose-700">
            Sign in
          </Link>
        </p>
      </div>

      {/* Terms & Conditions Dialog */}
      <Dialog open={showTerms} onOpenChange={setShowTerms}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Terms and Conditions</DialogTitle>
            <DialogDescription>Please read and accept our terms and conditions to continue</DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-96 rounded-md border p-4">
            <div className="space-y-4 text-sm">
              <h3 className="font-semibold text-lg">BILLING ARRANGEMENT / CANCELLATION & AMENDMENT POLICY</h3>

              <p>
                We will require reservation fee or Down payment upon confirmation. The amount is non-refundable and it
                will be deducted from your total contract charges.
              </p>

              <p>Full Payment should be settled at least one (1) Week Before the event date.</p>

              <p>
                The Client agree to "NO CANCELLATION – RESCHEDULE ONLY" policy if the situation should occur and
                cancellation is inevitable, only if such reason is caused by client and/or clients immediate family
                injury, illness, death or Fortuitous event.
              </p>

              <p>
                Late notification of Reschedule or notification made beyond 24hrs is subject for penalty of 10% of total
                Package amount.
              </p>

              <p>The client agrees to Weather Disturbance Agreement if applicable.</p>

              <p>
                Notice of changes on any of the foregoing arrangements should be communicated to the caterer at least
                three (3) days before the agreed date. Confirmation of changes will depend on the availability of
                requested resources or its alternative.
              </p>

              <p>
                No refund or adjustment shall be made if the actual number of guests falls below the minimum number of
                contracted Pax.
              </p>

              <p>
                Over Guest list/head count with a minimum of 20 pax is free, 25 pax or more than 50pax is subject for 5%
                service charge, 50 pax or more is subject for 10% service charge.
              </p>

              <p>
                Cash bond or Initial Down payment will be compromised if there are lost and damage property owned by
                L&BCS/JPWE due to negligence of the guest (Price per item will be deducted including Additional charges
                from balance).
              </p>

              <p>Outside food is allowed only with waiver</p>

              <p>Crew Meal must be shouldered by the Client (for equivalent to P150.00/Crew)</p>

              <p>
                Leftover food is allowed for release or if the client or guest wanted to take it home, L&BCS/JPWE will
                not be liable for any complaints due to spoilage etc.
              </p>

              <p>
                Our Setup/Ingress time is (3Hrs) and our Service time is strictly (4Hrs) including the program and Meal
                Time. Any over time of the crew/s and other present staff should be shouldered by the client. Rate is
                P300.00/hr./crew.
              </p>

              <p>
                Strictly no borrowing or there will be no Table Linens, Chair Cloths, Tableware, warmers etc. Will be
                left during egress or right after the service hour.
              </p>

              <p>Floor Charge May Apply. (starts at 2nd Floor) – Min Rate P200.00/crew/floor</p>

              <p>Lights & Sounds System over-time charge is P1,500.00/hr</p>

              <h3 className="font-semibold mt-6">Privacy Policy</h3>

              <p>
                By creating an account, you agree to our collection and use of your personal information as described in
                our Privacy Policy. We collect your information to provide and improve our services, process your
                bookings, and communicate with you about your events.
              </p>

              <p>
                Your personal information including name, contact details, and address will be used solely for the
                purpose of managing your account and event bookings. We do not share your information with third parties
                without your consent, except as required by law.
              </p>
            </div>
          </ScrollArea>
          <div className="flex items-center space-x-2">
            <Checkbox id="terms" checked={agreedToTerms} onCheckedChange={(checked) => setAgreedToTerms(!!checked)} />
            <label
              htmlFor="terms"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              I agree to the terms and conditions
            </label>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTerms(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button
              onClick={handleAcceptTerms}
              disabled={!agreedToTerms || isLoading}
              className="bg-rose-600 hover:bg-rose-700"
            >
              {isLoading ? "Processing..." : "Accept and Continue"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
