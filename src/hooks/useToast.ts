import { useState } from 'react'

export interface Toast {
  id: string
  message: string
  type: 'success' | 'error' | 'info'
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([])

  const add = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now().toString()
    const toast = { id, message, type }
    setToasts(prev => [...prev, toast])
    return id
  }

  const remove = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }

  return { toasts, add, remove }
}
