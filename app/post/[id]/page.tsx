"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { getPost, addKarikari, removeKarikari, checkKarikari } from "@/lib/firebase/firestore"
import { useToast } from "@/hooks/use-toast"
import { logEvent, logError } from "@/lib/utils/analytics"
import { getCurrentUser } from "@/lib/firebase/auth"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ShareDialog } from "@/components/share-dialog"
import { Fish, Share2, ArrowLeft, Edit, Trash2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { deletePost } from "@/lib/firebase/firestore"
import type { Post } from "@/lib/firebase/types"

export default function PostDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const postId = params.id as string

  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)
  const [hasKarikari, setHasKarikari] = useState(false)
  const [shareDialogOpen, setShareDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [isOwner, setIsOwner] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [animatingKarikari, setAnimatingKarikari] = useState(false)

  useEffect(() => {
    const loadPost = async () => {
      setLoading(true)
      logEvent("view_post_detail", { postId })
      
      const { data, error } = await getPost(postId)
      if (error || !data) {
        toast({
          variant: "destructive",
          title: "エラー",
          description: error || "投稿の読み込みに失敗しました。",
        })
        logError(new Error(error || "Unknown error"), { context: "fetch_post_detail", postId })
        setLoading(false)
        return
      }

      setPost(data)

      // カリカリ状態を確認
      const user = await getCurrentUser()
      if (user) {
        const { hasKarikari: hasK } = await checkKarikari(postId, user.uid)
        setHasKarikari(hasK)
        setIsOwner(data.userId === user.uid)
      }

      setLoading(false)
    }
    loadPost()
  }, [postId, toast])

  const handleKarikari = async () => {
    const user = await getCurrentUser()
    if (!user) {
      toast({
        variant: "default",
        title: "ログインしてください",
        description: "カリカリするにはログインが必要です。",
      })
      router.push("/auth/login")
      return
    }

    // アニメーション開始
    setAnimatingKarikari(true)
    setTimeout(() => setAnimatingKarikari(false), 300)

    logEvent(hasKarikari ? "remove_karikari_detail" : "add_karikari_detail", { postId, userId: user.uid })

    try {
      if (hasKarikari) {
        await removeKarikari(postId, user.uid)
        setHasKarikari(false)
        if (post) {
          setPost({ ...post, karikariCount: Math.max(0, post.karikariCount - 1) })
        }
        toast({
          variant: "default",
          title: "カリカリを取り消しました",
          description: "またカリカリしてね！",
        })
      } else {
        await addKarikari(postId, user.uid)
        setHasKarikari(true)
        if (post) {
          setPost({ ...post, karikariCount: post.karikariCount + 1 })
        }
        toast({
          variant: "success",
          title: "カリカリしました！",
          description: "投稿にカリカリを送りました。",
        })
      }
    } catch (err: any) {
      const errorMessage = "カリカリの操作に失敗しました: " + (err.message || "不明なエラー")
      toast({
        variant: "destructive",
        title: "エラー",
        description: errorMessage,
      })
      logError(err, { context: "handle_karikari_detail", postId, userId: user.uid })
    }
  }

  const handleDelete = async () => {
    if (!post) return

    const user = await getCurrentUser()
    if (!user) return

    setDeleting(true)
    logEvent("delete_post_started", { postId: post.id })
    
    const { error } = await deletePost(postId, user.uid, post.imageUrl)

    if (error) {
      toast({
        variant: "destructive",
        title: "削除エラー",
        description: error,
      })
      logError(new Error(error), { context: "delete_post", postId: post.id, userId: user.uid })
      setDeleting(false)
      return
    }

    toast({
      variant: "success",
      title: "投稿を削除しました",
      description: "投稿が正常に削除されました。",
    })
    logEvent("delete_post_success", { postId: post.id })
    router.push("/posts")
    router.refresh()
  }

  if (loading) {
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
        <div className="container mx-auto px-4 max-w-3xl">
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-charcoal-300 mb-4">投稿が見つかりません</p>
              <Link href="/posts">
                <Button>投稿一覧に戻る</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-cream to-cream-50 py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="mb-6">
          <Link href="/posts">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              投稿一覧に戻る
            </Button>
          </Link>
        </div>

        <Card className="overflow-hidden">
          <div className="relative w-full aspect-square bg-cream-50">
            <Image
              src={post.imageUrl}
              alt={`${post.catName}ちゃんの写真`}
              fill
              className="object-contain"
              priority
              sizes="(max-width: 768px) 100vw, 768px"
            />
            {/* 画像の上にコメントをオーバーレイ表示 */}
            {post.aiTranslation && (
              <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white p-4 rounded-b-lg">
                <p className="text-base font-semibold">{post.aiTranslation}</p>
              </div>
            )}
          </div>
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-charcoal mb-2">
                  {post.catName}ちゃん
                </h1>
                <p className="text-sm text-charcoal-300">
                  {new Date(post.createdAt).toLocaleDateString("ja-JP", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShareDialogOpen(true)}
                  className="text-charcoal-300"
                  aria-label={`${post.catName}ちゃんの投稿をシェアする`}
                >
                  <Share2 className="w-5 h-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleKarikari}
                  className={`${
                    hasKarikari ? "text-orange-warm" : "text-charcoal-300"
                  }`}
                  aria-label={
                    hasKarikari
                      ? `${post.catName}ちゃんの投稿のカリカリを解除する`
                      : `${post.catName}ちゃんの投稿にカリカリする`
                  }
                  aria-pressed={hasKarikari}
                >
                      <Fish
                        className={`w-6 h-6 transition-all duration-200 ${
                          animatingKarikari
                            ? "animate-bounce scale-125"
                            : hasKarikari 
                            ? "fill-current text-orange-600 scale-110" 
                            : "text-orange-500 hover:scale-110"
                        }`}
                      />
                  <span className="ml-2" aria-label={`カリカリ数: ${post.karikariCount}`}>
                    {post.karikariCount}
                  </span>
                </Button>
                {isOwner && (
                  <>
                    <Link href={`/post/${post.id}/edit`}>
                      <Button variant="ghost" size="icon">
                        <Edit className="w-4 h-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteDialogOpen(true)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </>
                )}
              </div>
            </div>
            <div className="bg-salmon-50 rounded-lg p-6 border-2 border-salmon-200">
              <p className="text-charcoal whitespace-pre-wrap text-lg leading-relaxed">
                {post.aiTranslation}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* シェアダイアログ */}
        <ShareDialog
          open={shareDialogOpen}
          onOpenChange={setShareDialogOpen}
          post={post}
        />

        {/* 削除確認ダイアログ */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>投稿を削除しますか？</DialogTitle>
              <DialogDescription>
                この操作は取り消せません。投稿が完全に削除されます。
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDeleteDialogOpen(false)}
                disabled={deleting}
              >
                キャンセル
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
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

