'use client'

import React, { useState, useEffect, useCallback, createContext, useContext } from 'react'

interface ToastMessage {
  id: number
  type: 'success' | 'error' | 'info' | 'warning'
  message: string
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastMessage['type']) => void
}

const ToastContext = createContext<ToastContextValue>({ showToast: () => {} })

export function useToast() {
  return useContext(ToastContext)
}

let nextId = 0

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  const showToast = useCallback((message: string, type: ToastMessage['type'] = 'info') => {
    const id = nextId++
    setToasts((prev) => [...prev, { id, type, message }])
  }, [])

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-20 right-5 z-[9999] flex flex-col gap-2 max-w-[400px]">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

const typeStyles: Record<ToastMessage['type'], string> = {
  success: 'bg-[#e8f5e9] border-l-4 border-l-[#4caf50] text-[#1b5e20]',
  error: 'bg-[#ffebee] border-l-4 border-l-[#f44336] text-[#b71c1c]',
  warning: 'bg-[#fff3e0] border-l-4 border-l-[#ff9800] text-[#e65100]',
  info: 'bg-[#e3f2fd] border-l-4 border-l-[#2196F3] text-[#0d47a1]',
}

function ToastItem({ toast, onRemove }: { toast: ToastMessage; onRemove: (id: number) => void }) {
  useEffect(() => {
    const timer = setTimeout(() => onRemove(toast.id), 4000)
    return () => clearTimeout(timer)
  }, [toast.id, onRemove])

  return (
    <div
      className={`px-4 py-3 rounded-lg text-sm font-medium shadow-md cursor-pointer animate-slideIn ${typeStyles[toast.type] || typeStyles.info}`}
      onClick={() => onRemove(toast.id)}
    >
      {toast.message}
    </div>
  )
}
