import type React from "react"
import type { Metadata } from "next"
import { Inter, Space_Grotesk } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { VideoGenerationProvider } from "@/contexts/video-generation-context"
import { VideoGenerationNotifications } from "@/components/ui/video-generation-notifications"
import "./globals.css"

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-display" })

export const metadata: Metadata = {
  title: "DUA MUSIC - Crie Música com IA",
  description: "Plataforma profissional de criação musical com Inteligência Artificial",
  generator: "v0.app",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "DUA MUSIC",
  },
  formatDetection: {
    telephone: false,
  },
}

export function generateViewport() {
  return {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: "cover", // iOS Safe Area Support
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body className={`${inter.variable} ${spaceGrotesk.variable} font-sans antialiased`}>
        <VideoGenerationProvider>
          {children}
          <VideoGenerationNotifications />
          <Analytics />
        </VideoGenerationProvider>
      </body>
    </html>
  )
}
