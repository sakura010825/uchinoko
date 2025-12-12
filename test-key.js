const { GoogleGenerativeAI } = require("@google/generative-ai");

// ↓ここに .env.local にあるキーをコピペして貼り付けてください
const API_KEY = "AIzaSyBpaOP83FmrLS-zHlD1uzdXP2plVPnyuUQ"; 

async function main() {
  console.log("🚀 テスト開始...");
  const genAI = new GoogleGenerativeAI(API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

  try {
    console.log("🤖 gemini-1.5-flash に話しかけています...");
    const result = await model.generateContent("猫の鳴きマネをして");
    console.log("✅ 成功しました！！返答はこちら↓");
    console.log(result.response.text());
  } catch (error) {
    console.error("❌ エラー発生...");
    console.error(error.message);
  }
}

main();