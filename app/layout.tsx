
// プロジェクト全体に適用されるレイアウト

import { ReactNode } from "react";
import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Inter } from "next/font/google";

import "@stream-io/video-react-sdk/dist/css/styles.css";
import "react-datepicker/dist/react-datepicker.css";
import "./globals.css";

import { Toaster } from "@/components/ui/toaster";

// subsets: ["latin"]
// → フォントデータのサイズを最小限にして、ページの読み込みを最適化
//   Interには英語しかないのと、このサイト自体が英語のみなのでlatinを読み込む
//   Noto Sans JPならJapaneseを指定
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "YOOM",
  description: "Video calling App",
  icons: {
    icon: "/icons/logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="ja">
      
      {/* 
        ⭐️ appearance
          → ClerkProvider のプロパティを使用して、
            Clerk（認証管理ライブラリ）のUIの見た目をカスタマイズ
      */}
      <ClerkProvider
        appearance={{
          layout: {
            socialButtonsVariant: "iconButton",
            logoImageUrl: "/icons/yoom-logo.svg",
          },
          variables: {
            colorText: "#fff", // テキストの色
            colorPrimary: "#0E78F9", // ボタンやリンクの色を青系に
            colorBackground: "#1C1F2E", // 全体の背景色
            colorInputBackground: "#252A41", // 入力フィールド内の背景色
            colorInputText: "#fff", // 入力フィールド内のテキスト色を白に
          },
        }}
      >
        <body className={`${inter.className} bg-dark-2`}>
          <Toaster />
          
          { children}
        </body>
      </ClerkProvider>
    </html>
  );
}
