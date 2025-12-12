"use client"

import { cn } from "@/lib/utils"

interface PawPrintAnimationProps {
  className?: string
  count?: number
}

export function PawPrintAnimation({
  className,
  count = 6,
}: PawPrintAnimationProps) {
  const pawPrints = Array.from({ length: count }, (_, i) => i)

  // 肉球の足跡のパスを生成（ランダムな位置）
  const getPawPosition = (index: number) => {
    const angle = (index / count) * Math.PI * 2
    const radius = 40 + (index % 3) * 10
    const centerX = 50
    const centerY = 50
    return {
      left: centerX + Math.cos(angle) * radius + "%",
      top: centerY + Math.sin(angle) * radius + "%",
    }
  }

  return (
    <div className={cn("relative w-full h-full overflow-visible", className)}>
      {pawPrints.map((index) => {
        const position = getPawPosition(index)
        return (
          <div
            key={index}
            className="absolute text-5xl opacity-0 animate-paw-print pointer-events-none"
            style={{
              left: position.left,
              top: position.top,
              animationDelay: `${index * 0.2}s`,
              animationIterationCount: "infinite",
              transform: "translate(-50%, -50%)",
            }}
          >
            🐾
          </div>
        )
      })}
    </div>
  )
}

