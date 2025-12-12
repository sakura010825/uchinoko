// アナリティクスとパフォーマンス監視用のユーティリティ

/**
 * パフォーマンスメトリクスを記録
 */
export function logPerformanceMetric(name: string, value: number, unit: string = "ms") {
  if (typeof window !== "undefined" && "performance" in window) {
    console.log(`[Performance] ${name}: ${value}${unit}`)
    
    // 将来的にGoogle Analyticsやその他のアナリティクスサービスに送信可能
    // 例: gtag('event', 'timing_complete', { name, value, event_category: 'Performance' })
  }
}

/**
 * カスタムイベントを記録
 */
export function logEvent(eventName: string, eventData?: Record<string, any>) {
  if (typeof window !== "undefined") {
    console.log(`[Event] ${eventName}`, eventData || {})
    
    // 将来的にGoogle Analyticsやその他のアナリティクスサービスに送信可能
    // 例: gtag('event', eventName, eventData)
  }
}

/**
 * エラーを記録
 */
export function logError(error: Error | string, context?: Record<string, any>) {
  const errorMessage = error instanceof Error ? error.message : error
  const errorStack = error instanceof Error ? error.stack : undefined
  
  console.error(`[Error] ${errorMessage}`, {
    stack: errorStack,
    context: context || {},
    timestamp: new Date().toISOString(),
  })
  
  // 将来的にエラートラッキングサービス（Sentry等）に送信可能
  // 例: Sentry.captureException(error, { extra: context })
}

/**
 * ページビューを記録
 */
export function logPageView(path: string) {
  if (typeof window !== "undefined") {
    console.log(`[PageView] ${path}`)
    
    // 将来的にGoogle Analyticsやその他のアナリティクスサービスに送信可能
    // 例: gtag('config', 'GA_MEASUREMENT_ID', { page_path: path })
  }
}



