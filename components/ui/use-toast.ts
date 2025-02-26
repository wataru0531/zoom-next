
// トーストの管理（追加・更新・削除）を行うロジック
// Shadcnのライブラリ

"use client"


// Inspired by react-hot-toast library
import * as React from "react"

// トーストの型
import type {
  ToastActionElement,
  ToastProps,
} from "@/components/ui/toast"

const TOAST_LIMIT = 1; // 同時に表示できるトーストの最大数
const TOAST_REMOVE_DELAY = 1000000; // トーストが削除されるまでの時間。ミリ秒

type ToasterToast = ToastProps & {
  id: string
  title?: React.ReactNode // トーストのタイトル
  description?: React.ReactNode // トーストの説明
  action?: ToastActionElement // トーストにつけれれるアクション
}

const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
} as const; // 型アサーション。読み取り専用にして変更不可にする


let count = 0

// トーストに対して一意のidを生成する関数
function genId() {
  // MAX_SAFE_INTEGER → JavaScriptで扱える最大の整数
  // console.log(Number.MAX_SAFE_INTEGER); // 9007199254740991

  count = (count + 1) % Number.MAX_SAFE_INTEGER
  return count.toString()
}

type ActionType = typeof actionTypes;

// アクションの型定義。
// リテラル型 → 固定の値のみを持つことができる型。ここでは決められたアクションのみを許可している
type Action =
  | {
      type: ActionType["ADD_TOAST"]
      toast: ToasterToast
    }
  | {
      type: ActionType["UPDATE_TOAST"]
      toast: Partial<ToasterToast>
    }
  | {
      type: ActionType["DISMISS_TOAST"]
      toastId?: ToasterToast["id"]
    }
  | {
      type: ActionType["REMOVE_TOAST"]
      toastId?: ToasterToast["id"]
    }

// トーストの状態管理
interface State {
  toasts: ToasterToast[]
}

// トーストの削除を管理するタイマーを格納する Map オブジェクト
// setTimeout の戻り値を保存し、後で削除できるようにする
// stringをキー、setTimeoutの戻り値を値 として保持
const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>()
// console.log(toastTimeouts);

// トーストを削除する処理
const addToRemoveQueue = (toastId: string) => {
  if (toastTimeouts.has(toastId)) {
    return
  }

  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId); // 削除

    dispatch({
      type: "REMOVE_TOAST",
      toastId: toastId,
    })
  }, TOAST_REMOVE_DELAY); // 1000000ミリ秒後に削除

  toastTimeouts.set(toastId, timeout)
}

// トーストの状態を管理するReducer
export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "ADD_TOAST": // 新しいトーストを追加
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
        // TOAST_LIMIT → 1。最大１つまでしか追加されない
      }

    case "UPDATE_TOAST": // 既存のトーストを更新
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t
        ),
      }

    case "DISMISS_TOAST": { // トーストを非表示にし、削除のキューに追加
      const { toastId } = action

      if (toastId) {
        addToRemoveQueue(toastId)
      } else {
        state.toasts.forEach((toast) => {
          addToRemoveQueue(toast.id)
        })
      }

      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === toastId || toastId === undefined
            ? {
                ...t,
                open: false,
              }
            : t
        ),
      }
    }

    case "REMOVE_TOAST": // トーストを完全に削除
      if (action.toastId === undefined) {
        return {
          ...state,
          toasts: [],
        }
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      }
  }
}

const listeners: Array<(state: State) => void> = []

let memoryState: State = { toasts: [] }

function dispatch(action: Action) {
  memoryState = reducer(memoryState, action)
  listeners.forEach((listener) => {
    listener(memoryState)
  })
}

type Toast = Omit<ToasterToast, "id">

//　トーストを追加する処理
function toast({ ...props }: Toast) {
  const id = genId()

  const update = (props: ToasterToast) =>
    dispatch({
      type: "UPDATE_TOAST",
      toast: { ...props, id },
    })
  const dismiss = () => dispatch({ type: "DISMISS_TOAST", toastId: id })

  dispatch({
    type: "ADD_TOAST",
    toast: {
      ...props,
      id,
      open: true,
      onOpenChange: (open) => {
        if (!open) dismiss()
      },
    },
  })

  return {
    id: id,
    dismiss,
    update,
  }
}


function useToast() {
  const [ state, setState ] = React.useState<State>(memoryState)

  React.useEffect(() => {
    listeners.push(setState);

    return () => {
      const index = listeners.indexOf(setState)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }, [ state ])

  return {
    ...state,
    toast,
    dismiss: (toastId?: string) => dispatch({ type: "DISMISS_TOAST", toastId }),
  }
}

export { useToast, toast }
