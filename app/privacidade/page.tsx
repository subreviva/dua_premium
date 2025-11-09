import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Política de Privacidade - DUA IA',
  description: 'Política de Privacidade da plataforma DUA IA',
}

export default function PrivacidadePage() {
  return (
    <div className="min-h-screen bg-neutral-950 py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-neutral-900/50 backdrop-blur-xl rounded-2xl border border-neutral-800 p-8 md:p-12">
          <h1 className="text-4xl font-bold text-white mb-4">Política de Privacidade</h1>
          <p className="text-neutral-400 mb-8">Última atualização: 8 de novembro de 2025</p>

          <div className="space-y-8 text-neutral-300">
            {/* Introdução */}
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">1. Introdução</h2>
              <p className="mb-4">
                A DUA IA (&quot;nós&quot;, &quot;nosso&quot;, &quot;Plataforma&quot;) está comprometida em proteger 
                a privacidade e os dados pessoais dos seus utilizadores (&quot;você&quot;, &quot;utilizador&quot;).
              </p>
              <p className="mb-4">
                Esta Política de Privacidade descreve como recolhemos, usamos, armazenamos e protegemos 
                as suas informações pessoais em conformidade com o Regulamento Geral de Proteção de Dados (GDPR) 
                da União Europeia e outras leis aplicáveis de proteção de dados.
              </p>
              <p>
                Ao usar a DUA IA, você concorda com as práticas descritas nesta Política. 
                Se não concordar, não utilize a Plataforma.
              </p>
            </section>

            {/* Responsável pelo Tratamento */}
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">2. Responsável pelo Tratamento de Dados</h2>
              <div className="bg-neutral-800/50 rounded-lg p-6 space-y-2">
                <p><strong>Entidade:</strong> DUA IA, Lda.</p>
                <p><strong>Morada:</strong> Lisboa, Portugal</p>
                <p><strong>Email:</strong> privacidade@duaia.com</p>
                <p><strong>DPO (Encarregado de Proteção de Dados):</strong> dpo@duaia.com</p>
              </div>
            </section>

            {/* Dados Recolhidos */}
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">3. Dados Pessoais Recolhidos</h2>
              
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-white mb-3">3.1 Dados Fornecidos Diretamente por Si</h3>
                <p className="mb-3">Ao registar-se e usar a Plataforma, recolhemos:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Nome completo:</strong> Para identificação e personalização</li>
                  <li><strong>Endereço de email:</strong> Para autenticação, comunicações e recuperação de conta</li>
                  <li><strong>Password (encriptada):</strong> Para segurança da conta</li>
                  <li><strong>Código de convite:</strong> Para validar acesso à plataforma</li>
                  <li><strong>Avatar (opcional):</strong> Imagem de perfil carregada por si</li>
                  <li><strong>Bio e informações de perfil (opcional):</strong> Descrição pessoal</li>
                </ul>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-semibold text-white mb-3">3.2 Dados Gerados pelo Uso da Plataforma</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Conversas com IA:</strong> Mensagens enviadas e recebidas no chat</li>
                  <li><strong>Conteúdo criado:</strong> Textos, imagens e designs gerados</li>
                  <li><strong>Histórico de interações:</strong> Data, hora e tipo de ações realizadas</li>
                  <li><strong>Transações DUACOIN:</strong> Histórico de compras e uso de tokens</li>
                  <li><strong>Preferências e configurações:</strong> Idioma, tema, notificações</li>
                </ul>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-semibold text-white mb-3">3.3 Dados Técnicos Recolhidos Automaticamente</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Endereço IP:</strong> Para segurança, prevenção de fraude e localização aproximada</li>
                  <li><strong>User Agent:</strong> Navegador e sistema operativo para compatibilidade</li>
                  <li><strong>Cookies e tecnologias similares:</strong> Para funcionalidade e análise (ver secção 9)</li>
                  <li><strong>Logs de acesso:</strong> Data, hora e páginas visitadas</li>
                  <li><strong>Dados de desempenho:</strong> Tempo de carregamento, erros técnicos</li>
                  <li><strong>Referrer (origem do acesso):</strong> De onde veio antes de aceder à plataforma</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-3">3.4 Dados NÃO Recolhidos</h3>
                <p className="mb-3">Não recolhemos:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Dados sensíveis (origem racial, opiniões políticas, crenças religiosas, saúde, orientação sexual)</li>
                  <li>Informações de menores de 18 anos (uso proibido a menores)</li>
                  <li>Passwords em texto simples (sempre encriptadas)</li>
                  <li>Dados bancários diretos (pagamentos processados por terceiros seguros)</li>
                </ul>
              </div>
            </section>

            {/* Base Legal */}
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">4. Base Legal para Tratamento de Dados (GDPR)</h2>
              <p className="mb-4">Tratamos os seus dados pessoais com base em:</p>
              
              <div className="space-y-4">
                <div className="bg-neutral-800/30 rounded-lg p-4">
                  <p className="font-semibold text-white mb-2">4.1 Execução de Contrato (Art. 6(1)(b) GDPR)</p>
                  <p>Necessário para fornecer o Serviço que você solicitou ao criar uma conta.</p>
                </div>

                <div className="bg-neutral-800/30 rounded-lg p-4">
                  <p className="font-semibold text-white mb-2">4.2 Consentimento (Art. 6(1)(a) GDPR)</p>
                  <p>Para comunicações de marketing, cookies não essenciais e partilha de dados (pode retirar a qualquer momento).</p>
                </div>

                <div className="bg-neutral-800/30 rounded-lg p-4">
                  <p className="font-semibold text-white mb-2">4.3 Interesses Legítimos (Art. 6(1)(f) GDPR)</p>
                  <p>Para melhorar o Serviço, prevenir fraudes, análise de uso e segurança da plataforma.</p>
                </div>

                <div className="bg-neutral-800/30 rounded-lg p-4">
                  <p className="font-semibold text-white mb-2">4.4 Obrigações Legais (Art. 6(1)(c) GDPR)</p>
                  <p>Para cumprir leis fiscais, contabilísticas e requisitos legais aplicáveis.</p>
                </div>
              </div>
            </section>

            {/* Finalidades */}
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">5. Finalidades do Tratamento de Dados</h2>
              <p className="mb-4">Usamos os seus dados para:</p>
              
              <div className="space-y-3">
                <div className="flex items-start">
                  <span className="text-purple-400 mr-3">✓</span>
                  <p><strong>Fornecer o Serviço:</strong> Autenticação, chat com IA, geração de conteúdo, gestão de conta</p>
                </div>
                <div className="flex items-start">
                  <span className="text-purple-400 mr-3">✓</span>
                  <p><strong>Personalização:</strong> Adaptar respostas da IA ao seu contexto e preferências</p>
                </div>
                <div className="flex items-start">
                  <span className="text-purple-400 mr-3">✓</span>
                  <p><strong>Comunicações:</strong> Enviar emails sobre sua conta, atualizações do Serviço, notificações importantes</p>
                </div>
                <div className="flex items-start">
                  <span className="text-purple-400 mr-3">✓</span>
                  <p><strong>Segurança:</strong> Detetar fraudes, prevenir abusos, proteger a plataforma e utilizadores</p>
                </div>
                <div className="flex items-start">
                  <span className="text-purple-400 mr-3">✓</span>
                  <p><strong>Melhorias:</strong> Analisar uso, corrigir bugs, desenvolver novas funcionalidades</p>
                </div>
                <div className="flex items-start">
                  <span className="text-purple-400 mr-3">✓</span>
                  <p><strong>Treino de IA:</strong> Melhorar modelos de IA (forma anonimizada e agregada)</p>
                </div>
                <div className="flex items-start">
                  <span className="text-purple-400 mr-3">✓</span>
                  <p><strong>Análise e Estatísticas:</strong> Compreender padrões de uso (dados agregados, não identificáveis)</p>
                </div>
                <div className="flex items-start">
                  <span className="text-purple-400 mr-3">✓</span>
                  <p><strong>Cumprimento Legal:</strong> Responder a solicitações legais, cumprir obrigações fiscais</p>
                </div>
                <div className="flex items-start">
                  <span className="text-purple-400 mr-3">✓</span>
                  <p><strong>Marketing (com consentimento):</strong> Enviar newsletters, promoções e novidades</p>
                </div>
              </div>
            </section>

            {/* Partilha de Dados */}
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">6. Partilha de Dados com Terceiros</h2>
              <p className="mb-4">Não vendemos os seus dados pessoais. Partilhamos apenas quando necessário:</p>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">6.1 Fornecedores de Serviços</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li><strong>Supabase (EUA/EU):</strong> Hospedagem de base de dados e autenticação</li>
                    <li><strong>Vercel (EUA):</strong> Hospedagem da aplicação web</li>
                    <li><strong>OpenAI / Anthropic / Google (EUA):</strong> Modelos de IA (conversas são processadas nos servidores deles)</li>
                    <li><strong>Processadores de pagamento:</strong> Para transações de DUACOIN (dados bancários não armazenados por nós)</li>
                    <li><strong>Serviços de email:</strong> Para envio de emails transacionais e marketing</li>
                  </ul>
                  <p className="mt-3 text-sm text-neutral-400">
                    Todos os fornecedores são obrigados contratualmente a proteger os seus dados e usar apenas 
                    para os fins especificados.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">6.2 Transferências Internacionais</h3>
                  <p className="mb-2">
                    Alguns fornecedores estão localizados fora da União Europeia (principalmente EUA). 
                    Garantimos proteção através de:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Cláusulas contratuais-tipo aprovadas pela Comissão Europeia</li>
                    <li>Certificação Privacy Shield (quando aplicável)</li>
                    <li>Medidas técnicas de encriptação e pseudonimização</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">6.3 Requisitos Legais</h3>
                  <p>
                    Podemos divulgar dados se exigido por lei, ordem judicial, processo legal, 
                    ou solicitação governamental aplicável.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">6.4 Proteção de Direitos</h3>
                  <p>
                    Para proteger os direitos, propriedade ou segurança da DUA IA, 
                    utilizadores ou público, conforme permitido ou exigido por lei.
                  </p>
                </div>
              </div>
            </section>

            {/* Retenção */}
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">7. Período de Retenção de Dados</h2>
              <p className="mb-4">Retemos os seus dados pessoais apenas pelo tempo necessário:</p>
              
              <div className="bg-neutral-800/30 rounded-lg p-6 space-y-3">
                <p><strong>Conta Ativa:</strong> Durante o período em que a conta estiver ativa</p>
                <p><strong>Após Eliminação de Conta:</strong> 30 dias (para permitir recuperação acidental)</p>
                <p><strong>Dados de Transações:</strong> 7 anos (obrigação fiscal e contabilística)</p>
                <p><strong>Logs de Segurança:</strong> 12 meses (prevenção de fraudes)</p>
                <p><strong>Dados Anonimizados:</strong> Indefinidamente (para estatísticas e análise)</p>
                <p><strong>Inatividade:</strong> Contas inativas por mais de 24 meses podem ser eliminadas após aviso prévio</p>
              </div>
            </section>

            {/* Direitos do Utilizador */}
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">8. Os Seus Direitos (GDPR)</h2>
              <p className="mb-4">Como utilizador na UE, você tem os seguintes direitos:</p>
              
              <div className="space-y-4">
                <div className="bg-purple-900/20 border border-purple-700/30 rounded-lg p-4">
                  <p className="font-semibold text-purple-300 mb-2">✓ Direito de Acesso (Art. 15)</p>
                  <p className="text-sm">Obter confirmação sobre quais dados pessoais tratamos e receber uma cópia.</p>
                </div>

                <div className="bg-purple-900/20 border border-purple-700/30 rounded-lg p-4">
                  <p className="font-semibold text-purple-300 mb-2">✓ Direito de Retificação (Art. 16)</p>
                  <p className="text-sm">Corrigir dados inexatos ou incompletos.</p>
                </div>

                <div className="bg-purple-900/20 border border-purple-700/30 rounded-lg p-4">
                  <p className="font-semibold text-purple-300 mb-2">✓ Direito ao Apagamento / &quot;Direito a Ser Esquecido&quot; (Art. 17)</p>
                  <p className="text-sm">Solicitar a eliminação dos seus dados (sujeito a obrigações legais).</p>
                </div>

                <div className="bg-purple-900/20 border border-purple-700/30 rounded-lg p-4">
                  <p className="font-semibold text-purple-300 mb-2">✓ Direito à Limitação do Tratamento (Art. 18)</p>
                  <p className="text-sm">Restringir o processamento em certas circunstâncias.</p>
                </div>

                <div className="bg-purple-900/20 border border-purple-700/30 rounded-lg p-4">
                  <p className="font-semibold text-purple-300 mb-2">✓ Direito à Portabilidade dos Dados (Art. 20)</p>
                  <p className="text-sm">Receber os seus dados em formato estruturado e transferi-los para outro serviço.</p>
                </div>

                <div className="bg-purple-900/20 border border-purple-700/30 rounded-lg p-4">
                  <p className="font-semibold text-purple-300 mb-2">✓ Direito de Oposição (Art. 21)</p>
                  <p className="text-sm">Opor-se ao tratamento baseado em interesses legítimos ou marketing direto.</p>
                </div>

                <div className="bg-purple-900/20 border border-purple-700/30 rounded-lg p-4">
                  <p className="font-semibold text-purple-300 mb-2">✓ Direito de Retirar Consentimento (Art. 7(3))</p>
                  <p className="text-sm">Retirar consentimento a qualquer momento (não afeta tratamento anterior).</p>
                </div>

                <div className="bg-purple-900/20 border border-purple-700/30 rounded-lg p-4">
                  <p className="font-semibold text-purple-300 mb-2">✓ Direito de Apresentar Reclamação (Art. 77)</p>
                  <p className="text-sm">
                    Apresentar queixa à autoridade de proteção de dados:{' '}
                    <a href="https://www.cnpd.pt" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-purple-300 underline">
                      CNPD (Portugal)
                    </a>
                  </p>
                </div>
              </div>

              <div className="mt-6 bg-neutral-800/50 rounded-lg p-6">
                <p className="font-semibold text-white mb-2">Como Exercer os Seus Direitos:</p>
                <p className="mb-2">Envie um email para: <strong className="text-purple-400">privacidade@duaia.com</strong></p>
                <p className="text-sm text-neutral-400">Responderemos no prazo de 30 dias conforme exigido pelo GDPR.</p>
              </div>
            </section>

            {/* Cookies */}
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">9. Cookies e Tecnologias Similares</h2>
              
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-white mb-3">9.1 O Que São Cookies</h3>
                <p>
                  Cookies são pequenos ficheiros de texto armazenados no seu dispositivo quando visita um website. 
                  Usamos cookies para melhorar a funcionalidade e experiência do utilizador.
                </p>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-semibold text-white mb-3">9.2 Tipos de Cookies Utilizados</h3>
                
                <div className="space-y-3">
                  <div className="bg-green-900/20 border border-green-700/30 rounded-lg p-4">
                    <p className="font-semibold text-green-300 mb-2">🔒 Cookies Estritamente Necessários</p>
                    <p className="text-sm mb-2">
                      Essenciais para o funcionamento da plataforma. Não podem ser desativados.
                    </p>
                    <p className="text-xs text-neutral-400">
                      Exemplos: Autenticação de sessão, segurança, preferências de idioma
                    </p>
                  </div>

                  <div className="bg-blue-900/20 border border-blue-700/30 rounded-lg p-4">
                    <p className="font-semibold text-blue-300 mb-2">📊 Cookies Analíticos</p>
                    <p className="text-sm mb-2">
                      Para entender como utiliza a plataforma e melhorar a experiência.
                    </p>
                    <p className="text-xs text-neutral-400">
                      Exemplos: Google Analytics, métricas de uso
                    </p>
                  </div>

                  <div className="bg-yellow-900/20 border border-yellow-700/30 rounded-lg p-4">
                    <p className="font-semibold text-yellow-300 mb-2">🎯 Cookies de Marketing</p>
                    <p className="text-sm mb-2">
                      Para mostrar anúncios relevantes e medir eficácia de campanhas.
                    </p>
                    <p className="text-xs text-neutral-400">
                      Exemplos: Facebook Pixel, Google Ads (apenas com consentimento)
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-3">9.3 Gestão de Cookies</h3>
                <p className="mb-3">
                  Pode gerir as suas preferências de cookies através do banner de consentimento 
                  que aparece na primeira visita. Para alterar posteriormente:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Aceda às Configurações da sua conta</li>
                  <li>Utilize as definições do seu navegador para bloquear cookies</li>
                  <li>Contacte-nos em privacidade@duaia.com</li>
                </ul>
                <p className="mt-3 text-sm text-neutral-400">
                  Nota: Bloquear cookies necessários pode afetar a funcionalidade da plataforma.
                </p>
              </div>
            </section>

            {/* Segurança */}
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">10. Segurança dos Dados</h2>
              <p className="mb-4">
                Implementamos medidas técnicas e organizacionais para proteger os seus dados:
              </p>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-neutral-800/30 rounded-lg p-4">
                  <p className="font-semibold text-white mb-2">🔐 Encriptação</p>
                  <p className="text-sm">HTTPS/TLS em todas as comunicações, passwords encriptadas com bcrypt</p>
                </div>

                <div className="bg-neutral-800/30 rounded-lg p-4">
                  <p className="font-semibold text-white mb-2">🛡️ Autenticação</p>
                  <p className="text-sm">Passwords fortes (12+ caracteres), rate limiting, proteção contra brute force</p>
                </div>

                <div className="bg-neutral-800/30 rounded-lg p-4">
                  <p className="font-semibold text-white mb-2">🔒 Acesso Restrito</p>
                  <p className="text-sm">Apenas pessoal autorizado, princípio de menor privilégio, autenticação multi-fator</p>
                </div>

                <div className="bg-neutral-800/30 rounded-lg p-4">
                  <p className="font-semibold text-white mb-2">📊 Monitorização</p>
                  <p className="text-sm">Logs de segurança, deteção de anomalias, backups regulares</p>
                </div>

                <div className="bg-neutral-800/30 rounded-lg p-4">
                  <p className="font-semibold text-white mb-2">🔄 Atualizações</p>
                  <p className="text-sm">Patches de segurança regulares, auditorias de código</p>
                </div>

                <div className="bg-neutral-800/30 rounded-lg p-4">
                  <p className="font-semibold text-white mb-2">🚨 Resposta a Incidentes</p>
                  <p className="text-sm">Plano de resposta a violações, notificação em 72h (GDPR)</p>
                </div>
              </div>

              <p className="mt-6 text-sm text-neutral-400">
                Apesar das nossas medidas de segurança, nenhum sistema é 100% seguro. 
                Você também é responsável por manter a confidencialidade da sua password 
                e reportar atividades suspeitas.
              </p>
            </section>

            {/* Menores */}
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">11. Menores de Idade</h2>
              <p className="mb-4">
                A DUA IA não é destinada a menores de 18 anos. Não recolhemos intencionalmente 
                dados de menores.
              </p>
              <p>
                Se tomarmos conhecimento de que recolhemos dados de um menor, 
                eliminaremos essas informações imediatamente. Se acredita que um menor 
                forneceu dados, contacte-nos em privacidade@duaia.com.
              </p>
            </section>

            {/* Alterações */}
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">12. Alterações a Esta Política</h2>
              <p className="mb-4">
                Podemos atualizar esta Política de Privacidade periodicamente para refletir 
                mudanças nas nossas práticas, tecnologia ou requisitos legais.
              </p>
              <p className="mb-4">
                Notificaremos sobre alterações significativas através de:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Email para o endereço registado na sua conta</li>
                <li>Aviso proeminente na plataforma</li>
                <li>Atualização da data de &quot;Última atualização&quot; no topo desta página</li>
              </ul>
              <p className="mt-4">
                Recomendamos que reveja esta Política regularmente. 
                O uso continuado após alterações constitui aceitação da nova Política.
              </p>
            </section>

            {/* Contacto */}
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">13. Contacto e Questões</h2>
              <p className="mb-4">
                Para questões, exercício de direitos ou preocupações sobre privacidade, contacte:
              </p>
              <div className="bg-neutral-800/50 rounded-lg p-6 space-y-3">
                <p><strong>Encarregado de Proteção de Dados (DPO):</strong></p>
                <p><strong>Email:</strong> dpo@duaia.com</p>
                <p><strong>Email Geral de Privacidade:</strong> privacidade@duaia.com</p>
                <p><strong>Morada:</strong> DUA IA, Lda.<br />Lisboa, Portugal</p>
                <p className="pt-3 border-t border-neutral-700">
                  <strong>Autoridade de Proteção de Dados (Portugal):</strong><br />
                  Comissão Nacional de Proteção de Dados (CNPD)<br />
                  Website:{' '}
                  <a href="https://www.cnpd.pt" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-purple-300 underline">
                    www.cnpd.pt
                  </a>
                </p>
              </div>
            </section>

            {/* Footer Legal */}
            <section className="border-t border-neutral-800 pt-8 mt-12">
              <p className="text-sm text-neutral-500 italic mb-4">
                Esta Política de Privacidade é complementar aos{' '}
                <a href="/termos" className="text-purple-400 hover:text-purple-300 underline">
                  Termos de Serviço
                </a>
                {' '}e cumpre com o Regulamento Geral de Proteção de Dados (GDPR) da União Europeia 
                e outras leis aplicáveis de proteção de dados.
              </p>
              <p className="text-sm text-neutral-500">
                <strong>Última atualização:</strong> 8 de novembro de 2025<br />
                <strong>Versão:</strong> 1.0<br />
                <strong>Conformidade:</strong> GDPR (UE) 2016/679, Lei nº 58/2019 (Portugal)
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
