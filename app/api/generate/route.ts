// AI生成APIルート（Gemini API使用）
// 画像解析とテキスト生成を行う

import { NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"
import { db } from "@/lib/firebase/config"
import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  where,
} from "firebase/firestore"

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
      quirks,
      // 家族メンバーの外見特徴情報
      familyMembers,
      // 他のペット情報（追加）
      otherPets,
      selectedCatId,
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
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.0-flash-exp", // ※お使いのモデル名のままでOK
      generationConfig: {
        temperature: 1.2,       // 創造性を上げる（0.0〜2.0。1.0以上でユニークになります）
        topP: 0.95,             // 文章の多様性を確保
        maxOutputTokens: 100,   // 短い一言なので制限をつける
      },
    });

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

    // 現在の日時情報（時間帯・季節連動用）
    const now = new Date()
    const pad = (n: number) => n.toString().padStart(2, "0")
    const formattedNow = `${now.getFullYear()}/${pad(now.getMonth() + 1)}/${pad(
      now.getDate()
    )} ${pad(now.getHours())}:${pad(now.getMinutes())}`

    // 動的コンテキスト構築：人間の家族メンバーと他の猫を統合
    const contextMembers: string[] = []

    // 人間の家族メンバー
    if (familyMembers && Array.isArray(familyMembers) && familyMembers.length > 0) {
      const validMembers = familyMembers.filter((fm: any) => fm.name && fm.appearanceFeatures)
      validMembers.forEach((fm: any) => {
        contextMembers.push(`- 名前: ${fm.name} (人間) / 特徴: ${fm.appearanceFeatures}`)
      })
    }

    // 他の猫（主役を除く）
    if (otherPets && Array.isArray(otherPets) && otherPets.length > 0) {
      const validPets = otherPets.filter((pet: any) => 
        pet.catName && (pet.appearanceFeatures || pet.pattern)
      )
      validPets.forEach((pet: any) => {
        const features = pet.appearanceFeatures 
          ? pet.appearanceFeatures 
          : pet.pattern 
            ? `柄: ${pet.pattern}` 
            : "特徴なし"
        contextMembers.push(`- 名前: ${pet.catName} (猫) / 特徴: ${features}`)
      })
    }

    // コンテキストメンバーのテキスト化
    const contextMembersText = contextMembers.length > 0 ? contextMembers.join("\n") : ""

    // 「過去の記憶」用に、この猫の直近投稿（最大5件）を取得
    let pastMemoriesText = ""
    if (selectedCatId && db) {
      try {
        const postsRef = collection(db, "posts")
        const q = query(
          postsRef,
          where("catId", "==", selectedCatId),
          orderBy("createdAt", "desc"),
          limit(5)
        )
        const snapshot = await getDocs(q)

        const logs: string[] = []
        snapshot.forEach((doc) => {
          const data: any = doc.data()
          const createdAt = data.createdAt?.toDate
            ? data.createdAt.toDate()
            : data.createdAt
            ? new Date(data.createdAt)
            : null
          const text: string = data.aiTranslation || data.comment || ""

          if (!createdAt || !text) return

          const d = createdAt as Date
          const logDate = `${pad(d.getMonth() + 1)}/${pad(d.getDate())} ${pad(
            d.getHours()
          )}:${pad(d.getMinutes())}`
          logs.push(`- [${logDate}] 「${text}」`)
        })

        if (logs.length > 0) {
          pastMemoriesText = logs.join("\n")
        }
      } catch (memoryError) {
        console.error("過去の投稿取得中にエラーが発生しました:", memoryError)
      }
    }

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

【現在情報】
- 日時: ${formattedNow}

${pastMemoriesText ? `【あなたの記憶（直近の投稿）】
以下は、あなた（${catName}）の直近の発言ログです。これらを過去の記憶として参照し、もし文脈がつながる場合は「昨日のあれは楽しかった」など、過去を回想するような発言を混ぜてください。

${pastMemoriesText}
` : ""}

${contextMembersText ? `【家族メンバーリスト（画像認識用）】
画像内には、以下の「家族メンバー（人間および同居猫）」が写っている可能性があります。
特徴が一致するメンバーがいる場合、その相手に向けたセリフを生成してください。

${contextMembersText}
` : ""}

【好き嫌い】
- 好き: ${normalizedLikes}
- 嫌い: ${normalizedDislikes}

【行動パターン・クセ】
${normalizedUniqueBehaviors}

【画像の内容】
写真を見て、この猫が今何を考えているか、どんな気持ちかを判断してください。
${contextMembersText ? "画像内に写っている人物や他の猫が、上記の家族メンバーリストの特徴と一致する場合は、その相手（名前）に向けたセリフを生成してください。" : ""}

【重要】以下の条件を厳格に守ってください：
1. 生成するコメントは必ず30文字以内の短い一言にしてください
2. 一人称「${normalizedFirstPerson}」を必ず使用してください
3. 口調タイプ「${normalizedToneType}」の雰囲気を忠実に再現してください（例：小学生男子風なら「〜だぜ！」「〜なんだ！」など）
4. 性格「${normalizedPersonality}」を反映した、その猫らしい発言にしてください
5. 家族・関係性の情報を活用し、適切な呼び方や関係性を表現してください
6. ${contextMembersText ? "画像内の人物や他の猫が登録された家族メンバーリストの特徴と一致する場合、その相手の名前（例: パパ、ママ、ひなちゃん、さくらちゃん）を呼びかける形でセリフを生成してください。" : ""}
7. 好きなものや嫌いなもの、特有のクセも考慮してください
8. 現在は「${formattedNow}」です。深夜なら「眠い」「まだ起きてるの？」のような発言、朝なら「おはよう」、昼なら「遊ぼう」など、時間帯や季節感（寒そう・暑そう 等）も考慮してください
9. **回答には絵文字を一切使用しないこと。絵文字は絶対に含めないでください。**
10. 猫の表情、姿勢、周囲の環境なども考慮してください

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

