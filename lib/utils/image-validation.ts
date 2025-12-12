// 画像アップロードのバリデーション関数

import {
  ALLOWED_IMAGE_TYPES,
  ALLOWED_IMAGE_EXTENSIONS,
  MAX_IMAGE_SIZE,
} from "@/lib/constants"

export interface ValidationResult {
  valid: boolean
  error?: string
}

/**
 * 画像ファイルのバリデーション
 * @param file 検証するファイル
 * @returns バリデーション結果
 */
export function validateImageFile(file: File): ValidationResult {
  // ファイルサイズチェック
  if (file.size > MAX_IMAGE_SIZE) {
    return {
      valid: false,
      error: "画像は5MB以下にしてください",
    }
  }

  // ファイル形式チェック
  const mimeType = file.type.toLowerCase()
  const fileName = file.name.toLowerCase()

  // MIMEタイプが空の場合は拡張子で判定
  if (!mimeType || mimeType === "") {
    const hasAllowedExtension = ALLOWED_IMAGE_EXTENSIONS.some((ext) =>
      fileName.endsWith(ext)
    )
    if (!hasAllowedExtension) {
      return {
        valid: false,
        error: "画像ファイルを選択してください（JPG, PNG, GIF, WebP, HEIC形式のみ）",
      }
    }
    // 拡張子が許可されている場合はOK
    return { valid: true }
  }

  // MIMEタイプが指定されている場合のチェック
  // 1. 許可されたMIMEタイプのリストに含まれているか
  const isAllowedMimeType = ALLOWED_IMAGE_TYPES.includes(mimeType as any)
  
  // 2. image/で始まるか（一般的な画像ファイル）
  const isImageType = mimeType.startsWith("image/")

  // 3. 拡張子もチェック（フォールバック）
  const hasAllowedExtension = ALLOWED_IMAGE_EXTENSIONS.some((ext) =>
    fileName.endsWith(ext)
  )

  // いずれかの条件を満たしていればOK
  if (!isAllowedMimeType && !isImageType && !hasAllowedExtension) {
    return {
      valid: false,
      error: "画像ファイルを選択してください（JPG, PNG, GIF, WebP, HEIC形式のみ）",
    }
  }

  return { valid: true }
}

/**
 * ファイルサイズを人間が読みやすい形式に変換
 * @param bytes バイト数
 * @returns フォーマットされた文字列（例: "2.5 MB"）
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes"
  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i]
}

