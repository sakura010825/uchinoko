import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Header } from "@/components/layout/header"
import { Toaster } from "@/components/ui/toaster"
import { OfflineIndicator } from "@/components/offline-indicator"
import { WebVitals } from "@/app/_components/web-vitals"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: {
    default: "うちの子の気持ち | 猫の気持ちを翻訳するSNS",
    template: "%s | うちの子の気持ち",
  },
  description: "愛猫の写真を投稿すると、AIが猫の気持ちを代弁してくれる翻訳SNS。うちの子手帳で性格を登録して、もっと愛猫を理解しましょう。",
  keywords: ["猫", "ペット", "AI", "翻訳", "SNS", "うちの子手帳", "猫の気持ち"],
  authors: [{ name: "うちの子の気持ち" }],
  openGraph: {
    type: "website",
    locale: "ja_JP",
    siteName: "うちの子の気持ち",
    title: "うちの子の気持ち | 猫の気持ちを翻訳するSNS",
    description: "愛猫の写真を投稿すると、AIが猫の気持ちを代弁してくれる翻訳SNS",
  },
  twitter: {
    card: "summary_large_image",
    title: "うちの子の気持ち | 猫の気持ちを翻訳するSNS",
    description: "愛猫の写真を投稿すると、AIが猫の気持ちを代弁してくれる翻訳SNS",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#FFB6C1" />
      </head>
      <body className={inter.className}>
        <Header />
        <main id="main-content" role="main">
          {children}
        </main>
        <Toaster />
        <OfflineIndicator />
        <WebVitals />
      </body>
    </html>
  )
}

