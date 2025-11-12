"use client"

import { WelcomeScreenPremium } from "./welcome-screen-premium"
import { useWelcomeScreen } from "@/hooks/use-welcome-screen"

export function WelcomeScreenWrapper() {
  const { shouldShowWelcome, user, loading, markWelcomeAsSeen } = useWelcomeScreen()

  if (loading || !shouldShowWelcome || !user) {
    return null
  }

  return <WelcomeScreenPremium user={user} onComplete={markWelcomeAsSeen} />
}
