
// ハンバーガーメニュー →　スマホ時のみ

// ⭐️Radix UIのSheetでラップされた場合、中のTriggerやCloseなどの動きは同期されて、
// オープンやクローズなどが自動で制御されるようになる

'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { Sheet, SheetClose, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { sidebarLinks } from '@/constants';
import { cn } from '@/lib/utils';

const MobileNav = () => {
  const pathname = usePathname(); // ドメインから下を返す
  // console.log(pathname); /, /upcomming, /recordings

  return (
    <section className="w-full max-w-[264px]">
      <Sheet>
        {/* 
          ⭐️asChild →　asChild={true} の略。
            asChildを true にすると、SheetTrigger はラップした children(ここでは <Image>)を直接返す
        */}
        <SheetTrigger asChild>
          {/* スマホ時は表示。smは640px */}
          <Image
            src="/icons/hamburger.svg"
            width={36}
            height={36}
            alt="hamburger icon"
            className="cursor-pointer sm:hidden"
          />
        </SheetTrigger>

        {/* コンテンツ */}
        <SheetContent side="left" className="border-none bg-dark-1">
          {/* 
            Sheetcontentの中のLinkタグ、divタブをchildrentとして受けとり、
            SheetPromitive.contentの内にレンダリングする
          */}
          <Link href="/" className="flex items-center gap-1">
            <Image
              src="/icons/logo.svg"
              width={32}
              height={32}
              alt="yoom logo"
            />
            <p className="text-[26px] font-extrabold text-white">YOOM</p>
          </Link>

          <div className="flex h-[calc(100vh-72px)] flex-col justify-between overflow-y-auto">
            <SheetClose asChild>
              <section className=" flex h-full flex-col gap-6 pt-16 text-white">
                {sidebarLinks.map((link) => {
                  const isActive = pathname === link.route;

                  return (
                    <SheetClose asChild key={link.route}>
                      <Link
                        href={link.route}
                        key={link.label}
                        // isActiveがtrueなら、bg-blue-1を結合。falseなら外す
                        // → {}の中は、clsxの仕様で処理され、trueなら結合されるようになっている
                        className={cn(
                          'flex gap-4 links-center p-4 rounded-lg w-full max-w-60',
                          { 'bg-blue-1': isActive, }
                        )}
                      >
                        <Image
                          src={link.imgURL}
                          alt={link.label}
                          width={20}
                          height={20}
                        />
                        <p className="font-semibold">{link.label}</p>
                      </Link>
                    </SheetClose>
                  );
                })}
              </section>
            </SheetClose>
          </div>
        </SheetContent>
      </Sheet>
    </section>
  );
};

export default MobileNav;
