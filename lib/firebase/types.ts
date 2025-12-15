// Firebase関連の型定義

import { Timestamp } from "firebase/firestore"

/**
 * 家族関係の型定義
 */
export interface FamilyRelation {
  name: string // 名前（例: "パパ", "ママ", "先輩猫"）
  relation: string // 猫から見た関係性（例: "ご飯係、たまに遊んでくれる", "下僕", "怖い先輩"）
}

/**
 * うちの子手帳の型定義
 */
export interface UchinoKoTecho {
  id: string
  userId: string
  catName: string
  pattern: string // 柄（選択式: くろ, しろ, サビ, キジトラ, 茶トラ, ミケ, その他, etc.）
  personality: string[] // 性格（マルチセレクト: ツンデレ, 甘えん坊, 王様, ビビリ, etc.）
  firstPerson: string // 一人称（選択式: わたし, ぼく, オレ, あたち, etc.）
  toneType: string // 口調タイプ（選択式: 小学生男子風, 貴婦人風, おじさん風, 赤ちゃん風, etc.）
  familyRelations: FamilyRelation[] // 家族・同居人リスト
  likes: string // 好きなもの（自由記述）
  dislikes: string // 嫌いなもの（自由記述）
  uniqueBehaviors: string // その子特有のクセ・エピソード（自由記述）
  birthDate?: Date | string | null // 誕生日（任意項目）
  // 後方互換性のためのフィールド（既存データとの互換性）
  callingOwner?: string // 飼い主の呼び方（非推奨、familyRelationsに移行）
  tone?: string // 口調（非推奨、toneTypeに移行）
  favoriteThings?: string // 好きなもの（非推奨、likesに移行）
  dislikeThings?: string // 嫌いなもの（非推奨、dislikesに移行）
  quirks?: string // 特記事項（非推奨、uniqueBehaviorsに移行）
  createdAt: Date
  updatedAt: Date
}

/**
 * うちの子手帳の作成用データ型（IDとタイムスタンプを除く）
 */
export type UchinoKoTechoCreateData = Omit<
  UchinoKoTecho,
  "id" | "userId" | "createdAt" | "updatedAt"
>

/**
 * うちの子手帳の更新用データ型（部分更新可能）
 */
export type UchinoKoTechoUpdateData = Partial<UchinoKoTechoCreateData>

/**
 * 投稿の型定義
 */
export interface Post {
  id: string
  userId: string
  catId: string // うちの子手帳のID
  catName: string // うちの子手帳から取得
  imageUrl: string
  aiTranslation: string
  karikariCount: number
  takenAt?: Date | null // 撮影日時（Exifから取得、なければnull）
  createdAt: Date
  updatedAt: Date
}

/**
 * 投稿の作成用データ型（IDとタイムスタンプ、カリカリ数を除く）
 */
export type PostCreateData = Omit<
  Post,
  "id" | "userId" | "karikariCount" | "createdAt" | "updatedAt"
>

/**
 * 投稿の更新用データ型（部分更新可能）
 */
export type PostUpdateData = Partial<Omit<Post, "id" | "userId" | "karikariCount" | "createdAt">>

/**
 * カリカリ（いいね）の型定義
 */
export interface Karikari {
  id: string // postId_userId
  postId: string
  userId: string
  createdAt: Date
}

/**
 * APIレスポンスの基本型
 */
export interface ApiResponse<T = unknown> {
  data: T | null
  error: string | null
}

/**
 * Firestore操作の結果型
 */
export interface FirestoreResult<T = string> {
  id?: T | null
  error: string | null
}

/**
 * 画像アップロード結果の型
 */
export interface ImageUploadResult {
  url: string | null
  error: string | null
}

/**
 * 画像削除結果の型
 */
export interface ImageDeleteResult {
  success: boolean
  error: string | null
}
