"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Instagram, Twitter, Linkedin, Youtube, Mail } from "lucide-react"

export default function Footer() {
  const currentYear = new Date().getFullYear()

  const footerLinks = {
    product: [
      { label: "Chat IA", href: "/chat" },
      { label: "Cinema Studio", href: "/videostudio" },
      { label: "Design Studio", href: "/designstudio" },
      { label: "Music Studio", href: "/musicstudio" },
      { label: "Image Studio", href: "/imagestudio" },
    ],
    company: [
      { label: "Sobre", href: "/sobre" },
      { label: "Comunidade", href: "/community" },
      { label: "Feed", href: "/feed" },
      { label: "Perfil", href: "/profile/dua" },
    ],
    resources: [
      { label: "2 LADOS Studio", href: "#2lados" },
      { label: "Kyntal", href: "#kyntal" },
      { label: "DUA Coin", href: "#duacoin" },
    ],
    legal: [
      { label: "Privacidade", href: "/privacy" },
      { label: "Termos", href: "/terms" },
      { label: "Cookies", href: "/cookies" },
    ],
  }

  const socialLinks = [
    { icon: Instagram, href: "https://instagram.com", label: "Instagram" },
    { icon: Twitter, href: "https://twitter.com", label: "Twitter" },
    { icon: Linkedin, href: "https://linkedin.com", label: "LinkedIn" },
    { icon: Youtube, href: "https://youtube.com", label: "YouTube" },
    { icon: Mail, href: "mailto:hello@dua.ai", label: "Email" },
  ]

  return (
    <footer className="relative bg-[#0a0a0a] border-t border-white/10">
      <div className="max-w-7xl mx-auto px-6 sm:px-12 py-16 lg:py-20">
        {/* Main Footer Content */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 lg:gap-12 mb-12">
          {/* Brand Column */}
          <div className="col-span-2">
            <Link href="/" className="inline-block mb-6">
              <h3 className="text-4xl font-extralight text-white tracking-tight">DUA</h3>
            </Link>
            <p className="text-white/60 font-light leading-relaxed mb-6 max-w-xs">
              A primeira assistente de IA criativa lusófona. Feita para criadores, por criadores.
            </p>
            {/* Social Links */}
            <div className="flex gap-4">
              {socialLinks.map((social) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-all duration-300"
                  aria-label={social.label}
                >
                  <social.icon size={18} />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Product Column */}
          <div>
            <h4 className="text-white font-medium mb-4">Produto</h4>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-white/60 hover:text-white font-light text-sm transition-colors duration-300"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Column */}
          <div>
            <h4 className="text-white font-medium mb-4">Empresa</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-white/60 hover:text-white font-light text-sm transition-colors duration-300"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Column */}
          <div>
            <h4 className="text-white font-medium mb-4">Ecossistema</h4>
            <ul className="space-y-3">
              {footerLinks.resources.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-white/60 hover:text-white font-light text-sm transition-colors duration-300"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Column */}
          <div>
            <h4 className="text-white font-medium mb-4">Legal</h4>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-white/60 hover:text-white font-light text-sm transition-colors duration-300"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-white/40 text-sm font-light">
              © {currentYear} DUA IA. Todos os direitos reservados.
            </p>
            <p className="text-white/40 text-sm font-light">
              Feito com ❤️ em Portugal e Cabo Verde
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
