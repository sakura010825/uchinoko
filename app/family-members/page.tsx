"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { getCurrentUser } from "@/lib/firebase/auth"
import {
  createFamilyMember,
  getFamilyMembers,
  updateFamilyMember,
  deleteFamilyMember,
} from "@/lib/firebase/firestore"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Plus, Edit, Trash2, Users } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { FamilyMember } from "@/lib/firebase/types"

export default function FamilyMembersPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [members, setMembers] = useState<FamilyMember[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formName, setFormName] = useState("")
  const [formFeatures, setFormFeatures] = useState("")
  const [error, setError] = useState("")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const loadMembers = async () => {
      const user = await getCurrentUser()
      if (!user) {
        router.push("/auth/login")
        return
      }

      const { data, error } = await getFamilyMembers(user.uid)
      if (error) {
        setError("家族メンバーの取得に失敗しました: " + error)
      } else if (data) {
        setMembers(data)
      }
      setLoading(false)
    }
    loadMembers()
  }, [router])

  const handleStartEdit = (member: FamilyMember) => {
    setEditingId(member.id)
    setFormName(member.name)
    setFormFeatures(member.appearanceFeatures)
    setError("")
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setFormName("")
    setFormFeatures("")
    setError("")
  }

  const handleSave = async () => {
    if (!formName.trim()) {
      setError("名前を入力してください")
      return
    }

    setSaving(true)
    setError("")

    const user = await getCurrentUser()
    if (!user) {
      setError("ログインが必要です")
      setSaving(false)
      return
    }

    try {
      if (editingId) {
        // 更新
        const { error: updateError } = await updateFamilyMember(
          editingId,
          user.uid,
          {
            name: formName.trim(),
            appearanceFeatures: formFeatures.trim(),
          }
        )

        if (updateError) {
          setError("更新に失敗しました: " + updateError)
          setSaving(false)
          return
        }

        // ローカル状態を更新
        setMembers((prev) =>
          prev.map((m) =>
            m.id === editingId
              ? {
                  ...m,
                  name: formName.trim(),
                  appearanceFeatures: formFeatures.trim(),
                }
              : m
          )
        )

        toast({
          variant: "success",
          title: "更新完了",
          description: "家族メンバーを更新しました",
        })
      } else {
        // 新規作成
        const { id, error: createError } = await createFamilyMember(
          user.uid,
          {
            name: formName.trim(),
            appearanceFeatures: formFeatures.trim(),
          }
        )

        if (createError || !id) {
          setError("作成に失敗しました: " + (createError || "不明なエラー"))
          setSaving(false)
          return
        }

        // ローカル状態に追加
        const newMember: FamilyMember = {
          id,
          userId: user.uid,
          name: formName.trim(),
          appearanceFeatures: formFeatures.trim(),
          createdAt: new Date(),
          updatedAt: new Date(),
        }
        setMembers([...members, newMember])

        toast({
          variant: "success",
          title: "作成完了",
          description: "家族メンバーを追加しました",
        })
      }

      handleCancelEdit()
    } catch (err: any) {
      setError("エラーが発生しました: " + err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("この家族メンバーを削除しますか？")) {
      return
    }

    const user = await getCurrentUser()
    if (!user) {
      setError("ログインが必要です")
      return
    }

    const { error: deleteError } = await deleteFamilyMember(id, user.uid)
    if (deleteError) {
      setError("削除に失敗しました: " + deleteError)
      return
    }

    setMembers((prev) => prev.filter((m) => m.id !== id))
    toast({
      variant: "success",
      title: "削除完了",
      description: "家族メンバーを削除しました",
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center text-gray-700">読み込み中...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white py-12 overflow-x-hidden w-full max-w-full">
      <div className="w-full max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" size="sm" className="mb-4 text-gray-900 hover:text-gray-900 hover:bg-gray-100">
              <ArrowLeft className="w-4 h-4 mr-2" />
              ホームに戻る
            </Button>
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-8 h-8 text-pink-500" />
            <h1 className="text-3xl font-bold text-gray-900">家族メンバー設定</h1>
          </div>
          <p className="text-gray-700 text-lg">
            AIが写真に写っている家族を認識できるように、外見の特徴を登録してください
          </p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* 新規作成/編集フォーム */}
        <Card className="mb-8 bg-white border border-gray-200 shadow-sm">
          <CardHeader className="bg-white border-b border-gray-200">
            <CardTitle className="text-xl font-semibold text-gray-900">
              {editingId ? "家族メンバーを編集" : "新しい家族メンバーを追加"}
            </CardTitle>
          </CardHeader>
          <CardContent className="bg-white pt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-gray-900 font-semibold">
                呼び名 *
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="例: パパ、ママ、お兄ちゃん"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                className="bg-white border-gray-300 text-gray-900 focus:border-pink-400 focus:ring-2 focus:ring-pink-200 h-12"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="features" className="text-gray-900 font-semibold">
                外見の特徴 *
              </Label>
              <Input
                id="features"
                type="text"
                placeholder="例: メガネ、短髪、ヒゲ / 長髪、優しい顔、背が高い"
                value={formFeatures}
                onChange={(e) => setFormFeatures(e.target.value)}
                className="bg-white border-gray-300 text-gray-900 focus:border-pink-400 focus:ring-2 focus:ring-pink-200 h-12"
              />
              <p className="text-xs text-gray-500">
                カンマ区切りで複数の特徴を入力できます（例: メガネ、短髪、ヒゲ）
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleSave}
                disabled={saving}
                className="bg-pink-500 hover:bg-pink-600 text-white"
              >
                {saving ? "保存中..." : editingId ? "更新" : "追加"}
              </Button>
              {editingId && (
                <Button
                  onClick={handleCancelEdit}
                  variant="outline"
                  className="border-gray-300 text-gray-900 hover:bg-gray-50"
                >
                  キャンセル
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 登録済みメンバー一覧 */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">登録済みの家族メンバー</h2>
          {members.length === 0 ? (
            <Card className="bg-white border border-gray-200 shadow-sm">
              <CardContent className="py-12 text-center">
                <Users className="w-16 h-16 text-pink-300 mx-auto mb-4" />
                <p className="text-gray-700 mb-4">
                  まだ家族メンバーが登録されていません
                </p>
                <p className="text-sm text-gray-500">
                  上記のフォームから家族メンバーを追加してください
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {members.map((member) => (
                <Card
                  key={member.id}
                  className="bg-white border border-gray-200 shadow-sm hover:shadow-lg transition-shadow"
                >
                  <CardHeader className="bg-white border-b border-gray-200">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-xl text-gray-900">{member.name}</CardTitle>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleStartEdit(member)}
                          className="text-gray-900 hover:text-gray-950 hover:bg-gray-50"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(member.id)}
                          className="text-red-600 hover:text-red-800 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="bg-white pt-4">
                    <div>
                      <p className="text-sm font-semibold text-gray-900 mb-1">
                        外見の特徴
                      </p>
                      <p className="text-gray-700 text-sm">{member.appearanceFeatures || "未設定"}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}








