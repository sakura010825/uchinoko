// スタンプセット生成API
// ユーザーの投稿8つから背景透過PNGのスタンプセットを作成

import { NextRequest, NextResponse } from "next/server"
import sharp from "sharp"
import JSZip from "jszip"

interface PostData {
  id: string
  imageUrl: string
  catName: string
}

export async function POST(request: NextRequest) {
  try {
    const { userId, posts } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { error: "ユーザーIDが必要です" },
        { status: 400 }
      )
    }

    if (!posts || !Array.isArray(posts) || posts.length < 8) {
      return NextResponse.json(
        { error: "投稿が8つ以上必要です" },
        { status: 400 }
      )
    }

    const zip = new JSZip()

    // 各投稿画像を処理
    for (let i = 0; i < Math.min(8, posts.length); i++) {
      const post = posts[i] as PostData
      
      try {
        // 画像を取得
        const imageResponse = await fetch(post.imageUrl)
        if (!imageResponse.ok) {
          throw new Error(`画像の取得に失敗しました: ${post.imageUrl}`)
        }

        const imageBuffer = Buffer.from(await imageResponse.arrayBuffer())

        // 画像を処理（512x512の背景透過PNGに変換）
        // 注意: 実際の背景透過処理は複雑なため、ここでは簡易的にリサイズとPNG変換のみ
        const processedImage = await sharp(imageBuffer)
          .resize(512, 512, {
            fit: "contain",
            background: { r: 0, g: 0, b: 0, alpha: 0 }, // 透明背景
          })
          .png()
          .toBuffer()

        // ZIPに追加
        const fileName = `stamp-${i + 1}-${post.catName || `post-${i + 1}`}.png`
        zip.file(fileName, processedImage)
      } catch (error: any) {
        console.error(`投稿 ${i + 1} の処理エラー:`, error)
        // エラーが発生した場合でも、他の画像は処理を続ける
        // 必要に応じて、エラーをスキップするか、デフォルト画像を使用
      }
    }

    // ZIPファイルを生成
    const zipBuffer = await zip.generateAsync({ type: "nodebuffer" })

    return new NextResponse(zipBuffer as unknown as BodyInit, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="stamp-set-${Date.now()}.zip"`,
      },
    })
  } catch (error: any) {
    console.error("スタンプ生成エラー:", error)
    return NextResponse.json(
      { error: `スタンプ生成に失敗しました: ${error.message || "不明なエラー"}` },
      { status: 500 }
    )
  }
}

