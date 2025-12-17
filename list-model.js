// list-models.js
// Node.jsの標準機能だけでモデル一覧を取得します

const API_KEY = "AIzaSyBiG7ngUMrEPOeIdHJhGKkOoa-1rAZl0x4"; // ← ここに ...Zl0x4 のキーを貼る

async function checkModels() {
  console.log("🚀 Googleのサーバーに問い合わせ中...");
  
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.error) {
      console.error("❌ エラーが発生しました:", data.error.message);
      return;
    }

    if (!data.models) {
      console.log("❌ モデルが見つかりませんでした。");
      return;
    }

    console.log("\n✅ あなたが現在使用可能なGeminiモデル一覧:");
    console.log("-------------------------------------------------");
    
    // Geminiと名のつくモデルだけを抽出して表示
    const gems = data.models.filter(m => m.name.includes("gemini"));
    
    if (gems.length === 0) {
        console.log("（Geminiモデルが見当たりません。権限を確認してください）");
    }

    gems.forEach(model => {
      // モデル名（models/gemini-1.5-flash など）を表示
      console.log(`名前: ${model.name}`);
      console.log(`対応: ${model.supportedGenerationMethods.join(", ")}`);
      console.log("-------------------------------------------------");
    });

  } catch (err) {
    console.error("通信エラー:", err);
  }
}

checkModels();
