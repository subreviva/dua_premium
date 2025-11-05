/**
 * In-memory operation store for Google Veo 3 API operations
 * In production, this should be replaced with Redis or a database
 */

export interface VeoOperationMetadata {
  prompt: string
  negativePrompt?: string
  mode?: string
  resolution: string
  aspectRatio: string
  duration: number
  seed?: number
  personGeneration: string
}

export interface VeoOperationResult {
  videoUrl: string
  thumbnailUrl?: string
}

export interface VeoOperation {
  id: string
  status: 'processing' | 'completed' | 'failed'
  progress: number
  startTime: string
  metadata: VeoOperationMetadata
  result: VeoOperationResult | null
  error: string | null
}

class OperationStore {
  private operations: Map<string, VeoOperation>

  constructor() {
    this.operations = new Map()
  }

  set(id: string, operation: VeoOperation): void {
    this.operations.set(id, operation)
  }

  get(id: string): VeoOperation | undefined {
    return this.operations.get(id)
  }

  delete(id: string): boolean {
    return this.operations.delete(id)
  }

  has(id: string): boolean {
    return this.operations.has(id)
  }

  clear(): void {
    this.operations.clear()
  }

  getAll(): VeoOperation[] {
    return Array.from(this.operations.values())
  }
}

// Use global to prevent multiple instances in development
declare global {
  var __operationStore: OperationStore | undefined
}

// Export singleton instance
export const operationStore = globalThis.__operationStore ?? (globalThis.__operationStore = new OperationStore())
