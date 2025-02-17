

// クラークの認証の設定


import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';


// プロテクトルート
// → ここに記述したルートは認証が済んでいないと入れない
const protectedRoute = createRouteMatcher([
  '/',
  '/upcoming',
  '/meeting(.*)',
  '/previous',
  '/recordings',
  '/personal-room',
]);

export default clerkMiddleware((auth, req) => {
  if (protectedRoute(req)) auth().protect();
});

export const config = {
  matcher: [
    '/((?!.+\\.[\\w]+$|_next).*)', 
    '/', '/(api|trpc)(.*)'
  ],
};
