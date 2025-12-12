import { Metadata } from "next"

export async function generateMetadata({
  params,
}: {
  params: { id: string }
}): Promise<Metadata> {
  // 実際の実装では、投稿データを取得してメタタグを生成
  // ここではデフォルトのメタタグを返す
  return {
    title: "投稿詳細 | うちの子の気持ち",
    description: "愛猫の気持ちを翻訳した投稿を閲覧",
  }
}



