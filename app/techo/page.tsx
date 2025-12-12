"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { getCurrentUser } from "@/lib/firebase/auth"
import { getUchinoKoTecho } from "@/lib/firebase/firestore"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BookOpen, Plus, Edit, ArrowLeft } from "lucide-react"
import type { UchinoKoTecho } from "@/lib/firebase/types"

export default function TechoPage() {
  const router = useRouter()
  const [techoList, setTechoList] = useState<UchinoKoTecho[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadTecho = async () => {
      const user = await getCurrentUser()
      if (!user) {
        router.push("/auth/login")
        return
      }

      const { data, error } = await getUchinoKoTecho(user.uid)
      if (error) {
        console.error("うちの子手帳の取得に失敗しました:", error)
      } else if (data) {
        setTechoList(data)
      }
      setLoading(false)
    }
    loadTecho()
  }, [router])

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
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" size="sm" className="mb-4 text-amber-900 hover:text-amber-950 hover:bg-amber-50">
              <ArrowLeft className="w-4 h-4 mr-2" />
              ホームに戻る
            </Button>
          </Link>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BookOpen className="w-8 h-8 text-pink-500" />
              <h1 className="text-4xl font-bold text-amber-900">うちの子手帳</h1>
            </div>
            <Link href="/techo/create">
              <Button className="bg-pink-500 hover:bg-pink-600 text-white rounded-xl">
                <Plus className="w-4 h-4 mr-2" />
                新しい手帳を作成
              </Button>
            </Link>
          </div>
          <p className="text-amber-900 mt-2">
            愛猫の情報を登録して、より正確な翻訳を実現しましょう
          </p>
        </div>

        {techoList.length === 0 ? (
          <Card className="bg-white border border-amber-200 shadow-sm rounded-xl">
            <CardContent className="py-12 text-center">
              <BookOpen className="w-16 h-16 text-pink-300 mx-auto mb-4" />
              <p className="text-amber-900 mb-4">
                まだうちの子手帳がありません
              </p>
              <Link href="/techo/create">
                <Button className="bg-pink-500 hover:bg-pink-600 text-white rounded-xl">
                  <Plus className="w-4 h-4 mr-2" />
                  最初の手帳を作成
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {techoList.map((techo) => (
              <Card key={techo.id} className="bg-white border border-amber-200 shadow-sm hover:shadow-lg transition-shadow rounded-xl">
                <CardHeader className="bg-white border-b border-amber-200">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-2xl text-amber-900">{techo.catName}</CardTitle>
                    <Link href={`/techo/${techo.id}/edit`}>
                      <Button variant="ghost" size="icon" className="text-amber-900 hover:text-amber-950 hover:bg-amber-50">
                        <Edit className="w-4 h-4" />
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {techo.pattern && (
                    <div>
                      <p className="text-sm font-semibold text-amber-900 mb-1">
                        柄
                      </p>
                      <p className="text-amber-900">{techo.pattern}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-semibold text-amber-900 mb-1">
                      性格
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {Array.isArray(techo.personality) && techo.personality.length > 0 ? (
                        techo.personality.map((p, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-sm"
                          >
                            {p}
                          </span>
                        ))
                      ) : (
                        <span className="text-amber-700 text-sm">未設定</span>
                      )}
                    </div>
                  </div>
                  {techo.firstPerson && (
                    <div>
                      <p className="text-sm font-semibold text-amber-900 mb-1">
                        一人称
                      </p>
                      <p className="text-amber-900">{techo.firstPerson}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-semibold text-amber-900 mb-1">
                      口調
                    </p>
                    <p className="text-amber-900">{techo.toneType || techo.tone || "未設定"}</p>
                  </div>
                  {techo.familyRelations && techo.familyRelations.length > 0 && (
                    <div>
                      <p className="text-sm font-semibold text-amber-900 mb-1">
                        家族・同居人
                      </p>
                      <div className="space-y-1">
                        {techo.familyRelations.map((rel, index) => (
                          <div key={index} className="text-sm text-amber-900">
                            <span className="font-medium">{rel.name}</span>: {rel.relation}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {techo.likes && (
                    <div>
                      <p className="text-sm font-semibold text-amber-900 mb-1">
                        好きなもの
                      </p>
                      <p className="text-amber-900 text-sm">{techo.likes}</p>
                    </div>
                  )}
                  {techo.dislikes && (
                    <div>
                      <p className="text-sm font-semibold text-amber-900 mb-1">
                        嫌いなもの
                      </p>
                      <p className="text-amber-900 text-sm">{techo.dislikes}</p>
                    </div>
                  )}
                  {techo.uniqueBehaviors && (
                    <div>
                      <p className="text-sm font-semibold text-amber-900 mb-1">
                        その子特有のクセ・エピソード
                      </p>
                      <p className="text-amber-900 text-sm">{techo.uniqueBehaviors}</p>
                    </div>
                  )}
                  <div className="pt-2 border-t border-amber-200">
                    <p className="text-xs text-amber-700">
                      作成日:{" "}
                      {new Date(techo.createdAt).toLocaleDateString("ja-JP")}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

