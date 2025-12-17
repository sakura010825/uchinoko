"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface NikukyuButtonProps {
  onClick: () => void
  isLoading?: boolean
  className?: string
}

export function NikukyuButton({
  onClick,
  isLoading = false,
  className,
}: NikukyuButtonProps) {
  return (
    <Button
      onClick={onClick}
      disabled={isLoading}
      className={cn(
        "relative h-20 w-20 rounded-full bg-salmon-200 hover:bg-salmon-300 border-4 border-salmon-300 shadow-lg transition-all hover:scale-105 active:scale-95",
        "before:content-[''] before:absolute before:inset-0 before:rounded-full before:bg-gradient-to-br before:from-salmon-100 before:to-salmon-200 before:opacity-50",
        className
      )}
      aria-label="肉球翻訳"
    >
      {isLoading ? (
        <div className="relative w-full h-full flex items-center justify-center">
          <span className="text-2xl animate-paw-bounce">🐾</span>
        </div>
      ) : (
        <span className="text-4xl">🐾</span>
      )}
    </Button>
  )
}













