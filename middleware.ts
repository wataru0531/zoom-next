
// ⭐️srcフォルダがある場合はsrcフォルダの直下に挿入

// Next.jsでClerkの認証ミドルウェアを設定
// → 「 特定のルートにアクセスするユーザーを自動的に認証し、適切に制限する 」ためのもの

// ⭐️OAuthでは認可サーバー(Googleなど)からアクセストークンを取得するが、Clerkはその処理をすべて代行する

// ⭐️結局のところ、アプリケーションが認可サーバー(GoogleやGitHub)からアクセストークンをもらうことで、そのトークンを使ってそのアプリにログインしている。
//  そして、そのトークンに見合ったデータをデータベースサーバーから取得してユーザー毎に画面を切り替えたり、ログイン状態を保持している
//  Clerkはその代行をしてくれている。


// clerkMiddleware → Clerkの 認証ミドルウェア
// createRouteMatcher → 特定のURL（ルート）を簡単に指定できる関数
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';


// ⭐️認証が必要なページを指定
// → ここに記述したルートは認証が済んでいないと入れない
// matcherの意味 ... 「 一致するものを探すもの 」の意味
//                  プログラミングでは、特定の条件に合うもの（URLなど）を探し、
//                  それに応じて処理を実行する役割 
const protectedRoute = createRouteMatcher([
  '/',
  '/upcoming',
  '/meeting(.*)',
  '/previous',
  '/recordings',
  '/personal-room',
]);

// ⭐️認証チェックを実行
// clerkMiddlewareははcreateRouteMatcherで指定したリクエストごとに発火する
export default clerkMiddleware((auth, req) => {
  // auth().protect() → ログインを要求する処理
  if (protectedRoute(req)) auth().protect();
});

// ⭐️Next.js の matcher を設定
// → middleware.ts をどのページに適用するか を決める
export const config = {
  matcher: [
    '/((?!.+\\.[\\w]+$|_next).*)', // →  APIルートにも適用
    '/', '/(api|trpc)(.*)' // → 画像やCSSファイルなどの静的ファイルは適用しない（ページだけに適用）
  ],
};
