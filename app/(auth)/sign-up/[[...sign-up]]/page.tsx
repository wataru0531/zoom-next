
// 登録ページ
// 登録していない場合はここにリダイレクトされる

import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <main className="flex h-screen w-full items-center justify-center">
      <SignUp />
    </main>
  );
}
