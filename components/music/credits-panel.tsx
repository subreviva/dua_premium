'use client'

import { CreditCard, HelpCircle, Zap, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

interface CreditsPanelProps {
  credits: number
  plan: 'free' | 'basic' | 'pro' | 'enterprise'
  monthlyLimit?: number
  onUpgrade: () => void
  onSupport: () => void
}

const PLAN_INFO = {
  free: { name: 'Gratuito', color: 'bg-gray-500', limit: 50 },
  basic: { name: 'Basic', color: 'bg-blue-500', limit: 500 },
  pro: { name: 'Pro', color: 'bg-purple-500', limit: 2000 },
  enterprise: { name: 'Enterprise', color: 'bg-gradient-to-r from-purple-500 to-pink-500', limit: 10000 }
}

export function CreditsPanel({ credits, plan, monthlyLimit, onUpgrade, onSupport }: CreditsPanelProps) {
  const planInfo = PLAN_INFO[plan]
  const limit = monthlyLimit || planInfo.limit
  const percentage = (credits / limit) * 100

  return (
    <div className="space-y-4">
      {/* Credits Card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">Créditos</CardTitle>
            <Badge className={planInfo.color}>
              {planInfo.name}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Credits Display */}
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold">{credits}</span>
              <span className="text-sm text-muted-foreground">/ {limit}</span>
            </div>
            <Progress value={percentage} className="mt-2" />
          </div>

          {/* Credit Info */}
          <div className="space-y-2 text-xs text-muted-foreground">
            <div className="flex justify-between">
              <span>Geração de música:</span>
              <span className="font-medium">12 créditos</span>
            </div>
            <div className="flex justify-between">
              <span>Separação stems:</span>
              <span className="font-medium">1-5 créditos</span>
            </div>
          </div>

          {/* Upgrade Button */}
          {plan !== 'enterprise' && (
            <Button
              className="w-full"
              variant={credits < limit * 0.2 ? 'default' : 'outline'}
              onClick={onUpgrade}
            >
              <Zap className="h-4 w-4 mr-2" />
              Fazer Upgrade
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Support Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <HelpCircle className="h-4 w-4" />
            Suporte
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={onSupport}
          >
            <HelpCircle className="h-4 w-4 mr-2" />
            Centro de Ajuda
          </Button>

          <Button
            variant="outline"
            className="w-full justify-start"
            asChild
          >
            <a href="https://docs.sunoapi.org" target="_blank" rel="noopener noreferrer">
              Documentação
              <ExternalLink className="h-4 w-4 ml-auto" />
            </a>
          </Button>

          <div className="pt-3 border-t text-xs text-muted-foreground">
            <p className="font-medium mb-1">Limites de API</p>
            <p>• 20 pedidos / 10 segundos</p>
            <p>• Ficheiros retidos 14 dias</p>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Estatísticas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Este mês:</span>
            <span className="font-medium">{limit - credits} usados</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Restantes:</span>
            <span className="font-medium">{credits} créditos</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Taxa de uso:</span>
            <span className="font-medium">{((limit - credits) / limit * 100).toFixed(1)}%</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
