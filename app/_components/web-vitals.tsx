"use client"

import { useEffect } from "react"
import { reportWebVitals } from "@/lib/utils/performance"

export function WebVitals() {
  useEffect(() => {
    // Web Vitalsの監視を開始
    if (typeof window !== "undefined") {
      // 本番環境でのみ監視（開発環境ではコンソールに出力）
      if (process.env.NODE_ENV === "production") {
        import("web-vitals").then(({ onCLS, onINP, onFCP, onLCP, onTTFB }) => {
          onCLS(reportWebVitals)
          // onFIDは非推奨のため、onINPを使用（新しいバージョンではonFIDが削除されている）
          if (onINP) {
            onINP(reportWebVitals)
          }
          onFCP(reportWebVitals)
          onLCP(reportWebVitals)
          onTTFB(reportWebVitals)
        }).catch((error) => {
          console.error("Web Vitalsの読み込みに失敗しました:", error)
        })
      }
    }
  }, [])

  return null
}



