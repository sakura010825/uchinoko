"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { getCurrentUser } from "@/lib/firebase/auth"
import { uploadImage } from "@/lib/firebase/storage"
import { createPost, getUchinoKoTecho, getFamilyMembers } from "@/lib/firebase/firestore"
import { validateImageFile, formatFileSize } from "@/lib/utils/image-validation"
import { convertHeicToJpeg, isHeicFile } from "@/lib/utils/heic-converter"
import { getImageTakenDate } from "@/lib/utils/exif-reader"
import { Button } from "@/components/ui/button"
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

  // --- ステート定義 ---
  const [user, setUser] = useState<any>(null)
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
  const [takenAt, setTakenAt] = useState<Date | null>(null)

  // 1. ユーザー情報とうちの子手帳を読み込む
  useEffect(() => {
    const initPage = async () => {
      const currentUser = await getCurrentUser()
      if (currentUser) {
        setUser(currentUser)
        const { data, error } = await getUchinoKoTecho(currentUser.uid)
        if (data && data.length > 0) {
          setTechoList(data)
          setSelectedTecho(data[0])
        } else {
          router.push("/techo/create")
        }
      } else {
        router.push("/auth/login")
      }
    }
    initPage()
  }, [router])

  // 2. ファイル選択処理
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const validation = validateImageFile(file)
    if (!validation.valid) {
      setError(validation.error || "画像ファイルを選択してください")
      return
    }

    let processedFile = file
    if (isHeicFile(file)) {
      setIsConverting(true)
      try {
        processedFile = await convertHeicToJpeg(file)
      } catch (err: any) {
        setError("HEIC変換失敗: " + err.message)
        setIsConverting(false)
        return
      }
      setIsConverting(false)
    }

    setSelectedFile(processedFile)
    setUploadedImageUrl(null) // 新しい画像を選んだらアップロード済みURLをリセット
    setPreviewUrl(URL.createObjectURL(processedFile))
    setError("")

    try {
      const date = await getImageTakenDate(processedFile)
      setTakenAt(date)
    } catch (err) {
      setTakenAt(null)
    }
  }

  // 3. 画像の削除
  const handleRemoveImage = () => {
    setSelectedFile(null)
    setUploadedImageUrl(null)
    setTranslation("")
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  // 4. 【肉球翻訳】AI生成処理
  const handleGenerateTranslation = async () => {
    if (!selectedFile || !selectedTecho || !user) {
      setError("画像と手帳を選択してください")
      return
    }

    setIsGenerating(true)
    setError("")

    try {
      // 翻訳のためにまず画像をFirebaseにアップロードしてURLを取得する
      let currentImageUrl = uploadedImageUrl
      if (!currentImageUrl) {
        const timestamp = Date.now()
        const path = `posts/${user.uid}/${timestamp}_${selectedFile.name}`
        const { url, error: uploadError } = await uploadImage(selectedFile, path)
        if (uploadError || !url) throw new Error(uploadError || "アップロード失敗")
        currentImageUrl = url
        setUploadedImageUrl(url)
      }

      // 家族情報と他のペット情報を取得
      const { data: familyMembers } = await getFamilyMembers(user.uid)
      const { data: allPets } = await getUchinoKoTecho(user.uid)
      const otherPets = allPets?.filter((pet: any) => pet.id !== selectedTecho.id) || []

      // API呼び出し
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: currentImageUrl,
          catName: selectedTecho.catName,
          catPattern: selectedTecho.pattern || "",
          normalizedPersonality: Array.isArray(selectedTecho.personality) 
            ? selectedTecho.personality.join("、") 
            : selectedTecho.personality || "マイペース",
          normalizedFirstPerson: selectedTecho.firstPerson || "私",
          normalizedToneType: selectedTecho.toneType || selectedTecho.tone || "普通",
          normalizedLikes: selectedTecho.likes || "特になし",
          normalizedDislikes: selectedTecho.dislikes || "特になし",
          normalizedUniqueBehaviors: selectedTecho.uniqueBehaviors || "特になし",
          familyMembers: familyMembers || [],
          otherPets: otherPets || [],
          selectedCatId: selectedTecho.id,
        }),
      })

      const data = await response.json()
      if (data.error) throw new Error(data.error)

      setTranslation(data.result)
      toast({ title: "翻訳完了", description: "猫の気持ちを翻訳しました" })
    } catch (err: any) {
      setError("翻訳失敗: " + err.message)
    } finally {
      setIsGenerating(false)
    }
  }

  // 5. 最終投稿処理
  const handleSubmit = async () => {
    if (!uploadedImageUrl || !selectedTecho || !translation) {
      setError("翻訳を行ってから投稿してください")
      return
    }

    setLoading(true)
    try {
      const { id, error: postError } = await createPost(user.uid, {
        catId: selectedTecho.id,
        catName: selectedTecho.catName,
        imageUrl: uploadedImageUrl,
        aiTranslation: translation,
        takenAt: takenAt ?? null,
      })

      if (postError) throw new Error(postError)

      toast({ title: "投稿完了", description: "投稿が保存されました" })
      router.push("/")
      router.refresh()
    } catch (err: any) {
      setError("投稿失敗: " + err.message)
    } finally {
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
            
            {/* 手帳選択 */}
            <div className="space-y-2">
              <Label className="text-gray-900">うちの子手帳を選択</Label>
              <select
                className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900"
                value={selectedTecho?.id || ""}
                onChange={(e) => setSelectedTecho(techoList.find(t => t.id === e.target.value) || null)}
              >
                {techoList.map((techo) => (
                  <option key={techo.id} value={techo.id}>{techo.catName}</option>
                ))}
              </select>
            </div>

            {/* 画像アップロード領域 */}
            <div className="space-y-2">
              <Label className="text-gray-900">猫の写真</Label>
              {isConverting ? (
                <div className="border-2 border-dashed border-salmon-200 rounded-lg p-12 text-center">
                  <div className="animate-spin w-8 h-8 border-4 border-salmon-300 border-t-transparent rounded-full mx-auto mb-4" />
                  <p>HEIC変換中...</p>
                </div>
              ) : previewUrl ? (
                <div className="relative">
                  <div className="relative w-full aspect-square rounded-lg overflow-hidden border-2 border-salmon-200">
                    <Image src={previewUrl} alt="Preview" fill className="object-contain" />
                  </div>
                  <Button variant="destructive" size="icon" className="absolute top-2 right-2" onClick={handleRemoveImage}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div
                  className="border-2 border-dashed border-salmon-200 rounded-lg p-12 text-center cursor-pointer hover:bg-salmon-50"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-12 h-12 text-salmon-300 mx-auto mb-4" />
                  <p>画像をクリックしてアップロード</p>
                  <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={handleFileSelect} />
                </div>
              )}
            </div>

            {/* 肉球翻訳ボタン */}
            {selectedFile && selectedTecho && (
              <div className="flex flex-col items-center gap-4">
                <div className="relative w-80 h-80 flex items-center justify-center">
                  <NikukyuButton onClick={handleGenerateTranslation} isLoading={isGenerating} />
                  {isGenerating && (
                    <div className="absolute inset-0 w-full h-full">
                      <PawPrintAnimation count={8} />
                    </div>
                  )}
                </div>
                <p className="text-gray-600 text-sm">{isGenerating ? "AIが翻訳中..." : "肉球をタップして翻訳開始"}</p>
              </div>
            )}

            {/* 翻訳結果表示 */}
            {translation && (
              <div className="space-y-2">
                <Label className="text-gray-900">翻訳結果</Label>
                <div className="bg-salmon-50 rounded-lg p-4 border-2 border-salmon-200">
                  <p className="text-gray-900 whitespace-pre-wrap">{translation}</p>
                </div>
              </div>
            )}

            {error && <div className="text-sm text-red-500 bg-red-50 p-3 rounded-md">{error}</div>}

            {translation && (
              <Button onClick={handleSubmit} className="w-full" disabled={loading}>
                {loading ? "投稿中..." : "投稿する"}
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

