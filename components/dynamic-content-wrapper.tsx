"use client"

import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"

export function DynamicContentWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [paddingClass, setPaddingClass] = useState("pt-16")

  useEffect(() => {
    // Welcome pages (full screen) - SEM padding para experiência imersiva
    const welcomePages = ["/musicstudio", "/videostudio", "/imagestudio", "/designstudio"]
    if (welcomePages.includes(pathname || "")) {
      setPaddingClass("")
      return
    }

    // Páginas normais - padding da navbar principal
    setPaddingClass("pt-16")
  }, [pathname])

  return (
    <div className={paddingClass}>
      {children}
    </div>
  )
}
