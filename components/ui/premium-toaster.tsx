/**
 * Premium Toast Notifications Wrapper
 * Configuração premium para Sonner toasts - Design elegante sem emojis
 */

"use client"

import { Toaster } from "sonner"

export function PremiumToaster() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        unstyled: true,
        classNames: {
          toast: "group relative overflow-hidden bg-black/95 backdrop-blur-2xl border border-white/[0.08] rounded-xl p-4 shadow-[0_8px_32px_rgba(0,0,0,0.4)] hover:border-white/[0.12] transition-all duration-300 flex items-start gap-3 min-w-[320px]",
          title: "text-[13px] font-medium text-white/95 leading-tight",
          description: "text-[12px] text-white/60 mt-0.5 leading-snug",
          success: "border-white/[0.15] bg-white/[0.03]",
          error: "border-red-500/[0.25] bg-red-500/[0.05]",
          warning: "border-amber-500/[0.25] bg-amber-500/[0.05]",
          info: "border-white/[0.12] bg-white/[0.02]",
          closeButton: "!bg-white/[0.08] !border-white/[0.08] hover:!bg-white/[0.15] !rounded-lg !transition-all",
        },
      }}
      icons={{
        success: (
          <div className="flex-shrink-0 w-6 h-6 rounded-lg bg-white/[0.08] backdrop-blur-xl border border-white/[0.12] flex items-center justify-center">
            <svg className="w-3.5 h-3.5 text-white/90" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        ),
        error: (
          <div className="flex-shrink-0 w-6 h-6 rounded-lg bg-red-500/[0.12] backdrop-blur-xl border border-red-500/[0.25] flex items-center justify-center">
            <svg className="w-3.5 h-3.5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        ),
        warning: (
          <div className="flex-shrink-0 w-6 h-6 rounded-lg bg-amber-500/[0.12] backdrop-blur-xl border border-amber-500/[0.25] flex items-center justify-center">
            <svg className="w-3.5 h-3.5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        ),
        info: (
          <div className="flex-shrink-0 w-6 h-6 rounded-lg bg-white/[0.08] backdrop-blur-xl border border-white/[0.12] flex items-center justify-center">
            <svg className="w-3.5 h-3.5 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        ),
      }}
      duration={3500}
      closeButton
    />
  )
}
