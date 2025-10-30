"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"

interface CreditsData {
  credits_left: number
  period: string
  monthly_limit: number
  monthly_usage: number
}

export function CreditsDisplay() {
  const [credits, setCredits] = useState<CreditsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchCredits() {
      try {
        const response = await fetch("/api/suno/credits")
        if (!response.ok) {
          throw new Error("Failed to fetch credits")
        }
        const data = await response.json()
        setCredits(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error")
      } finally {
        setLoading(false)
      }
    }

    fetchCredits()
    // Refresh credits every 30 seconds
    const interval = setInterval(fetchCredits, 30000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <Card className="p-4">
        <div className="flex items-center gap-2">
          <Spinner className="h-4 w-4" />
          <span className="text-sm text-muted-foreground">Loading credits...</span>
        </div>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="p-4 border-destructive">
        <p className="text-sm text-destructive">Error: {error}</p>
      </Card>
    )
  }

  if (!credits) return null

  const usagePercentage = (credits.monthly_usage / credits.monthly_limit) * 100

  return (
    <Card className="p-4">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">API Credits</h3>
          <span className="text-2xl font-bold">{credits.credits_left}</span>
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Monthly Usage</span>
            <span>
              {credits.monthly_usage} / {credits.monthly_limit}
            </span>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${Math.min(usagePercentage, 100)}%` }}
            />
          </div>
        </div>

        <p className="text-xs text-muted-foreground">Period: {credits.period}</p>
      </div>
    </Card>
  )
}
