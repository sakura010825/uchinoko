"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { getCurrentUser } from "@/lib/firebase/auth"
import { uploadImage } from "@/lib/firebase/storage"
import { createPost, getUchinoKoTecho } from "@/lib/firebase/firestore"
import { validateImageFile, formatFileSize } from "@/lib/utils/image-validation"
import { convertHeicToJpeg, isHeicFile } from "@/lib/utils/heic-converter"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { NikukyuButton } from "@/components/nikukyu-button"
import { PawPrintAnimation } from "@/components/paw-print-animation"
import { useToast } from "@/hooks/use-toast"
import { logEvent, logError } from "@/lib/utils/analytics"
import { measureApiCall } from "@/lib/utils/performance"
import { Upload, X } from "lucide-react"
import type { UchinoKoTecho } from "@/lib/firebase/types"

export default function CreatePostPage() {
  const router = useRouter()
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null)
  const [selectedTecho, setSelectedTecho] = useState<UchinoKoTecho | null>(null)
  const [techoList, setTechoList] = useState<UchinoKoTecho[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [translation, setTranslation] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [isConverting, setIsConverting] = useState(false)

  // うちの子手帳を読み込む
  useEffect(() => {
    const loadTecho = async () => {
      const user = await getCurrentUser()
      if (user) {
        const { data, error } = await getUchinoKoTecho(user.uid)
        if (data && data.length > 0) {
          setTechoList(data)
          setSelectedTecho(data[0])
        } else {
          // うちの子手帳がない場合は作成ページに誘導
          router.push("/techo/create")
        }
      } else {
        router.push("/auth/login")
      }
    }
    loadTecho()
  }, [router])

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // バリデーション実行
    const validation = validateImageFile(file)
    
    if (!validation.valid) {
      setError(validation.error || "画像ファイルを選択してください")
      // ファイル入力をリセット
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
      return
    }

    // HEICファイルの場合は変換
    let processedFile = file
    if (isHeicFile(file)) {
      setIsConverting(true)
      setError("")
      try {
        processedFile = await convertHeicToJpeg(file)
        setError("")
      } catch (error: any) {
        setError("HEICファイルの変換に失敗しました: " + (error.message || "不明なエラー"))
        setIsConverting(false)
        if (fileInputRef.current) {
          fileInputRef.current.value = ""
        }
        return
      }
      setIsConverting(false)
    }

    // 処理済みファイルを使用
    setSelectedFile(processedFile)
    const url = URL.createObjectURL(processedFile)
    setPreviewUrl(url)
    setError("")
  }

  const handleRemoveImage = () => {
    setSelectedFile(null)
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleGenerateTranslation = async () => {
    if (!selectedFile || !selectedTecho) {
      setError("画像とうちの子手帳を選択してください")
      return
    }

    setIsGenerating(true)
    setError("")

    try {
      // 画像をアップロード
      const user = await getCurrentUser()
      if (!user) {
        setError("ログインが必要です")
        setIsGenerating(false)
        return
      }

      const timestamp = Date.now()
      const imagePath = `posts/${user.uid}/${timestamp}_${selectedFile.name}`
      const { url: imageUrl, error: uploadError } = await uploadImage(
        selectedFile,
        imagePath
      )

      if (uploadError || !imageUrl) {
        setError("画像のアップロードに失敗しました")
        setIsGenerating(false)
        return
      }

      // アップロード済みURLを保存
      setUploadedImageUrl(imageUrl)

      // AI生成APIを呼び出し
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imageUrl,
          catName: selectedTecho.catName,
          pattern: selectedTecho.pattern || "",
          personality: Array.isArray(selectedTecho.personality) 
            ? selectedTecho.personality 
            : selectedTecho.personality 
            ? [selectedTecho.personality] 
            : [],
          firstPerson: selectedTecho.firstPerson || "",
          toneType: selectedTecho.toneType || selectedTecho.tone || "",
          familyRelations: selectedTecho.familyRelations || [],
          likes: selectedTecho.likes || selectedTecho.favoriteThings || "",
          dislikes: selectedTecho.dislikes || selectedTecho.dislikeThings || "",
          uniqueBehaviors: selectedTecho.uniqueBehaviors || selectedTecho.quirks || "",
          // 後方互換性のためのフィールド
          callingOwner: selectedTecho.callingOwner || "",
          tone: selectedTecho.tone || "",
          favoriteThings: selectedTecho.favoriteThings || "",
          dislikeThings: selectedTecho.dislikeThings || "",
          quirks: selectedTecho.quirks || "",
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
          toast({
            variant: "success",
            title: "翻訳完了",
            description: "AIが猫の気持ちを翻訳しました",
          })
        } catch (error: any) {
          const errorMessage = "翻訳の生成に失敗しました: " + error.message
          setError(errorMessage)
          toast({
            variant: "destructive",
            title: "エラー",
            description: errorMessage,
          })
          setIsGenerating(false)
        }
  }

  const handleSubmit = async () => {
    if (!selectedFile || !selectedTecho || !translation) {
      setError("すべての項目を入力してください")
      return
    }

    setLoading(true)
    setError("")

    try {
      const user = await getCurrentUser()
      if (!user) {
        setError("ログインが必要です")
        setLoading(false)
        return
      }

      // 画像URLを取得（既にアップロード済みの場合はそれを使用）
      let imageUrl = uploadedImageUrl
      if (!imageUrl && selectedFile) {
        const timestamp = Date.now()
        const imagePath = `posts/${user.uid}/${timestamp}_${selectedFile.name}`
        const { url, error: uploadError } = await uploadImage(
          selectedFile,
          imagePath
        )

        if (uploadError || !url) {
          setError("画像のアップロードに失敗しました")
          setLoading(false)
          return
        }
        imageUrl = url
      }

      if (!imageUrl) {
        setError("画像が選択されていません")
        setLoading(false)
        return
      }

      // 投稿を作成
      logEvent("post_creation_started", {
        catName: selectedTecho.catName,
      })

      const { id, error: postError } = await measureApiCall(
        async () => {
          return createPost(user.uid, {
            catId: selectedTecho.id,
            catName: selectedTecho.catName,
            imageUrl: imageUrl!,
            aiTranslation: translation,
          })
        },
        "create_post"
      )

      if (postError || !id) {
        const errorMessage = "投稿の作成に失敗しました"
        logError(new Error(errorMessage), { context: "post_creation", error: postError })
        setError(errorMessage)
        toast({
          variant: "destructive",
          title: "エラー",
          description: errorMessage,
        })
        setLoading(false)
        return
      }

      logEvent("post_created", {
        postId: id,
        catName: selectedTecho.catName,
      })
      toast({
        variant: "success",
        title: "投稿完了",
        description: "投稿が正常に作成されました",
      })
      router.push("/")
      router.refresh()
    } catch (error: any) {
      const errorMessage = "エラーが発生しました: " + error.message
      setError(errorMessage)
      toast({
        variant: "destructive",
        title: "エラー",
        description: errorMessage,
      })
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl text-gray-900">新しい投稿を作成</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* うちの子手帳選択 */}
            {techoList.length > 0 && (
              <div className="space-y-2">
                <Label className="text-gray-900">うちの子手帳を選択</Label>
                <select
                  className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900"
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

            {/* 画像アップロード */}
            <div className="space-y-2">
              <Label className="text-gray-900">猫の写真</Label>
              <p className="text-xs text-gray-600">
                JPG, PNG, GIF, WebP, HEIC形式、5MB以下（HEICは自動でJPEGに変換されます）
              </p>
              {isConverting ? (
                <div className="border-2 border-dashed border-salmon-200 rounded-lg p-12 text-center">
                  <div className="animate-spin w-8 h-8 border-4 border-salmon-300 border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p className="text-gray-600">HEICファイルを変換中...</p>
                </div>
              ) : previewUrl ? (
                <div className="relative">
                  <div className="relative w-full aspect-square max-h-[400px] rounded-lg overflow-hidden border-2 border-salmon-200 bg-gray-100">
                    <Image
                      src={previewUrl}
                      alt="プレビュー"
                      fill
                      className="object-contain"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={handleRemoveImage}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  {selectedFile && (
                    <div className="mt-2 text-sm text-gray-600">
                      ファイルサイズ: {formatFileSize(selectedFile.size)}
                    </div>
                  )}
                </div>
              ) : (
                <div
                  className="border-2 border-dashed border-salmon-200 rounded-lg p-12 text-center cursor-pointer hover:bg-salmon-50 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-12 h-12 text-salmon-300 mx-auto mb-4" />
                  <p className="text-gray-700 mb-2">画像をクリックしてアップロード</p>
                  <p className="text-xs text-gray-600">
                    JPG, PNG, GIF, WebP, HEIC形式、5MB以下
                    <br />
                    （HEICは自動でJPEGに変換されます）
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp,image/heic,image/heif"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>
              )}
            </div>

            {/* 肉球翻訳ボタン */}
            {selectedFile && selectedTecho && (
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
                <p className="text-gray-600 text-sm">
                  {isGenerating
                    ? "AIが気持ちを翻訳中..."
                    : "肉球をタップして翻訳開始"}
                </p>
              </div>
            )}

            {/* 翻訳結果 */}
            {translation && (
              <div className="space-y-2">
                <Label className="text-gray-900">翻訳結果</Label>
                <div className="bg-salmon-50 rounded-lg p-4 border-2 border-salmon-200">
                  <p className="text-gray-900 whitespace-pre-wrap">{translation}</p>
                </div>
              </div>
            )}

            {error && (
              <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                {error}
              </div>
            )}

            {/* 投稿ボタン */}
            {translation && (
              <Button
                onClick={handleSubmit}
                className="w-full"
                disabled={loading}
              >
                {loading ? "投稿中..." : "投稿する"}
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

