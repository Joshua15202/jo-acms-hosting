"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Eye, EyeOff } from "lucide-react"
import { useAuth } from "@/components/user-auth-provider"

export default function LoginPage() {
  const router = useRouter()
  const { setUser } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [requiresVerification, setRequiresVerification] = useState(false)
  const [pendingEmail, setPendingEmail] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)
    setRequiresVerification(false)

    try {
      const formData = new FormData()
      formData.append("email", email)
      formData.append("password", password)

      const response = await fetch("/api/auth/login", {
        method: "POST",
        body: formData,
      })

      const result = await response.json()

      if (result.success) {
        // Set user data in auth context
        if (result.user) {
          setUser(result.user)
        }
        // Redirect based on role
        if (result.user?.role === "admin") {
          router.push("/admin")
        } else {
          router.push("/")
        }
      } else {
        if (result.requiresVerification) {
          // User has pending registration - redirect to verification
          setRequiresVerification(true)
          setPendingEmail(result.email || email)
        } else {
          setError(result.message || "Login failed")
        }
      }
    } catch (error) {
      console.error("Login error:", error)
      setError("An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoToVerification = () => {
    // Redirect to register page with verification step
    router.push(`/register?verify=${encodeURIComponent(pendingEmail)}`)
  }

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
          <p className="text-sm text-muted-foreground">Enter your credentials to sign in to your account</p>
        </div>

        {requiresVerification ? (
          <Card>
            <CardHeader>
              <CardTitle>Verification Required</CardTitle>
              <CardDescription>Your account needs to be verified before you can log in.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  You have a pending registration. Please verify your email address to complete your registration.
                </AlertDescription>
              </Alert>
              <p className="text-sm text-muted-foreground">
                We sent a verification code to <strong>{pendingEmail}</strong>
              </p>
            </CardContent>
            <CardFooter className="flex flex-col space-y-2">
              <Button onClick={handleGoToVerification} className="w-full bg-rose-600 hover:bg-rose-700">
                Go to Verification
              </Button>
              <Button
                variant="link"
                onClick={() => {
                  setRequiresVerification(false)
                  setPendingEmail("")
                }}
                className="text-rose-600 hover:text-rose-700"
              >
                Back to Login
              </Button>
            </CardFooter>
          </Card>
        ) : (
          <Card>
            <form onSubmit={handleSubmit}>
              <CardContent className="pt-6">
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoComplete="email"
                    />
                  </div>
                  <div className="grid gap-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Password</Label>
                      <Link href="/forgot-password" className="text-sm text-rose-600 hover:text-rose-700">
                        Forgot password?
                      </Link>
                    </div>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        autoComplete="current-password"
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex flex-col space-y-4">
                <Button type="submit" className="w-full bg-rose-600 hover:bg-rose-700" disabled={isLoading}>
                  {isLoading ? "Signing in..." : "Sign in"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        )}

        <p className="px-8 text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-medium text-rose-600 hover:text-rose-700">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}
