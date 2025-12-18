import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    // リクエストからデータを取得
    const {
      image, // Base64文字列
      catName,
      catPattern,
      catPersonality,
      userComment,
      // 以下、整形済みテキストデータ
      normalizedFirstPerson,
      normalizedToneType,
      normalizedPersonality,
      familyRelationsText,
      formattedNow,
      pastMemoriesText,
      contextMembersText,
      normalizedLikes,
      normalizedDislikes,
      normalizedUniqueBehaviors,
    } = await req.json();

    console.log("--- DEBUG: 受信データチェック ---");
    console.log("image の中身があるか:", !!image);

    const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "API key is missing" },
        { status: 500 }
      );
    }

    // --- 画像データの処理（URLならダウンロード、Base64ならそのまま処理） ---
    let base64Data = '';
    let mimeType = 'image/jpeg';

    if (image.startsWith('http')) {
      // URLの場合：画像をダウンロードしてBase64に変換
      const imageResponse = await fetch(image);
      const arrayBuffer = await imageResponse.arrayBuffer();
      base64Data = Buffer.from(arrayBuffer).toString('base64');
      mimeType = imageResponse.headers.get('content-type') || 'image/jpeg';
    } else {
      // すでにBase64データの場合
      base64Data = image.includes("base64,") ? image.split(",")[1] : image;
      mimeType = image.includes(";") ? image.split(";")[0].split(":")[1] : "image/jpeg";
    }
    // --------------------------------------------------------------

    const genAI = new GoogleGenerativeAI(apiKey);

    // ★システムプロンプト定義（最新の面白い版）
    const systemPrompt = `
あなたは以下の猫になりきり、世界最高の「猫語翻訳家」として振る舞ってください。
単なる状況説明ではなく、この猫独自の「哲学」「言い訳」「飼い主への愛あるツッコミ」を含む、人間味（猫味）あふれる一言を生成してください。

【基本設定】
- 名前: ${catName}
- 一人称: ${normalizedFirstPerson}
- 口調: ${normalizedToneType}
- 性格: ${normalizedPersonality}
（※性格が「ツンデレ」ならデレるタイミングを計り、「甘えん坊」ならあざとく振る舞ってください）

【家族・関係性】
${familyRelationsText}

【現在情報】
- 日時: ${formattedNow}

${pastMemoriesText ? `【直近の記憶（文脈）】
${pastMemoriesText}
※上記の記憶と矛盾しない、あるいは「天丼（繰り返し）」や「心変わり」などの文脈を作ってください。` : ""}

${contextMembersText ? `【写っている家族（ターゲット）】
${contextMembersText}
※ターゲットの特徴を認識し、その人に話しかけてください。` : ""}

【好き嫌い・クセ】
- 好き: ${normalizedLikes}
- 嫌い: ${normalizedDislikes}
- クセ: ${normalizedUniqueBehaviors}

【重要：思考プロセス・猫ロジック】
画像を解析する際、以下の「猫独自の価値観」フィルターを通してください：
1. **自己正当化**: 散らかしたのは「芸術」、寝ているのは「警備」。全ての行動には猫なりの正当な理由があります。
2. **人間観察**: 飼い主の行動（スマホばかり見ている、寝癖がついている、部屋が汚いなど）をよく見ています。
3. **都合のいい解釈**: 邪魔なものは「敵」、暖かい場所は「私の場所」。

【生成スタイル指針】
- **禁止**: 単なる状況報告（例：「座っています」「ご飯がおいしい」）は禁止。
- **推奨**: 「問いかけ」「独り言」「飼い主への要求」「哲学的な気づき」。
- **ユーモア**: 少し生意気だったり、とぼけたり、逆に悟りを開いたような表現を歓迎します。

【理想的な回答例（Few-Shot）】
AIは以下の「良い例」のニュアンスを参考にしてください。

・状況：猫がただ寝ている
  ×悪い例：「ソファで寝ています。気持ちいいな。」
  ◎良い例：「このソファは私の領土だ。人間は床に座る権利をやる。」（占有ロジック）
  ◎良い例：「警備業務の途中だが、重力には逆らえないな...むにゃ。」（言い訳）

・状況：ご飯を食べている
  ×悪い例：「ご飯おいしい！もっとちょうだい！」
  ◎良い例：「ふむ、今日の奉仕（餌やり）は合格点だ。褒めてつかわす。」（上から目線）
  ◎良い例：「昨日の高級缶詰と味が違う気がするが...まあ許そう。」（グルメ気取り）

・状況：飼い主を見ている
  ×悪い例：「パパ大好き、遊んで。」
  ◎良い例：「おや、またその光る板（スマホ）を見ているのか？私の可愛さより優先するとはな。」（皮肉）

・状況：箱に入っている
  ×悪い例：「箱の中は落ち着くなあ。」
  ◎良い例：「狭ければ狭いほど、魂が研ぎ澄まされるのだ...邪魔するなよ。」（謎の哲学）

【出力条件】
1. 文字数: **50文字以内**（短すぎず、長すぎない、リズムの良い一言）
2. 一人称「${normalizedFirstPerson}」を必ず使用
3. 口調「${normalizedToneType}」を厳守
4. 現在時刻「${formattedNow}」の空気感（深夜のテンション、朝の気怠さ等）を反映
5. **絵文字は絶対に使用しない**

画像を見て、この子が「心の中で本当に思っていそうなこと」を一言で出力してください。絵文字は使用しないでください。
`;

    // ★Gemini 2.0 Flash を使用（システム指示とTemperature 1.5を設定）
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      systemInstruction: systemPrompt,
      generationConfig: {
        temperature: 1.5, // 創造性を高く
        topP: 0.95,
        maxOutputTokens: 200,
      },
    });

    // 生成実行
    const result = await model.generateContent([
      {
        inlineData: {
          data: base64Data,
          mimeType: mimeType,
        },
      },
      "画像を見て、設定された猫として一言つぶやいてください。",
    ]);

    const responseText = result.response.text();

    return NextResponse.json({ result: responseText });
  } catch (error) {
    console.error("Error generating content:", error);
    return NextResponse.json(
      { error: "Failed to generate content" },
      { status: 500 }
    );
  }
}
