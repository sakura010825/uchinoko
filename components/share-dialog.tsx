"use client"

import { useState } from "react"
import Image from "next/image"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { generateOmikuji, getOmikujiColorClass, type OmikujiResult } from "@/lib/utils/omikuji"
import { Share2, Download, Twitter, Facebook } from "lucide-react"
import type { Post } from "@/lib/firebase/types"

interface ShareDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  post: Post
}

export function ShareDialog({ open, onOpenChange, post }: ShareDialogProps) {
  const [omikuji, setOmikuji] = useState<OmikujiResult | null>(null)
  const [shareImageUrl, setShareImageUrl] = useState<string | null>(null)
  const [generating, setGenerating] = useState(false)

  const handleGenerateShareImage = async () => {
    setGenerating(true)
    try {
      // おみくじ結果を生成
      const newOmikuji = generateOmikuji()
      setOmikuji(newOmikuji)

      // シェア画像を生成
      const response = await fetch("/api/share/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imageUrl: post.imageUrl,
          catName: post.catName,
          translation: post.aiTranslation,
          omikujiItem: newOmikuji.item,
          omikujiEmoji: newOmikuji.emoji,
        }),
      })

      if (!response.ok) {
        throw new Error("シェア画像の生成に失敗しました")
      }

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      setShareImageUrl(url)
    } catch (error: any) {
      console.error("シェア画像生成エラー:", error)
      alert("シェア画像の生成に失敗しました: " + error.message)
    } finally {
      setGenerating(false)
    }
  }

  const handleDownload = () => {
    if (!shareImageUrl) return

    const a = document.createElement("a")
    a.href = shareImageUrl
    a.download = `share-${post.catName}-${Date.now()}.png`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  const handleTwitterShare = () => {
    const text = `${post.catName}ちゃんの気持ちを翻訳しました！${
      omikuji ? `今日のラッキーアイテム: ${omikuji.item} ${omikuji.emoji}` : ""
    }`
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      text
    )}&url=${encodeURIComponent(window.location.href)}`
    window.open(url, "_blank")
  }

  const handleFacebookShare = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
      window.location.href
    )}`
    window.open(url, "_blank")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>シェアする</DialogTitle>
          <DialogDescription>
            投稿をSNSでシェアして、みんなに愛猫の気持ちを伝えましょう
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* おみくじ結果 */}
          {omikuji && (
            <div
              className={`p-4 rounded-lg border-2 ${getOmikujiColorClass(
                omikuji.color
              )}`}
            >
              <div className="flex items-center gap-3">
                <span className="text-3xl">{omikuji.emoji}</span>
                <div>
                  <p className="font-semibold text-charcoal">
                    今日のラッキーアイテム
                  </p>
                  <p className="text-sm text-charcoal-400">{omikuji.message}</p>
                </div>
              </div>
            </div>
          )}

          {/* シェア画像プレビュー */}
          {shareImageUrl ? (
            <div className="relative w-full aspect-video rounded-lg overflow-hidden border-2 border-salmon-200">
              <Image
                src={shareImageUrl}
                alt="シェア画像"
                fill
                className="object-cover"
              />
            </div>
          ) : (
            <div className="border-2 border-dashed border-salmon-200 rounded-lg p-12 text-center">
              <p className="text-charcoal-400 mb-4">
                シェア画像を生成すると、おみくじ結果も表示されます
              </p>
              <Button
                onClick={handleGenerateShareImage}
                disabled={generating}
                className="bg-salmon hover:bg-salmon-200"
              >
                {generating ? "生成中..." : "シェア画像を生成"}
              </Button>
            </div>
          )}

          {/* アクションボタン */}
          <div className="flex flex-wrap gap-2">
            {shareImageUrl && (
              <>
                <Button
                  variant="outline"
                  onClick={handleDownload}
                  className="flex-1"
                >
                  <Download className="w-4 h-4 mr-2" />
                  画像をダウンロード
                </Button>
                <Button
                  variant="outline"
                  onClick={handleTwitterShare}
                  className="flex-1"
                >
                  <Twitter className="w-4 h-4 mr-2" />
                  Twitterでシェア
                </Button>
                <Button
                  variant="outline"
                  onClick={handleFacebookShare}
                  className="flex-1"
                >
                  <Facebook className="w-4 h-4 mr-2" />
                  Facebookでシェア
                </Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

