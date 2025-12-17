// エラーハンドリング用のユーティリティ

import { logError } from "./analytics"

/**
 * エラーの種類
 */
export enum ErrorType {
  NETWORK = "NETWORK",
  VALIDATION = "VALIDATION",
  AUTH = "AUTH",
  FIRESTORE = "FIRESTORE",
  STORAGE = "STORAGE",
  API = "API",
  UNKNOWN = "UNKNOWN",
}

/**
 * カスタムエラークラス
 */
export class AppError extends Error {
  constructor(
    message: string,
    public type: ErrorType = ErrorType.UNKNOWN,
    public code?: string,
    public context?: Record<string, any>
  ) {
    super(message)
    this.name = "AppError"
    Object.setPrototypeOf(this, AppError.prototype)
  }
}

/**
 * エラーをAppErrorに変換
 */
export function normalizeError(error: unknown): AppError {
  if (error instanceof AppError) {
    return error
  }

  if (error instanceof Error) {
    // Firebaseエラーの判定
    if (error.message.includes("auth/")) {
      return new AppError(error.message, ErrorType.AUTH, undefined, { originalError: error })
    }
    if (error.message.includes("firestore/") || error.message.includes("permission-denied")) {
      return new AppError(error.message, ErrorType.FIRESTORE, undefined, { originalError: error })
    }
    if (error.message.includes("storage/")) {
      return new AppError(error.message, ErrorType.STORAGE, undefined, { originalError: error })
    }
    if (error.message.includes("network") || error.message.includes("fetch")) {
      return new AppError(error.message, ErrorType.NETWORK, undefined, { originalError: error })
    }

    return new AppError(error.message, ErrorType.UNKNOWN, undefined, { originalError: error })
  }

  return new AppError(String(error), ErrorType.UNKNOWN)
}

/**
 * エラーをログに記録し、ユーザーフレンドリーなメッセージを返す
 */
export function handleError(error: unknown, context?: Record<string, any>): string {
  const appError = normalizeError(error)
  
  logError(appError, {
    type: appError.type,
    code: appError.code,
    context: { ...appError.context, ...context },
  })

  // ユーザーフレンドリーなメッセージを返す
  switch (appError.type) {
    case ErrorType.NETWORK:
      return "ネットワークエラーが発生しました。接続を確認してください。"
    case ErrorType.AUTH:
      return "認証エラーが発生しました。再度ログインしてください。"
    case ErrorType.FIRESTORE:
      return "データの取得に失敗しました。しばらくしてから再度お試しください。"
    case ErrorType.STORAGE:
      return "画像のアップロードに失敗しました。ファイルサイズや形式を確認してください。"
    case ErrorType.VALIDATION:
      return appError.message
    case ErrorType.API:
      return "API呼び出しに失敗しました。しばらくしてから再度お試しください。"
    default:
      return "エラーが発生しました。しばらくしてから再度お試しください。"
  }
}












