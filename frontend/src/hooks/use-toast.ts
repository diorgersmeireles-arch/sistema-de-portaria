import { useState, useCallback } from "react"

export interface Toast {
  id: string
  title: string
  description?: string
  variant?: "default" | "destructive" | "success"
}

interface ToastState {
  toasts: Toast[]
}

let toastListeners: Array<(state: ToastState) => void> = []
let toastState: ToastState = { toasts: [] }

function notify() {
  toastListeners.forEach((l) => l(toastState))
}

export function toast(props: Omit<Toast, "id">) {
  const id = crypto.randomUUID()
  toastState = {
    toasts: [...toastState.toasts, { ...props, id }],
  }
  notify()

  setTimeout(() => {
    toastState = {
      toasts: toastState.toasts.filter((t) => t.id !== id),
    }
    notify()
  }, 4000)
}

export function useToast() {
  const [state, setState] = useState<ToastState>(toastState)

  const subscribe = useCallback(() => {
    toastListeners.push(setState)
    return () => {
      toastListeners = toastListeners.filter((l) => l !== setState)
    }
  }, [])

  useState(() => subscribe())

  return {
    toasts: state.toasts,
    toast,
  }
}
