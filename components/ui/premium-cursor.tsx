/**
 * Premium Cursor Effect
 * Cursor personalizado com trail effect
 */

"use client"

import { useEffect, useState } from "react"
import { motion, useMotionValue, useSpring } from "framer-motion"

export function PremiumCursor() {
  const [isPointer, setIsPointer] = useState(false)
  const [isHidden, setIsHidden] = useState(false)

  const cursorX = useMotionValue(-100)
  const cursorY = useMotionValue(-100)

  const springConfig = { damping: 25, stiffness: 700 }
  const cursorXSpring = useSpring(cursorX, springConfig)
  const cursorYSpring = useSpring(cursorY, springConfig)

  useEffect(() => {
    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX)
      cursorY.set(e.clientY)

      // Check if hovering over interactive element
      const target = e.target as HTMLElement
      const isInteractive = 
        target.tagName === "BUTTON" ||
        target.tagName === "A" ||
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.closest("button") !== null ||
        target.closest("a") !== null

      setIsPointer(isInteractive)
    }

    const hideCursor = () => setIsHidden(true)
    const showCursor = () => setIsHidden(false)

    window.addEventListener("mousemove", moveCursor)
    window.addEventListener("mouseleave", hideCursor)
    window.addEventListener("mouseenter", showCursor)

    return () => {
      window.removeEventListener("mousemove", moveCursor)
      window.removeEventListener("mouseleave", hideCursor)
      window.removeEventListener("mouseenter", showCursor)
    }
  }, [cursorX, cursorY])

  return (
    <>
      {/* Main cursor */}
      <motion.div
        className="fixed top-0 left-0 w-6 h-6 pointer-events-none z-[9999] mix-blend-difference"
        style={{
          x: cursorXSpring,
          y: cursorYSpring,
          translateX: "-50%",
          translateY: "-50%",
        }}
      >
        <motion.div
          animate={{
            scale: isPointer ? 1.5 : 1,
            opacity: isHidden ? 0 : 1,
          }}
          transition={{ duration: 0.2 }}
          className="w-full h-full rounded-full border-2 border-white"
        />
      </motion.div>

      {/* Cursor dot */}
      <motion.div
        className="fixed top-0 left-0 w-2 h-2 pointer-events-none z-[9999] bg-white rounded-full mix-blend-difference"
        style={{
          x: cursorX,
          y: cursorY,
          translateX: "-50%",
          translateY: "-50%",
        }}
        animate={{
          scale: isPointer ? 0 : 1,
          opacity: isHidden ? 0 : 1,
        }}
        transition={{ duration: 0.1 }}
      />

      {/* Trail effect */}
      <motion.div
        className="fixed top-0 left-0 w-12 h-12 pointer-events-none z-[9998]"
        style={{
          x: cursorXSpring,
          y: cursorYSpring,
          translateX: "-50%",
          translateY: "-50%",
        }}
      >
        <motion.div
          animate={{
            scale: isPointer ? 1.8 : 1,
            opacity: isHidden ? 0 : 0.3,
          }}
          transition={{ duration: 0.6 }}
          className="w-full h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500 blur-xl"
        />
      </motion.div>
    </>
  )
}
