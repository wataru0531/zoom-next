
// Navbar

import Image from 'next/image';
import Link from 'next/link';
import { SignedIn, UserButton, useClerk } from '@clerk/nextjs';

import MobileNav from './MobileNav';

const Navbar = () => {
  // 注意: useClerkは、use clientを記述必須
  // const { signOut } = useClerk();

  // afterSignOutUrl、redirectUriは非推奨のため記述
  // const handleSignOut = async () => {
  //   await signOut();

  //   window.location.href = "/sign-in"; 
  // }

  return (
    <nav className="w-full flex-between fixed z-50 bg-dark-1 px-6 py-4 lg:px-10">
      <Link href="/" className="flex items-center gap-1">
        {/* 
          ⭐️Imageコンポーネント
            → ビットマップ画像(JPEG, PNG など)を最適化するときに WebP などのフォーマットに変換するが、
              svg画像はそのまま出力される
        */}
        <Image
          src="/icons/logo.svg"
          width={32}
          height={32}
          alt="yoom logo"
          className="max-sm:size-10"
        />
        <p className="text-[26px] font-extrabold text-white max-sm:hidden">
          YOOM
        </p>
      </Link>
      <div className="flex-between gap-5">
        {/* 
          ⭐️SignedIn 
            → Clerk ライブラリを使って、ユーザーのサインイン状態に応じたボタンを表示
              ユーザーがサインインしている場合のみ、その中のコンテンツを表示するが、
              もしユーザーがサインインしていなければ、このコンポーネント内のコンテンツは表示されない

          ⭐️UserButton
            → Clerk が提供するボタンコンポーネントで、サインインしているユーザーの情報(例えば名前、プロフィール画像など)を表示するために使われる
              クリックすると、サインアウト(ログアウト)するためのアクションを実行します。

          ⭐️afterSignOutUrl="/sign-in" → ユーザーがサインアウトした後にリダイレクトされるurlに遷移させる
        */}
        <SignedIn>
          <UserButton afterSignOutUrl="/sign-in" />
          {/* <button onClick={handleSignOuot}>Sign Out</button> */}
        </SignedIn>

        <MobileNav />
      </div>
    </nav>
  );
};

export default Navbar;
