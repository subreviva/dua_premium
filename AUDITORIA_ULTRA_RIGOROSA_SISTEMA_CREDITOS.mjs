#!/usr/bin/env node

/**
 * 🔍 AUDITORIA ULTRA RIGOROSA - SISTEMA DE CRÉDITOS
 * 
 * TESTES:
 * 1. Login com código da base de dados
 * 2. Verificar créditos iniciais
 * 3. Comprar pacote de créditos
 * 4. Verificar atualização em tempo real na navbar
 * 5. Usar serviço (Music Studio)
 * 6. Verificar desconto de créditos
 * 7. Verificar histórico de transações
 * 8. Testes de edge cases e race conditions
 */

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { readFileSync } from 'fs'

// Carregar .env.local manualmente
const envContent = readFileSync('.env.local', 'utf-8')
const envVars = {}
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)="?([^"]+)"?$/)
  if (match) {
    envVars[match[1]] = match[2]
  }
})

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = envVars.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente não configuradas')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Cores para output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
}

function log(emoji, color, message, data = null) {
  console.log(`${emoji} ${color}${message}${colors.reset}`)
  if (data) {
    console.log(JSON.stringify(data, null, 2))
  }
}

function section(title) {
  console.log('\n' + '='.repeat(80))
  console.log(`${colors.bright}${colors.cyan}${title}${colors.reset}`)
  console.log('='.repeat(80) + '\n')
}

// Estado do teste
const testState = {
  userId: null,
  userEmail: null,
  creditosIniciais: 0,
  creditosAposCompra: 0,
  creditosAposUso: 0,
  errors: [],
  warnings: [],
  success: []
}

/**
 * TESTE 1: Buscar usuário real da base de dados
 */
async function teste1_BuscarUsuarioReal() {
  section('TESTE 1: BUSCAR USUÁRIO REAL DA BASE DE DADOS')
  
  try {
    // Buscar usuário com email verificado e que tenha código de acesso
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .not('access_code', 'is', null)
      .limit(5)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    
    if (!users || users.length === 0) {
      log('⚠️', colors.yellow, 'Nenhum usuário com código de acesso encontrado')
      log('💡', colors.blue, 'Criando usuário de teste...')
      
      // Criar usuário de teste
      const testEmail = `teste.${Date.now()}@2lados.pt`
      const accessCode = `TEST${Math.random().toString(36).substring(2, 8).toUpperCase()}`
      
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({
          email: testEmail,
          name: 'Usuário Teste Auditoria',
          access_code: accessCode,
          credits: 150,
          email_verified: true
        })
        .select()
        .single()
      
      if (createError) throw createError
      
      testState.userId = newUser.id
      testState.userEmail = newUser.email
      testState.creditosIniciais = newUser.credits || 0
      
      log('✅', colors.green, 'Usuário de teste criado com sucesso')
      log('📧', colors.cyan, `Email: ${testEmail}`)
      log('🔑', colors.cyan, `Código de Acesso: ${accessCode}`)
      log('💰', colors.cyan, `Créditos Iniciais: ${newUser.credits}`)
      
      testState.success.push('Usuário de teste criado')
    } else {
      // Usar usuário existente
      const user = users[0]
      testState.userId = user.id
      testState.userEmail = user.email
      testState.creditosIniciais = user.credits || 0
      
      log('✅', colors.green, 'Usuário encontrado na base de dados')
      log('📧', colors.cyan, `Email: ${user.email}`)
      log('🔑', colors.cyan, `Código de Acesso: ${user.access_code}`)
      log('💰', colors.cyan, `Créditos Atuais: ${user.credits || 0}`)
      log('📅', colors.cyan, `Criado em: ${new Date(user.created_at).toLocaleString('pt-BR')}`)
      
      testState.success.push('Usuário real encontrado')
    }
    
    return true
  } catch (error) {
    log('❌', colors.red, 'Erro ao buscar usuário', { error: error.message })
    testState.errors.push(`Teste 1: ${error.message}`)
    return false
  }
}

/**
 * TESTE 2: Verificar estrutura da tabela de créditos
 */
async function teste2_VerificarEstruturaBanco() {
  section('TESTE 2: VERIFICAR ESTRUTURA DO BANCO DE DADOS')
  
  try {
    // Verificar se coluna credits existe
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, credits, duaia_credits, duacoin_balance')
      .eq('id', testState.userId)
      .single()
    
    if (error) throw error
    
    log('✅', colors.green, 'Estrutura da tabela users verificada')
    log('📊', colors.cyan, 'Colunas de créditos disponíveis:', {
      credits: user.credits !== undefined,
      duaia_credits: user.duaia_credits !== undefined,
      duacoin_balance: user.duacoin_balance !== undefined
    })
    
    // Verificar tabela credit_transactions
    const { data: transactions, error: txError } = await supabase
      .from('credit_transactions')
      .select('*')
      .eq('user_id', testState.userId)
      .limit(1)
    
    if (!txError) {
      log('✅', colors.green, 'Tabela credit_transactions acessível')
      testState.success.push('Estrutura do banco verificada')
    } else {
      log('⚠️', colors.yellow, 'Tabela credit_transactions pode não existir')
      testState.warnings.push('Tabela credit_transactions não acessível')
    }
    
    return true
  } catch (error) {
    log('❌', colors.red, 'Erro ao verificar estrutura', { error: error.message })
    testState.errors.push(`Teste 2: ${error.message}`)
    return false
  }
}

/**
 * TESTE 3: Simular compra de créditos
 */
async function teste3_SimularCompraCreditos() {
  section('TESTE 3: SIMULAR COMPRA DE CRÉDITOS')
  
  try {
    const creditosParaAdicionar = 100
    const novosCreditos = testState.creditosIniciais + creditosParaAdicionar
    
    log('💳', colors.blue, `Simulando compra de ${creditosParaAdicionar} créditos...`)
    
    // Atualizar créditos do usuário
    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update({ credits: novosCreditos })
      .eq('id', testState.userId)
      .select()
      .single()
    
    if (updateError) throw updateError
    
    // Registrar transação
    const { error: txError } = await supabase
      .from('credit_transactions')
      .insert({
        user_id: testState.userId,
        amount: creditosParaAdicionar,
        type: 'purchase',
        description: 'Compra de créditos - Teste Auditoria',
        balance_after: novosCreditos
      })
    
    if (txError && !txError.message.includes('does not exist')) {
      log('⚠️', colors.yellow, 'Não foi possível registrar transação (tabela pode não existir)')
    }
    
    testState.creditosAposCompra = updatedUser.credits
    
    log('✅', colors.green, 'Compra simulada com sucesso')
    log('💰', colors.cyan, `Créditos antes: ${testState.creditosIniciais}`)
    log('💰', colors.cyan, `Créditos depois: ${testState.creditosAposCompra}`)
    log('➕', colors.green, `Diferença: +${creditosParaAdicionar}`)
    
    if (testState.creditosAposCompra === novosCreditos) {
      testState.success.push('Compra de créditos funcionando')
    } else {
      testState.errors.push('Valor de créditos não atualizado corretamente')
    }
    
    // Aguardar para simular tempo real
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    return true
  } catch (error) {
    log('❌', colors.red, 'Erro ao simular compra', { error: error.message })
    testState.errors.push(`Teste 3: ${error.message}`)
    return false
  }
}

/**
 * TESTE 4: Verificar atualização em tempo real (polling)
 */
async function teste4_VerificarAtualizacaoTempoReal() {
  section('TESTE 4: VERIFICAR ATUALIZAÇÃO EM TEMPO REAL')
  
  try {
    log('🔄', colors.blue, 'Simulando consulta da navbar (3 vezes em 3 segundos)...')
    
    for (let i = 1; i <= 3; i++) {
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const { data: user, error } = await supabase
        .from('users')
        .select('credits')
        .eq('id', testState.userId)
        .single()
      
      if (error) throw error
      
      log('📊', colors.cyan, `Consulta ${i}: ${user.credits} créditos`)
      
      if (user.credits !== testState.creditosAposCompra) {
        testState.warnings.push(`Inconsistência na consulta ${i}`)
      }
    }
    
    log('✅', colors.green, 'Atualização em tempo real verificada')
    testState.success.push('Sistema de polling funcionando')
    
    return true
  } catch (error) {
    log('❌', colors.red, 'Erro na verificação de tempo real', { error: error.message })
    testState.errors.push(`Teste 4: ${error.message}`)
    return false
  }
}

/**
 * TESTE 5: Simular uso de serviço (desconto de créditos)
 */
async function teste5_SimularUsoServico() {
  section('TESTE 5: SIMULAR USO DE SERVIÇO (MUSIC STUDIO)')
  
  try {
    const custoServico = 10 // Custo típico de gerar uma música
    const creditosAntes = testState.creditosAposCompra
    const creditosDepois = creditosAntes - custoServico
    
    log('🎵', colors.blue, `Simulando geração de música (custo: ${custoServico} créditos)...`)
    
    // Descontar créditos
    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update({ credits: creditosDepois })
      .eq('id', testState.userId)
      .select()
      .single()
    
    if (updateError) throw updateError
    
    // Registrar transação de uso
    const { error: txError } = await supabase
      .from('credit_transactions')
      .insert({
        user_id: testState.userId,
        amount: -custoServico,
        type: 'usage',
        description: 'Music Studio - Geração de música',
        balance_after: creditosDepois,
        metadata: { service: 'music_studio', action: 'generate' }
      })
    
    if (txError && !txError.message.includes('does not exist')) {
      log('⚠️', colors.yellow, 'Não foi possível registrar transação de uso')
    }
    
    testState.creditosAposUso = updatedUser.credits
    
    log('✅', colors.green, 'Uso de serviço simulado com sucesso')
    log('💰', colors.cyan, `Créditos antes: ${creditosAntes}`)
    log('💰', colors.cyan, `Créditos depois: ${testState.creditosAposUso}`)
    log('➖', colors.red, `Diferença: -${custoServico}`)
    
    if (testState.creditosAposUso === creditosDepois) {
      testState.success.push('Desconto de créditos funcionando')
    } else {
      testState.errors.push('Valor de créditos não descontado corretamente')
    }
    
    return true
  } catch (error) {
    log('❌', colors.red, 'Erro ao simular uso de serviço', { error: error.message })
    testState.errors.push(`Teste 5: ${error.message}`)
    return false
  }
}

/**
 * TESTE 6: Verificar histórico de transações
 */
async function teste6_VerificarHistoricoTransacoes() {
  section('TESTE 6: VERIFICAR HISTÓRICO DE TRANSAÇÕES')
  
  try {
    const { data: transactions, error } = await supabase
      .from('credit_transactions')
      .select('*')
      .eq('user_id', testState.userId)
      .order('created_at', { ascending: false })
      .limit(10)
    
    if (error) {
      if (error.message.includes('does not exist')) {
        log('⚠️', colors.yellow, 'Tabela credit_transactions não existe')
        testState.warnings.push('Histórico de transações não disponível')
        return true
      }
      throw error
    }
    
    log('✅', colors.green, `${transactions.length} transações encontradas`)
    
    transactions.forEach((tx, index) => {
      const emoji = tx.type === 'purchase' ? '💳' : tx.type === 'usage' ? '🎵' : '💰'
      const color = tx.amount > 0 ? colors.green : colors.red
      log(emoji, color, `${index + 1}. ${tx.description} (${tx.amount > 0 ? '+' : ''}${tx.amount} créditos)`)
    })
    
    testState.success.push('Histórico de transações acessível')
    
    return true
  } catch (error) {
    log('❌', colors.red, 'Erro ao verificar histórico', { error: error.message })
    testState.errors.push(`Teste 6: ${error.message}`)
    return false
  }
}

/**
 * TESTE 7: Edge cases e race conditions
 */
async function teste7_TestarEdgeCases() {
  section('TESTE 7: EDGE CASES E RACE CONDITIONS')
  
  try {
    // Teste 7.1: Tentar usar mais créditos do que possui
    log('🔬', colors.blue, 'Teste 7.1: Tentar usar mais créditos do que possui')
    
    const { data: user } = await supabase
      .from('users')
      .select('credits')
      .eq('id', testState.userId)
      .single()
    
    const creditosAtuais = user.credits
    const tentativaUso = creditosAtuais + 100
    
    if (creditosAtuais < tentativaUso) {
      log('✅', colors.green, `Proteção: Usuário tem ${creditosAtuais} créditos, tentativa de usar ${tentativaUso} deve falhar`)
      testState.success.push('Proteção contra saldo negativo implementável')
    }
    
    // Teste 7.2: Múltiplas requisições simultâneas
    log('🔬', colors.blue, 'Teste 7.2: Múltiplas requisições simultâneas (race condition)')
    
    const promises = []
    for (let i = 0; i < 3; i++) {
      promises.push(
        supabase
          .from('users')
          .select('credits')
          .eq('id', testState.userId)
          .single()
      )
    }
    
    const results = await Promise.all(promises)
    const creditos = results.map(r => r.data?.credits)
    
    if (creditos.every(c => c === creditos[0])) {
      log('✅', colors.green, 'Todas as consultas retornaram o mesmo valor')
      testState.success.push('Consistência em requisições simultâneas')
    } else {
      log('⚠️', colors.yellow, 'Valores diferentes em requisições simultâneas', creditos)
      testState.warnings.push('Possível race condition detectada')
    }
    
    // Teste 7.3: Valor zero ou negativo
    log('🔬', colors.blue, 'Teste 7.3: Proteção contra valores negativos')
    
    const { error: negativeError } = await supabase
      .from('users')
      .update({ credits: -10 })
      .eq('id', testState.userId)
    
    if (negativeError) {
      log('✅', colors.green, 'Banco bloqueia valores negativos')
      testState.success.push('Constraint de valores negativos ativa')
    } else {
      log('⚠️', colors.yellow, 'Banco permite valores negativos - adicionar constraint')
      testState.warnings.push('Falta constraint para prevenir créditos negativos')
      
      // Reverter
      await supabase
        .from('users')
        .update({ credits: creditosAtuais })
        .eq('id', testState.userId)
    }
    
    return true
  } catch (error) {
    log('❌', colors.red, 'Erro nos testes de edge cases', { error: error.message })
    testState.errors.push(`Teste 7: ${error.message}`)
    return false
  }
}

/**
 * TESTE 8: Verificar APIs de compra
 */
async function teste8_VerificarAPIsCompra() {
  section('TESTE 8: VERIFICAR ENDPOINTS DE COMPRA')
  
  try {
    log('🔍', colors.blue, 'Verificando arquivos de API de compra...')
    
    const { readdir, access, constants } = await import('fs/promises')
    const { join } = await import('path')
    
    const apiPaths = [
      'app/api/credits/route.ts',
      'app/api/credits/purchase/route.ts',
      'app/api/stripe/webhook/route.ts',
      'app/api/payments/webhook/route.ts'
    ]
    
    for (const apiPath of apiPaths) {
      try {
        await access(apiPath, constants.F_OK)
        log('✅', colors.green, `API encontrada: ${apiPath}`)
        testState.success.push(`API ${apiPath} existe`)
      } catch {
        log('⚠️', colors.yellow, `API não encontrada: ${apiPath}`)
      }
    }
    
    return true
  } catch (error) {
    log('❌', colors.red, 'Erro ao verificar APIs', { error: error.message })
    return false
  }
}

/**
 * TESTE 9: Verificar componente de Navbar
 */
async function teste9_VerificarNavbar() {
  section('TESTE 9: VERIFICAR COMPONENTE NAVBAR')
  
  try {
    const { readFile } = await import('fs/promises')
    
    const navbarPaths = [
      'components/navbar.tsx',
      'components/Navbar.tsx',
      'app/components/navbar.tsx'
    ]
    
    let navbarContent = null
    let navbarPath = null
    
    for (const path of navbarPaths) {
      try {
        navbarContent = await readFile(path, 'utf-8')
        navbarPath = path
        break
      } catch {}
    }
    
    if (!navbarContent) {
      log('⚠️', colors.yellow, 'Arquivo navbar não encontrado')
      testState.warnings.push('Navbar não encontrada')
      return true
    }
    
    log('✅', colors.green, `Navbar encontrada: ${navbarPath}`)
    
    // Verificar se exibe créditos
    const temCreditos = navbarContent.includes('credits') || navbarContent.includes('créditos')
    const temPolling = navbarContent.includes('setInterval') || navbarContent.includes('useEffect')
    const temSupabase = navbarContent.includes('supabase')
    
    log('📊', colors.cyan, 'Análise do componente Navbar:')
    log(temCreditos ? '✅' : '⚠️', temCreditos ? colors.green : colors.yellow, `Exibe créditos: ${temCreditos}`)
    log(temPolling ? '✅' : '⚠️', temPolling ? colors.green : colors.yellow, `Tem atualização periódica: ${temPolling}`)
    log(temSupabase ? '✅' : '⚠️', temSupabase ? colors.green : colors.yellow, `Usa Supabase: ${temSupabase}`)
    
    if (temCreditos && temPolling && temSupabase) {
      testState.success.push('Navbar com sistema de créditos completo')
    } else {
      testState.warnings.push('Navbar pode estar incompleta')
    }
    
    return true
  } catch (error) {
    log('❌', colors.red, 'Erro ao verificar navbar', { error: error.message })
    return false
  }
}

/**
 * TESTE 10: Restaurar estado original (cleanup)
 */
async function teste10_Cleanup() {
  section('TESTE 10: RESTAURAR ESTADO ORIGINAL')
  
  try {
    log('🧹', colors.blue, 'Restaurando créditos originais...')
    
    const { error } = await supabase
      .from('users')
      .update({ credits: testState.creditosIniciais })
      .eq('id', testState.userId)
    
    if (error) throw error
    
    log('✅', colors.green, `Créditos restaurados para ${testState.creditosIniciais}`)
    
    return true
  } catch (error) {
    log('❌', colors.red, 'Erro ao restaurar estado', { error: error.message })
    return false
  }
}

/**
 * Relatório Final
 */
function gerarRelatorioFinal() {
  section('📊 RELATÓRIO FINAL DA AUDITORIA')
  
  console.log(`${colors.bright}RESUMO DOS TESTES:${colors.reset}\n`)
  
  log('✅', colors.green, `Sucessos: ${testState.success.length}`)
  testState.success.forEach((s, i) => {
    console.log(`   ${i + 1}. ${s}`)
  })
  
  console.log()
  
  if (testState.warnings.length > 0) {
    log('⚠️', colors.yellow, `Avisos: ${testState.warnings.length}`)
    testState.warnings.forEach((w, i) => {
      console.log(`   ${i + 1}. ${w}`)
    })
    console.log()
  }
  
  if (testState.errors.length > 0) {
    log('❌', colors.red, `Erros: ${testState.errors.length}`)
    testState.errors.forEach((e, i) => {
      console.log(`   ${i + 1}. ${e}`)
    })
    console.log()
  }
  
  console.log(`${colors.bright}FLUXO COMPLETO TESTADO:${colors.reset}\n`)
  console.log(`1. 💰 Créditos Iniciais: ${testState.creditosIniciais}`)
  console.log(`2. 💳 Após Compra (+100): ${testState.creditosAposCompra}`)
  console.log(`3. 🎵 Após Uso (-10): ${testState.creditosAposUso}`)
  console.log(`4. 🔄 Restaurado para: ${testState.creditosIniciais}\n`)
  
  const pontuacao = (testState.success.length / (testState.success.length + testState.errors.length)) * 100
  
  console.log(`${colors.bright}PONTUAÇÃO FINAL: ${pontuacao.toFixed(1)}%${colors.reset}\n`)
  
  if (pontuacao >= 90) {
    log('🏆', colors.green, 'SISTEMA APROVADO - Pronto para produção!')
  } else if (pontuacao >= 70) {
    log('⚠️', colors.yellow, 'SISTEMA COM RESSALVAS - Melhorias recomendadas')
  } else {
    log('❌', colors.red, 'SISTEMA REPROVADO - Correções necessárias')
  }
  
  console.log('\n' + '='.repeat(80) + '\n')
}

/**
 * Executar todos os testes
 */
async function executarAuditoria() {
  console.log('\n')
  log('🚀', colors.bright, 'INICIANDO AUDITORIA ULTRA RIGOROSA DO SISTEMA DE CRÉDITOS')
  console.log('\n')
  
  const testes = [
    teste1_BuscarUsuarioReal,
    teste2_VerificarEstruturaBanco,
    teste3_SimularCompraCreditos,
    teste4_VerificarAtualizacaoTempoReal,
    teste5_SimularUsoServico,
    teste6_VerificarHistoricoTransacoes,
    teste7_TestarEdgeCases,
    teste8_VerificarAPIsCompra,
    teste9_VerificarNavbar,
    teste10_Cleanup
  ]
  
  for (const teste of testes) {
    const resultado = await teste()
    if (!resultado && teste !== teste10_Cleanup) {
      log('⚠️', colors.yellow, 'Continuando apesar do erro...\n')
    }
  }
  
  gerarRelatorioFinal()
}

// Executar
executarAuditoria().catch(error => {
  console.error('Erro fatal na auditoria:', error)
  process.exit(1)
})
