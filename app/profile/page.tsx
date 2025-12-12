"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { getCurrentUser, logout } from "@/lib/firebase/auth"
import {
  getUserPostCount,
  getUserPosts,
  deletePost,
  getUchinoKoTecho,
} from "@/lib/firebase/firestore"
import { calculateAgeAtDate } from "@/lib/utils/age-calculator"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { User, LogOut, Trash2, BookOpen, Gift, ArrowLeft, Edit } from "lucide-react"
import type { Post, UchinoKoTecho } from "@/lib/firebase/types"

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [postCount, setPostCount] = useState(0)
  const [posts, setPosts] = useState<Post[]>([])
  const [techoMap, setTechoMap] = useState<Record<string, UchinoKoTecho>>({})
  const [loading, setLoading] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [postToDelete, setPostToDelete] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      const currentUser = await getCurrentUser()
      if (!currentUser) {
        router.push("/auth/login")
        return
      }

      setUser(currentUser)

      // 投稿数を取得
      const { count, error: countError } = await getUserPostCount(currentUser.uid)
      if (!countError) {
        setPostCount(count)
      }

      // 投稿一覧を取得
      const { data: postsData, error: postsError } = await getUserPosts(currentUser.uid)
      if (!postsError && postsData) {
        setPosts(postsData)

        // 猫のデータを取得（投稿に含まれるcatIdから）
        const catIds = [...new Set(postsData.map((post) => post.catId))]
        const { data: techoList } = await getUchinoKoTecho(currentUser.uid)
        if (techoList) {
          const map: Record<string, UchinoKoTecho> = {}
          techoList.forEach((techo) => {
            map[techo.id] = techo
          })
          setTechoMap(map)
        }
      }

      setLoading(false)
    }
    loadData()
  }, [router])

  const handleLogout = async () => {
    await logout()
    router.push("/")
    router.refresh()
  }

  const handleDeleteClick = (postId: string) => {
    setPostToDelete(postId)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!postToDelete || !user) return

    setDeleting(true)
    const post = posts.find((p) => p.id === postToDelete)
    const { error } = await deletePost(postToDelete, user.uid, post?.imageUrl || "")

    if (error) {
      alert("投稿の削除に失敗しました: " + error)
      setDeleting(false)
      return
    }

    // 投稿一覧から削除
    setPosts((prev) => prev.filter((post) => post.id !== postToDelete))
    setPostCount((prev) => Math.max(0, prev - 1))
    setDeleteDialogOpen(false)
    setPostToDelete(null)
    setDeleting(false)
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
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" size="sm" className="mb-4 text-amber-900 hover:text-amber-950 hover:bg-amber-50">
              <ArrowLeft className="w-4 h-4 mr-2" />
              ホームに戻る
            </Button>
          </Link>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <User className="w-8 h-8 text-pink-500" />
              <h1 className="text-4xl font-bold text-amber-900">プロフィール</h1>
            </div>
            <Button variant="outline" onClick={handleLogout} className="border-amber-300 text-amber-900 hover:bg-amber-50">
              <LogOut className="w-4 h-4 mr-2" />
              ログアウト
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white border border-amber-200 shadow-sm rounded-xl">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-pink-500 mb-2">
                {postCount}
              </div>
              <div className="text-sm text-amber-900">投稿数</div>
            </CardContent>
          </Card>
          <Link href="/techo">
            <Card className="bg-white border border-amber-200 shadow-sm hover:shadow-lg transition-shadow cursor-pointer rounded-xl">
              <CardContent className="p-6 text-center">
                <BookOpen className="w-8 h-8 text-pink-500 mx-auto mb-2" />
                <div className="text-sm text-amber-900">うちの子手帳</div>
              </CardContent>
            </Card>
          </Link>
          <Link href="/stamp-challenge">
            <Card className="bg-white border border-amber-200 shadow-sm hover:shadow-lg transition-shadow cursor-pointer rounded-xl">
              <CardContent className="p-6 text-center">
                <Gift className="w-8 h-8 text-pink-500 mx-auto mb-2" />
                <div className="text-sm text-amber-900">スタンプチャレンジ</div>
              </CardContent>
            </Card>
          </Link>
        </div>

        <Card className="bg-white border border-amber-200 shadow-sm rounded-xl">
          <CardHeader className="bg-white border-b border-amber-200">
            <CardTitle className="text-amber-900 text-2xl">マイ投稿</CardTitle>
          </CardHeader>
          <CardContent className="bg-white p-6">
            {posts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-amber-900 mb-4">まだ投稿がありません</p>
                <Link href="/post/create">
                  <Button className="bg-pink-500 hover:bg-pink-600 text-white">最初の投稿を作成</Button>
                </Link>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {posts.map((post) => (
                  <div
                    key={post.id}
                    className="relative bg-white border-2 border-amber-200 rounded-2xl p-4 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                    style={{
                      background: "linear-gradient(to bottom, #fff 0%, #FFFBEB 100%)",
                    }}
                  >
                    {/* ポラロイド風の画像 */}
                    <div className="relative w-full aspect-square mb-3 rounded-xl overflow-hidden bg-gray-100 shadow-inner">
                      <Image
                        src={post.imageUrl}
                        alt={post.catName}
                        fill
                        className="object-contain"
                      />
                    </div>

                    {/* 日付と年齢（控えめに表示） */}
                    <div className="text-xs text-amber-700 mb-2 text-center">
                      {(() => {
                        const dateStr = new Date(post.createdAt).toLocaleDateString("ja-JP", {
                          year: "numeric",
                          month: "numeric",
                          day: "numeric",
                        }).replace(/\//g, ".")
                        const techo = techoMap[post.catId]
                        const age = techo?.birthDate
                          ? calculateAgeAtDate(techo.birthDate, new Date(post.createdAt))
                          : null
                        return age ? `${dateStr} (${age})` : dateStr
                      })()}
                    </div>

                    {/* 猫の一言（吹き出し風） */}
                    {post.aiTranslation && (
                      <div className="relative mb-3">
                        <div className="bg-pink-100 border-2 border-pink-300 rounded-2xl p-3 shadow-sm">
                          <p className="text-sm font-medium text-amber-900 text-center leading-relaxed">
                            {post.aiTranslation}
                          </p>
                        </div>
                        {/* 吹き出しのしっぽ */}
                        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                          <div className="w-4 h-4 bg-pink-100 border-r-2 border-b-2 border-pink-300 transform rotate-45"></div>
                        </div>
                      </div>
                    )}

                    {/* 猫の名前 */}
                    <div className="text-center mb-2">
                      <h3 className="font-bold text-amber-900 text-lg">
                        {post.catName}ちゃん
                      </h3>
                    </div>

                    {/* 編集・削除ボタン */}
                    <div className="flex gap-2 justify-center mt-3 pt-3 border-t border-amber-200">
                      <Link href={`/post/${post.id}/edit`}>
                        <Button variant="ghost" size="sm" className="text-amber-900 hover:text-amber-950 hover:bg-amber-50">
                          <Edit className="w-4 h-4 mr-1" />
                          編集
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteClick(post.id)}
                        className="text-red-600 hover:text-red-800 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        削除
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 削除確認ダイアログ */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent className="bg-white border border-amber-200">
            <DialogHeader>
              <DialogTitle className="text-amber-900">投稿を削除しますか？</DialogTitle>
              <DialogDescription className="text-amber-800">
                この操作は取り消せません。投稿が完全に削除されます。
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDeleteDialogOpen(false)}
                disabled={deleting}
                className="border-amber-300 text-amber-900 hover:bg-amber-50"
              >
                キャンセル
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteConfirm}
                disabled={deleting}
              >
                {deleting ? "削除中..." : "削除する"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
