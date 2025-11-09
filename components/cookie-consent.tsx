'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Cookie, Settings, X, Check } from 'lucide-react'

interface CookiePreferences {
  necessary: boolean // Sempre true
  analytics: boolean
  marketing: boolean
}

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true, // Sempre ativo
    analytics: false,
    marketing: false,
  })

  useEffect(() => {
    // Verificar se já existe consentimento guardado
    const savedConsent = localStorage.getItem('cookieConsent')
    
    if (!savedConsent) {
      // Se não existe, mostrar banner após 1 segundo
      const timer = setTimeout(() => {
        setShowBanner(true)
      }, 1000)
      return () => clearTimeout(timer)
    } else {
      // Carregar preferências guardadas
      try {
        const parsed = JSON.parse(savedConsent)
        setPreferences(parsed)
      } catch (error) {
        console.error('Error parsing cookie consent:', error)
      }
    }
  }, [])

  const savePreferences = (prefs: CookiePreferences) => {
    // Guardar no localStorage
    localStorage.setItem('cookieConsent', JSON.stringify(prefs))
    localStorage.setItem('cookieConsentDate', new Date().toISOString())
    
    // Aplicar preferências (inicializar/desativar analytics, marketing, etc.)
    if (prefs.analytics) {
      // Inicializar Google Analytics ou similar
      console.log('✅ Analytics cookies enabled')
      // window.gtag?.('consent', 'update', { analytics_storage: 'granted' })
    } else {
      console.log('❌ Analytics cookies disabled')
      // window.gtag?.('consent', 'update', { analytics_storage: 'denied' })
    }

    if (prefs.marketing) {
      // Inicializar pixels de marketing
      console.log('✅ Marketing cookies enabled')
      // window.gtag?.('consent', 'update', { ad_storage: 'granted' })
    } else {
      console.log('❌ Marketing cookies disabled')
      // window.gtag?.('consent', 'update', { ad_storage: 'denied' })
    }

    setPreferences(prefs)
    setShowBanner(false)
    setShowSettings(false)
  }

  const acceptAll = () => {
    savePreferences({
      necessary: true,
      analytics: true,
      marketing: true,
    })
  }

  const acceptNecessaryOnly = () => {
    savePreferences({
      necessary: true,
      analytics: false,
      marketing: false,
    })
  }

  const saveCustomPreferences = () => {
    savePreferences(preferences)
  }

  if (!showBanner) return null

  return (
    <AnimatePresence>
      {showBanner && (
        <>
          {/* Overlay escuro quando settings estão abertos */}
          {showSettings && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998]"
              onClick={() => setShowSettings(false)}
            />
          )}

          {/* Banner Principal */}
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-[9999] p-4 md:p-6"
          >
            <div className="max-w-6xl mx-auto">
              <div className="bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden">
                <div className="p-6 md:p-8">
                  {/* Cabeçalho */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-500/10 rounded-lg">
                        <Cookie className="w-6 h-6 text-purple-400" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">Cookies & Privacidade</h3>
                        <p className="text-sm text-neutral-400">Utilizamos cookies para melhorar a sua experiência</p>
                      </div>
                    </div>
                  </div>

                  {/* Descrição */}
                  <p className="text-neutral-300 mb-6 text-sm leading-relaxed">
                    Utilizamos cookies essenciais para o funcionamento da plataforma e, com o seu consentimento, 
                    cookies analíticos e de marketing para melhorar a experiência e personalizar conteúdo. 
                    Pode gerir as suas preferências a qualquer momento.{' '}
                    <a href="/privacidade" className="text-purple-400 hover:text-purple-300 underline">
                      Política de Privacidade
                    </a>
                  </p>

                  {/* Botões de Ação */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      onClick={acceptAll}
                      className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-semibold"
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Aceitar Todos
                    </Button>
                    
                    <Button
                      onClick={acceptNecessaryOnly}
                      variant="outline"
                      className="flex-1 border-neutral-700 hover:bg-neutral-800 text-white"
                    >
                      Apenas Necessários
                    </Button>
                    
                    <Button
                      onClick={() => setShowSettings(true)}
                      variant="outline"
                      className="border-neutral-700 hover:bg-neutral-800 text-white"
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Personalizar
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Painel de Configurações Detalhadas */}
          <AnimatePresence>
            {showSettings && (
              <motion.div
                initial={{ y: 100, opacity: 0, scale: 0.95 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ y: 100, opacity: 0, scale: 0.95 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:bottom-6 z-[10000] max-w-2xl md:ml-auto"
              >
                <div className="bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden">
                  {/* Cabeçalho do Painel */}
                  <div className="bg-neutral-800/50 p-6 border-b border-neutral-700 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Settings className="w-5 h-5 text-purple-400" />
                      <h3 className="text-lg font-bold text-white">Preferências de Cookies</h3>
                    </div>
                    <button
                      onClick={() => setShowSettings(false)}
                      className="p-2 hover:bg-neutral-700 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5 text-neutral-400" />
                    </button>
                  </div>

                  {/* Conteúdo do Painel */}
                  <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
                    {/* Cookie Necessários */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="text-white font-semibold flex items-center gap-2">
                            🔒 Cookies Estritamente Necessários
                            <span className="text-xs bg-green-600 text-white px-2 py-0.5 rounded-full">
                              Sempre Ativos
                            </span>
                          </h4>
                          <p className="text-sm text-neutral-400 mt-1">
                            Essenciais para o funcionamento da plataforma. Incluem autenticação, 
                            segurança e preferências básicas. Não podem ser desativados.
                          </p>
                        </div>
                      </div>
                      <div className="bg-neutral-800/30 rounded-lg p-3 text-xs text-neutral-500">
                        Exemplos: Sessão de login, token de autenticação, preferências de idioma
                      </div>
                    </div>

                    {/* Cookies Analíticos */}
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h4 className="text-white font-semibold flex items-center gap-2">
                            📊 Cookies Analíticos
                          </h4>
                          <p className="text-sm text-neutral-400 mt-1">
                            Ajudam-nos a entender como utiliza a plataforma para melhorar a experiência. 
                            Recolhemos dados agregados e anónimos sobre uso e desempenho.
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                          <input
                            type="checkbox"
                            checked={preferences.analytics}
                            onChange={(e) => setPreferences({ ...preferences, analytics: e.target.checked })}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-neutral-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-purple-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                        </label>
                      </div>
                      <div className="bg-neutral-800/30 rounded-lg p-3 text-xs text-neutral-500">
                        Exemplos: Google Analytics, métricas de uso, heatmaps, performance
                      </div>
                    </div>

                    {/* Cookies de Marketing */}
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h4 className="text-white font-semibold flex items-center gap-2">
                            🎯 Cookies de Marketing
                          </h4>
                          <p className="text-sm text-neutral-400 mt-1">
                            Utilizados para mostrar anúncios relevantes e medir a eficácia das campanhas. 
                            Podem rastrear a sua atividade em diferentes websites.
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                          <input
                            type="checkbox"
                            checked={preferences.marketing}
                            onChange={(e) => setPreferences({ ...preferences, marketing: e.target.checked })}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-neutral-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-purple-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                        </label>
                      </div>
                      <div className="bg-neutral-800/30 rounded-lg p-3 text-xs text-neutral-500">
                        Exemplos: Facebook Pixel, Google Ads, remarketing, conversões
                      </div>
                    </div>

                    {/* Informação Adicional */}
                    <div className="bg-purple-900/20 border border-purple-700/30 rounded-lg p-4">
                      <p className="text-sm text-purple-200">
                        💡 <strong>Nota:</strong> Pode alterar as suas preferências a qualquer momento 
                        nas configurações da sua conta ou contactando-nos em{' '}
                        <a href="mailto:privacidade@duaia.com" className="underline hover:text-purple-100">
                          privacidade@duaia.com
                        </a>
                      </p>
                    </div>
                  </div>

                  {/* Footer com Botões */}
                  <div className="bg-neutral-800/50 p-6 border-t border-neutral-700 flex flex-col sm:flex-row gap-3">
                    <Button
                      onClick={saveCustomPreferences}
                      className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-semibold"
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Guardar Preferências
                    </Button>
                    <Button
                      onClick={() => setShowSettings(false)}
                      variant="outline"
                      className="border-neutral-700 hover:bg-neutral-800 text-white"
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </AnimatePresence>
  )
}
