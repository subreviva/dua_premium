/**
 * Premium Page Transition
 * Transições suaves entre páginas
 */

"use client"

import { motion, AnimatePresence } from "framer-motion"
import { usePathname } from "next/navigation"
import { ReactNode } from "react"

interface PremiumTransitionProps {
  children: ReactNode
}

export function PremiumTransition({ children }: PremiumTransitionProps) {
  const pathname = usePathname()

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ 
          duration: 0.3, 
          ease: [0.22, 1, 0.36, 1] 
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}

/**
 * Premium Button with micro-interactions
 */
export function PremiumButton({ 
  children, 
  onClick, 
  className = "",
  variant = "default",
  ...props
}: any) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ 
        type: "spring", 
        stiffness: 400, 
        damping: 17 
      }}
      onClick={onClick}
      className={`${className} relative overflow-hidden group`}
      {...props}
    >
      {/* Ripple effect on hover */}
      <motion.div
        className="absolute inset-0 bg-white/10"
        initial={{ scale: 0, opacity: 1 }}
        whileHover={{ scale: 2, opacity: 0 }}
        transition={{ duration: 0.6 }}
      />
      
      {children}
    </motion.button>
  )
}

/**
 * Premium Card with hover effects
 */
export function PremiumCard({ 
  children, 
  className = "",
  ...props 
}: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ 
        y: -5,
        transition: { duration: 0.2 }
      }}
      className={`${className} group`}
      {...props}
    >
      {/* Glow effect */}
      <motion.div
        className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500"
        aria-hidden="true"
      />
      
      <div className="relative">
        {children}
      </div>
    </motion.div>
  )
}

/**
 * Premium Input with focus effects
 */
export function PremiumInput({ 
  className = "",
  ...props 
}: any) {
  return (
    <motion.div 
      className="relative"
      whileFocus={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <input
        className={`${className} transition-all duration-300 focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500`}
        {...props}
      />
      
      {/* Focus glow */}
      <motion.div
        className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded opacity-0 focus-within:opacity-20 blur-xl transition-opacity duration-300 pointer-events-none"
        aria-hidden="true"
      />
    </motion.div>
  )
}
