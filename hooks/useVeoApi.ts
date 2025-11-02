"use client"

import { useState } from "react"

// Veo Models
export const VEO_MODELS = {
  "veo-3.1-preview": {
    id: "veo-3.1-generate-preview",
    name: "Veo 3.1 Preview",
    description: "Latest model with reference images and interpolation",
    maxDuration: 7,
    features: ["text-to-video", "image-to-video", "reference-images", "interpolation", "extension"] as const,
  },
  "veo-3.1-fast": {
    id: "veo-3.1-fast-generate-preview",
    name: "Veo 3.1 Fast",
    description: "Fast generation with high quality",
    maxDuration: 7,
    features: ["text-to-video", "image-to-video"] as const,
  },
  "veo-3.0": {
    id: "veo-3.0-generate-001",
    name: "Veo 3.0",
    description: "Stable model with audio",
    maxDuration: 7,
    features: ["text-to-video", "image-to-video"] as const,
  },
  "veo-3.0-fast": {
    id: "veo-3.0-fast-generate-001",
    name: "Veo 3.0 Fast",
    description: "Fast generation for production",
    maxDuration: 7,
    features: ["text-to-video", "image-to-video"] as const,
  },
  "veo-2.0": {
    id: "veo-2.0-generate-001",
    name: "Veo 2.0",
    description: "Previous generation model",
    maxDuration: 5,
    features: ["text-to-video", "image-to-video"] as const,
  },
} as const

export type VeoModel = keyof typeof VEO_MODELS

export type VeoMode = "text-to-video" | "image-to-video" | "reference-images" | "interpolation" | "extension"

export interface VeoConfig {
  model: VeoModel
  mode: VeoMode
  prompt: string
  
  // Negative prompt - o que NÃO incluir no vídeo
  negativePrompt?: string
  
  // Image-to-video (first frame)
  firstFrameImage?: File | string
  
  // Reference images (up to 3) - Veo 3.1 only
  referenceImages?: Array<{
    image: File | string
    referenceType: "asset" | "style"
  }>
  
  // Interpolation (first + last frame) - Veo 3.1 only
  lastFrameImage?: File | string
  
  // Extension (extend existing video) - Veo 3.1 only
  inputVideo?: File | string
  
  // Video settings
  resolution?: "720p" | "1080p"
  aspectRatio?: "16:9" | "9:16"
  durationSeconds?: 4 | 5 | 6 | 8 // Veo 3.1: 4,6,8 | Veo 3: 4,6,8 | Veo 2: 5,6,8
  
  // Person generation control
  personGeneration?: "allow_all" | "allow_adult" | "dont_allow"
  
  // Seed for improved determinism (Veo 3 only)
  seed?: number
  
  numberOfVideos?: number
}

export interface VeoVideo {
  url: string
  thumbnailUrl?: string
  duration: number
  resolution: string
  aspectRatio: string
}

export interface VeoOperation {
  id: string
  status: "pending" | "processing" | "completed" | "failed"
  progress: number
  video?: VeoVideo
  error?: string
}

export function useVeoApi() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [operation, setOperation] = useState<VeoOperation | null>(null)

  const generateVideo = async (config: VeoConfig): Promise<VeoOperation> => {
    setIsLoading(true)
    setError(null)
    setOperation(null)

    try {
      // Validate prompt length
      if (config.prompt.length > 1024) {
        throw new Error("Prompt deve ter no máximo 1024 caracteres")
      }

      // Validate mode compatibility
      const model = VEO_MODELS[config.model]
      if (!(model.features as readonly string[]).includes(config.mode)) {
        throw new Error(`Modo ${config.mode} não suportado pelo modelo ${model.name}`)
      }

      // Validate reference images count
      if (config.mode === "reference-images") {
        if (!config.referenceImages || config.referenceImages.length === 0) {
          throw new Error("Modo reference-images requer pelo menos 1 imagem")
        }
        if (config.referenceImages.length > 3) {
          throw new Error("Máximo de 3 imagens de referência")
        }
      }

      // Validate interpolation
      if (config.mode === "interpolation") {
        if (!config.firstFrameImage || !config.lastFrameImage) {
          throw new Error("Modo interpolation requer primeiro e último frame")
        }
      }

      // Validate extension
      if (config.mode === "extension") {
        if (!config.inputVideo) {
          throw new Error("Modo extension requer vídeo de entrada")
        }
      }

      // Create FormData for file uploads
      const formData = new FormData()
      formData.append("model", model.id)
      formData.append("mode", config.mode)
      formData.append("prompt", config.prompt)

      // Add optional config
      if (config.resolution) formData.append("resolution", config.resolution)
      if (config.aspectRatio) formData.append("aspectRatio", config.aspectRatio)
      if (config.durationSeconds) formData.append("durationSeconds", config.durationSeconds.toString())
      if (config.negativePrompt) formData.append("negativePrompt", config.negativePrompt)
      if (config.personGeneration) formData.append("personGeneration", config.personGeneration)
      if (config.seed) formData.append("seed", config.seed.toString())
      if (config.numberOfVideos) formData.append("numberOfVideos", config.numberOfVideos.toString())

      // Add files based on mode
      if (config.firstFrameImage instanceof File) {
        formData.append("firstFrameImage", config.firstFrameImage)
      } else if (config.firstFrameImage) {
        formData.append("firstFrameImageUrl", config.firstFrameImage)
      }

      if (config.lastFrameImage instanceof File) {
        formData.append("lastFrameImage", config.lastFrameImage)
      } else if (config.lastFrameImage) {
        formData.append("lastFrameImageUrl", config.lastFrameImage)
      }

      if (config.inputVideo instanceof File) {
        formData.append("inputVideo", config.inputVideo)
      } else if (config.inputVideo) {
        formData.append("inputVideoUrl", config.inputVideo)
      }

      if (config.referenceImages) {
        config.referenceImages.forEach((ref, index) => {
          if (ref.image instanceof File) {
            formData.append(`referenceImage${index}`, ref.image)
          } else {
            formData.append(`referenceImageUrl${index}`, ref.image)
          }
          formData.append(`referenceType${index}`, ref.referenceType)
        })
      }

      // Start video generation
      const response = await fetch("/api/veo/generate", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Erro ao gerar vídeo")
      }

      const operationData: VeoOperation = await response.json()
      setOperation(operationData)

      // Start polling if operation is pending/processing
      if (operationData.status === "pending" || operationData.status === "processing") {
        pollOperation(operationData.id)
      }

      return operationData
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro desconhecido"
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const pollOperation = async (operationId: string) => {
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/veo/operation?id=${operationId}`)
        if (!response.ok) throw new Error("Erro ao verificar status")

        const operationData: VeoOperation = await response.json()
        setOperation(operationData)

        // Stop polling if completed or failed
        if (operationData.status === "completed" || operationData.status === "failed") {
          clearInterval(pollInterval)
          setIsLoading(false)
          if (operationData.status === "failed") {
            setError(operationData.error || "Geração falhou")
          }
        }
      } catch (err) {
        clearInterval(pollInterval)
        setIsLoading(false)
        setError(err instanceof Error ? err.message : "Erro ao verificar status")
      }
    }, 10000) // Poll every 10 seconds (as per Google documentation)

    // Store interval ID to allow cleanup
    return pollInterval
  }

  const cancelOperation = async (operationId: string) => {
    try {
      await fetch(`/api/veo/operation?id=${operationId}`, {
        method: "DELETE",
      })
      setOperation(null)
      setIsLoading(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao cancelar operação")
    }
  }

  return {
    generateVideo,
    cancelOperation,
    isLoading,
    error,
    operation,
  }
}
