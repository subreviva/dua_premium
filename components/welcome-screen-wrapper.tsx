"use client"

import { WelcomeScreen } from "./welcome-screen"
import { useWelcomeScreen } from "@/hooks/use-welcome-screen"

export function WelcomeScreenWrapper() {
  const { shouldShowWelcome, user, loading, markWelcomeAsSeen } = useWelcomeScreen()

  if (loading || !shouldShowWelcome || !user) {
    return null
  }

  return <WelcomeScreen user={user} onComplete={markWelcomeAsSeen} />
}
