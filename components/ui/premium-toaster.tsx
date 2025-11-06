/**
 * Premium Toast Notifications Wrapper
 * Configuração premium para Sonner toasts
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
          toast: "group relative overflow-hidden bg-black/90 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl hover:scale-105 transition-all duration-300 flex items-start gap-4",
          title: "text-sm font-semibold text-white",
          description: "text-sm text-white/70 mt-1",
          success: "border-green-500/20 bg-gradient-to-r from-green-500/10 to-emerald-500/10",
          error: "border-red-500/20 bg-gradient-to-r from-red-500/10 to-rose-500/10",
          warning: "border-yellow-500/20 bg-gradient-to-r from-yellow-500/10 to-orange-500/10",
          info: "border-purple-500/20 bg-gradient-to-r from-purple-500/10 to-pink-500/10",
        },
      }}
      icons={{
        success: (
          <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center">
            <svg className="w-3 h-3 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        ),
        error: (
          <div className="flex-shrink-0 w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center">
            <svg className="w-3 h-3 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        ),
        warning: (
          <div className="flex-shrink-0 w-5 h-5 rounded-full bg-yellow-500/20 flex items-center justify-center">
            <svg className="w-3 h-3 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        ),
        info: (
          <div className="flex-shrink-0 w-5 h-5 rounded-full bg-purple-500/20 flex items-center justify-center">
            <svg className="w-3 h-3 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        ),
      }}
      duration={3000}
      closeButton
    />
  )
}
