// フォームバリデーション用のユーティリティ関数

import {
  MAX_CAT_NAME_LENGTH,
  MAX_PERSONALITY_COUNT,
  MAX_FAVORITE_THINGS_COUNT,
  MAX_FAVORITE_THING_LENGTH,
} from "@/lib/constants"

export interface ValidationResult {
  valid: boolean
  error?: string
}

/**
 * メールアドレスのバリデーション
 */
export function validateEmail(email: string): ValidationResult {
  if (!email) {
    return { valid: false, error: "メールアドレスを入力してください" }
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return { valid: false, error: "有効なメールアドレスを入力してください" }
  }

  return { valid: true }
}

/**
 * パスワードのバリデーション
 */
export function validatePassword(password: string): ValidationResult {
  if (!password) {
    return { valid: false, error: "パスワードを入力してください" }
  }

  if (password.length < 6) {
    return { valid: false, error: "パスワードは6文字以上で入力してください" }
  }

  return { valid: true }
}

/**
 * 猫の名前のバリデーション
 */
export function validateCatName(name: string): ValidationResult {
  if (!name || name.trim().length === 0) {
    return { valid: false, error: "猫の名前を入力してください" }
  }

  if (name.length > MAX_CAT_NAME_LENGTH) {
    return {
      valid: false,
      error: `猫の名前は${MAX_CAT_NAME_LENGTH}文字以内で入力してください`,
    }
  }

  return { valid: true }
}

/**
 * 性格のバリデーション
 */
export function validatePersonality(personality: string[]): ValidationResult {
  if (!personality || personality.length === 0) {
    return { valid: false, error: "性格を1つ以上選択してください" }
  }

  if (personality.length > MAX_PERSONALITY_COUNT) {
    return {
      valid: false,
      error: `性格は${MAX_PERSONALITY_COUNT}つまで選択できます`,
    }
  }

  return { valid: true }
}

/**
 * 口調のバリデーション
 */
export function validateTone(tone: string): ValidationResult {
  if (!tone || tone.trim().length === 0) {
    return { valid: false, error: "口調を選択してください" }
  }

  return { valid: true }
}

/**
 * 好きなもののバリデーション
 */
export function validateFavoriteThings(favoriteThings: string[]): ValidationResult {
  if (!favoriteThings) {
    return { valid: true } // 任意項目
  }

  if (favoriteThings.length > MAX_FAVORITE_THINGS_COUNT) {
    return {
      valid: false,
      error: `好きなものは${MAX_FAVORITE_THINGS_COUNT}個まで入力できます`,
    }
  }

  // 各項目の文字数チェック
  for (const item of favoriteThings) {
    if (item.length > MAX_FAVORITE_THING_LENGTH) {
      return {
        valid: false,
        error: `各項目は${MAX_FAVORITE_THING_LENGTH}文字以内で入力してください`,
      }
    }
  }

  return { valid: true }
}

