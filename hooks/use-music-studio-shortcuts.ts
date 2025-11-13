"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

/**
 * Hook para atalhos de teclado globais do Music Studio
 * 
 * Atalhos disponíveis:
 * - Alt + ← : Voltar
 * - Alt + H : Home
 * - Alt + C : Chat
 * - Alt + M : Music Studio
 * - Alt + 1 : Início (Music Studio)
 * - Alt + 2 : Criar
 * - Alt + 3 : Melodia
 * - Alt + 4 : Biblioteca
 * - Esc : Fechar modal/drawer (quando aplicável)
 */
export function useMusicStudioKeyboardShortcuts() {
  const router = useRouter()

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ignorar se estiver digitando em input, textarea ou contenteditable
      const target = event.target as HTMLElement
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return
      }

      // Alt + ← : Voltar
      if (event.altKey && event.key === "ArrowLeft") {
        event.preventDefault()
        router.back()
        return
      }

      // Alt + H : Home
      if (event.altKey && event.key.toLowerCase() === "h") {
        event.preventDefault()
        router.push("/")
        return
      }

      // Alt + C : Chat
      if (event.altKey && event.key.toLowerCase() === "c") {
        event.preventDefault()
        router.push("/chat")
        return
      }

      // Alt + M : Music Studio (Início)
      if (event.altKey && event.key.toLowerCase() === "m") {
        event.preventDefault()
        router.push("/musicstudio")
        return
      }

      // Alt + 1 : Início (Music Studio)
      if (event.altKey && event.key === "1") {
        event.preventDefault()
        router.push("/musicstudio")
        return
      }

      // Alt + 2 : Criar
      if (event.altKey && event.key === "2") {
        event.preventDefault()
        router.push("/create")
        return
      }

      // Alt + 3 : Melodia
      if (event.altKey && event.key === "3") {
        event.preventDefault()
        router.push("/melody")
        return
      }

      // Alt + 4 : Biblioteca
      if (event.altKey && event.key === "4") {
        event.preventDefault()
        router.push("/musicstudio/library")
        return
      }
    }

    window.addEventListener("keydown", handleKeyDown)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [router])
}
