"use client"

import { usePathname } from "next/navigation"

/**
 * Hook para determinar se a página atual deve ter navbar contextual
 * Páginas com navbar contextual precisam de padding-top extra
 */
export function useHasContextualNavbar() {
  const pathname = usePathname()

  const studioRoutes = [
    "/chat",
    "/musicstudio",
    "/imagestudio",
    "/videostudio",
    "/designstudio",
  ]

  return studioRoutes.some((route) => pathname?.startsWith(route))
}
