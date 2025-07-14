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

export default function RegisterPage() {
  const router = useRouter()
  const { setUser } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [verificationStep, setVerificationStep] = useState(false)
  const [verificationCode, setVerificationCode] = useState("")
  const [timeLeft, setTimeLeft] = useState(1800) // 30 minutes in seconds
  const [registeredEmail, setRegisteredEmail] = useState("")

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const formData = new FormData(e.currentTarget)
      const password = formData.get("password") as string
      const confirmPassword = formData.get("confirmPassword") as string
      const email = formData.get("email") as string
      const firstName = formData.get("firstName") as string
      const lastName = formData.get("lastName") as string
      const phone = formData.get("phone") as string

      // Validate passwords match
      if (password !== confirmPassword) {
        setError("Passwords do not match")
        setIsLoading(false)
        return
      }

      // Create new FormData with the correct field names for the API
      const apiFormData = new FormData()
      apiFormData.set("firstName", firstName)
      apiFormData.set("lastName", lastName)
      apiFormData.set("email", email)
      apiFormData.set("phone", phone || "")
      apiFormData.set("password", password)

      console.log("Sending registration data:", {
        firstName,
        lastName,
        email,
        phone: phone || "",
        hasPassword: !!password,
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
                  disabled={timeLeft > 60 || isLoading} // Allow resend only when less than 1 minute left
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
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Create an account</h1>
          <p className="text-sm text-gray-500">Enter your information to create an account</p>
        </div>
        <Card>
          <form onSubmit={handleSubmit}>
            <CardContent className="pt-6">
              <div className="grid gap-4">
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
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" placeholder="name@example.com" required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" name="phone" placeholder="Your phone number" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" name="password" type="password" required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input id="confirmPassword" name="confirmPassword" type="password" required />
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
    </div>
  )
}
