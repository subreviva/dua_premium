import type React from "react"
import type { Metadata } from "next"
import { Inter, Space_Grotesk } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { VideoGenerationProvider } from "@/contexts/video-generation-context"
import { UnifiedMusicProvider } from "@/contexts/unified-music-context"
import { VideoGenerationNotifications } from "@/components/ui/video-generation-notifications"
import { UnifiedMusicPlayer } from "@/components/unified-music-player"
import { StagewiseToolbar } from "@/components/stagewise-toolbar"
import { PremiumToaster } from "@/components/ui/premium-toaster"
import { PremiumLoading } from "@/components/ui/premium-loading"
import PWAInstallPrompt, { ConnectionStatus } from "@/components/PWAInstallPrompt"
import CookieConsent from "@/components/cookie-consent"
import "./globals.css"

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-display" })

export const metadata: Metadata = {
  title: "DUA - Plataforma de IA Criativa",
  description: "Plataforma completa com Inteligência Artificial - Crie vídeos, imagens, designs e muito mais",
  generator: "v0.app",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "DUA AI",
    startupImage: [
      {
        url: "/splash/iphone5_splash.png",
        media: "(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2)",
      },
      {
        url: "/splash/iphone6_splash.png",
        media: "(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2)",
      },
      {
        url: "/splash/iphoneplus_splash.png",
        media: "(device-width: 621px) and (device-height: 1104px) and (-webkit-device-pixel-ratio: 3)",
      },
      {
        url: "/splash/iphonex_splash.png",
        media: "(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3)",
      },
      {
        url: "/splash/iphonexr_splash.png",
        media: "(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2)",
      },
      {
        url: "/splash/iphonexsmax_splash.png",
        media: "(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3)",
      },
      {
        url: "/splash/ipad_splash.png",
        media: "(device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2)",
      },
      {
        url: "/splash/ipadpro1_splash.png",
        media: "(device-width: 834px) and (device-height: 1112px) and (-webkit-device-pixel-ratio: 2)",
      },
      {
        url: "/splash/ipadpro3_splash.png",
        media: "(device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2)",
      },
      {
        url: "/splash/ipadpro2_splash.png",
        media: "(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2)",
      },
    ],
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
      { url: "/icons/icon-152x152.png", sizes: "152x152", type: "image/png" },
    ],
  },
}

export function generateViewport() {
  return {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
    viewportFit: "cover",
    themeColor: "#000000",
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt" data-scroll-behavior="smooth">
      <head>
        {/* PWA Meta Tags */}
        <meta name="application-name" content="DUA AI" />
        <meta name="mobile-web-app-capable" content="yes" />
        
        {/* iOS Specific Meta Tags */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="DUA AI" />
        
        {/* iOS Splash Screens - Placeholder */}
        <link rel="apple-touch-startup-image" href="/splash/default.png" />
        
        {/* Manifest Link */}
        <link rel="manifest" href="/manifest.webmanifest" />
      </head>
      <body className={`${inter.variable} ${spaceGrotesk.variable} font-sans antialiased`}>
        <UnifiedMusicProvider>
          <VideoGenerationProvider>
            {children}
            <VideoGenerationNotifications />
            
            {/* Unified Music Player - Funciona em TODO o site */}
            <UnifiedMusicPlayer />
            
            {/* Stagewise Toolbar - Dev Mode Only */}
            <StagewiseToolbar />
            
            {/* PWA Components */}
            <PWAInstallPrompt />
            <ConnectionStatus />
            
            {/* Cookie Consent Banner - GDPR Compliance */}
            <CookieConsent />
            
            {/* Premium Components */}
            <PremiumToaster />
            
            <Analytics />
          </VideoGenerationProvider>
        </UnifiedMusicProvider>
      </body>
    </html>
  )
}
