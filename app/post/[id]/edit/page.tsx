"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { getCurrentUser } from "@/lib/firebase/auth"
import { getPost, updatePost, getUchinoKoTecho } from "@/lib/firebase/firestore"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { NikukyuButton } from "@/components/nikukyu-button"
import { PawPrintAnimation } from "@/components/paw-print-animation"
import { ArrowLeft, X } from "lucide-react"
import type { Post, UchinoKoTecho } from "@/lib/firebase/types"

export default function EditPostPage() {
  const router = useRouter()
  const params = useParams()
  const postId = params.id as string

  const [post, setPost] = useState<Post | null>(null)
  const [selectedTecho, setSelectedTecho] = useState<UchinoKoTecho | null>(null)
  const [techoList, setTechoList] = useState<UchinoKoTecho[]>([])
  const [translation, setTranslation] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      const user = await getCurrentUser()
      if (!user) {
        router.push("/auth/login")
        return
      }

      // 投稿を取得
      const { data: postData, error: postError } = await getPost(postId)
      if (postError || !postData) {
        setError("投稿の取得に失敗しました")
        setInitialLoading(false)
        return
      }

      // 投稿がユーザーのものか確認
      if (postData.userId !== user.uid) {
        setError("この投稿を編集する権限がありません")
        setInitialLoading(false)
        return
      }

      setPost(postData)
      setTranslation(postData.aiTranslation)

      // うちの子手帳を取得
      const { data: techoData } = await getUchinoKoTecho(user.uid)
      if (techoData && techoData.length > 0) {
        setTechoList(techoData)
        const techo = techoData.find((t) => t.id === postData.catId)
        if (techo) {
          setSelectedTecho(techo)
        } else {
          setSelectedTecho(techoData[0])
        }
      }

      setInitialLoading(false)
    }
    loadData()
  }, [postId, router])

  const handleGenerateTranslation = async () => {
    if (!post || !selectedTecho) {
      setError("必要な情報が不足しています")
      return
    }

    setIsGenerating(true)
    setError("")

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imageUrl: post.imageUrl,
          catName: selectedTecho.catName,
          personality: selectedTecho.personality,
          tone: selectedTecho.tone,
        }),
      })

      const data = await response.json()

      if (data.error) {
        setError(data.error)
        setIsGenerating(false)
        return
      }

      setTranslation(data.translation)
      setIsGenerating(false)
    } catch (error: any) {
      setError("翻訳の生成に失敗しました: " + error.message)
      setIsGenerating(false)
    }
  }

  const handleSubmit = async () => {
    if (!post || !selectedTecho || !translation) {
      setError("すべての項目を入力してください")
      return
    }

    setLoading(true)
    setError("")

    const user = await getCurrentUser()
    if (!user) {
      setError("ログインが必要です")
      setLoading(false)
      router.push("/auth/login")
      return
    }

    const { error: updateError } = await updatePost(postId, user.uid, {
      catId: selectedTecho.id,
      catName: selectedTecho.catName,
      aiTranslation: translation,
    })

    if (updateError) {
      setError("投稿の更新に失敗しました")
      setLoading(false)
      return
    }

    router.push("/profile")
    router.refresh()
  }

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-cream to-cream-50 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center text-charcoal-300">読み込み中...</div>
        </div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-cream to-cream-50 py-12">
        <div className="container mx-auto px-4">
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-charcoal-300 mb-4">{error || "投稿が見つかりません"}</p>
              <Link href="/profile">
                <Button>プロフィールに戻る</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-cream to-cream-50 py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="mb-8">
          <Link href="/profile">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              プロフィールに戻る
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">投稿を編集</CardTitle>
            <CardDescription>
              翻訳を再生成するか、手動で編集できます
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 画像プレビュー */}
            <div className="relative w-full h-64 rounded-lg overflow-hidden border-2 border-salmon-200">
              <Image
                src={post.imageUrl}
                alt={post.catName}
                fill
                className="object-cover"
              />
            </div>

            {/* うちの子手帳選択 */}
            {techoList.length > 0 && (
              <div className="space-y-2">
                <Label>うちの子手帳を選択</Label>
                <select
                  className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={selectedTecho?.id || ""}
                  onChange={(e) => {
                    const techo = techoList.find((t) => t.id === e.target.value)
                    setSelectedTecho(techo || null)
                  }}
                >
                  {techoList.map((techo) => (
                    <option key={techo.id} value={techo.id}>
                      {techo.catName}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* 肉球翻訳ボタン */}
            {selectedTecho && (
              <div className="flex flex-col items-center gap-4">
                <div className="relative w-80 h-80 flex items-center justify-center">
                  <NikukyuButton
                    onClick={handleGenerateTranslation}
                    isLoading={isGenerating}
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
                    : "肉球をタップして翻訳を再生成"}
                </p>
              </div>
            )}

            {/* 翻訳結果 */}
            <div className="space-y-2">
              <Label>翻訳結果</Label>
              <textarea
                className="w-full min-h-[200px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={translation}
                onChange={(e) => setTranslation(e.target.value)}
                placeholder="翻訳結果を入力または編集してください"
              />
            </div>

            {error && (
              <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                {error}
              </div>
            )}

            {/* 更新ボタン */}
            <div className="flex gap-4">
              <Button
                onClick={handleSubmit}
                className="flex-1"
                disabled={loading}
              >
                {loading ? "更新中..." : "更新する"}
              </Button>
              <Link href="/profile" className="flex-1">
                <Button type="button" variant="outline" className="w-full">
                  キャンセル
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}



