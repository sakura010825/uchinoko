"use client"

import { AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface ErrorMessageProps {
  message: string
  className?: string
  onRetry?: () => void
}

export function ErrorMessage({
  message,
  className,
  onRetry,
}: ErrorMessageProps) {
  return (
    <div
      className={cn(
        "bg-destructive/10 border border-destructive/20 rounded-lg p-4",
        className
      )}
    >
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-sm text-destructive font-medium">{message}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-2 text-sm text-destructive underline hover:no-underline"
            >
              再試行
            </button>
          )}
        </div>
      </div>
    </div>
  )
}












