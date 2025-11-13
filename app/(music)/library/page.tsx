"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function LibraryRedirect() {
  const router = useRouter()
  
  useEffect(() => {
    // Redireciona para a nova biblioteca
    router.replace("/musicstudio/library")
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        <p className="mt-4 text-white/60">Redirecionando...</p>
      </div>
    </div>
  )
}
