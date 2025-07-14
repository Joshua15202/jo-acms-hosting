"use client"

import { useState, createContext, useContext, type ReactNode } from "react"
import { X } from "lucide-react"

interface Toast {
  id: string
  title: string
  description?: string
  variant?: "default" | "destructive"
  duration?: number
}

interface ToastContextType {
  toast: (toast: Omit<Toast, "id">) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function CustomToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = (toastData: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newToast: Toast = {
      id,
      duration: 5000,
      ...toastData,
    }

    setToasts((prev) => [...prev, newToast])

    // Auto remove after duration
    setTimeout(() => {
      removeToast(id)
    }, newToast.duration)
  }

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }

  return (
    <ToastContext.Provider value={{ toast: addToast }}>
      {children}

      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`
              min-w-[300px] max-w-[400px] p-4 rounded-lg shadow-lg border
              animate-in slide-in-from-right-full duration-300
              ${
                toast.variant === "destructive"
                  ? "bg-red-50 border-red-200 text-red-900"
                  : "bg-white border-gray-200 text-gray-900"
              }
            `}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="font-semibold text-sm">{toast.title}</div>
                {toast.description && <div className="text-sm mt-1 opacity-90">{toast.description}</div>}
              </div>
              <button onClick={() => removeToast(toast.id)} className="ml-2 p-1 hover:bg-gray-100 rounded">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useCustomToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error("useCustomToast must be used within CustomToastProvider")
  }
  return context
}
