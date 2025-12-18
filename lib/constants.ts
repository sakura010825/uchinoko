// アプリケーション全体で使用する定数

export const APP_NAME = "うちの子の気持ち"
export const APP_DESCRIPTION = "愛猫の写真を投稿すると、AIが猫の気持ちを代弁してくれる翻訳SNS"

// 投稿関連の定数
export const POST_LIMIT = 10 // 無限スクロールで一度に読み込む投稿数
export const POST_SEARCH_LIMIT = 50 // 検索結果の最大数
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024 // 5MB
export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/heic",
  "image/heif",
] as const

export const ALLOWED_IMAGE_EXTENSIONS = [
  ".jpg",
  ".jpeg",
  ".png",
  ".gif",
  ".webp",
  ".heic",
  ".heif",
] as const

// うちの子手帳関連の定数
export const MAX_CAT_NAME_LENGTH = 20
export const MAX_PERSONALITY_COUNT = 5
export const MAX_FAVORITE_THINGS_COUNT = 10
export const MAX_FAVORITE_THING_LENGTH = 30

// スタンプチャレンジ関連の定数
export const STAMP_CHALLENGE_TARGET = 8
export const STAMP_IMAGE_SIZE = 512 // スタンプ画像のサイズ（px）

// パフォーマンス関連の定数
export const PERFORMANCE_THRESHOLDS = {
  CLS: 0.25,
  FID: 300, // ms
  FCP: 3000, // ms
  LCP: 4000, // ms
  TTFB: 800, // ms
  API_CALL: 5000, // ms
} as const

// トースト通知関連の定数
export const TOAST_DURATION = 5000 // ms

// 検索関連の定数
export const SEARCH_DEBOUNCE_DELAY = 300 // ms

// カラー定数（Tailwind設定と一致）
export const COLORS = {
  cream: "#FFF8DC",
  salmon: "#FFB6C1",
  mint: "#98D8C8",
  charcoal: "#4A4A4A",
  orangeWarm: "#FF7F50",
} as const














