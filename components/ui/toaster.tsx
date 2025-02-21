
// ⭐️トースト(通知)を管理するためのカスタムトーストシステムを実装

// Toaster.tsx → 画面にトーストを表示するコンポーネント
// use-toast.tsx → トーストの状態を管理し、表示・更新・削除するロジック

"use client";

import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast";
import { useToast } from "@/components/ui/use-toast";


export function Toaster() {
  const { toasts } = useToast();

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        // console.log(id);
        
        return (
          <Toast
            key={id}
            {...props}
            className="border-none bg-dark-1 text-white"
          >
            <div className="grid gap-1 ">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            { action }
            <ToastClose />
          </Toast>
        );
      })}
      <ToastViewport />
    </ToastProvider>
  );
}
