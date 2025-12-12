// HEICファイルをJPEG/PNGに変換するユーティリティ

// heic2anyはクライアントサイドでのみ使用
let heic2any: any = null

// 動的インポート（クライアントサイドでのみ読み込む）
async function loadHeic2Any() {
  if (typeof window === "undefined") {
    throw new Error("heic2anyはクライアントサイドでのみ使用できます")
  }
  if (!heic2any) {
    heic2any = (await import("heic2any")).default
  }
  return heic2any
}

/**
 * HEICファイルをJPEGに変換
 * @param file HEICファイル
 * @returns 変換されたJPEGファイル
 */
export async function convertHeicToJpeg(file: File): Promise<File> {
  try {
    // heic2anyを動的ロード
    const heic2anyLib = await loadHeic2Any()
    
    // heic2anyはBlobの配列を返す
    const convertedBlob = await heic2anyLib({
      blob: file,
      toType: "image/jpeg",
      quality: 0.9, // 品質を90%に設定
    })

    // 配列の最初の要素を取得（通常は1つのファイルのみ）
    const blob = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob

    // BlobをFileに変換
    const fileName = file.name.replace(/\.(heic|heif)$/i, ".jpg")
    const convertedFile = new File([blob], fileName, {
      type: "image/jpeg",
      lastModified: Date.now(),
    })

    return convertedFile
  } catch (error) {
    console.error("HEIC変換エラー:", error)
    throw new Error("HEICファイルの変換に失敗しました")
  }
}

/**
 * ファイルがHEIC形式かどうかを判定
 * @param file チェックするファイル
 * @returns HEIC形式の場合true
 */
export function isHeicFile(file: File): boolean {
  const fileName = file.name.toLowerCase()
  const mimeType = file.type.toLowerCase()

  return (
    fileName.endsWith(".heic") ||
    fileName.endsWith(".heif") ||
    mimeType === "image/heic" ||
    mimeType === "image/heif"
  )
}

