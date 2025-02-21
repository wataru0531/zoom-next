
// ⭐️Radix UIの @radix-ui/react-dialog
// → シート（オーバーレイメニューやサイドバー）を実装するためのReactコンポーネントを作成

'use client';

import * as React from 'react';
import * as SheetPrimitive from '@radix-ui/react-dialog';
import { cva, type VariantProps } from 'class-variance-authority';
import { X } from 'lucide-react';

import { cn } from '@/lib/utils';

// ⭐️SheetPrimitive
// → @radix-ui/react-dialog ライブラリからインポートされたコンポーネント群
//   Radix UI は、アクセシビリティを考慮したプリミティブコンポーネント（基本的なUI部品）を提供

// ⭐️このSheetでラップされた場合、中のTriggerやCloseなどの機能や動きは同期されて、
//   オープンやクローズなどが自動で制御されるようになる

// シート全体のルートコンポーネント。シートを開いたり閉じたりする機能を提供
const Sheet = SheetPrimitive.Root;

// シートを開くトリガー(ボタンやアイコン)。ユーザーがクリックするとシートが開く
// → 内部でonClickが組み込まれていているため
const SheetTrigger = SheetPrimitive.Trigger;

// シートを閉じるためのボタン。シート内の内容をクリックしたり、特定の場所で閉じる
const SheetClose = SheetPrimitive.Close;

// シートの中身。実際に表示されるコンテンツやナビゲーションメニューがここに入り
const SheetPortal = SheetPrimitive.Portal;


// シートが開いたときに、画面全体に半透明のオーバーレイを表示
// refを親から渡せるように、refの型をOverlayの型に対応する型にする
// また、propsの型も同様にOverlayの型に対応するように設定する
const SheetOverlay = React.forwardRef< // React.forwardRef → SheetOverlay に ref を渡せるようにする。2つの引数を取る
  React.ElementRef<typeof SheetPrimitive.Overlay>, // SheetPrimitive.Overlayのrefの型を取得するための型定義
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Overlay> // SheetPrimitive.Overlayに渡せるpropsの型を取得。refを除いたpropsの型を取得
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Overlay
    className={cn(
      'fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
      className
    )}
    {...props}
    ref={ref}
  />
));
SheetOverlay.displayName = SheetPrimitive.Overlay.displayName;
// → ⭐️React DevTools でコンポーネント名を適切に表示するための設定
//  つまり、SheetOverlay をデバッグするときに、React DevTools で SheetOverlay ではなく
//  SheetPrimitive.Overlay として表示されるようになる

// ⭐️ React.forwardRef → Reactコンポーネントで ref(参照)を渡せるようにするための関数。
// → 通常、関数コンポーネントには ref を直接渡せないが、React.forwardRef を使うと 
//   親コンポーネントから渡された ref を内部の要素に関連付けることができるようになる
// ⭐️ fowardRefで、refが親コンポーネントから渡ってこない場合は、undefinedになるだけで
//    エラーにはならない


// class-variance-authority(cva)を使って、シートのスタイルを状態や種類に応じて変更
// 例えば、シートの表示位置(side)に応じて異なるスタイルが適用される
// { side }が渡ってきた場合は、cva内部の仕様でsideオブジェクの中のプロパティのどれかが選ばれる
const sheetVariants = cva(
  'fixed z-50 gap-4 bg-white p-6 shadow-lg transition ease-in-out data-[state=closed]:duration-300 data-[state=open]:duration-500 data-[state=open]:animate-in data-[state=closed]:animate-out dark:bg-slate-950',
  {
    variants: {
      side: {
        top: 'inset-x-0 top-0 border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top',
        bottom:
          'inset-x-0 bottom-0 border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom',
        left: 'inset-y-0 left-0 h-full w-3/4 border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:max-w-sm',
        right:
          'inset-y-0 right-0 h-full w-3/4  border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-sm',
      },
    },
    defaultVariants: {
      side: 'right',
    },
  }
);


interface SheetContentProps
extends React.ComponentPropsWithoutRef<typeof SheetPrimitive.Content>,
    VariantProps<typeof sheetVariants> {}

// シートの実際のコンテンツがここに含まれる
// → childrenには、SheetContentの中のLinkやdivタグを受けとり、
//   SheetPrimitive.Contentの中にレンダリングする
const SheetContent = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Content>, // refの型をSheetPrimitive.Contentに指定
  SheetContentProps>
  (({ side = 'right', className, children, ...props }, ref) => (
  <SheetPortal>
    {/* オーバーレイ(背景の薄いレイヤー) */}
    <SheetOverlay />

    {/* コンテンツ ⭐️ここにレンダリングされる */}
    <SheetPrimitive.Content
      ref={ref} // 親コンポーネントから渡されたrefを設定
      className={cn(sheetVariants({ side }), className)}
      {...props}
    >
      { children }

      {/* クローズボタン */}
      <SheetPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-white transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-slate-100 dark:ring-offset-slate-950 dark:focus:ring-slate-300 dark:data-[state=open]:bg-slate-800">
        {/*「 閉じる（X）」アイコン*/}
        <X className="size-4 text-white" />
        <span className="sr-only">Close</span>
      </SheetPrimitive.Close>

    </SheetPrimitive.Content>
  </SheetPortal>
));
SheetContent.displayName = SheetPrimitive.Content.displayName;


const SheetHeader = ({ 
  className, 
  ...props 
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      'flex flex-col space-y-2 text-center sm:text-left',
      className
    )}
    {...props}
  />
);
SheetHeader.displayName = 'SheetHeader';


const SheetFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      'flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2',
      className
    )}
    {...props}
  />
);
SheetFooter.displayName = 'SheetFooter';

const SheetTitle = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Title>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Title
    ref={ref}
    className={cn(
      'text-lg font-semibold text-slate-950 dark:text-slate-50',
      className
    )}
    {...props}
  />
));
SheetTitle.displayName = SheetPrimitive.Title.displayName;

const SheetDescription = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Description>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Description
    ref={ref}
    className={cn('text-sm text-slate-500 dark:text-slate-400', className)}
    {...props}
  />
));
SheetDescription.displayName = SheetPrimitive.Description.displayName;

export {
  Sheet,
  SheetPortal,
  SheetOverlay,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
};
