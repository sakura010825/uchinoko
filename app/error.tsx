"use client"

import { useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { logError } from "@/lib/utils/analytics"
import { AlertCircle, Home } from "lucide-react"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("エラーが発生しました:", error)
    logError(error, {
      digest: error.digest,
      component: "ErrorBoundary",
    })
  }, [error])

  return (
    <div className="min-h-screen bg-gradient-to-b from-cream to-cream-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardContent className="py-12 text-center">
          <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-charcoal mb-2">
            エラーが発生しました
          </h1>
          <p className="text-charcoal-300 mb-6">
            申し訳ございません。予期しないエラーが発生しました。
          </p>
          <div className="flex gap-4 justify-center">
            <Button onClick={reset} variant="outline">
              再試行
            </Button>
            <Link href="/">
              <Button className="bg-salmon hover:bg-salmon-200">
                <Home className="w-4 h-4 mr-2" />
                ホームに戻る
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

