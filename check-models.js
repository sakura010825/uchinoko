// check-models.js
// 以下の "AIza..." をあなたのキーに書き換えてください
const API_KEY = "AIzaSyBpaOP83FmrLS-zHlD1uzdXP2plVPnyuUQ"; 

async function main() {
  console.log("🚀 利用可能なモデルを問い合わせ中...");
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.models) {
      console.log("✅ このキーで使えるモデル一覧:");
      // 使いそうなモデルだけ見やすく表示
      const relevantModels = data.models
        .filter(m => m.name.includes("gemini"))
        .map(m => m.name);
      
      relevantModels.forEach(name => console.log(` - ${name}`));
      
      if (relevantModels.length === 0) {
        console.log("⚠️ gemini系モデルが1つも見つかりませんでした。");
      }
    } else {
      console.log("❌ エラーまたはモデルなし:", data);
    }
  } catch (error) {
    console.error("❌ 通信エラー:", error.message);
  }
}

main();