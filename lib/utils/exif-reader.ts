/**
 * Exif情報を読み取るユーティリティ
 * クライアントサイドでのみ動作します
 */

/**
 * 画像ファイルからExif情報を取得し、撮影日時を返す
 * @param file 画像ファイル
 * @returns 撮影日時（Date）、取得できない場合はnull
 */
export async function getImageTakenDate(file: File): Promise<Date | null> {
  // クライアントサイドでのみ実行
  if (typeof window === "undefined") {
    return null
  }

  try {
    // exifrを動的にインポート（クライアントサイドのみ）
    const exifr = await import("exifr")
    
    // Exif情報を取得
    const exifData = await exifr.parse(file, {
      pick: ["DateTimeOriginal", "CreateDate", "ModifyDate"],
    })

    // DateTimeOriginal（撮影日時）を優先的に使用
    if (exifData?.DateTimeOriginal) {
      const date = new Date(exifData.DateTimeOriginal)
      if (!isNaN(date.getTime())) {
        return date
      }
    }

    // CreateDateをフォールバックとして使用
    if (exifData?.CreateDate) {
      const date = new Date(exifData.CreateDate)
      if (!isNaN(date.getTime())) {
        return date
      }
    }

    // ModifyDateを最後のフォールバックとして使用
    if (exifData?.ModifyDate) {
      const date = new Date(exifData.ModifyDate)
      if (!isNaN(date.getTime())) {
        return date
      }
    }

    return null
  } catch (error) {
    console.warn("Exif情報の取得に失敗しました:", error)
    return null
  }
}

