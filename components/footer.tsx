"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { useState, useEffect } from "react"
import { supabaseClient } from "@/lib/supabase"
import { getLoginRedirect } from "@/lib/route-protection"

// Ícones SVG reais das redes sociais
const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
)

const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
)

const TikTokIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
)

export default function Footer() {
  const router = useRouter()
  const currentYear = new Date().getFullYear()
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    // Verificar autenticação
    const checkAuth = async () => {
      const { data: { user } } = await supabaseClient.auth.getUser()
      setIsAuthenticated(!!user)
    }
    checkAuth()

    // Listener para mudanças de autenticação
    const { data: { subscription } } = supabaseClient.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session?.user)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleProtectedLink = (e: React.MouseEvent, href: string) => {
    // Rotas protegidas que requerem autenticação
    const protectedPaths = ['/chat', '/videostudio', '/designstudio', '/musicstudio', '/imagestudio']
    
    if (protectedPaths.some(path => href.startsWith(path)) && !isAuthenticated) {
      e.preventDefault()
      router.push(getLoginRedirect(href))
    }
  }

  const footerLinks = {
    product: [
      { label: "Chat IA", href: "/chat" },
      { label: "Vídeo Studio", href: "/video-studio" },
      { label: "Design Studio", href: "/design-studio" },
      { label: "Music Studio", href: "/music-studio" },
      { label: "Image Studio", href: "/image-studio" },
    ],
    ecosystem: [
      { label: "2 LADOS", href: "https://www.2lados.pt", external: true },
      { label: "DUA IA", href: "https://dua.2lados.pt", external: true },
      { label: "DUA Coin", href: "https://duacoin.2lados.pt", external: true },
      { label: "Kyntal", href: "https://kyntal.pt", external: true },
    ],
    company: [
      { label: "Comunidade", href: "/comunidade" },
      { label: "Comprar Créditos", href: "/comprar" },
    ],
  }

  const socialLinks = [
    { 
      icon: InstagramIcon, 
      href: "https://www.instagram.com/_2lados/", 
      label: "2 LADOS no Instagram",
      name: "@2lados"
    },
    { 
      icon: InstagramIcon, 
      href: "https://www.instagram.com/soudua_/", 
      label: "DUA no Instagram",
      name: "@soudua"
    },
    { 
      icon: InstagramIcon, 
      href: "https://www.instagram.com/kyntal_/", 
      label: "Kyntal no Instagram",
      name: "@kyntal"
    },
    { 
      icon: FacebookIcon, 
      href: "https://www.facebook.com/p/2-Lados-61575605463692/", 
      label: "2 LADOS no Facebook",
      name: "Facebook"
    },
    {
      icon: TikTokIcon,
      href: "https://www.tiktok.com/@2.lados",
      label: "2 LADOS no TikTok",
      name: "TikTok"
    },
    {
      icon: TikTokIcon,
      href: "https://www.tiktok.com/@soudua",
      label: "DUA no TikTok",
      name: "TikTok DUA"
    },
  ]

  return (
    <footer className="relative bg-[#0a0a0a] border-t border-white/10">
      <div className="max-w-7xl mx-auto px-6 sm:px-12 py-16 lg:py-20">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12 mb-12">
          {/* Brand Column - Maior destaque */}
          <div className="lg:col-span-4">
            <Link href="/" className="inline-block mb-6">
              <h3 className="text-5xl font-extralight text-white tracking-tight">DUA</h3>
              <p className="text-sm text-white/40 mt-1">by 2 LADOS</p>
            </Link>
            <p className="text-white/70 font-light leading-relaxed mb-8 max-w-sm text-[15px]">
              A primeira assistente de IA criativa lusófona. Feita para criadores, por criadores. 
              Transforme ideias em realidade com nossos estúdios de criação alimentados por IA.
            </p>

            {/* Social Links */}
            <div className="flex flex-wrap gap-3">
              {socialLinks.map((social) => {
                const IconComponent = social.icon
                return (
                  <motion.a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="group relative"
                    aria-label={social.label}
                    title={social.name}
                  >
                    <div className="w-11 h-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/70 group-hover:text-white group-hover:bg-white/10 group-hover:border-white/20 transition-all duration-300">
                      <IconComponent />
                    </div>
                  </motion.a>
                )
              })}
            </div>
          </div>

          {/* Product Column */}
          <div className="lg:col-span-2">
            <h4 className="text-white font-semibold mb-5 text-sm tracking-wide uppercase">Estúdios</h4>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={(e) => handleProtectedLink(e, link.href)}
                    className="text-white/60 hover:text-white font-light text-[15px] transition-colors duration-300 hover:translate-x-1 inline-block"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Ecosystem Column */}
          <div className="lg:col-span-2">
            <h4 className="text-white font-semibold mb-5 text-sm tracking-wide uppercase">Ecossistema</h4>
            <ul className="space-y-3">
              {footerLinks.ecosystem.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white/60 hover:text-white font-light text-[15px] transition-colors duration-300 hover:translate-x-1 inline-block"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Column */}
          <div className="lg:col-span-2">
            <h4 className="text-white font-semibold mb-5 text-sm tracking-wide uppercase">Links</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-white/60 hover:text-white font-light text-[15px] transition-colors duration-300 hover:translate-x-1 inline-block"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Column */}
          <div className="lg:col-span-2">
            <h4 className="text-white font-semibold mb-5 text-sm tracking-wide uppercase">Contacto</h4>
            <ul className="space-y-3">
              <li>
                <a
                  href="mailto:info@2lados.pt"
                  className="text-white/60 hover:text-white font-light text-[15px] transition-colors duration-300 hover:translate-x-1 inline-block"
                >
                  info@2lados.pt
                </a>
              </li>
              <li>
                <a
                  href="https://wa.me/351964696576"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/60 hover:text-white font-light text-[15px] transition-colors duration-300 hover:translate-x-1 inline-block"
                >
                  +351 964 696 576
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/[0.06]">
          <div className="flex flex-col md:flex-row justify-center items-center gap-4">
            <p className="text-white/40 text-sm font-light text-center">
              © {currentYear} DUA IA & 2 LADOS. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
