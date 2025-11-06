import type React from "react"
import type { Metadata } from "next"
import { Inter, Space_Grotesk } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { VideoGenerationProvider } from "@/contexts/video-generation-context"
import { VideoGenerationNotifications } from "@/components/ui/video-generation-notifications"
import { StagewiseToolbar } from "@/components/stagewise-toolbar"
import { PremiumToaster } from "@/components/ui/premium-toaster"
import { PremiumLoading } from "@/components/ui/premium-loading"
import PWAInstallPrompt, { ConnectionStatus } from "@/components/PWAInstallPrompt"
import "./globals.css"

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-display" })

export const metadata: Metadata = {
  title: "DUA - Plataforma de IA Criativa",
  description: "Plataforma completa com Inteligência Artificial - Crie vídeos, imagens, designs e muito mais",
  generator: "v0.app",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "DUA",
  },
  formatDetection: {
    telephone: false,
  },
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#8B5CF6" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
  icons: {
    icon: [
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/icon-152x152.png", sizes: "152x152", type: "image/png" },
    ],
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
          
          {/* Stagewise Toolbar - Dev Mode Only */}
          <StagewiseToolbar />
          
          {/* PWA Components */}
          <PWAInstallPrompt />
          <ConnectionStatus />
          
          {/* Premium Components */}
          <PremiumToaster />
          
          <Analytics />
        </VideoGenerationProvider>
      </body>
    </html>
  )
}
