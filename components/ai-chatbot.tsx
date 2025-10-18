"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Send, User, AlertCircle, Loader2, ChefHat, X, Minus, UtensilsCrossed } from "lucide-react"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  created_at: string
}

export default function ChatbotComponent() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      created_at: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)
    setError(null)

    try {
      console.log("Sending request to /api/chat")
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
        }),
      })

      console.log("Response status:", response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("API Error Response:", errorText)
        throw new Error(`HTTP ${response.status}: ${errorText}`)
      }

      // Get response text first to check if it's valid JSON
      const responseText = await response.text()
      console.log("Raw response:", responseText)

      let data
      try {
        data = JSON.parse(responseText)
      } catch (parseError) {
        console.error("JSON Parse Error:", parseError)
        console.error("Response text:", responseText)
        throw new Error("Invalid JSON response from server")
      }

      console.log("Parsed API Response:", data)

      if (data.error) {
        throw new Error(data.error)
      }

      const assistantMessage: Message = {
        id: data.id || (Date.now() + 1).toString(),
        role: "assistant",
        content: data.content || data.message || "Sorry, I couldn't generate a response.",
        created_at: data.created_at || new Date().toISOString(),
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (err: any) {
      console.error("Chat error:", err)
      setError(err.message || "Failed to send message")

      // Add error message to chat
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Sorry, I'm having trouble processing your request. Please try again.",
        created_at: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleQuickQuestion = (question: string) => {
    setInput(question)
    // Trigger form submission
    setTimeout(() => {
      const form = document.querySelector("form")
      if (form) {
        form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }))
      }
    }, 100)
  }

  const toggleChat = () => {
    if (isOpen) {
      setIsOpen(false)
      setIsMinimized(false)
    } else {
      setIsOpen(true)
      setIsMinimized(false)
    }
  }

  const minimizeChat = () => {
    setIsMinimized(true)
  }

  const restoreChat = () => {
    setIsMinimized(false)
  }

  return (
    <>
      {/* Chathead */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-50">
          <button
            onClick={toggleChat}
            aria-label="Open Jo-ACMS ChatBot"
            className="w-16 h-16 rounded-full bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 flex items-center justify-center"
          >
            <UtensilsCrossed className="h-8 w-8 text-white" />
          </button>
          {messages.filter((m) => m.role === "assistant").length > 0 && (
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
              {messages.filter((m) => m.role === "assistant").length}
            </div>
          )}
        </div>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div
          className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ${
            isMinimized ? "w-80 h-16" : "w-96 h-[600px] max-h-[calc(100vh-3rem)]"
          }`}
        >
          <div className="h-full shadow-2xl border border-rose-200 rounded-lg bg-white flex flex-col">
            {/* Chat Header */}
            <div className="bg-gradient-to-r from-rose-600 to-pink-600 text-white p-4 rounded-t-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-white/20 p-1 rounded-full">
                    <ChefHat className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">Jo-ACMS ChatBot</h3>
                    <p className="text-rose-100 text-base">Your Catering Assistant</p>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={isMinimized ? restoreChat : minimizeChat}
                    aria-label={isMinimized ? "Restore chat" : "Minimize chat"}
                    className="text-white hover:bg-white/20 p-1 h-7 w-7 rounded flex items-center justify-center"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <button
                    onClick={toggleChat}
                    aria-label="Close chat"
                    className="text-white hover:bg-white/20 p-1 h-7 w-7 rounded flex items-center justify-center"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
              {isLoading && !isMinimized && (
                <div className="flex items-center space-x-2 mt-2">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  <span className="text-sm text-rose-100">Jo-ACMS ChatBot is typing...</span>
                </div>
              )}
            </div>

            {!isMinimized && (
              <>
                {/* Error Alert */}
                {error && (
                  <div className="m-4 border border-red-200 bg-red-50 rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="h-4 w-4 text-red-600" />
                      <div className="text-red-800 text-sm">
                        <strong>Error:</strong> {error}
                      </div>
                    </div>
                  </div>
                )}

                {/* Chat Content */}
                <div className="p-0 flex-1 overflow-hidden">
                  <div className="h-[440px] p-4 overflow-y-auto" ref={scrollAreaRef}>
                    {messages.length === 0 && !isLoading ? (
                      <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                        <div className="bg-gradient-to-r from-rose-100 to-pink-100 p-4 rounded-full">
                          <ChefHat className="h-12 w-12 text-rose-600" />
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900 mb-2">Welcome to Jo-ACMS! 👋</h3>
                          <p className="text-gray-600 text-base mb-4">
                            I'm your personal catering assistant. I can help you with our services, bookings, menu
                            planning, and more!
                          </p>

                          {/* Quick Start Buttons */}
                          <div className="space-y-2">
                            <button
                              onClick={() => handleQuickQuestion("What catering services does Jo-ACMS offer?")}
                              disabled={isLoading}
                              className="w-full border border-rose-200 hover:bg-rose-50 text-sm py-2 px-3 rounded-md disabled:opacity-50"
                            >
                              🍽️ Our Catering Services
                            </button>
                            <button
                              onClick={() => handleQuickQuestion("How do I book an appointment through Jo-ACMS?")}
                              disabled={isLoading}
                              className="w-full border border-rose-200 hover:bg-rose-50 text-sm py-2 px-3 rounded-md disabled:opacity-50"
                            >
                              📅 Book an Appointment
                            </button>
                            <button
                              onClick={() => handleQuickQuestion("What menu packages are available in Jo-ACMS?")}
                              disabled={isLoading}
                              className="w-full border border-rose-200 hover:bg-rose-50 text-sm py-2 px-3 rounded-md disabled:opacity-50"
                            >
                              📋 Menu Packages
                            </button>
                            <button
                              onClick={() => handleQuickQuestion("How does Jo-ACMS pricing work for events?")}
                              disabled={isLoading}
                              className="w-full border border-rose-200 hover:bg-rose-50 text-sm py-2 px-3 rounded-md disabled:opacity-50"
                            >
                              💰 Pricing Information
                            </button>
                            <button
                              onClick={() => handleQuickQuestion("What event types does Jo-ACMS cater to?")}
                              disabled={isLoading}
                              className="w-full border border-rose-200 hover:bg-rose-50 text-sm py-2 px-3 rounded-md disabled:opacity-50"
                            >
                              🎉 Event Types
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {messages.map((message) => (
                          <div
                            key={message.id}
                            className={`flex items-start space-x-2 ${
                              message.role === "user" ? "flex-row-reverse space-x-reverse" : ""
                            }`}
                          >
                            <div className="h-6 w-6 flex-shrink-0 mt-0.5 rounded-full flex items-center justify-center">
                              <div
                                className={`w-6 h-6 rounded-full flex items-center justify-center ${
                                  message.role === "user" ? "bg-blue-100" : "bg-gradient-to-r from-rose-100 to-pink-100"
                                }`}
                              >
                                {message.role === "user" ? (
                                  <User className="h-3 w-3 text-blue-600" />
                                ) : (
                                  <ChefHat className="h-3 w-3 text-rose-600" />
                                )}
                              </div>
                            </div>

                            <div
                              className={`max-w-[80%] p-2 rounded-lg text-sm shadow-sm ${
                                message.role === "user"
                                  ? "bg-blue-500 text-white"
                                  : "bg-gradient-to-r from-rose-50 to-pink-50 text-gray-900 border border-rose-100"
                              }`}
                            >
                              <div className="whitespace-pre-wrap break-words leading-relaxed">{message.content}</div>
                            </div>
                          </div>
                        ))}

                        {isLoading && (
                          <div className="flex items-start space-x-2">
                            <div className="h-6 w-6 rounded-full bg-gradient-to-r from-rose-100 to-pink-100 flex items-center justify-center">
                              <ChefHat className="h-3 w-3 text-rose-600" />
                            </div>
                            <div className="bg-gradient-to-r from-rose-50 to-pink-50 border border-rose-100 p-2 rounded-lg">
                              <div className="flex space-x-1">
                                <div className="w-1.5 h-1.5 bg-rose-400 rounded-full animate-bounce"></div>
                                <div
                                  className="w-1.5 h-1.5 bg-rose-400 rounded-full animate-bounce"
                                  style={{ animationDelay: "0.1s" }}
                                ></div>
                                <div
                                  className="w-1.5 h-1.5 bg-rose-400 rounded-full animate-bounce"
                                  style={{ animationDelay: "0.2s" }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Input Area */}
                <div className="border-t bg-gradient-to-r from-rose-50 to-pink-50 p-3">
                  <form onSubmit={handleSubmit} className="flex w-full space-x-2">
                    <input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Ask about Jo-ACMS catering services..."
                      disabled={isLoading}
                      className="flex-1 border border-rose-200 focus:border-rose-400 focus:outline-none focus:ring-1 focus:ring-rose-400 bg-white text-sm h-8 px-3 rounded-md"
                      autoFocus
                    />
                    <button
                      type="submit"
                      disabled={isLoading || !input.trim()}
                      aria-label="Send message"
                      className="bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 h-8 px-3 rounded-md text-white disabled:opacity-50 flex items-center justify-center"
                    >
                      {isLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />}
                    </button>
                  </form>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
