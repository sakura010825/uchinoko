"use client"

import { useOffline } from "@/hooks/use-offline"
import { WifiOff } from "lucide-react"
import { cn } from "@/lib/utils"

export function OfflineIndicator() {
  const isOffline = useOffline()

  if (!isOffline) return null

  return (
    <div
      className={cn(
        "fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50",
        "bg-charcoal text-cream px-4 py-2 rounded-lg shadow-lg",
        "flex items-center gap-2 animate-in slide-in-from-bottom-5"
      )}
      role="alert"
      aria-live="polite"
    >
      <WifiOff className="w-4 h-4" />
      <span className="text-sm font-medium">オフラインです。接続を確認してください。</span>
    </div>
  )
}












