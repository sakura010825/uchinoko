// おみくじ機能のユーティリティ
// ラッキーアイテムやメッセージをランダムで生成

export interface OmikujiResult {
  item: string
  emoji: string
  message: string
  color: string
}

// ラッキーアイテムのリスト
const LUCKY_ITEMS: Array<Omit<OmikujiResult, "message">> = [
  { item: "キャットタワー", emoji: "🏗️", color: "salmon" },
  { item: "おもちゃ", emoji: "🎾", color: "mint" },
  { item: "おやつ", emoji: "🍖", color: "orange-warm" },
  { item: "毛玉ケアグッズ", emoji: "🪮", color: "salmon" },
  { item: "お昼寝マット", emoji: "🛏️", color: "mint" },
  { item: "キャットフード", emoji: "🐟", color: "orange-warm" },
  { item: "爪とぎ", emoji: "✂️", color: "salmon" },
  { item: "お気に入りの場所", emoji: "🏠", color: "mint" },
  { item: "日向ぼっこ", emoji: "☀️", color: "orange-warm" },
  { item: "マッサージ", emoji: "💆", color: "salmon" },
  { item: "遊び時間", emoji: "🎈", color: "mint" },
  { item: "ごはんタイム", emoji: "🍽️", color: "orange-warm" },
]

// メッセージテンプレート
const MESSAGES = [
  "今日は{item}がラッキーアイテム！",
  "{item}で幸せな一日になりそう🐾",
  "今日の運勢は{item}がポイント！",
  "{item}で気分も上がるかも？",
  "今日は{item}に注目してみて✨",
]

/**
 * ランダムなおみくじ結果を生成
 * @returns おみくじ結果
 */
export function generateOmikuji(): OmikujiResult {
  const randomItem =
    LUCKY_ITEMS[Math.floor(Math.random() * LUCKY_ITEMS.length)]
  const randomMessage =
    MESSAGES[Math.floor(Math.random() * MESSAGES.length)]

  return {
    ...randomItem,
    message: randomMessage.replace("{item}", randomItem.item),
  }
}

/**
 * おみくじ結果の色をTailwindクラスに変換
 * @param color 色名
 * @returns Tailwindクラス
 */
export function getOmikujiColorClass(color: string): string {
  switch (color) {
    case "salmon":
      return "bg-salmon-200 text-salmon-300"
    case "mint":
      return "bg-mint-200 text-mint"
    case "orange-warm":
      return "bg-orange-warm/20 text-orange-warm"
    default:
      return "bg-salmon-200 text-salmon-300"
  }
}













