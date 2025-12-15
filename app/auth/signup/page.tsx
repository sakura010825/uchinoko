"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { signUp, signInWithGoogle } from "@/lib/firebase/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Heart, Chrome, AlertTriangle, X } from "lucide-react"

export default function SignupPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [isInAppBrowser, setIsInAppBrowser] = useState(false)
  const [showBrowserWarning, setShowBrowserWarning] = useState(false)

  // LINE内ブラウザを検知
  useEffect(() => {
    if (typeof window !== "undefined") {
      const userAgent = window.navigator.userAgent || ""
      const isLine = /Line/i.test(userAgent)
      setIsInAppBrowser(isLine)
      setShowBrowserWarning(isLine)
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (password !== confirmPassword) {
      setError("パスワードが一致しません")
      return
    }

    if (password.length < 6) {
      setError("パスワードは6文字以上で入力してください")
      return
    }

    setLoading(true)

    const { user, error: authError } = await signUp(email, password)

    if (authError) {
      setError(authError)
      setLoading(false)
      return
    }

    if (user) {
      router.push("/")
      router.refresh()
    }
  }

  const handleGoogleLogin = async () => {
    setError("")
    setLoading(true)

    const { user, error: authError } = await signInWithGoogle()

    if (authError) {
      setError(authError)
      setLoading(false)
      return
    }

    if (user) {
      router.push("/")
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      {/* LINE内ブラウザ警告バナー */}
      {showBrowserWarning && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-orange-500 text-white shadow-lg">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium">
                  GoogleログインはLINE内ブラウザでは利用できません。右上のメニュー等から「ブラウザで開く」を選択するか、Chrome/Safariで開き直してください。
                </p>
              </div>
              <button
                onClick={() => setShowBrowserWarning(false)}
                className="flex-shrink-0 hover:bg-orange-600 rounded p-1 transition-colors"
                aria-label="警告を閉じる"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
      <Card className={`w-full max-w-md shadow-lg ${showBrowserWarning ? 'mt-20' : ''}`}>
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Heart className="w-12 h-12 text-salmon-300" />
          </div>
          <CardTitle className="text-3xl text-gray-900">新規登録</CardTitle>
          <CardDescription className="text-gray-600">
            愛猫の気持ちを翻訳してみましょう
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-900">メールアドレス</Label>
              <Input
                id="email"
                type="email"
                placeholder="example@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-white border-gray-300 text-gray-900"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-900">パスワード</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="bg-white border-gray-300 text-gray-900"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-gray-900">パスワード（確認）</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                className="bg-white border-gray-300 text-gray-900"
              />
            </div>
            {error && (
              <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                {error}
              </div>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "登録中..." : "新規登録"}
            </Button>
          </form>
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-charcoal-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-500">または</span>
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            className="w-full border-2 border-gray-300 hover:bg-gray-50 text-gray-900"
            onClick={handleGoogleLogin}
            disabled={loading || isInAppBrowser}
            title={isInAppBrowser ? "LINE内ブラウザではGoogleログインは利用できません" : ""}
          >
            <Chrome className="w-5 h-5 mr-2" />
            Googleでログイン
          </Button>
          <div className="mt-6 text-center text-sm">
            <span className="text-gray-600">すでにアカウントをお持ちの方は</span>
            <Link href="/auth/login" className="text-salmon-300 hover:underline ml-1">
              ログイン
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

