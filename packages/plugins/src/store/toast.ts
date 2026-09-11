import { createSignal } from 'solid-js'

/** 轻量 toast 通知（全局唯一栈，挂在 App 布局中渲染） */

export type ToastKind = 'info' | 'success' | 'error'

export interface ToastItem {
  id: number
  kind: ToastKind
  text: string
}

const [toasts, setToasts] = createSignal<ToastItem[]>([])
let seq = 0

export function showToast(text: string, kind: ToastKind = 'info', duration = 4200): void {
  const id = ++seq
  setToasts((list) => [...list, { id, kind, text }])
  setTimeout(() => {
    setToasts((list) => list.filter((t) => t.id !== id))
  }, duration)
}

export { toasts }
