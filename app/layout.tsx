import type React from "react"
import type { Metadata } from "next"
import { Inter, Space_Grotesk } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { VideoGenerationProvider } from "@/contexts/video-generation-context"
import { VideoGenerationNotifications } from "@/components/ui/video-generation-notifications"
import { Toaster } from "sonner"
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
          <Toaster 
            position="top-center"
            theme="dark"
            richColors
            closeButton
            duration={3000}
            toastOptions={{
              className: "font-sans",
              style: {
                background: "rgba(0, 0, 0, 0.95)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                backdropFilter: "blur(20px)",
              }
            }}
          />
          <Analytics />
        </VideoGenerationProvider>
      </body>
    </html>
  )
}
