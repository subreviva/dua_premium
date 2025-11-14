import type React from "react"
import type { Metadata } from "next"
import { Inter, Space_Grotesk, Playfair_Display } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { VideoGenerationProvider } from "@/contexts/video-generation-context"
import { UnifiedMusicProvider } from "@/contexts/unified-music-context"
import { GlobalPlayerProvider } from "@/contexts/global-player-context"
import { VideoGenerationNotifications } from "@/components/ui/video-generation-notifications"
import { UnifiedMusicPlayer } from "@/components/unified-music-player"
import { GlobalMusicPlayer } from "@/components/global-music-player"
import { FloatingMiniPlayer } from "@/components/floating-mini-player"
import { StagewiseToolbar } from "@/components/stagewise-toolbar"
import { PremiumToaster } from "@/components/ui/premium-toaster"
import { PremiumLoading } from "@/components/ui/premium-loading"
import PWAInstallPrompt, { ConnectionStatus } from "@/components/PWAInstallPrompt"
import CookieConsent from "@/components/cookie-consent"
import { WelcomeScreenWrapper } from "@/components/welcome-screen-wrapper"
import { SmartNavbar } from "@/components/smart-navbar"
import { DynamicContentWrapper } from "@/components/dynamic-content-wrapper"
import "./globals.css"

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-display" })
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-serif" })

export const metadata: Metadata = {
  metadataBase: new URL('https://dua.2lados.pt'),
  title: {
    default: "DUA IA - Assistente de IA Criativa Portuguesa | Estúdios de Criação com Inteligência Artificial",
    template: "%s | DUA IA"
  },
  description: "DUA é a primeira assistente de IA criativa lusófona. Crie música, vídeos, designs e imagens com inteligência artificial. Plataforma portuguesa de criação digital com IA generativa para artistas, criadores e marcas.",
  keywords: [
    "ia portugal", "inteligencia artificial portugal", "criação com ia", "assistente ia português",
    "dua ia", "2 lados", "criar musica com ia", "gerar imagens ia portugal", "editor video ia",
    "design grafico ia", "chat ia portugues", "music studio ia", "image studio ia",
    "plataforma criativa portuguesa", "ia generativa em portugues", "ferramentas ia para artistas",
    "kyntal", "dua coin", "distribuicao musical portugal", "startup portuguesa ia",
    "alternativa midjourney portugal", "alternativa chatgpt portugues", "alternativa suno portugal"
  ],
  authors: [{ name: "2 LADOS", url: "https://www.2lados.pt" }],
  creator: "2 LADOS",
  publisher: "2 LADOS",
  generator: "Next.js",
  manifest: "/manifest.webmanifest",
  
  openGraph: {
    type: "website",
    locale: "pt_PT",
    alternateLocale: ["pt_BR", "pt_AO", "pt_MZ", "pt_CV"],
    url: "https://dua.2lados.pt",
    title: "DUA IA - Assistente de IA Criativa Portuguesa",
    description: "Crie música, vídeos, designs e imagens com IA. A primeira plataforma criativa lusófona alimentada por inteligência artificial.",
    siteName: "DUA IA",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "DUA - Assistente de IA Criativa Portuguesa",
      },
    ],
  },
  
  twitter: {
    card: "summary_large_image",
    title: "DUA IA - Assistente de IA Criativa Portuguesa",
    description: "Crie música, vídeos, designs e imagens com IA. Plataforma criativa lusófona.",
    images: ["/og-image.jpg"],
    creator: "@2lados",
  },
  
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  
  alternates: {
    canonical: "https://dua.2lados.pt",
    languages: {
      'pt-PT': 'https://dua.2lados.pt',
      'pt-BR': 'https://dua.2lados.pt/br',
    },
  },
  
  category: "Technology",
  
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "DUA IA",
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
    <html lang="pt-PT" data-scroll-behavior="smooth">
      <head>
        {/* SEO Premium - Schemas JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: '2 LADOS',
              alternateName: 'DUA IA',
              url: 'https://www.2lados.pt',
              logo: 'https://dua.2lados.pt/logo.png',
              description: 'Plataforma de criação com inteligência artificial para artistas e criadores lusófonos',
              foundingDate: '2024',
              contactPoint: {
                '@type': 'ContactPoint',
                telephone: '+351-964-696-576',
                contactType: 'Customer Service',
                email: 'info@2lados.pt',
                availableLanguage: ['pt', 'pt-PT', 'pt-BR'],
              },
              sameAs: [
                'https://www.instagram.com/_2lados/',
                'https://www.instagram.com/soudua_/',
                'https://www.instagram.com/kyntal_/',
                'https://www.facebook.com/p/2-Lados-61575605463692/',
                'https://www.tiktok.com/@2.lados',
                'https://www.tiktok.com/@soudua',
              ],
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'DUA IA',
              url: 'https://dua.2lados.pt',
              description: 'Assistente de IA criativa portuguesa para criação de música, imagens, vídeos e designs',
              potentialAction: {
                '@type': 'SearchAction',
                target: {
                  '@type': 'EntryPoint',
                  urlTemplate: 'https://dua.2lados.pt/pesquisar?q={search_term_string}',
                },
                'query-input': 'required name=search_term_string',
              },
              inLanguage: 'pt-PT',
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'SoftwareApplication',
              name: 'DUA IA',
              applicationCategory: 'MultimediaApplication',
              operatingSystem: 'Web, iOS, Android',
              offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'EUR',
              },
              description: 'Plataforma de criação com IA: música, imagens, vídeos, designs e chat inteligente em português',
            }),
          }}
        />
        
        {/* PWA Meta Tags */}
        <meta name="application-name" content="DUA IA" />
        <meta name="mobile-web-app-capable" content="yes" />
        
        {/* iOS Specific Meta Tags */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="DUA IA" />
        
        {/* iOS Splash Screens - Placeholder */}
        <link rel="apple-touch-startup-image" href="/splash/default.png" />
        
        {/* 🔧 Desabilitar Service Worker e Manifest em desenvolvimento */}
        {process.env.NODE_ENV === 'development' && (
          <script
            dangerouslySetInnerHTML={{
              __html: `
                // Desabilitar Service Worker em desenvolvimento
                if ('serviceWorker' in navigator) {
                  navigator.serviceWorker.getRegistrations().then(function(registrations) {
                    registrations.forEach(function(registration) {
                      registration.unregister();
                      console.log('[DEV] Service Worker unregistered');
                    });
                  });
                  
                  // Limpar todos os caches
                  if ('caches' in window) {
                    caches.keys().then(function(names) {
                      names.forEach(function(name) {
                        caches.delete(name);
                      });
                    });
                  }
                  console.log('[DEV] Service Worker disabled for development');
                }
              `,
            }}
          />
        )}
        
        {/* Manifest Link - Apenas em produção */}
        {process.env.NODE_ENV === 'production' && (
          <link rel="manifest" href="/manifest.webmanifest" />
        )}
      </head>
      <body className={`${inter.variable} ${spaceGrotesk.variable} ${playfair.variable} font-sans antialiased`}>
        <GlobalPlayerProvider>
          <UnifiedMusicProvider>
            <VideoGenerationProvider>
              {/* 🧠 Smart Navbar - Ultra inteligente, adapta-se a qualquer contexto */}
              <SmartNavbar />
              
              {/* Main content with dynamic padding */}
              <DynamicContentWrapper>
                {children}
              </DynamicContentWrapper>
              
              <VideoGenerationNotifications />
              
              {/* Unified Music Player - Funciona em TODO o site */}
              <UnifiedMusicPlayer />
              
              {/* Global Music Player - Player fixo no bottom (dentro do Music Studio) */}
              <GlobalMusicPlayer />
              
              {/* Floating Mini Player - Mini player flutuante (fora do Music Studio) */}
              <FloatingMiniPlayer />
              
              {/* Stagewise Toolbar - Dev Mode Only */}
              <StagewiseToolbar />
              
              {/* PWA Components */}
              <PWAInstallPrompt />
              <ConnectionStatus />
              
              {/* Cookie Consent Banner - GDPR Compliance */}
              <CookieConsent />
              
              {/* Welcome Screen - First time user experience */}
              <WelcomeScreenWrapper />
              
              {/* Premium Components */}
              <PremiumToaster />
              
              <Analytics />
            </VideoGenerationProvider>
          </UnifiedMusicProvider>
        </GlobalPlayerProvider>
      </body>
    </html>
  )
}
