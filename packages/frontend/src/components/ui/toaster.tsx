import { useState, useEffect } from 'react'

type ToastType = 'default' | 'success' | 'destructive'

interface Toast {
  id: string
  title?: string
  description?: string
  variant?: ToastType
}

let listeners: ((toast: Toast) => void)[] = []

function toast({ title, description, variant = 'default' }: Omit<Toast, 'id'>) {
  const id = Math.random().toString(36).substring(2, 9)
  const newToast = { id, title, description, variant }
  listeners.forEach((listener) => listener(newToast))
  return id
}

export function useToast() {
  return { toast }
}

export function Toaster() {
  const [toasts, setToasts] = useState<Toast[]>([])

  useEffect(() => {
    const handleToast = (toast: Toast) => {
      setToasts((prev) => [...prev, toast])
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== toast.id))
      }, 3000)
    }

    listeners.push(handleToast)
    return () => {
      listeners = listeners.filter((l) => l !== handleToast)
    }
  }, [])

  if (toasts.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`p-4 rounded-md shadow-lg min-w-[300px] animate-in slide-in-from-right-full ${t.variant === 'destructive'
              ? 'bg-red-600 text-white'
              : t.variant === 'success'
                ? 'bg-green-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border'
            }`}
        >
          {t.title && <div className="font-semibold">{t.title}</div>}
          {t.description && <div className="text-sm opacity-90">{t.description}</div>}
        </div>
      ))}
    </div>
  )
}
