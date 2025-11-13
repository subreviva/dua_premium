"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-white/10">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <Link href="/">
            <Button variant="ghost" className="mb-6 text-white/70 hover:text-white">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
          </Link>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-extralight tracking-tight"
          >
            Política de Cookies
          </motion.h1>
          <p className="text-white/60 mt-4 font-light">
            Última atualização: 13 de novembro de 2025
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="prose prose-invert prose-lg max-w-none"
        >
          <div className="space-y-8 text-white/80 font-light leading-relaxed">
            <section>
              <h2 className="text-2xl font-light text-white mb-4">O que são Cookies?</h2>
              <p>
                Cookies são pequenos ficheiros de texto armazenados no seu dispositivo quando visita 
                um website. São amplamente utilizados para fazer os websites funcionarem de forma mais 
                eficiente e fornecer informações aos proprietários do site.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-light text-white mb-4">Como Utilizamos Cookies</h2>
              <p>
                A DUA IA utiliza cookies para melhorar a sua experiência e garantir o funcionamento 
                adequado da plataforma. Os cookies que utilizamos podem ser categorizados da seguinte forma:
              </p>
            </section>

            <section>
              <h3 className="text-xl font-light text-white mb-3">1. Cookies Essenciais</h3>
              <p>
                Estes cookies são necessários para o funcionamento básico do website e não podem ser 
                desativados. Incluem:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-4">
                <li><strong>Autenticação:</strong> Mantêm-no conectado à sua conta</li>
                <li><strong>Segurança:</strong> Protegem contra ataques e fraudes</li>
                <li><strong>Preferências:</strong> Guardam as suas escolhas de idioma e região</li>
                <li><strong>Sessão:</strong> Permitem a navegação entre páginas sem perder dados</li>
              </ul>
            </section>

            <section>
              <h3 className="text-xl font-light text-white mb-3">2. Cookies de Desempenho</h3>
              <p>
                Estes cookies recolhem informações sobre como utiliza o website, ajudando-nos a 
                melhorar o desempenho e a experiência do utilizador:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-4">
                <li><strong>Analytics:</strong> Contabilizam visitas e fontes de tráfego</li>
                <li><strong>Monitorização:</strong> Identificam erros e problemas técnicos</li>
                <li><strong>Otimização:</strong> Testam diferentes versões de páginas</li>
              </ul>
            </section>

            <section>
              <h3 className="text-xl font-light text-white mb-3">3. Cookies Funcionais</h3>
              <p>
                Permitem funcionalidades melhoradas e personalizadas:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-4">
                <li><strong>Preferências de utilizador:</strong> Tema, layout, configurações personalizadas</li>
                <li><strong>Histórico:</strong> Conversas recentes, projetos favoritos</li>
                <li><strong>Conteúdo dinâmico:</strong> Recomendações baseadas no uso</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-light text-white mb-4">Cookies de Terceiros</h2>
              <p>
                Utilizamos serviços de terceiros que podem definir os seus próprios cookies:
              </p>
              <div className="mt-4 space-y-3">
                <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
                  <p className="font-medium text-white">Supabase (Autenticação)</p>
                  <p className="text-sm text-white/60 mt-1">Gestão de sessões e autenticação segura</p>
                </div>
                <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
                  <p className="font-medium text-white">Vercel (Hospedagem)</p>
                  <p className="text-sm text-white/60 mt-1">Analytics e monitorização de desempenho</p>
                </div>
                <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
                  <p className="font-medium text-white">Stripe/PayPal (Pagamentos)</p>
                  <p className="text-sm text-white/60 mt-1">Processamento seguro de transações</p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-light text-white mb-4">Duração dos Cookies</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Cookies de Sessão:</strong> Eliminados quando fecha o navegador</li>
                <li><strong>Cookies Persistentes:</strong> Permanecem até expirarem ou serem eliminados manualmente</li>
                <li><strong>Cookies de Longa Duração:</strong> Mantêm-no conectado por períodos prolongados (até 30 dias)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-light text-white mb-4">Como Gerir Cookies</h2>
              <p>
                Pode controlar e gerir cookies através das configurações do seu navegador. 
                A maioria dos navegadores permite:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-4">
                <li>Ver que cookies estão armazenados</li>
                <li>Bloquear cookies de terceiros</li>
                <li>Eliminar todos os cookies ao fechar o navegador</li>
                <li>Bloquear todos os cookies (pode afetar funcionalidades)</li>
              </ul>
              <p className="mt-4">
                <strong>Nota:</strong> Desativar cookies essenciais pode impedir o acesso a certas 
                funcionalidades da DUA IA, incluindo autenticação e uso dos estúdios.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-light text-white mb-4">Instruções por Navegador</h2>
              <div className="space-y-3 mt-4">
                <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
                  <p className="font-medium text-white">Google Chrome</p>
                  <p className="text-sm text-white/60 mt-1">
                    Definições → Privacidade e segurança → Cookies e outros dados de sites
                  </p>
                </div>
                <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
                  <p className="font-medium text-white">Mozilla Firefox</p>
                  <p className="text-sm text-white/60 mt-1">
                    Opções → Privacidade e segurança → Cookies e dados de sites
                  </p>
                </div>
                <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
                  <p className="font-medium text-white">Safari</p>
                  <p className="text-sm text-white/60 mt-1">
                    Preferências → Privacidade → Gerir dados de websites
                  </p>
                </div>
                <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
                  <p className="font-medium text-white">Microsoft Edge</p>
                  <p className="text-sm text-white/60 mt-1">
                    Definições → Cookies e permissões de site → Gerir e eliminar cookies
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-light text-white mb-4">Alterações a Esta Política</h2>
              <p>
                Podemos atualizar esta política de cookies periodicamente para refletir mudanças 
                nas nossas práticas ou requisitos legais. Recomendamos que reveja esta página 
                regularmente.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-light text-white mb-4">Contacto</h2>
              <p>
                Se tiver questões sobre a nossa utilização de cookies:
              </p>
              <div className="mt-4 p-6 bg-white/5 border border-white/10 rounded-lg">
                <p><strong>Email:</strong> info@2lados.pt</p>
                <p className="mt-2"><strong>WhatsApp:</strong> +351 964 696 576</p>
                <p className="mt-2"><strong>Website:</strong> www.2lados.pt</p>
              </div>
            </section>

            <section className="mt-12 p-6 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <h3 className="text-lg font-medium text-blue-400 mb-3">✓ Consentimento</h3>
              <p className="text-white/70">
                Ao continuar a utilizar a DUA IA, você consente com a utilização de cookies 
                conforme descrito nesta política. Pode retirar o seu consentimento a qualquer 
                momento através das configurações do seu navegador.
              </p>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
