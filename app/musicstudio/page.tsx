"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function MusicStudioPage() {
  const router = useRouter()
  
  useEffect(() => {
    // Redirecionar para home
    router.push("/")
  }, [router])

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-white text-center">
        <h1 className="text-2xl font-bold mb-4">Music Studio</h1>
        <p className="text-neutral-400">Em manutenção...</p>
      </div>
    </div>
  )
}
