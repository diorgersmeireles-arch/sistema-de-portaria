import { X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

const variantStyles = {
  default: "bg-background border shadow-lg",
  destructive: "bg-destructive text-destructive-foreground border-destructive shadow-lg",
  success: "bg-green-600 text-white border-green-700 shadow-lg",
}

export function Toaster() {
  const { toasts } = useToast()

  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            "flex items-start gap-3 rounded-lg px-4 py-3 text-sm animate-in slide-in-from-right",
            variantStyles[t.variant ?? "default"]
          )}
        >
          <div className="flex-1 min-w-0">
            <p className="font-medium">{t.title}</p>
            {t.description && (
              <p className="text-xs opacity-90 mt-0.5">{t.description}</p>
            )}
          </div>
          <button
            onClick={() => {
              const event = new CustomEvent("dismiss-toast", { detail: t.id })
              window.dispatchEvent(event)
            }}
            className="shrink-0 rounded-md p-0.5 opacity-70 hover:opacity-100 transition-opacity"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  )
}
