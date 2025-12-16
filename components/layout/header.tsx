"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { getCurrentUser, logout } from "@/lib/firebase/auth"
import { Button } from "@/components/ui/button"
import { BookOpen, User, LogOut } from "lucide-react"

export function Header() {
  const pathname = usePathname()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await getCurrentUser()
      setUser(currentUser)
      setLoading(false)
    }
    loadUser()
  }, [pathname])

  const handleLogout = async () => {
    await logout()
    setUser(null)
    window.location.href = "/"
  }

  // 認証ページや公開ページでは表示しない
  const hideHeader = pathname?.startsWith("/auth")

  if (hideHeader || loading) {
    return null
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-cream/95 backdrop-blur supports-[backdrop-filter]:bg-cream/60 overflow-x-hidden">
      <div className="w-full max-w-screen-xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-2">
          <Link href="/" className="flex-shrink-0">
            <h1 className="text-xl sm:text-2xl font-bold text-salmon-300 whitespace-nowrap">
              うちの子の気持ち
            </h1>
          </Link>
          <nav className="flex items-center gap-1 sm:gap-2 flex-shrink" aria-label="メインナビゲーション">
            {/* モバイル表示: アイコンのみ、PC表示: テキスト付き */}
            <Link href="/posts">
              <Button variant="ghost" size="sm" className="hidden sm:flex" aria-label="投稿一覧ページへ">
                投稿を見る
              </Button>
              <Button variant="ghost" size="sm" className="sm:hidden" aria-label="投稿一覧ページへ">
                📝
              </Button>
            </Link>
            <Link href="/stamp-challenge">
              <Button variant="ghost" size="sm" className="hidden sm:flex" aria-label="スタンプチャレンジページへ">
                スタンプ
              </Button>
              <Button variant="ghost" size="sm" className="sm:hidden" aria-label="スタンプチャレンジページへ">
                🎁
              </Button>
            </Link>
            {user ? (
              <>
                <Link href="/techo">
                  <Button variant="ghost" size="sm" className="hidden sm:flex">
                    <BookOpen className="w-4 h-4 mr-2" />
                    手帳
                  </Button>
                  <Button variant="ghost" size="sm" className="sm:hidden" aria-label="うちの子手帳">
                    <BookOpen className="w-4 h-4" />
                  </Button>
                </Link>
                <Link href="/family-members">
                  <Button variant="ghost" size="sm" className="hidden sm:flex" aria-label="家族メンバー設定">
                    👨‍👩‍👧
                  </Button>
                  <Button variant="ghost" size="sm" className="sm:hidden" aria-label="家族メンバー設定">
                    👨‍👩‍👧
                  </Button>
                </Link>
                <Link href="/profile">
                  <Button variant="ghost" size="sm" className="hidden sm:flex">
                    <User className="w-4 h-4 mr-2" />
                    プロフィール
                  </Button>
                  <Button variant="ghost" size="sm" className="sm:hidden" aria-label="プロフィール">
                    <User className="w-4 h-4" />
                  </Button>
                </Link>
                <Button variant="ghost" size="sm" onClick={handleLogout} className="hidden sm:flex">
                  <LogOut className="w-4 h-4 mr-2" />
                  ログアウト
                </Button>
                <Button variant="ghost" size="sm" onClick={handleLogout} className="sm:hidden" aria-label="ログアウト">
                  <LogOut className="w-4 h-4" />
                </Button>
              </>
            ) : (
              <>
                <Link href="/auth/login">
                  <Button variant="ghost" size="sm" className="text-xs sm:text-sm">
                    ログイン
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button variant="default" size="sm" className="text-xs sm:text-sm">
                    登録
                  </Button>
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  )
}

