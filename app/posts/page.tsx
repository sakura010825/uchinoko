"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  getPosts,
  searchPosts,
  addKarikari,
  removeKarikari,
  checkKarikari,
} from "@/lib/firebase/firestore"
import { getCurrentUser } from "@/lib/firebase/auth"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ShareDialog } from "@/components/share-dialog"
import { Loading } from "@/components/ui/loading"
import { PostSearch } from "@/components/post-search"
import { PostCardSkeleton } from "@/components/post-card-skeleton"
import { logPageView, logEvent } from "@/lib/utils/analytics"
import { Fish, Share2 } from "lucide-react"
import type { Post } from "@/lib/firebase/types"

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [karikariStates, setKarikariStates] = useState<Record<string, boolean>>({})
  const [shareDialogOpen, setShareDialogOpen] = useState(false)
  const [selectedPost, setSelectedPost] = useState<Post | null>(null)
  const lastDocRef = useRef<any>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const loadMoreRef = useRef<HTMLDivElement>(null)

  const loadPosts = useCallback(async (reset: boolean = false) => {
    if (reset) {
      setLoading(true)
      setPosts([])
      lastDocRef.current = null
      setHasMore(true)
    } else {
      setLoadingMore(true)
    }

    const { data, error, lastDoc } = await getPosts(10, reset ? undefined : lastDocRef.current)
    
    if (data) {
      if (reset) {
        setPosts(data)
      } else {
        setPosts((prev) => [...prev, ...data])
      }
      lastDocRef.current = lastDoc
      setHasMore(data.length === 10)

      // カリカリ状態を確認
      const user = await getCurrentUser()
      if (user) {
        const states: Record<string, boolean> = {}
        for (const post of data) {
          const { hasKarikari } = await checkKarikari(post.id, user.uid)
          states[post.id] = hasKarikari
        }
        setKarikariStates((prev) => ({ ...prev, ...states }))
      }
    }

    setLoading(false)
    setLoadingMore(false)
  }, [])

  const handleSearch = useCallback(async (term: string) => {
    setSearchTerm(term)
    setIsSearching(true)
    setLoading(true)

    const { data, error } = await searchPosts(term, 50)
    if (data) {
      setPosts(data)

      // カリカリ状態を確認
      const user = await getCurrentUser()
      if (user) {
        const states: Record<string, boolean> = {}
        for (const post of data) {
          const { hasKarikari } = await checkKarikari(post.id, user.uid)
          states[post.id] = hasKarikari
        }
        setKarikariStates(states)
      }
    }
    setLoading(false)
    setIsSearching(false)
  }, [])

  const handleClearSearch = useCallback(() => {
    setSearchTerm("")
    setIsSearching(false)
    loadPosts(true)
  }, [loadPosts])

  useEffect(() => {
    loadPosts(true)
    logPageView("/posts")
  }, [loadPosts])

  // 無限スクロールの実装
  useEffect(() => {
    if (isSearching || !hasMore) return

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loadingMore && hasMore) {
          loadPosts(false)
        }
      },
      { threshold: 0.1 }
    )

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current)
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [isSearching, hasMore, loadingMore, loadPosts])

  const [animatingKarikari, setAnimatingKarikari] = useState<string | null>(null)

  const handleKarikari = async (postId: string) => {
    const user = await getCurrentUser()
    if (!user) {
      // ログインページにリダイレクト
      window.location.href = "/auth/login"
      return
    }

    // アニメーション開始
    setAnimatingKarikari(postId)
    setTimeout(() => setAnimatingKarikari(null), 300)

    const hasKarikari = karikariStates[postId]
    
    if (hasKarikari) {
      await removeKarikari(postId, user.uid)
      logEvent("karikari_removed", { postId })
      setKarikariStates((prev) => ({ ...prev, [postId]: false }))
      setPosts((prev) =>
        prev.map((post) =>
          post.id === postId
            ? { ...post, karikariCount: Math.max(0, post.karikariCount - 1) }
            : post
        )
      )
    } else {
      await addKarikari(postId, user.uid)
      logEvent("karikari_added", { postId })
      setKarikariStates((prev) => ({ ...prev, [postId]: true }))
      setPosts((prev) =>
        prev.map((post) =>
          post.id === postId
            ? { ...post, karikariCount: post.karikariCount + 1 }
            : post
        )
      )
    }
  }

  const handleShare = (post: Post) => {
    setSelectedPost(post)
    setShareDialogOpen(true)
  }

  if (loading && posts.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-cream to-cream-50 py-12">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-charcoal mb-2">みんなの投稿</h1>
            <p className="text-charcoal-300 mb-4">愛猫たちの気持ちを覗いてみましょう</p>
            <PostSearch onSearch={handleSearch} onClear={handleClearSearch} />
          </div>
          <div className="space-y-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <PostCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-cream to-cream-50 py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-charcoal mb-2">みんなの投稿</h1>
          <p className="text-charcoal-300 mb-4">愛猫たちの気持ちを覗いてみましょう</p>
          <PostSearch onSearch={handleSearch} onClear={handleClearSearch} />
        </div>

        {posts.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-charcoal-300">まだ投稿がありません</p>
              <Link href="/post/create">
                <Button className="mt-4">最初の投稿を作成</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {posts.map((post) => (
              <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <Link href={`/post/${post.id}`}>
                  <div className="relative w-full aspect-square cursor-pointer bg-cream-50">
                    <Image
                      src={post.imageUrl}
                      alt={`${post.catName}の写真`}
                      fill
                      className="object-contain"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      loading="lazy"
                    />
                    {/* 画像の上にコメントをオーバーレイ表示 */}
                    {post.aiTranslation && (
                      <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white p-3 rounded-b-lg">
                        <p className="text-sm font-semibold line-clamp-2">{post.aiTranslation}</p>
                      </div>
                    )}
                  </div>
                </Link>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <Link href={`/post/${post.id}`} className="flex-1">
                      <h3 className="text-xl font-semibold text-charcoal hover:text-salmon-300 transition-colors">
                        {post.catName}ちゃん
                      </h3>
                      <p className="text-sm text-charcoal-300">
                        {new Date(post.createdAt).toLocaleDateString("ja-JP")}
                      </p>
                    </Link>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleShare(post)}
                        className="text-charcoal-300"
                        aria-label={`${post.catName}ちゃんの投稿をシェアする`}
                      >
                        <Share2 className="w-5 h-5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleKarikari(post.id)}
                        className={`transition-all ${
                          karikariStates[post.id]
                            ? "text-orange-600"
                            : "text-orange-500"
                        }`}
                        aria-label={
                          karikariStates[post.id]
                            ? `${post.catName}ちゃんの投稿のカリカリを解除する`
                            : `${post.catName}ちゃんの投稿にカリカリする`
                        }
                        aria-pressed={karikariStates[post.id]}
                      >
                        <Fish
                          className={`w-6 h-6 transition-all duration-200 ${
                            animatingKarikari === post.id
                              ? "animate-bounce scale-125"
                              : karikariStates[post.id] 
                              ? "fill-current text-orange-600 scale-110" 
                              : "text-orange-500 hover:scale-110"
                          }`}
                        />
                        <span className="ml-2" aria-label={`カリカリ数: ${post.karikariCount}`}>
                          {post.karikariCount}
                        </span>
                      </Button>
                    </div>
                  </div>
                  <div className="bg-salmon-50 rounded-lg p-4 border-2 border-salmon-200">
                    <p className="text-charcoal whitespace-pre-wrap">
                      {post.aiTranslation}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* 無限スクロール用のトリガー */}
        {!isSearching && hasMore && (
          <div ref={loadMoreRef} className="py-8">
            {loadingMore && (
              <div className="text-center text-charcoal-300">読み込み中...</div>
            )}
          </div>
        )}

        {/* 検索結果の表示 */}
        {isSearching && posts.length === 0 && !loading && (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-charcoal-300">
                「{searchTerm}」に一致する投稿が見つかりませんでした
              </p>
            </CardContent>
          </Card>
        )}

        {/* シェアダイアログ */}
        {selectedPost && (
          <ShareDialog
            open={shareDialogOpen}
            onOpenChange={setShareDialogOpen}
            post={selectedPost}
          />
        )}
      </div>
    </div>
  )
}

