"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import { cn } from "@/lib/utils"

interface Feature {
  step: string
  title?: string
  content: string
  image: string
}

interface FeatureStepsProps {
  features: Feature[]
  className?: string
  title?: string
  autoPlayInterval?: number
  imageHeight?: string
}

export function FeatureSteps({
  features,
  className,
  title = "How to get Started",
  autoPlayInterval = 3000,
  imageHeight = "h-[400px]",
}: FeatureStepsProps) {
  const [currentFeature, setCurrentFeature] = useState(0)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      if (progress < 100) {
        setProgress((prev) => prev + 100 / (autoPlayInterval / 100))
      } else {
        setCurrentFeature((prev) => (prev + 1) % features.length)
        setProgress(0)
      }
    }, 100)

    return () => clearInterval(timer)
  }, [progress, features.length, autoPlayInterval])

  return (
    <div className={cn("p-8 md:p-12", className)}>
      <div className="max-w-7xl mx-auto w-full">
        {title && (
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-10 text-center text-[#f5f0eb]">{title}</h2>
        )}

        <div className="flex flex-col md:grid md:grid-cols-2 gap-6 md:gap-10">
          <div className="order-2 md:order-1 space-y-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="flex items-start gap-6 md:gap-8 cursor-pointer"
                initial={{ opacity: 0.3 }}
                animate={{ opacity: index === currentFeature ? 1 : 0.4 }}
                transition={{ duration: 0.5 }}
                onClick={() => {
                  setCurrentFeature(index)
                  setProgress(0)
                }}
              >
                <motion.div
                  className={cn(
                    "w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center border-2 shrink-0",
                    index === currentFeature
                      ? "bg-gradient-to-br from-[#d4a574] to-[#c89b6f] border-[#d4a574] text-[#0a1628] scale-110 shadow-lg shadow-[#d4a574]/50"
                      : "bg-[#1a2942]/60 border-[#f5d4c8]/30 text-[#f5d4c8]/60",
                  )}
                  animate={{ scale: index === currentFeature ? 1.1 : 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {index <= currentFeature ? (
                    <span className="text-lg font-bold">✓</span>
                  ) : (
                    <span className="text-lg font-semibold">{index + 1}</span>
                  )}
                </motion.div>

                <div className="flex-1">
                  <h3
                    className={cn(
                      "text-2xl md:text-3xl lg:text-4xl font-bold mb-3 tracking-tight transition-colors duration-300",
                      index === currentFeature ? "text-[#f5f0eb]" : "text-[#f5d4c8]/50",
                    )}
                  >
                    {feature.title || feature.step}
                  </h3>
                  <p
                    className={cn(
                      "text-base md:text-lg lg:text-xl leading-relaxed transition-colors duration-300",
                      index === currentFeature ? "text-[#f5d4c8]/90" : "text-[#f5d4c8]/40",
                    )}
                  >
                    {feature.content}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className={cn("order-1 md:order-2 relative overflow-hidden rounded-2xl", imageHeight)}>
            <AnimatePresence mode="wait">
              {features.map(
                (feature, index) =>
                  index === currentFeature && (
                    <motion.div
                      key={index}
                      className="absolute inset-0 rounded-2xl overflow-hidden"
                      initial={{ y: 100, opacity: 0, rotateX: -20 }}
                      animate={{ y: 0, opacity: 1, rotateX: 0 }}
                      exit={{ y: -100, opacity: 0, rotateX: 20 }}
                      transition={{ duration: 0.5, ease: "easeInOut" }}
                    >
                      <Image
                        src={feature.image || "/placeholder.svg"}
                        alt={feature.step}
                        className="w-full h-full object-cover transition-transform transform"
                        width={1000}
                        height={500}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0a1628] via-[#0a1628]/50 to-transparent" />
                      <div className="absolute inset-0 border-2 border-[#d4a574]/30 rounded-2xl" />
                    </motion.div>
                  ),
              )}
            </AnimatePresence>

            {/* Progress indicator */}
            <div className="absolute bottom-6 left-6 right-6 z-10">
              <div className="h-1 bg-[#1a2942]/60 rounded-full overflow-hidden backdrop-blur-sm">
                <motion.div
                  className="h-full bg-gradient-to-r from-[#d4a574] to-[#f5d4c8]"
                  style={{ width: `${progress}%` }}
                  transition={{ duration: 0.1 }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FeatureSteps
