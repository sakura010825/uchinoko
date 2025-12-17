/**
 * 猫の年齢を計算するユーティリティ関数
 */

/**
 * 誕生日と基準日から、その時点での年齢を計算する
 * @param birthDate 誕生日（Date、string、またはnull）
 * @param targetDate 基準日（投稿の撮影日など、Date）
 * @returns 年齢の文字列（例: "1歳", "2歳3ヶ月", "生後5ヶ月", "生後20日"）またはnull
 */
export function calculateAgeAtDate(
  birthDate: Date | string | null | undefined,
  targetDate: Date
): string | null {
  if (!birthDate) {
    return null
  }

  // 文字列の場合はDateに変換
  const birth = typeof birthDate === "string" ? new Date(birthDate) : birthDate
  const target = targetDate

  // 日付の妥当性チェック
  if (isNaN(birth.getTime()) || isNaN(target.getTime())) {
    return null
  }

  // 基準日が誕生日より前の場合はnullを返す
  if (target < birth) {
    return null
  }

  // 年齢を計算
  const years = target.getFullYear() - birth.getFullYear()
  const months = target.getMonth() - birth.getMonth()
  const days = target.getDate() - birth.getDate()

  // 月と日の調整
  let totalMonths = years * 12 + months
  if (days < 0) {
    totalMonths -= 1
  }

  // 1歳以上の場合
  if (totalMonths >= 12) {
    const yearsCount = Math.floor(totalMonths / 12)
    const monthsCount = totalMonths % 12
    if (monthsCount === 0) {
      return `${yearsCount}歳`
    } else {
      return `${yearsCount}歳${monthsCount}ヶ月`
    }
  }

  // 1歳未満の場合（生後○ヶ月または生後○日）
  if (totalMonths > 0) {
    return `生後${totalMonths}ヶ月`
  }

  // 1ヶ月未満の場合（生後○日）
  const daysDiff = Math.floor((target.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24))
  if (daysDiff >= 0) {
    return `生後${daysDiff}日`
  }

  return null
}













