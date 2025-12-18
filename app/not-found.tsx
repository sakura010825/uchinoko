import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Home } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-cream to-cream-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardContent className="py-12 text-center">
          <div className="text-6xl mb-4">🐾</div>
          <h1 className="text-3xl font-bold text-charcoal mb-2">404</h1>
          <p className="text-charcoal-300 mb-6">
            お探しのページが見つかりませんでした
          </p>
          <Link href="/">
            <Button className="bg-salmon hover:bg-salmon-200">
              <Home className="w-4 h-4 mr-2" />
              ホームに戻る
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}














