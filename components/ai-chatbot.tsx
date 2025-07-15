"use client"

import { useChat } from "ai/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Send, User, AlertCircle, Loader2, Heart, X, Minus } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import ReactMarkdown from "react-markdown" // Import ReactMarkdown
import remarkGfm from "remark-gfm" // Import remarkGfm for GitHub Flavored Markdown

export default function JoPachecoChathead() {
  const { messages, input, handleInputChange, handleSubmit, isLoading, error, append } = useChat({
    api: "/api/chat",
    // Remove streamProtocol to use default
  })
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  const handleQuickQuestion = (question: string) => {
    append({ role: "user", content: question })
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
      {/* Chathead Button */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-50">
          <Button
            onClick={toggleChat}
            className="w-16 h-16 rounded-full bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
          >
            <Heart className="h-8 w-8 text-white" />
          </Button>
          {messages.length > 0 && (
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">
                {messages.filter((m) => m.role === "assistant").length}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div
          className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ${
            isMinimized ? "w-80 h-16" : "w-96 h-[600px]"
          }`}
        >
          <Card className="h-full shadow-2xl border-rose-200">
            {/* Chat Header */}
            <CardHeader className="bg-gradient-to-r from-rose-600 to-pink-600 text-white p-4 rounded-t-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-white/20 p-1 rounded-full">
                    <Heart className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Jo Pacheco Chatbot</CardTitle>
                    <p className="text-rose-100 text-sm">Wedding & Event Planning</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={isMinimized ? restoreChat : minimizeChat}
                    className="text-white hover:bg-white/20 p-1 h-8 w-8"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleChat}
                    className="text-white hover:bg-white/20 p-1 h-8 w-8"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              {isLoading && (
                <div className="flex items-center space-x-2 mt-2">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  <span className="text-xs text-rose-100">Planning your perfect event...</span>
                </div>
              )}
            </CardHeader>

            {!isMinimized && (
              <>
                {/* Error Alert */}
                {error && (
                  <Alert className="m-4 border-red-200 bg-red-50">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-800 text-sm">
                      <strong>Error:</strong>{" "}
                      {error.message || "Failed to connect. Please check your API configuration."}
                    </AlertDescription>
                  </Alert>
                )}

                {/* Chat Content */}
                <CardContent className="p-0 flex-1">
                  <ScrollArea className="h-[440px] p-4" ref={scrollAreaRef}>
                    {messages.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                        <div className="bg-gradient-to-r from-rose-100 to-pink-100 p-4 rounded-full">
                          <Heart className="h-12 w-12 text-rose-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">Welcome! 💕</h3>
                          <p className="text-gray-600 text-sm mb-4">
                            I'm here to help you plan your perfect event with Jo Pacheco Wedding & Event!
                          </p>

                          {/* Quick Start Buttons */}
                          <div className="space-y-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleQuickQuestion("I want to plan a wedding event")}
                              disabled={isLoading}
                              className="w-full border-rose-200 hover:bg-rose-50 text-xs"
                            >
                              💒 Plan Wedding
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleQuickQuestion("Show me your catering menu and packages")}
                              disabled={isLoading}
                              className="w-full border-rose-200 hover:bg-rose-50 text-xs"
                            >
                              🍽️ View Menu & Packages
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleQuickQuestion("Help me plan a debut celebration")}
                              disabled={isLoading}
                              className="w-full border-rose-200 hover:bg-rose-50 text-xs"
                            >
                              ✨ Plan Debut
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleQuickQuestion("How do I book an appointment?")}
                              disabled={isLoading}
                              className="w-full border-rose-200 hover:bg-rose-50 text-xs"
                            >
                              📅 Book Appointment
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleQuickQuestion("What are your most popular Filipino dishes?")}
                              disabled={isLoading}
                              className="w-full border-rose-200 hover:bg-rose-50 text-xs"
                            >
                              🇵🇭 Filipino Specialties
                            </Button>
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
                            <div
                              className={`h-6 w-6 flex-shrink-0 rounded-full flex items-center justify-center ${
                                message.role === "user" ? "bg-blue-100" : "bg-gradient-to-r from-rose-100 to-pink-100"
                              }`}
                            >
                              {message.role === "user" ? (
                                <User className="h-3 w-3 text-blue-600" />
                              ) : (
                                <Heart className="h-3 w-3 text-rose-600" />
                              )}
                            </div>

                            <div
                              className={`max-w-[80%] p-2 rounded-lg text-xs whitespace-pre-wrap break-words leading-relaxed ${
                                message.role === "user"
                                  ? "bg-blue-500 text-white"
                                  : "bg-gradient-to-r from-rose-50 to-pink-50 text-gray-900 border border-rose-100"
                              }`}
                            >
                              {/* Use ReactMarkdown to render message content */}
                              <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
                            </div>
                          </div>
                        ))}

                        {isLoading && (
                          <div className="flex items-start space-x-2">
                            <div className="h-6 w-6 rounded-full bg-gradient-to-r from-rose-100 to-pink-100 flex items-center justify-center">
                              <Heart className="h-3 w-3 text-rose-600" />
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
                  </ScrollArea>
                </CardContent>

                {/* Input Area */}
                <CardFooter className="border-t bg-gradient-to-r from-rose-50 to-pink-50 p-3">
                  <form onSubmit={handleSubmit} className="flex w-full space-x-2">
                    <Input
                      value={input}
                      onChange={handleInputChange}
                      placeholder="Ask about events, catering, bookings..."
                      disabled={isLoading}
                      className="flex-1 border-rose-200 focus:border-rose-400 bg-white text-sm h-8"
                      autoFocus
                    />
                    <Button
                      type="submit"
                      disabled={isLoading || !input.trim()}
                      size="sm"
                      className="bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 h-8 px-3"
                    >
                      {isLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />}
                    </Button>
                  </form>
                </CardFooter>
              </>
            )}
          </Card>
        </div>
      )}
    </>
  )
}
