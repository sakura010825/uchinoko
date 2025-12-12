"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Gift, Download } from "lucide-react"
import { cn } from "@/lib/utils"

interface StampChallengeProgressProps {
  currentCount: number
  targetCount?: number
  onDownload?: () => void
  downloading?: boolean
  className?: string
}

const TARGET_COUNT = 8

export function StampChallengeProgress({
  currentCount,
  targetCount = TARGET_COUNT,
  onDownload,
  downloading = false,
  className,
}: StampChallengeProgressProps) {
  const remaining = Math.max(0, targetCount - currentCount)
  const progress = Math.min(100, (currentCount / targetCount) * 100)
  const isComplete = currentCount >= targetCount

  return (
    <Card className={cn("bg-gradient-to-r from-salmon-50 to-mint-50", className)}>
      <CardContent className="p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 bg-salmon-200 rounded-full flex items-center justify-center">
            <Gift className="w-6 h-6 text-salmon-300" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-charcoal mb-1">
              LINEスタンプチャレンジ
            </h3>
            {isComplete ? (
              <p className="text-sm text-charcoal-400">
                おめでとうございます！スタンプが作れます🎉
              </p>
            ) : (
              <p className="text-sm text-charcoal-400">
                あと{remaining}個でスタンプが作れるよ！
              </p>
            )}
          </div>
        </div>

        {/* 進捗バー */}
        <div className="mb-4">
          <div className="flex justify-between text-sm text-charcoal-400 mb-2">
            <span>{currentCount} / {targetCount} 投稿</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-charcoal-100 rounded-full h-3 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-salmon-300 to-mint transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* スタンプアイコン表示 */}
        <div className="flex gap-2 mb-4">
          {Array.from({ length: targetCount }).map((_, index) => (
            <div
              key={index}
              className={cn(
                "w-10 h-10 rounded-lg border-2 flex items-center justify-center transition-all",
                index < currentCount
                  ? "bg-salmon-200 border-salmon-300"
                  : "bg-white border-charcoal-200"
              )}
            >
              {index < currentCount ? (
                <span className="text-xl">🐾</span>
              ) : (
                <span className="text-charcoal-300">○</span>
              )}
            </div>
          ))}
        </div>

        {/* ダウンロードボタン */}
        {isComplete && onDownload && (
          <Button
            onClick={onDownload}
            disabled={downloading}
            className="w-full bg-gradient-to-r from-salmon-300 to-mint hover:from-salmon-200 hover:to-mint-200"
          >
            <Download className="w-4 h-4 mr-2" />
            {downloading ? "生成中..." : "スタンプセットをダウンロード"}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

