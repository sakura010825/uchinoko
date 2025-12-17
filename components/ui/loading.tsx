"use client"

import { cn } from "@/lib/utils"

interface LoadingProps {
  className?: string
  text?: string
}

export function Loading({ className, text = "読み込み中..." }: LoadingProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-12", className)}>
      <div className="relative w-16 h-16 mb-4">
        <div className="absolute inset-0 border-4 border-salmon-200 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-salmon-300 border-t-transparent rounded-full animate-spin"></div>
      </div>
      <p className="text-charcoal-300 text-sm">{text}</p>
    </div>
  )
}













