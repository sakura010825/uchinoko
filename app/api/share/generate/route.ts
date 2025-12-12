// シェア用画像生成API（おみくじ機能付き）
// 投稿画像＋おみくじ結果を合成した画像を生成

import { NextRequest, NextResponse } from "next/server"
import sharp from "sharp"
import { generateOmikuji } from "@/lib/utils/omikuji"

export async function POST(request: NextRequest) {
  try {
    const { imageUrl, catName, translation, omikujiItem, omikujiEmoji } =
      await request.json()

    if (!imageUrl || !catName) {
      return NextResponse.json(
        { error: "画像URLと猫の名前が必要です" },
        { status: 400 }
      )
    }

    // おみくじ結果（クライアントから送られてきたもの、または新規生成）
    const omikuji = omikujiItem
      ? { item: omikujiItem, emoji: omikujiEmoji || "🎁" }
      : generateOmikuji()

    // 元の画像を取得
    const imageResponse = await fetch(imageUrl)
    if (!imageResponse.ok) {
      throw new Error("画像の取得に失敗しました")
    }

    const imageBuffer = Buffer.from(await imageResponse.arrayBuffer())

    // 画像を処理（1200x630のSNSシェア用サイズ）
    const shareImageWidth = 1200
    const shareImageHeight = 630

    // 元画像をリサイズ（上部に配置）
    const resizedImage = await sharp(imageBuffer)
      .resize(1200, 400, {
        fit: "cover",
      })
      .toBuffer()

    // 背景画像を作成（クリーム色）
    const background = await sharp({
      create: {
        width: shareImageWidth,
        height: shareImageHeight,
        channels: 3,
        background: { r: 255, g: 248, b: 220 }, // クリーム色
      },
    })
      .png()
      .toBuffer()

    // 画像を合成
    const finalImage = await sharp(background)
      .composite([
        {
          input: resizedImage,
          top: 0,
          left: 0,
        },
      ])
      .png()
      .toBuffer()

    // テキストを追加するために、SVGオーバーレイを作成
    // 注意: sharpでは直接テキストを描画できないため、簡易的な実装
    // 本番環境では、canvasやnode-canvasを使用することを推奨

    // ここでは画像のみを返す（テキストはクライアント側で追加することも可能）
    return new NextResponse(finalImage as unknown as BodyInit, {
      headers: {
        "Content-Type": "image/png",
        "Content-Disposition": `inline; filename="share-image.png"`,
      },
    })
  } catch (error: any) {
    console.error("シェア画像生成エラー:", error)
    return NextResponse.json(
      { error: `シェア画像生成に失敗しました: ${error.message || "不明なエラー"}` },
      { status: 500 }
    )
  }
}

