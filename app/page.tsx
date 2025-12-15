"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { getCurrentUser } from "@/lib/firebase/auth"
import { NikukyuButton } from "@/components/nikukyu-button"
import { PawPrintAnimation } from "@/components/paw-print-animation"
import { Button } from "@/components/ui/button"
import { Heart, BookOpen, Sparkles, Share2 } from "lucide-react"

export default function Home() {
  const [isGenerating, setIsGenerating] = useState(false)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await getCurrentUser()
      setUser(currentUser)
    }
    loadUser()
  }, [])

  const handleNikukyuClick = () => {
    // 投稿作成ページに遷移
    window.location.href = "/post/create"
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-cream to-cream-50 overflow-x-hidden w-full max-w-full">
      {/* メインコンテンツ */}
      <main className="container mx-auto px-4 py-8 w-full max-w-full">
        {/* ヒーローセクション */}
        <section className="text-center mb-16">
          <div className="mb-8">
            <h2 className="text-5xl font-bold text-charcoal mb-4">
              愛猫の気持ちを
              <br />
              <span className="text-salmon-300">翻訳</span>してみませんか？
            </h2>
            <p className="text-xl text-charcoal-300 mt-6 max-w-2xl mx-auto">
              写真を投稿するだけで、AIが猫の気持ちを代弁してくれます。
              <br />
              「うちの子手帳」で性格を登録すれば、もっと正確な翻訳が可能に。
            </p>
          </div>

          {/* 肉球ボタン */}
          <div className="flex flex-col items-center gap-6 mb-12">
            <div className="relative w-full max-w-80 h-80 flex items-center justify-center mx-auto">
              <NikukyuButton
                onClick={handleNikukyuClick}
                isLoading={isGenerating}
                className="shadow-2xl z-10"
              />
              {isGenerating && (
                <div className="absolute inset-0 w-full h-full">
                  <PawPrintAnimation count={8} />
                </div>
              )}
            </div>
            <p className="text-charcoal-400 text-sm">
              {isGenerating
                ? "AIが気持ちを翻訳中..."
                : "肉球をタップして翻訳開始"}
            </p>
          </div>
        </section>

        {/* 機能紹介セクション */}
        <section className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16 w-full">
          <Link href={user ? "/techo/create" : "/auth/login"}>
            <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-shadow cursor-pointer">
              <div className="w-12 h-12 bg-salmon-100 rounded-full flex items-center justify-center mb-4">
                <BookOpen className="w-6 h-6 text-salmon-300" />
              </div>
              <h3 className="text-xl font-semibold text-charcoal mb-2">
                うちの子手帳
              </h3>
              <p className="text-charcoal-300 text-sm">
                愛猫の性格や口調を登録して、より正確な翻訳を実現
              </p>
            </div>
          </Link>

          <Link href={user ? "/post/create" : "/auth/login"}>
            <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-shadow cursor-pointer">
              <div className="w-12 h-12 bg-mint-100 rounded-full flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6 text-mint" />
              </div>
              <h3 className="text-xl font-semibold text-charcoal mb-2">
                肉球翻訳
              </h3>
              <p className="text-charcoal-300 text-sm">
                AIが写真を見て、猫の気持ちを代弁してくれます
              </p>
            </div>
          </Link>

          <Link href="/posts">
            <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-shadow cursor-pointer">
              <div className="w-12 h-12 bg-orange-warm/20 rounded-full flex items-center justify-center mb-4">
                <Heart className="w-6 h-6 text-orange-warm" />
              </div>
              <h3 className="text-xl font-semibold text-charcoal mb-2">
                カリカリ
              </h3>
              <p className="text-charcoal-300 text-sm">
                いいね機能。他の猫ちゃんにもカリカリを送りましょう
              </p>
            </div>
          </Link>

          <Link href="/stamp-challenge">
            <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-shadow cursor-pointer">
              <div className="w-12 h-12 bg-salmon-100 rounded-full flex items-center justify-center mb-4">
                <Share2 className="w-6 h-6 text-salmon-300" />
              </div>
              <h3 className="text-xl font-semibold text-charcoal mb-2">
                スタンプチャレンジ
              </h3>
              <p className="text-charcoal-300 text-sm">
                投稿8つでLINEスタンプが作れる！
              </p>
            </div>
          </Link>
        </section>

        {/* CTAセクション */}
        {!user && (
          <section className="bg-gradient-to-r from-salmon-100 to-mint-100 rounded-3xl p-12 text-center">
            <h2 className="text-3xl font-bold text-charcoal mb-4">
              さっそく始めてみましょう
            </h2>
            <p className="text-charcoal-400 mb-8">
              無料で登録して、愛猫の気持ちを翻訳してみてください
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/auth/signup">
                <Button size="lg" className="bg-salmon hover:bg-salmon-200">
                  新規登録
                </Button>
              </Link>
              <Link href="/auth/login">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-charcoal-300"
                >
                  ログイン
                </Button>
              </Link>
              <Link href="/posts">
                <Button
                  size="lg"
                  variant="secondary"
                  className="bg-mint hover:bg-mint-200"
                >
                  投稿を見る
                </Button>
              </Link>
            </div>
          </section>
        )}
      </main>

      {/* フッター */}
      <footer className="container mx-auto px-4 py-8 mt-16 border-t border-charcoal-100">
        <p className="text-center text-charcoal-300 text-sm">
          © 2024 うちの子の気持ち. All rights reserved.
        </p>
      </footer>
    </div>
  )
}

