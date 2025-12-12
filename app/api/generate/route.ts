// AI生成APIルート（Gemini API使用）
// 画像解析とテキスト生成を行う

import { NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"

// 画像をBase64に変換する関数
async function urlToBase64(imageUrl: string): Promise<string> {
  try {
    const response = await fetch(imageUrl)
    const arrayBuffer = await response.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const base64 = buffer.toString("base64")
    return base64
  } catch (error) {
    throw new Error("画像の取得に失敗しました")
  }
}

export async function POST(request: NextRequest) {
  try {
    // デバッグログ: APIキーとモデル名を確認
    const apiKeyFromEnv = process.env.GEMINI_API_KEY
    console.log("Environment check:")
    console.log("- NODE_ENV:", process.env.NODE_ENV)
    console.log("- VERCEL:", process.env.VERCEL)
    console.log("- API Key exists:", !!apiKeyFromEnv)
    console.log("- API Key length:", apiKeyFromEnv?.length || 0)
    console.log("- API Key starts with:", apiKeyFromEnv?.substring(0, 5) || "N/A")
    console.log("- API Key ends with:", apiKeyFromEnv?.substring(apiKeyFromEnv?.length - 5) || "N/A")
    console.log("Using Model: gemini-2.0-flash")
    
    const { 
      imageUrl, 
      catName, 
      pattern,
      personality, 
      firstPerson,
      toneType,
      familyRelations,
      likes,
      dislikes,
      uniqueBehaviors,
      // 後方互換性のためのフィールド
      callingOwner,
      tone,
      favoriteThings,
      dislikeThings,
      quirks
    } = await request.json()

    if (!imageUrl || !catName) {
      return NextResponse.json(
        { error: "画像URLと猫の名前が必要です" },
        { status: 400 }
      )
    }

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      console.error("GEMINI_API_KEY環境変数が設定されていません")
      const isProduction = process.env.VERCEL || process.env.NODE_ENV === "production"
      const errorMessage = isProduction
        ? "Gemini APIキーが設定されていません。Vercelの環境変数設定でGEMINI_API_KEYを追加してください。"
        : "Gemini APIキーが設定されていません。.env.localファイルにGEMINI_API_KEYを設定してください。"
      
      return NextResponse.json(
        { 
          error: errorMessage
        },
        { status: 500 }
      )
    }

    // APIキーの前後の空白を削除
    const trimmedApiKey = apiKey.trim()
    if (trimmedApiKey !== apiKey) {
      console.warn("APIキーに前後の空白が含まれていました。自動的に削除しました。")
    }

    // APIキーの形式チェック（簡単な検証）
    if (trimmedApiKey.length < 20) {
      console.error("GEMINI_API_KEYの形式が正しくない可能性があります。長さ:", trimmedApiKey.length)
      return NextResponse.json(
        { 
          error: "Gemini APIキーの形式が正しくない可能性があります。正しいAPIキーを設定してください。" 
        },
        { status: 500 }
      )
    }

    // APIキーが正しい形式か確認（Google APIキーは通常 "AIza" で始まる）
    if (!trimmedApiKey.startsWith("AIza")) {
      console.error("GEMINI_API_KEYの形式が正しくない可能性があります。先頭:", trimmedApiKey.substring(0, 4))
      return NextResponse.json(
        { 
          error: "Gemini APIキーの形式が正しくない可能性があります。Google AI Studioで新しいAPIキーを取得してください。" 
        },
        { status: 500 }
      )
    }

    const genAI = new GoogleGenerativeAI(trimmedApiKey)
    
    // 画像をBase64に変換
    const imageBase64 = await urlToBase64(imageUrl)
    
    // MIMEタイプを推測（URLの拡張子から判定）
    let mimeType = "image/jpeg" // デフォルト
    const urlLower = imageUrl.toLowerCase()
    if (urlLower.includes(".png")) {
      mimeType = "image/png"
    } else if (urlLower.includes(".gif")) {
      mimeType = "image/gif"
    } else if (urlLower.includes(".webp")) {
      mimeType = "image/webp"
    } else if (urlLower.includes(".heic") || urlLower.includes(".heif")) {
      mimeType = "image/heic"
    }

    // Gemini 2.0 Flash を使用（multimodal対応、画像入力可能）
    // モデル名は "gemini-2.0-flash" を指定
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" })

    // データの正規化（後方互換性対応）
    const normalizedPersonality = Array.isArray(personality) 
      ? personality.join("、") 
      : personality || "一般的な猫"
    const normalizedFirstPerson = firstPerson || "わたし"
    const normalizedToneType = toneType || tone || "かわいらしい"
    const normalizedLikes = likes || favoriteThings || "なし"
    const normalizedDislikes = dislikes || dislikeThings || "なし"
    const normalizedUniqueBehaviors = uniqueBehaviors || quirks || "なし"
    
    // 家族関係の文字列化
    let familyRelationsText = "なし"
    if (familyRelations && Array.isArray(familyRelations) && familyRelations.length > 0) {
      const validRelations = familyRelations.filter((fr: any) => fr.name && fr.relation)
      if (validRelations.length > 0) {
        familyRelationsText = validRelations
          .map((fr: any) => `${fr.name}のことは「${fr.relation}」だと思っている`)
          .join("。")
      }
    } else if (callingOwner) {
      // 後方互換性: callingOwnerがある場合はそれを使用
      familyRelationsText = `飼い主のことは「${callingOwner}」と呼んでいる`
    }

    const normalizedPattern = pattern || "不明"

    const prompt = `
あなたは以下の猫になりきってください。

【基本設定】
- 名前: ${catName}
- 柄: ${normalizedPattern}
- 一人称: ${normalizedFirstPerson}
- 口調の雰囲気: ${normalizedToneType}
- 性格: ${normalizedPersonality}

【家族・関係性】
${familyRelationsText}

【好き嫌い】
- 好き: ${normalizedLikes}
- 嫌い: ${normalizedDislikes}

【行動パターン・クセ】
${normalizedUniqueBehaviors}

【画像の内容】
写真を見て、この猫が今何を考えているか、どんな気持ちかを判断してください。

【重要】以下の条件を厳格に守ってください：
1. 生成するコメントは必ず30文字以内の短い一言にしてください
2. 一人称「${normalizedFirstPerson}」を必ず使用してください
3. 口調タイプ「${normalizedToneType}」の雰囲気を忠実に再現してください（例：小学生男子風なら「〜だぜ！」「〜なんだ！」など）
4. 性格「${normalizedPersonality}」を反映した、その猫らしい発言にしてください
5. 家族・関係性の情報を活用し、適切な呼び方や関係性を表現してください
6. 好きなものや嫌いなもの、特有のクセも考慮してください
7. **回答には絵文字を一切使用しないこと。絵文字は絶対に含めないでください。**
8. 猫の表情、姿勢、周囲の環境なども考慮してください

上記の設定を忠実に守り、画像の状況に合わせて「この猫なら言いそうなこと」を30文字以内で一言出力してください。絵文字は使用しないでください。
`

    // 画像とプロンプトを組み合わせて生成
    console.log("モデル名:", "gemini-2.0-flash")
    console.log("画像サイズ:", imageBase64.length, "bytes")
    console.log("MIMEタイプ:", mimeType)
    
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: imageBase64,
          mimeType: mimeType,
        },
      },
    ])

    const response = await result.response
    const text = response.text()

    return NextResponse.json({
      translation: text,
      success: true,
    })
  } catch (error: any) {
    console.error("AI生成エラー:", error)
    console.error("エラー詳細:", JSON.stringify(error, null, 2))
    
    // 403エラー（APIキーが漏洩として報告されている）の特別処理
    if (error.status === 403 || error.statusCode === 403 || error.message?.includes("403")) {
      if (error.message?.includes("leaked") || error.message?.includes("reported as leaked")) {
        return NextResponse.json(
          { 
            error: "Gemini APIキーが漏洩として報告されています。新しいAPIキーを取得して、Vercelの環境変数を更新してください。詳細はFIX_LEAKED_API_KEY.mdを参照してください。" 
          },
          { status: 403 }
        )
      }
    }

    // 429エラー（クォータ超過）の特別処理
    if (error.status === 429 || error.statusCode === 429 || error.message?.includes("429") || error.message?.includes("quota") || error.message?.includes("Quota exceeded")) {
      const retryAfter = error.message?.match(/retry in ([\d.]+)s/i)?.[1] || "60"
      return NextResponse.json(
        { 
          error: `Gemini APIの使用制限に達しました。無料プランの制限に達した可能性があります。${retryAfter}秒後に再試行するか、Google AI Studioでクォータを確認してください。詳細: https://ai.google.dev/gemini-api/docs/rate-limits` 
        },
        { status: 429 }
      )
    }
    
    // 404エラーの場合（モデル名が間違っている可能性）
    if (error.message?.includes("404") || error.status === 404 || error.statusCode === 404) {
      console.error("404エラー詳細:", {
        message: error.message,
        status: error.status,
        statusCode: error.statusCode,
        error: error
      })
      return NextResponse.json(
        { 
          error: "Gemini APIモデルが見つかりません。モデル名を確認してください。使用モデル: gemini-2.0-flash" 
        },
        { status: 500 }
      )
    }
    
    // APIキー関連のエラーの場合、より分かりやすいメッセージを返す
    if (error.message?.includes("API key not valid") || error.message?.includes("API_KEY_INVALID")) {
      const isProduction = process.env.VERCEL || process.env.NODE_ENV === "production"
      const errorMessage = isProduction
        ? "Gemini APIキーが無効です。Vercelの環境変数設定でGEMINI_API_KEYを確認し、正しいAPIキーを設定してください。設定後、再デプロイしてください。"
        : "Gemini APIキーが無効です。.env.localファイルのGEMINI_API_KEYを確認し、正しいAPIキーを設定してください。設定後、開発サーバーを再起動してください。"
      
      return NextResponse.json(
        { 
          error: errorMessage
        },
        { status: 500 }
      )
    }
    
    return NextResponse.json(
      { error: `AI生成に失敗しました: ${error.message || "不明なエラー"}` },
      { status: 500 }
    )
  }
}

