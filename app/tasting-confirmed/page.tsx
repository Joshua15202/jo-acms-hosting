"use client"

import { useEffect, useState } from "react"

const TastingConfirmedPage = () => {
  const [user, setUser] = useState(null)
  const [autoLoginAttempted, setAutoLoginAttempted] = useState(false)

  // Add this useEffect to handle auto-login
  useEffect(() => {
    const handleAutoLogin = async () => {
      const urlParams = new URLSearchParams(window.location.search)
      const sessionToken = urlParams.get("sessionToken")
      const userId = urlParams.get("userId")

      if (sessionToken && userId && !user) {
        setAutoLoginAttempted(true)
        try {
          const response = await fetch("/api/auth/auto-login", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ sessionToken, userId }),
          })

          if (response.ok) {
            const data = await response.json()
            if (data.success && data.user) {
              setUser(data.user)

              // Clean up URL parameters
              const newUrl =
                window.location.pathname +
                "?" +
                urlParams
                  .toString()
                  .replace(/[?&](sessionToken|userId)=[^&]*/g, "")
                  .replace(/^&/, "")
                  .replace(/&$/, "")
              window.history.replaceState({}, "", newUrl)
            }
          }
        } catch (error) {
          console.error("Auto-login failed:", error)
        }
      }
    }

    handleAutoLogin()
  }, [user, setUser])

  return (
    <div>
      <h1>Tasting Confirmed Page</h1>
      {user ? (
        <p>Welcome, {user.name}!</p>
      ) : !autoLoginAttempted ? (
        <p>Attempting auto-login...</p>
      ) : (
        <p>Please log in.</p>
      )}
    </div>
  )
}

export default TastingConfirmedPage
