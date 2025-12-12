"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getCurrentUser } from "@/lib/firebase/auth"
import {
  getUserPostCount,
  getUserPostsForStamps,
} from "@/lib/firebase/firestore"
import { StampChallengeProgress } from "@/components/stamp-challenge-progress"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Gift, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { logError } from "@/lib/utils/analytics"

export default function StampChallengePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [postCount, setPostCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      const user = await getCurrentUser()
      if (!user) {
        router.push("/auth/login")
        return
      }

      const { count, error } = await getUserPostCount(user.uid)
      if (error) {
        console.error("投稿数の取得に失敗しました:", error)
        logError(new Error(error), { context: "getUserPostCount_stamp_challenge", userId: user.uid })
        toast({
          variant: "destructive",
          title: "エラー",
          description: "投稿数の取得に失敗しました。",
        })
      } else {
        setPostCount(count || 0)
      }
      setLoading(false)
    }
    loadData()
  }, [router])

  const handleDownload = async () => {
    const user = await getCurrentUser()
    if (!user) {
      router.push("/auth/login")
      return
    }

    // 投稿数を再確認
    const { count: currentCount, error: countError } = await getUserPostCount(user.uid)
    if (countError) {
      alert("投稿数の取得に失敗しました: " + countError)
      return
    }

    if (currentCount < 8) {
      alert(`投稿が8つ以上必要です（現在: ${currentCount}件）`)
      return
    }

    setDownloading(true)

    try {
      // ユーザーの投稿を取得
      const { data: posts, error: postsError } = await getUserPostsForStamps(
        user.uid,
        8
      )

      if (postsError) {
        // インデックスエラーの場合、より分かりやすいメッセージを表示
        if (postsError.includes("index") || postsError.includes("インデックス")) {
          throw new Error(
            "Firestoreのインデックスが必要です。\n" +
            "以下のURLからインデックスを作成してください：\n" +
            "https://console.firebase.google.com/project/uchinoko-app-38b95/firestore/indexes\n\n" +
            "または、しばらく待ってから再度お試しください。"
          )
        }
        throw new Error("投稿の取得に失敗しました: " + postsError)
      }

      if (!posts || posts.length < 8) {
        throw new Error(`投稿が8つ以上必要です（現在: ${posts?.length || 0}件）`)
      }

      // スタンプ生成APIを呼び出し
      const response = await fetch("/api/stamps/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.uid,
          posts: posts.map((post) => ({
            id: post.id,
            imageUrl: post.imageUrl,
            catName: post.catName,
          })),
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || "スタンプ生成に失敗しました")
      }

      // ZIPファイルをダウンロード
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `stamp-set-${Date.now()}.zip`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (error: any) {
      console.error("ダウンロードエラー:", error)
      const errorMessage = error.message || "不明なエラー"
      // インデックスエラーの場合は改行を含むメッセージを表示
      if (errorMessage.includes("インデックス") || errorMessage.includes("index")) {
        alert(errorMessage)
      } else {
        alert("スタンプのダウンロードに失敗しました: " + errorMessage)
      }
    } finally {
      setDownloading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFFBEB] py-12">
        <div className="container mx-auto px-4">
          <div className="text-center text-amber-900">読み込み中...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FFFBEB] py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" size="sm" className="mb-4 text-amber-900 hover:text-amber-950 hover:bg-amber-50">
              <ArrowLeft className="w-4 h-4 mr-2" />
              ホームに戻る
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <Gift className="w-8 h-8 text-pink-500" />
            <h1 className="text-4xl font-bold text-amber-900">スタンプチャレンジ</h1>
          </div>
          <p className="text-amber-900 mt-2">
            投稿を8つ貯めて、愛猫のLINEスタンプを作ろう！
          </p>
        </div>

        <StampChallengeProgress
          currentCount={postCount}
          onDownload={postCount >= 8 ? handleDownload : undefined}
          downloading={downloading}
          className="mb-6"
        />

        <Card className="bg-white border border-amber-200 shadow-sm rounded-xl">
          <CardHeader className="bg-white border-b border-amber-200">
            <CardTitle className="text-amber-900">スタンプについて</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 bg-white">
            <div>
              <h3 className="font-semibold text-amber-900 mb-2">📦 スタンプセットの内容</h3>
              <ul className="list-disc list-inside text-amber-900 space-y-1 text-sm">
                <li>投稿した8枚の写真を背景透過PNG形式でスタンプ化</li>
                <li>ZIPファイルで一括ダウンロード</li>
                <li>LINEスタンプとして使用可能な形式</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-amber-900 mb-2">🎯 チャレンジの進め方</h3>
              <ul className="list-disc list-inside text-amber-900 space-y-1 text-sm">
                <li>投稿を作成するとカウントが増えます</li>
                <li>8つの投稿でスタンプセットが完成します</li>
                <li>進捗はリアルタイムで更新されます</li>
              </ul>
            </div>
            {postCount < 8 && (
              <div className="pt-4">
                <Link href="/post/create">
                  <Button className="w-full bg-pink-500 hover:bg-pink-600 text-white rounded-xl">新しい投稿を作成</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

