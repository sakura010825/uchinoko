"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getCurrentUser } from "@/lib/firebase/auth"
import { createUchinoKoTecho, getUchinoKoTecho } from "@/lib/firebase/firestore"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Plus, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { FamilyRelation } from "@/lib/firebase/types"

const personalityOptions = [
  "ツンデレ",
  "甘えん坊",
  "王様",
  "ビビリ",
  "おっとり",
  "活発",
  "のんびり",
  "好奇心旺盛",
  "人見知り",
  "社交的",
  "マイペース",
  "おとなしい",
]

const patternOptions = [
  "くろ",
  "しろ",
  "サビ",
  "キジトラ",
  "茶トラ",
  "ミケ",
  "ハチワレ",
  "その他",
]

const firstPersonOptions = [
  "わたし",
  "ぼく",
  "オレ",
  "あたち",
  "わし",
  "わたくし",
]

const toneTypeOptions = [
  { value: "小学生男子風", label: "小学生男子風（元気いっぱい）" },
  { value: "貴婦人風", label: "貴婦人風（上品で優雅）" },
  { value: "おじさん風", label: "おじさん風（のんびり、マイペース）" },
  { value: "赤ちゃん風", label: "赤ちゃん風（かわいらしく甘えた）" },
  { value: "クール系", label: "クール系（ツンツン、冷静）" },
  { value: "おっとり系", label: "おっとり系（優しく穏やか）" },
]

export default function CreateTechoPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [catName, setCatName] = useState("")
  const [pattern, setPattern] = useState("")
  const [personality, setPersonality] = useState<string[]>([])
  const [firstPerson, setFirstPerson] = useState("")
  const [toneType, setToneType] = useState("")
  const [familyRelations, setFamilyRelations] = useState<FamilyRelation[]>([
    { name: "", relation: "" }
  ])
  const [likes, setLikes] = useState("")
  const [dislikes, setDislikes] = useState("")
  const [uniqueBehaviors, setUniqueBehaviors] = useState("")
  const [birthDate, setBirthDate] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [existingTecho, setExistingTecho] = useState<any>(null)

  // 既存のうちの子手帳を確認
  useEffect(() => {
    const checkExisting = async () => {
      const user = await getCurrentUser()
      if (user) {
        const { data } = await getUchinoKoTecho(user.uid)
        if (data && data.length > 0) {
          setExistingTecho(data[0])
          const techo = data[0]
          setCatName(techo.catName || "")
          setPattern(techo.pattern || "")
          setPersonality(Array.isArray(techo.personality) ? techo.personality : techo.personality ? [techo.personality] : [])
          setFirstPerson(techo.firstPerson || "")
          setToneType(techo.toneType || techo.tone || "")
          setFamilyRelations(techo.familyRelations && techo.familyRelations.length > 0 ? techo.familyRelations : [{ name: "", relation: "" }])
          setLikes(techo.likes || techo.favoriteThings || "")
          setDislikes(techo.dislikes || techo.dislikeThings || "")
          setUniqueBehaviors(techo.uniqueBehaviors || techo.quirks || "")
          // 誕生日の設定（Dateオブジェクトの場合は文字列に変換）
          if (techo.birthDate) {
            const birthDateValue = techo.birthDate instanceof Date 
              ? techo.birthDate.toISOString().split('T')[0]
              : typeof techo.birthDate === 'string'
              ? techo.birthDate.split('T')[0]
              : ""
            setBirthDate(birthDateValue)
          }
        }
      }
    }
    checkExisting()
  }, [])

  const handlePersonalityToggle = (option: string) => {
    setPersonality((prev) =>
      prev.includes(option)
        ? prev.filter((p) => p !== option)
        : [...prev, option]
    )
  }

  const handleAddFamilyRelation = () => {
    setFamilyRelations([...familyRelations, { name: "", relation: "" }])
  }

  const handleRemoveFamilyRelation = (index: number) => {
    if (familyRelations.length > 1) {
      setFamilyRelations(familyRelations.filter((_, i) => i !== index))
    }
  }

  const handleFamilyRelationChange = (index: number, field: "name" | "relation", value: string) => {
    const updated = [...familyRelations]
    updated[index] = { ...updated[index], [field]: value }
    setFamilyRelations(updated)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!catName.trim()) {
      setError("猫の名前を入力してください")
      return
    }

    if (!pattern) {
      setError("柄を選択してください")
      return
    }

    if (personality.length === 0) {
      setError("性格を1つ以上選択してください")
      return
    }

    if (!firstPerson) {
      setError("一人称を選択してください")
      return
    }

    if (!toneType) {
      setError("口調タイプを選択してください")
      return
    }

    // 家族関係のバリデーション（空の行を除外）
    const validFamilyRelations = familyRelations.filter(
      (fr) => fr.name.trim() && fr.relation.trim()
    )

    setLoading(true)

    const user = await getCurrentUser()
    if (!user) {
      setError("ログインが必要です")
      setLoading(false)
      router.push("/auth/login")
      return
    }

    const data = {
      catName: catName.trim(),
      pattern,
      personality,
      firstPerson,
      toneType,
      familyRelations: validFamilyRelations,
      likes: String(likes || "").trim(),
      dislikes: String(dislikes || "").trim(),
      uniqueBehaviors: String(uniqueBehaviors || "").trim(),
      birthDate: birthDate ? new Date(birthDate) : null,
    }

    if (existingTecho) {
      const { updateUchinoKoTecho } = await import("@/lib/firebase/firestore")
      const { error: updateError } = await updateUchinoKoTecho(existingTecho.id, data)

      if (updateError) {
        setError("うちの子手帳の更新に失敗しました")
        setLoading(false)
        return
      }

      toast({
        variant: "success",
        title: "更新完了",
        description: "うちの子手帳を更新しました",
      })
    } else {
      const { id, error: createError } = await createUchinoKoTecho(user.uid, data)

      if (createError || !id) {
        setError("うちの子手帳の作成に失敗しました")
        setLoading(false)
        return
      }

      toast({
        variant: "success",
        title: "作成完了",
        description: "うちの子手帳を作成しました",
      })
    }

    router.push("/post/create")
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-white py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <BookOpen className="w-8 h-8 text-pink-500" />
            <h1 className="text-3xl font-bold text-gray-900">
              {existingTecho ? "うちの子手帳を編集" : "うちの子手帳を作成"}
            </h1>
          </div>
          <p className="text-gray-700 text-lg">
            愛猫の情報を登録して、より正確な翻訳を実現しましょう
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* 基本プロフィール */}
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardHeader className="bg-white border-b border-gray-200">
              <CardTitle className="text-xl font-semibold text-gray-900">
                基本プロフィール
              </CardTitle>
            </CardHeader>
            <CardContent className="bg-white pt-6 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="catName" className="text-gray-900 font-semibold text-base">
                  猫の名前 *
                </Label>
                <Input
                  id="catName"
                  type="text"
                  placeholder="例: たま"
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  required
                  className="bg-white border-gray-300 text-gray-900 focus:border-pink-400 focus:ring-2 focus:ring-pink-200 h-12 text-base"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-gray-900 font-semibold text-base">柄 *</Label>
                <div className="flex flex-wrap gap-2">
                  {patternOptions.map((option) => (
                    <Badge
                      key={option}
                      variant={pattern === option ? "default" : "outline"}
                      className={`cursor-pointer px-4 py-2 transition-colors text-base ${
                        pattern === option
                          ? "bg-pink-100 border-pink-400 text-pink-800 font-semibold"
                          : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                      }`}
                      onClick={() => setPattern(option)}
                    >
                      {option}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="birthDate" className="text-gray-900 font-semibold text-base">
                  誕生日（任意）
                </Label>
                <Input
                  id="birthDate"
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="bg-white border-gray-300 text-gray-900 focus:border-pink-400 focus:ring-2 focus:ring-pink-200 h-12 text-base"
                />
                <p className="text-xs text-gray-500">
                  誕生日がわからない場合は未入力でも問題ありません
                </p>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-900 font-semibold text-base">性格 *（複数選択可）</Label>
                <div className="flex flex-wrap gap-2">
                  {personalityOptions.map((option) => (
                    <Badge
                      key={option}
                      variant={personality.includes(option) ? "default" : "outline"}
                      className={`cursor-pointer px-4 py-2 transition-colors text-base ${
                        personality.includes(option)
                          ? "bg-pink-100 border-pink-400 text-pink-800 font-semibold"
                          : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                      }`}
                      onClick={() => handlePersonalityToggle(option)}
                    >
                      {option}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-900 font-semibold text-base">一人称 *</Label>
                <div className="flex flex-wrap gap-2">
                  {firstPersonOptions.map((option) => (
                    <Badge
                      key={option}
                      variant={firstPerson === option ? "default" : "outline"}
                      className={`cursor-pointer px-4 py-2 transition-colors text-base ${
                        firstPerson === option
                          ? "bg-pink-100 border-pink-400 text-pink-800 font-semibold"
                          : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                      }`}
                      onClick={() => setFirstPerson(option)}
                    >
                      {option}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 口調設定 */}
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardHeader className="bg-white border-b border-gray-200">
              <CardTitle className="text-xl font-semibold text-gray-900">
                口調設定
              </CardTitle>
            </CardHeader>
            <CardContent className="bg-white pt-6">
              <div className="space-y-2">
                <Label className="text-gray-900 font-semibold text-base">口調タイプ *</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {toneTypeOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setToneType(option.value)}
                      className={`p-4 rounded-lg border-2 text-left transition-colors text-base ${
                        toneType === option.value
                          ? "bg-pink-50 border-pink-400 text-pink-800 font-semibold"
                          : "bg-white border-gray-300 text-gray-900 hover:border-gray-400 hover:bg-gray-50"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 家族・同居人リスト */}
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardHeader className="bg-white border-b border-gray-200">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-semibold text-gray-900">
                  家族・同居人
                </CardTitle>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddFamilyRelation}
                  className="border-gray-300 text-gray-900 hover:bg-gray-50"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  追加
                </Button>
              </div>
            </CardHeader>
            <CardContent className="bg-white pt-6">
              <div className="space-y-3">
                {familyRelations.map((relation, index) => (
                  <div key={index} className="flex gap-2 items-start p-4 bg-gray-50 rounded-lg border border-gray-300">
                    <div className="flex-1 space-y-2">
                      <Input
                        placeholder="名前（例: パパ、ママ、先輩猫）"
                        value={relation.name}
                        onChange={(e) =>
                          handleFamilyRelationChange(index, "name", e.target.value)
                        }
                        className="bg-white border-gray-300 text-gray-900 focus:border-pink-400 focus:ring-2 focus:ring-pink-200 h-12 text-base"
                      />
                      <Input
                        placeholder="この子から見た関係（例: ご飯係、下僕、怖い先輩）"
                        value={relation.relation}
                        onChange={(e) =>
                          handleFamilyRelationChange(index, "relation", e.target.value)
                        }
                        className="bg-white border-gray-300 text-gray-900 focus:border-pink-400 focus:ring-2 focus:ring-pink-200 h-12 text-base"
                      />
                    </div>
                    {familyRelations.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveFamilyRelation(index)}
                        className="text-red-600 hover:text-red-800 hover:bg-red-50"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 詳細情報 */}
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardHeader className="bg-white border-b border-gray-200">
              <CardTitle className="text-xl font-semibold text-gray-900">
                詳細情報
              </CardTitle>
            </CardHeader>
            <CardContent className="bg-white pt-6 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="likes" className="text-gray-900 font-semibold text-base">
                  好きなもの
                </Label>
                <Textarea
                  id="likes"
                  placeholder="例: おもちゃ、キャットタワー、おやつ、ひなたぼっこ"
                  value={likes}
                  onChange={(e) => setLikes(e.target.value)}
                  className="bg-white border-gray-300 text-gray-900 focus:border-pink-400 focus:ring-2 focus:ring-pink-200 min-h-[100px] text-base"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dislikes" className="text-gray-900 font-semibold text-base">
                  嫌いなもの
                </Label>
                <Textarea
                  id="dislikes"
                  placeholder="例: 掃除機、大きな音、お風呂"
                  value={dislikes}
                  onChange={(e) => setDislikes(e.target.value)}
                  className="bg-white border-gray-300 text-gray-900 focus:border-pink-400 focus:ring-2 focus:ring-pink-200 min-h-[100px] text-base"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="uniqueBehaviors" className="text-gray-900 font-semibold text-base">
                  その子特有のクセ・エピソード
                </Label>
                <Textarea
                  id="uniqueBehaviors"
                  placeholder="例: カラスを見ると逃げる、高いところが好き、よくゴロゴロする"
                  value={uniqueBehaviors}
                  onChange={(e) => setUniqueBehaviors(e.target.value)}
                  className="bg-white border-gray-300 text-gray-900 focus:border-pink-400 focus:ring-2 focus:ring-pink-200 min-h-[120px] text-base"
                />
              </div>
            </CardContent>
          </Card>

          {error && (
            <div className="text-base text-red-700 bg-red-50 border-2 border-red-300 p-4 rounded-lg font-medium">
              {error}
            </div>
          )}

          <Button
            type="submit"
            className="w-full bg-pink-500 hover:bg-pink-600 text-white font-bold py-6 text-lg shadow-md"
            disabled={loading}
          >
            {loading
              ? existingTecho
                ? "更新中..."
                : "作成中..."
              : existingTecho
              ? "うちの子手帳を更新"
              : "うちの子手帳を作成"}
          </Button>
        </form>
      </div>
    </div>
  )
}
