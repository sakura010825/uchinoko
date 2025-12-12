// パフォーマンス監視用のユーティリティ

import { logPerformanceMetric, logError } from "./analytics"

/**
 * Web Vitalsを監視
 */
export function reportWebVitals(metric: any) {
  const { name, value, id } = metric

  // メトリクスを記録
  logPerformanceMetric(name, value, metric.unit || "ms")

  // 重要なメトリクスの閾値チェック
  switch (name) {
    case "CLS":
      if (value > 0.25) {
        logError(new Error(`CLSが高い値です: ${value}`), { metric: name, value })
      }
      break
    case "FID":
      if (value > 300) {
        logError(new Error(`FIDが高い値です: ${value}ms`), { metric: name, value })
      }
      break
    case "FCP":
      if (value > 3000) {
        logError(new Error(`FCPが高い値です: ${value}ms`), { metric: name, value })
      }
      break
    case "LCP":
      if (value > 4000) {
        logError(new Error(`LCPが高い値です: ${value}ms`), { metric: name, value })
      }
      break
    case "TTFB":
      if (value > 800) {
        logError(new Error(`TTFBが高い値です: ${value}ms`), { metric: name, value })
      }
      break
  }
}

/**
 * 画像読み込み時間を測定
 */
export function measureImageLoad(imageUrl: string): Promise<number> {
  return new Promise((resolve, reject) => {
    const startTime = performance.now()
    const img = new Image()

    img.onload = () => {
      const loadTime = performance.now() - startTime
      logPerformanceMetric(`Image Load: ${imageUrl}`, loadTime)
      resolve(loadTime)
    }

    img.onerror = () => {
      const loadTime = performance.now() - startTime
      logError(new Error(`画像の読み込みに失敗しました: ${imageUrl}`), { loadTime })
      reject(new Error(`画像の読み込みに失敗しました: ${imageUrl}`))
    }

    img.src = imageUrl
  })
}

/**
 * API呼び出し時間を測定
 */
export async function measureApiCall<T>(
  apiCall: () => Promise<T>,
  apiName: string
): Promise<T> {
  const startTime = performance.now()
  
  try {
    const result = await apiCall()
    const duration = performance.now() - startTime
    logPerformanceMetric(`API Call: ${apiName}`, duration)
    
    if (duration > 5000) {
      logError(new Error(`API呼び出しが遅いです: ${apiName}`), { duration })
    }
    
    return result
  } catch (error) {
    const duration = performance.now() - startTime
    logError(error instanceof Error ? error : new Error(String(error)), {
      apiName,
      duration,
    })
    throw error
  }
}



