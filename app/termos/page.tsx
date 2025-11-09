import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Termos de Serviço - DUA IA',
  description: 'Termos de Serviço da plataforma DUA IA',
}

export default function TermosPage() {
  return (
    <div className="min-h-screen bg-neutral-950 py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-neutral-900/50 backdrop-blur-xl rounded-2xl border border-neutral-800 p-8 md:p-12">
          <h1 className="text-4xl font-bold text-white mb-4">Termos de Serviço</h1>
          <p className="text-neutral-400 mb-8">Última atualização: 8 de novembro de 2025</p>

          <div className="space-y-8 text-neutral-300">
            {/* Aceitação dos Termos */}
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">1. Aceitação dos Termos</h2>
              <p className="mb-4">
                Ao aceder e utilizar a plataforma DUA IA (&quot;Plataforma&quot;, &quot;Serviço&quot;, &quot;nós&quot;, &quot;nosso&quot;), 
                você (&quot;Utilizador&quot;, &quot;você&quot;) concorda em ficar vinculado a estes Termos de Serviço. 
                Se não concordar com estes termos, não utilize a Plataforma.
              </p>
              <p>
                Reservamo-nos o direito de modificar estes termos a qualquer momento. 
                As alterações entrarão em vigor imediatamente após a publicação. 
                O uso continuado da Plataforma após alterações constitui aceitação dos novos termos.
              </p>
            </section>

            {/* Descrição do Serviço */}
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">2. Descrição do Serviço</h2>
              <p className="mb-4">
                A DUA IA é uma plataforma de inteligência artificial que oferece:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Assistência inteligente através de chat conversacional</li>
                <li>Geração de conteúdo e respostas contextualizadas</li>
                <li>Ferramentas de design e criação visual</li>
                <li>Sistema de tokens DUACOIN para acesso a funcionalidades premium</li>
                <li>Integração com modelos de IA avançados</li>
              </ul>
              <p className="mt-4">
                O Serviço é fornecido &quot;como está&quot; e pode ser modificado, suspenso ou descontinuado 
                a qualquer momento, com ou sem aviso prévio.
              </p>
            </section>

            {/* Registo e Conta */}
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">3. Registo e Conta de Utilizador</h2>
              <p className="mb-4">
                <strong>3.1 Requisitos de Registo:</strong>
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4 mb-4">
                <li>Deve ter pelo menos 18 anos de idade</li>
                <li>Fornecer informações verdadeiras, precisas e completas</li>
                <li>Manter as informações da conta atualizadas</li>
                <li>Não criar múltiplas contas sem autorização</li>
                <li>Não partilhar credenciais de acesso com terceiros</li>
              </ul>
              <p className="mb-4">
                <strong>3.2 Código de Convite:</strong> O acesso à plataforma requer um código de convite válido. 
                Os códigos são pessoais e intransmissíveis.
              </p>
              <p className="mb-4">
                <strong>3.3 Segurança da Conta:</strong> Você é responsável por:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Manter a confidencialidade da sua password</li>
                <li>Todas as atividades realizadas na sua conta</li>
                <li>Notificar-nos imediatamente sobre acessos não autorizados</li>
              </ul>
            </section>

            {/* Uso Aceitável */}
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">4. Uso Aceitável</h2>
              <p className="mb-4">
                <strong>4.1 Usos Permitidos:</strong> Pode utilizar a Plataforma para fins legais e éticos.
              </p>
              <p className="mb-4">
                <strong>4.2 Usos Proibidos:</strong> Não pode:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Violar leis, regulamentos ou direitos de terceiros</li>
                <li>Gerar conteúdo ilegal, difamatório, ameaçador ou discriminatório</li>
                <li>Fazer engenharia reversa, descompilar ou desmontar o Serviço</li>
                <li>Usar bots, scrapers ou ferramentas automatizadas não autorizadas</li>
                <li>Sobrecarregar ou interferir com a infraestrutura da Plataforma</li>
                <li>Tentar aceder a áreas restritas ou dados de outros utilizadores</li>
                <li>Revender ou redistribuir o Serviço sem autorização</li>
                <li>Usar o Serviço para gerar spam, malware ou phishing</li>
              </ul>
            </section>

            {/* Propriedade Intelectual */}
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">5. Propriedade Intelectual</h2>
              <p className="mb-4">
                <strong>5.1 Propriedade da DUA IA:</strong> Todos os direitos, títulos e interesses na Plataforma, 
                incluindo software, design, marca, logos e conteúdo, pertencem à DUA IA e seus licenciadores.
              </p>
              <p className="mb-4">
                <strong>5.2 Licença de Uso:</strong> Concedemos-lhe uma licença limitada, não exclusiva, 
                intransmissível e revogável para usar a Plataforma conforme estes Termos.
              </p>
              <p className="mb-4">
                <strong>5.3 Conteúdo Gerado:</strong> Você mantém a propriedade do conteúdo que cria usando a Plataforma. 
                No entanto, concede-nos uma licença mundial, livre de royalties, para:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Processar e armazenar o seu conteúdo para fornecer o Serviço</li>
                <li>Melhorar e treinar os modelos de IA (forma anonimizada)</li>
                <li>Usar para fins de análise e estatísticas (forma agregada)</li>
              </ul>
            </section>

            {/* DUACOIN e Pagamentos */}
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">6. DUACOIN e Pagamentos</h2>
              <p className="mb-4">
                <strong>6.1 Sistema de Tokens:</strong> A DUA IA usa um sistema de tokens virtuais chamado DUACOIN 
                para aceder a funcionalidades premium.
              </p>
              <p className="mb-4">
                <strong>6.2 Aquisição:</strong> DUACOIN pode ser obtido através de:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4 mb-4">
                <li>Compra direta na Plataforma</li>
                <li>Promoções e bónus de registo</li>
                <li>Programas de fidelidade</li>
              </ul>
              <p className="mb-4">
                <strong>6.3 Uso e Validade:</strong>
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4 mb-4">
                <li>DUACOIN não tem valor monetário real</li>
                <li>Não são reembolsáveis ou transferíveis</li>
                <li>Podem expirar conforme políticas específicas</li>
                <li>Reservamo-nos o direito de ajustar preços e custos</li>
              </ul>
              <p className="mb-4">
                <strong>6.4 Reembolsos:</strong> Todas as compras são finais. Reembolsos apenas em casos 
                de erro técnico comprovado ou conforme exigido por lei.
              </p>
            </section>

            {/* Privacidade e Dados */}
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">7. Privacidade e Proteção de Dados</h2>
              <p className="mb-4">
                A recolha e tratamento de dados pessoais são regidos pela nossa{' '}
                <a href="/privacidade" className="text-purple-400 hover:text-purple-300 underline">
                  Política de Privacidade
                </a>
                , que faz parte integrante destes Termos.
              </p>
              <p>
                Ao usar a Plataforma, você concorda com a recolha e uso de informações 
                conforme descrito na Política de Privacidade.
              </p>
            </section>

            {/* Limitação de Responsabilidade */}
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">8. Limitação de Responsabilidade</h2>
              <p className="mb-4">
                <strong>8.1 Isenção de Garantias:</strong> O Serviço é fornecido &quot;como está&quot; e &quot;conforme disponível&quot;, 
                sem garantias de qualquer tipo, expressas ou implícitas.
              </p>
              <p className="mb-4">
                <strong>8.2 Limitação de Responsabilidade:</strong> Na máxima extensão permitida por lei, 
                a DUA IA não será responsável por:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4 mb-4">
                <li>Danos indiretos, incidentais, especiais ou consequenciais</li>
                <li>Perda de lucros, dados, uso ou boa vontade</li>
                <li>Interrupções ou erros no Serviço</li>
                <li>Conteúdo gerado por utilizadores ou IA</li>
                <li>Ações de terceiros</li>
              </ul>
              <p className="mb-4">
                <strong>8.3 Limite Máximo:</strong> Em qualquer caso, nossa responsabilidade total 
                não excederá o valor pago por você nos últimos 12 meses.
              </p>
            </section>

            {/* Suspensão e Terminação */}
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">9. Suspensão e Terminação</h2>
              <p className="mb-4">
                <strong>9.1 Pela DUA IA:</strong> Podemos suspender ou terminar sua conta imediatamente, 
                sem aviso prévio, se:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4 mb-4">
                <li>Violar estes Termos de Serviço</li>
                <li>Usar o Serviço de forma fraudulenta ou ilegal</li>
                <li>Representar risco à segurança da Plataforma</li>
                <li>Houver inatividade prolongada (mais de 24 meses)</li>
              </ul>
              <p className="mb-4">
                <strong>9.2 Pelo Utilizador:</strong> Pode cancelar sua conta a qualquer momento 
                através das configurações da conta ou contactando-nos.
              </p>
              <p className="mb-4">
                <strong>9.3 Efeitos da Terminação:</strong>
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Acesso imediato cessado</li>
                <li>DUACOIN não utilizado será perdido</li>
                <li>Dados podem ser retidos conforme Política de Privacidade</li>
                <li>Disposições que devem sobreviver (propriedade intelectual, limitação de responsabilidade) continuam válidas</li>
              </ul>
            </section>

            {/* Modificações do Serviço */}
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">10. Modificações do Serviço</h2>
              <p>
                Reservamo-nos o direito de modificar, suspender ou descontinuar qualquer parte 
                do Serviço a qualquer momento, com ou sem aviso prévio. Não seremos responsáveis 
                perante você ou terceiros por qualquer modificação, suspensão ou descontinuação.
              </p>
            </section>

            {/* Lei Aplicável */}
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">11. Lei Aplicável e Jurisdição</h2>
              <p className="mb-4">
                <strong>11.1 Lei Aplicável:</strong> Estes Termos são regidos pelas leis de Portugal, 
                sem considerar conflitos de disposições legais.
              </p>
              <p className="mb-4">
                <strong>11.2 Jurisdição:</strong> Qualquer disputa será submetida aos tribunais de Lisboa, Portugal.
              </p>
              <p>
                <strong>11.3 GDPR:</strong> Para utilizadores na União Europeia, aplicam-se os direitos 
                do Regulamento Geral de Proteção de Dados (GDPR).
              </p>
            </section>

            {/* Resolução de Disputas */}
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">12. Resolução de Disputas</h2>
              <p className="mb-4">
                <strong>12.1 Negociação Informal:</strong> Em caso de disputa, você concorda em primeiro 
                tentar resolver a questão informalmente contactando-nos em suporte@duaia.com.
              </p>
              <p className="mb-4">
                <strong>12.2 Arbitragem:</strong> Se não for possível resolver informalmente em 30 dias, 
                a disputa será resolvida através de arbitragem vinculativa conforme as regras da 
                Câmara de Comércio e Indústria Portuguesa.
              </p>
            </section>

            {/* Disposições Gerais */}
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">13. Disposições Gerais</h2>
              <p className="mb-4">
                <strong>13.1 Acordo Completo:</strong> Estes Termos, juntamente com a Política de Privacidade, 
                constituem o acordo completo entre você e a DUA IA.
              </p>
              <p className="mb-4">
                <strong>13.2 Renúncia:</strong> A falha em exercer qualquer direito não constitui renúncia a esse direito.
              </p>
              <p className="mb-4">
                <strong>13.3 Independência:</strong> Se qualquer disposição for considerada inválida, 
                as demais disposições permanecerão em vigor.
              </p>
              <p className="mb-4">
                <strong>13.4 Atribuição:</strong> Você não pode transferir estes Termos sem nosso consentimento. 
                Podemos transferir nossos direitos a qualquer momento.
              </p>
              <p>
                <strong>13.5 Idioma:</strong> Em caso de conflito entre versões em diferentes idiomas, 
                a versão em português prevalece.
              </p>
            </section>

            {/* Contacto */}
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">14. Contacto</h2>
              <p className="mb-4">
                Para questões sobre estes Termos de Serviço, contacte-nos:
              </p>
              <div className="bg-neutral-800/50 rounded-lg p-6 space-y-2">
                <p><strong>Email:</strong> suporte@duaia.com</p>
                <p><strong>Email Legal:</strong> legal@duaia.com</p>
                <p><strong>Morada:</strong> DUA IA, Lda.<br />Lisboa, Portugal</p>
              </div>
            </section>

            {/* Footer Legal */}
            <section className="border-t border-neutral-800 pt-8 mt-12">
              <p className="text-sm text-neutral-500 italic">
                Ao usar a DUA IA, você reconhece ter lido, compreendido e concordado em ficar vinculado 
                a estes Termos de Serviço. Se tiver dúvidas, contacte-nos antes de usar a Plataforma.
              </p>
              <p className="text-sm text-neutral-500 mt-4">
                <strong>Última atualização:</strong> 8 de novembro de 2025<br />
                <strong>Versão:</strong> 1.0
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
