"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { useRouter, useSearchParams } from "next/navigation"
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
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Eye, EyeOff } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Service area data
const SERVICE_AREAS = {
  "Metro Manila": {
    "Quezon City": [
      "Alicia",
      "Amihan",
      "Apolonio Samson",
      "Aurora",
      "Baesa",
      "Bagbag",
      "Bagong Lipunan ng Crame",
      "Bagong Pag-asa",
      "Bagong Silangan",
      "Bagumbayan",
      "Bagumbuhay",
      "Bahay Toro",
      "Balingasa",
      "Balong Bato",
      "Batasan Hills",
      "Bayanihan",
      "Blue Ridge A",
      "Blue Ridge B",
      "Botocan",
      "Bungad",
      "Camp Aguinaldo",
      "Capri",
      "Central",
      "Claro",
      "Commonwealth",
      "Culiat",
      "Damar",
      "Damayan",
      "Damayang Lagi",
      "Del Monte",
      "Dioquino Zobel",
      "Don Manuel",
      "Doña Imelda",
      "Doña Josefa",
      "Duyan-Duyan",
      "E. Rodriguez",
      "East Kamias",
      "Escopa I",
      "Escopa II",
      "Escopa III",
      "Escopa IV",
      "Fairview",
      "Fortune",
      "Greater Lagro",
      "Gulod",
      "Holy Spirit",
      "Horseshoe",
      "Immaculate Concepcion",
      "Kaligayahan",
      "Kalusugan",
      "Kamuning",
      "Katipunan",
      "Kaunlaran",
      "Kristong Hari",
      "Krus na Ligas",
      "Laging Handa",
      "Libis",
      "Lourdes",
      "Loyola Heights",
      "Maharlika",
      "Malaya",
      "Манггаханан",
      "Mangga",
      "Marilag",
      "Маринаба",
      "Masagana",
      "Masambong",
      "Matalahib",
      "Matandang Balara",
      "Milagrosa",
      "N.S. Amoranto",
      "Nagkaisang Nayon",
      "Narvacan",
      "New Era",
      "North Fairview",
      "Novaliches Proper",
      "Obrero",
      "Old Capitol Site",
      "Olimpia",
      "Paligsahan",
      "Paltok",
      "Pansol",
      "Paraiso",
      "Pasong Putik Proper",
      "Pasong Tamo",
      "Payatas",
      "Phil-Am",
      "Pinagkaisahan",
      "Pinyahan",
      "Project 6",
      "Quirino 2-A",
      "Quirino 2-B",
      "Quirino 2-C",
      "Quirino 3-A",
      "Ramon Magsaysay",
      "Roxas",
      "Sabina",
      "Saint Ignatius",
      "Saint Peter",
      "Salvacion",
      "San Agustin",
      "San Antonio",
      "San Bartolome",
      "San Isidro",
      "San Isidro Labrador",
      "San Jose",
      "San Martin de Porres",
      "San Roque",
      "San Vicente",
      "Santa Cruz",
      "Santa Lucia",
      "Santa Monica",
      "Santa Teresita",
      "Santo Cristo",
      "Santo Niño",
      "Santol",
      "Sauyo",
      "Siena",
      "Silangan",
      "Sikatuna Village",
      "South Triangle",
      "Tagumpay",
      "Talampas",
      "Talayan",
      "Talipapa",
      "Tandang Sora",
      "Tatalon",
      "Teachers Village East",
      "Teachers Village West",
      "Ugong Norte",
      "Unang Sigaw",
      "UP Campus",
      "UP Village",
      "Valencia",
      "Vasra",
      "Veterans Village",
      "West Triangle",
      "White Plains",
    ],
    Valenzuela: [
      "Arkong Bato",
      "Bagbaguin",
      "Balangkas",
      "Bignay",
      "Bisig",
      "Canumay East",
      "Canumay West",
      "Coloong",
      "Dalandanan",
      "Gen. T. de Leon",
      "Hen. Mariano",
      "Isla",
      "Karuhatan",
      "Lawang Bato",
      "Lingunan",
      "Mabolo",
      "Malanday",
      "Malinta",
      "Mapulang Lupa",
      "Marulas",
      "Maysan",
      "Palasan",
      "Parada",
      "Pariancillo Villa",
      "Paso de Blas",
      "Pasolo",
      "Poblacion",
      "Polo",
      "Punturin",
      "Rincon",
      "Tagalag",
      "Ugong",
      "Viente Reales",
      "Wawang Pulo",
    ],
    Malabon: [
      "Acacia",
      "Baritan",
      "Bayan-Bayanan",
      "Catmon",
      "Concepcion",
      "Dampalit",
      "Flores",
      "Hulong Duhat",
      "Ibaba",
      "Longos",
      "Maysilo",
      "Muzon",
      "Niugan",
      "Panghulo",
      "Potrero",
      "San Agustin",
      "Santolan",
      "Tañong",
      "Tinajeros",
      "Tonsuya",
      "Tugatog",
    ],
    Novaliches: [
      "Greater Lagro",
      "Gulod",
      "Kaligayahan",
      "Nagkaisang Nayon",
      "North Fairview",
      "Novaliches Proper",
      "Pasong Putik",
      "San Agustin",
      "San Bartolome",
      "Sta. Lucia",
      "Sta. Monica",
    ],
  },
  Bulacan: {
    Malolos: [
      "Anilao",
      "Atlag",
      "Babatnin",
      "Bagna",
      "Bagong Bayan",
      "Balayong",
      "Balite",
      "Bangkal",
      "Barihan",
      "Bulihan",
      "Bungahan",
      "Caingin",
      "Calero",
      "Caliligawan",
      "Canalate",
      "Caniogan",
      "Catmon",
      "Cofradia",
      "Dakila",
      "Guinhawa",
      "Ligas",
      "Liyang",
      "Longos",
      "Look 1st",
      "Look 2nd",
      "Lugam",
      "Mabolo",
      "Mambog",
      "Masile",
      "Matimbo",
      "Mojon",
      "Namayan",
      "Niugan",
      "Pamarawan",
      "Panasahan",
      "Pinagbakahan",
      "San Agustin",
      "San Gabriel",
      "San Juan",
      "San Pablo",
      "San Vicente",
      "Santiago",
      "Santisima Trinidad",
      "Santo Cristo",
      "Santo Niño",
      "Santo Rosario",
      "Santor",
      "Sumapang Bata",
      "Sumapang Matanda",
      "Taal",
      "Tikay",
    ],
    Meycauayan: [
      "Bagbaguin",
      "Bahay Pare",
      "Banga",
      "Bayugo",
      "Bisig",
      "Bolacan",
      "Calvario",
      "Camalig",
      "Hulo",
      "Iba",
      "Langka",
      "Lawa",
      "Libtong",
      "Liputan",
      "Longos",
      "Malhacan",
      "Pajo",
      "Pandayan",
      "Pantoc",
      "Perez",
      "Poblacion",
      "Saluysoy",
      "St. Francis",
      "Tugatog",
      "Ubihan",
      "Zamora",
    ],
    Marilao: [
      "Abangan Norte",
      "Abangan Sur",
      "Lambakin",
      "Lias",
      "Loma de Gato",
      "Nagbalon",
      "Patubig",
      "Poblacion I",
      "Poblacion II",
      "Prenza I",
      "Prenza II",
      "Santa Rosa I",
      "Santa Rosa II",
      "Saog",
      "Tabing Ilog",
      "Ibayo",
    ],
    Pandi: [
      "Bagbaguin",
      "Bagong Barrio",
      "Baka-Bakahan",
      "Bunsuran I",
      "Bunsuran II",
      "Bunsuran III",
      "Cacarong Bata",
      "Cacarong Matanda",
      "Cupang",
      "Malibo",
      "Manatal",
      "Mapulang Lupa",
      "Masagana",
      "Masuso",
      "Pinagkuartelan",
      "Poblacion",
      "Real de Cacarong",
      "San Roque",
      "Siling Matanda",
      "Siling Bata",
    ],
  },
}

export default function RegisterPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const verifyEmail = searchParams.get("verify")
  const { setUser } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [verificationStep, setVerificationStep] = useState(false)
  const [verificationCode, setVerificationCode] = useState("")
  const [timeLeft, setTimeLeft] = useState(180) // 3 minutes in seconds
  const [resendTimeLeft, setResendTimeLeft] = useState(180) // 3 minutes in seconds
  const [canResend, setCanResend] = useState(false)
  const [registeredEmail, setRegisteredEmail] = useState("")
  const [showTerms, setShowTerms] = useState(false)
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [pendingFormData, setPendingFormData] = useState<FormData | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Address state
  const [selectedProvince, setSelectedProvince] = useState("")
  const [selectedCity, setSelectedCity] = useState("")
  const [selectedBarangay, setSelectedBarangay] = useState("")
  const [availableCities, setAvailableCities] = useState<string[]>([])
  const [availableBarangays, setAvailableBarangays] = useState<string[]>([])

  useEffect(() => {
    if (verifyEmail) {
      checkPendingRegistration(verifyEmail)
    }
  }, [verifyEmail])

  useEffect(() => {
    if (selectedProvince) {
      const cities = Object.keys(SERVICE_AREAS[selectedProvince as keyof typeof SERVICE_AREAS] || {})
      setAvailableCities(cities)
      setSelectedCity("")
      setSelectedBarangay("")
      setAvailableBarangays([])
    }
  }, [selectedProvince])

  useEffect(() => {
    if (selectedProvince && selectedCity) {
      const barangays = SERVICE_AREAS[selectedProvince as keyof typeof SERVICE_AREAS]?.[selectedCity] || []
      setAvailableBarangays(barangays)
      setSelectedBarangay("")
    }
  }, [selectedCity])

  const checkPendingRegistration = async (email: string) => {
    try {
      const response = await fetch("/api/auth/check-pending", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      const result = await response.json()

      if (result.success && result.hasPending) {
        setRegisteredEmail(email)
        setVerificationStep(true)
        setCanResend(false)
        setResendTimeLeft(180) // 3 minutes in seconds

        const expiresAt = new Date(result.expiresAt)
        const now = new Date()
        const secondsLeft = Math.max(0, Math.floor((expiresAt.getTime() - now.getTime()) / 1000))
        setTimeLeft(secondsLeft)

        const expirationTimer = setInterval(() => {
          setTimeLeft((prev) => {
            if (prev <= 1) {
              clearInterval(expirationTimer)
              return 0
            }
            return prev - 1
          })
        }, 1000)

        const resendTimer = setInterval(() => {
          setResendTimeLeft((prev) => {
            if (prev <= 1) {
              clearInterval(resendTimer)
              setCanResend(true)
              return 0
            }
            return prev - 1
          })
        }, 1000)
      } else if (result.expired) {
        setError("Your verification code has expired. Please register again.")
      }
    } catch (error) {
      console.error("Check pending error:", error)
    }
  }

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!verificationStep && !showTerms) {
        e.preventDefault()
        e.returnValue = ""
        return ""
      } else if (verificationStep) {
        e.preventDefault()
        e.returnValue = "You haven't verified your email yet. Are you sure you want to leave?"
        return "You haven't verified your email yet. Are you sure you want to leave?"
      }
    }

    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => window.removeEventListener("beforeunload", handleBeforeUnload)
  }, [verificationStep, showTerms])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError("")

    const formData = new FormData(e.currentTarget)
    const password = formData.get("password") as string
    const confirmPassword = formData.get("confirmPassword") as string

    // Password strength validation
    const hasNumber = /\d/.test(password)
    const hasSpecialChar = /[!@#$%^&*()_\-+={}[\]:;"'<>,.?/\\|`~]/.test(password)

    if (!hasNumber) {
      setError("Password must contain at least one number")
      return
    }

    if (!hasSpecialChar) {
      setError("Password must contain at least one special character (e.g., !@#$%^&*_-+=)")
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (!selectedProvince || !selectedCity || !selectedBarangay) {
      setError("Please select province, city, and barangay")
      return
    }

    // Add address fields to form data
    formData.set("province", selectedProvince)
    formData.set("city", selectedCity)
    formData.set("barangay", selectedBarangay)

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
      const streetAddress = pendingFormData.get("streetAddress") as string
      const addressLine2 = pendingFormData.get("addressLine2") as string
      const barangay = pendingFormData.get("barangay") as string
      const city = pendingFormData.get("city") as string
      const province = pendingFormData.get("province") as string
      const postalCode = pendingFormData.get("postalCode") as string

      const apiFormData = new FormData()
      apiFormData.set("firstName", firstName)
      apiFormData.set("lastName", lastName)
      apiFormData.set("email", email)
      apiFormData.set("phone", phone || "")
      apiFormData.set("password", password)
      apiFormData.set("addressLine1", streetAddress)
      apiFormData.set("addressLine2", addressLine2 || "")
      apiFormData.set("city", `${barangay}, ${city}`)
      apiFormData.set("province", province)
      apiFormData.set("postalCode", postalCode)
      apiFormData.set("agreedToTerms", "true")

      console.log("Sending registration data...")

      const response = await fetch("/api/auth/register", {
        method: "POST",
        body: apiFormData,
      })

      const result = await response.json()
      console.log("Registration result:", result)

      if (result.success) {
        setRegisteredEmail(result.email || email)
        setVerificationStep(true)
        setCanResend(false)
        setResendTimeLeft(180) // 3 minutes in seconds

        const expirationTimer = setInterval(() => {
          setTimeLeft((prev) => {
            if (prev <= 1) {
              clearInterval(expirationTimer)
              return 0
            }
            return prev - 1
          })
        }, 1000)

        const resendTimer = setInterval(() => {
          setResendTimeLeft((prev) => {
            if (prev <= 1) {
              clearInterval(resendTimer)
              setCanResend(true)
              return 0
            }
            return prev - 1
          })
        }, 1000)
      } else {
        if (result.requiresVerification) {
          setRegisteredEmail(result.email || email)
          setVerificationStep(true)
          setCanResend(true)
        } else {
          setError(result.message || "Registration failed")
        }
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
        if (result.user) {
          setUser(result.user)
        }
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
    setCanResend(false)
    setResendTimeLeft(180) // 3 minutes in seconds

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
        setTimeLeft(180) // 3 minutes in seconds

        const expirationTimer = setInterval(() => {
          setTimeLeft((prev) => {
            if (prev <= 1) {
              clearInterval(expirationTimer)
              return 0
            }
            return prev - 1
          })
        }, 1000)

        const resendTimer = setInterval(() => {
          setResendTimeLeft((prev) => {
            if (prev <= 1) {
              clearInterval(resendTimer)
              setCanResend(true)
              return 0
            }
            return prev - 1
          })
        }, 1000)

        setError("")
      } else {
        setError(result.message || "Failed to resend code")
        setCanResend(true)
      }
    } catch (error) {
      console.error("Resend error:", error)
      setError("An unexpected error occurred")
      setCanResend(true)
    } finally {
      setIsLoading(false)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`
  }

  const maskEmail = (email: string) => {
    const [localPart, domain] = email.split("@")
    if (localPart.length <= 2) {
      return email // If email is too short, don't mask
    }
    const firstTwo = localPart.substring(0, 2)
    const maskedLocal = firstTwo + "*".repeat(10)
    return `${maskedLocal}@${domain}`
  }

  if (verificationStep) {
    return (
      <div className="container flex h-screen w-screen flex-col items-center justify-center">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">Verify your email</h1>
            <p className="text-sm text-gray-500">
              We&apos;ve sent a 6-digit verification code to {maskEmail(registeredEmail)}
            </p>
          </div>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              You must verify your email before you can log in. Please check your inbox and spam folder.
            </AlertDescription>
          </Alert>

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
                  <div className="text-center text-sm space-y-1">
                    {timeLeft > 0 ? (
                      <p className="text-gray-500">Code expires in {formatTime(timeLeft)}</p>
                    ) : (
                      <p className="text-red-500">Code expired. Please request a new code.</p>
                    )}
                    {!canResend && resendTimeLeft > 0 && (
                      <p className="text-gray-400 text-xs">
                        Resend available in {resendTimeLeft} second{resendTimeLeft !== 1 ? "s" : ""}
                      </p>
                    )}
                  </div>
                  {error && <p className="text-sm text-red-500">{error}</p>}
                </div>
              </CardContent>
              <CardFooter className="flex flex-col space-y-4">
                <Button
                  className="w-full bg-rose-600 hover:bg-rose-700"
                  type="submit"
                  disabled={isLoading || !verificationCode || verificationCode.length !== 6 || timeLeft === 0}
                >
                  {isLoading ? "Verifying..." : "Verify Email"}
                </Button>
                <Button
                  variant="link"
                  type="button"
                  onClick={resendCode}
                  disabled={!canResend || isLoading}
                  className="text-rose-600 hover:text-rose-700 disabled:opacity-50"
                >
                  {canResend ? "Resend Code" : `Resend available in ${resendTimeLeft}s`}
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
                    <Label htmlFor="streetAddress">Street Address</Label>
                    <Input
                      id="streetAddress"
                      name="streetAddress"
                      placeholder="123 Main Street, House #, Block #"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="addressLine2">
                      Apartment, Suite, etc. <span className="text-gray-400">(Optional)</span>
                    </Label>
                    <Input id="addressLine2" name="addressLine2" placeholder="Apt 4B, Building 2" />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="province">Province</Label>
                    <Select value={selectedProvince} onValueChange={setSelectedProvince} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select province" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.keys(SERVICE_AREAS).map((province) => (
                          <SelectItem key={province} value={province}>
                            {province}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="city">City/Municipality</Label>
                    <Select value={selectedCity} onValueChange={setSelectedCity} disabled={!selectedProvince} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select city/municipality" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableCities.map((city) => (
                          <SelectItem key={city} value={city}>
                            {city}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="barangay">Barangay</Label>
                    <Select
                      value={selectedBarangay}
                      onValueChange={setSelectedBarangay}
                      disabled={!selectedCity}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select barangay" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableBarangays.map((barangay) => (
                          <SelectItem key={barangay} value={barangay}>
                            {barangay}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                    <div className="relative">
                      <Input 
                        id="password" 
                        name="password" 
                        type={showPassword ? "text" : "password"} 
                        required 
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
                    <p className="text-xs text-gray-500">
                      Password must contain at least one number and one special character (e.g., !@#$%^&*_-+=)
                    </p>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <div className="relative">
                      <Input 
                        id="confirmPassword" 
                        name="confirmPassword" 
                        type={showConfirmPassword ? "text" : "password"} 
                        required 
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
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
