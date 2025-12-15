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
    <header className="sticky top-0 z-50 w-full border-b bg-cream/95 backdrop-blur supports-[backdrop-filter]:bg-cream/60">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex-shrink-0">
            <h1 className="text-2xl font-bold text-salmon-300 whitespace-nowrap">
              うちの子の気持ち
            </h1>
          </Link>
          <nav className="flex items-center gap-2" aria-label="メインナビゲーション">
            <Link href="/posts">
              <Button variant="ghost" size="sm" aria-label="投稿一覧ページへ">
                投稿を見る
              </Button>
            </Link>
            <Link href="/stamp-challenge">
              <Button variant="ghost" size="sm" aria-label="スタンプチャレンジページへ">
                スタンプチャレンジ
              </Button>
            </Link>
            {user ? (
              <>
                <Link href="/techo">
                  <Button variant="ghost" size="sm">
                    <BookOpen className="w-4 h-4 mr-2" />
                    うちの子手帳
                  </Button>
                </Link>
                <Link href="/profile">
                  <Button variant="ghost" size="sm">
                    <User className="w-4 h-4 mr-2" />
                    プロフィール
                  </Button>
                </Link>
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  <LogOut className="w-4 h-4 mr-2" />
                  ログアウト
                </Button>
              </>
            ) : (
              <>
                <Link href="/auth/login">
                  <Button variant="ghost" size="sm">
                    ログイン
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button variant="default" size="sm">
                    新規登録
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

