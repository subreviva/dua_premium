'use client'

import { motion, useInView } from "framer-motion"
import { cn } from "@/lib/utils"
import { useRef, useMemo, ElementType } from "react"

interface TimelineContentProps {
  children: React.ReactNode
  animationNum: number
  timelineRef?: React.RefObject<HTMLElement | HTMLDivElement | null>
  customVariants?: any
  className?: string
  as?: ElementType
}

export function TimelineContent({
  children,
  animationNum,
  timelineRef,
  customVariants,
  className,
  as: Component = "div",
  ...props
}: TimelineContentProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  const variants = useMemo(() => customVariants || {
    visible: { opacity: 1, y: 0 },
    hidden: { opacity: 0, y: 20 }
  }, [customVariants])

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      custom={animationNum}
      variants={variants}
      className={cn(className)}
      {...props}
    >
      {children}
    </motion.div>
  )
}
