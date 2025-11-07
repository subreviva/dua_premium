/**
 * 🔥 MODO ZVP ULTRA MEGA: DUA COIN MODULE VALIDATION
 * 
 * Validação modular ULTRA-MEGA-RIGOROSA do módulo DUA COIN
 * Incluindo validações financeiras críticas e segurança máxima
 * 🚀 MAXIMUM OVERDRIVE MODE ACTIVATED 🚀
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Carregar variáveis de ambiente
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente Supabase não encontradas')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

console.log('🔥🚀 INICIANDO MODO ZVP ULTRA MEGA: VALIDAÇÃO MÓDULO DUA COIN 🚀🔥')
console.log('=' .repeat(80))
console.log('🔒 VALIDAÇÃO FINANCEIRA ULTRA-RIGOROSA ATIVADA')
console.log('💰 SEGURANÇA MÁXIMA DE TRANSAÇÕES ENGAJADA')
console.log('⚡ PERFORMANCE CRÍTICA MONITORADA')
console.log('=' .repeat(80))

// CONFIGURAÇÃO DO MÓDULO DUA COIN
const DUACOIN_TABLES = [
  'duacoin_profiles',
  'duacoin_transactions', 
  'duacoin_staking'
]

const ADMIN_USER_EMAIL = 'estraca@2lados.pt'

let validationResults = {
  structure: {},
  rlsPolicies: {},
  triggers: {},
  financialSecurity: {},
  e2eWorkflow: {},
  conflicts: {},
  performance: {},
  dataIntegrity: {}
}

// ========================================
// FASE 1: VALIDAÇÃO ULTRA-RIGOROSA DE ESTRUTURA FINANCEIRA
// ========================================
async function validateFinancialTableStructure() {
  console.log('\n🏦 FASE 1: Validação Ultra-Rigorosa de Estrutura Financeira')
  console.log('-' .repeat(70))
  
  for (const table of DUACOIN_TABLES) {
    try {
      console.log(`💰 Verificando tabela financeira: ${table}`)
      
      // Verificar se a tabela existe
      const { data: tableExists, error: tableError } = await supabase
        .from(table)
        .select('*')
        .limit(1)
      
      if (tableError && tableError.code === '42P01') {
        console.log(`❌ CRÍTICO: Tabela financeira ${table} NÃO existe`)
        validationResults.structure[table] = { exists: false, critical: true, error: tableError.message }
        continue
      }
      
      if (tableError) {
        console.log(`🚨 ALERTA FINANCEIRO: Erro ao acessar ${table}: ${tableError.message}`)
        validationResults.structure[table] = { exists: false, error: tableError.message }
        continue
      }
      
      console.log(`✅ Tabela financeira ${table} existe e está acessível`)
      validationResults.structure[table] = { exists: true, accessible: true }
      
      // Verificar colunas financeiras críticas
      await validateFinancialColumns(table)
      
      // Verificar índices para performance
      await validateFinancialIndexes(table)
      
    } catch (error) {
      console.log(`🚨 ERRO CRÍTICO FINANCEIRO na tabela ${table}:`, error.message)
      validationResults.structure[table] = { exists: false, criticalError: error.message }
    }
  }
}

async function validateFinancialColumns(tableName) {
  console.log(`  🔍 Verificando colunas financeiras de ${tableName}`)
  
  const financialColumns = {
    'duacoin_profiles': {
      critical: ['id', 'user_id', 'balance', 'total_earned', 'total_spent'],
      optional: ['created_at', 'updated_at', 'kyc_status', 'wallet_address']
    },
    'duacoin_transactions': {
      critical: ['id', 'user_id', 'type', 'amount', 'status', 'created_at'],
      optional: ['description', 'reference_id', 'fee', 'confirmed_at']
    },
    'duacoin_staking': {
      critical: ['id', 'user_id', 'amount', 'start_date', 'status'],
      optional: ['end_date', 'reward_rate', 'earned_rewards']
    }
  }
  
  const columns = financialColumns[tableName] || { critical: [], optional: [] }
  
  // Verificar colunas críticas
  console.log(`    🚨 Validando colunas CRÍTICAS:`)
  for (const column of columns.critical) {
    try {
      const { error } = await supabase
        .from(tableName)
        .select(column)
        .limit(1)
      
      if (error) {
        console.log(`      ❌ CRÍTICO: Coluna ${column} com problema: ${error.message}`)
        validationResults.structure[tableName] = validationResults.structure[tableName] || {}
        validationResults.structure[tableName].criticalColumns = validationResults.structure[tableName].criticalColumns || {}
        validationResults.structure[tableName].criticalColumns[column] = { valid: false, critical: true, error: error.message }
      } else {
        console.log(`      ✅ Coluna crítica ${column} OK`)
        validationResults.structure[tableName] = validationResults.structure[tableName] || {}
        validationResults.structure[tableName].criticalColumns = validationResults.structure[tableName].criticalColumns || {}
        validationResults.structure[tableName].criticalColumns[column] = { valid: true, critical: true }
      }
    } catch (error) {
      console.log(`      🚨 ERRO CRÍTICO na coluna ${column}:`, error.message)
    }
  }
  
  // Verificar colunas opcionais
  console.log(`    📋 Validando colunas opcionais:`)
  for (const column of columns.optional) {
    try {
      const { error } = await supabase
        .from(tableName)
        .select(column)
        .limit(1)
      
      if (error) {
        console.log(`      ⚠️ Coluna opcional ${column}: ${error.message}`)
        validationResults.structure[tableName] = validationResults.structure[tableName] || {}
        validationResults.structure[tableName].optionalColumns = validationResults.structure[tableName].optionalColumns || {}
        validationResults.structure[tableName].optionalColumns[column] = { valid: false, optional: true, error: error.message }
      } else {
        console.log(`      ✅ Coluna opcional ${column} OK`)
        validationResults.structure[tableName] = validationResults.structure[tableName] || {}
        validationResults.structure[tableName].optionalColumns = validationResults.structure[tableName].optionalColumns || {}
        validationResults.structure[tableName].optionalColumns[column] = { valid: true, optional: true }
      }
    } catch (error) {
      console.log(`      ⚠️ Erro na coluna opcional ${column}:`, error.message)
    }
  }
}

async function validateFinancialIndexes(tableName) {
  console.log(`  ⚡ Verificando performance e índices de ${tableName}`)
  
  try {
    // Testar query de performance crítica
    const start = Date.now()
    
    if (tableName === 'duacoin_transactions') {
      // Query típica de histórico de transações
      const { error } = await supabase
        .from(tableName)
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10)
      
      const duration = Date.now() - start
      
      if (error) {
        console.log(`    ❌ Query de performance falhou: ${error.message}`)
        validationResults.performance[tableName] = { queryTest: false, error: error.message }
      } else {
        console.log(`    ✅ Query performance OK (${duration}ms)`)
        validationResults.performance[tableName] = { queryTest: true, duration }
        
        if (duration > 1000) {
          console.log(`    ⚠️ Query lenta (${duration}ms) - considerar índices`)
          validationResults.performance[tableName].slow = true
        }
      }
    }
    
  } catch (error) {
    console.log(`    🚨 Erro no teste de performance:`, error.message)
    validationResults.performance[tableName] = { error: error.message }
  }
}

// ========================================
// FASE 2: VALIDAÇÃO ULTRA-SEGURA DE RLS FINANCEIRO
// ========================================
async function validateFinancialRLSPolicies() {
  console.log('\n🛡️ FASE 2: Validação Ultra-Segura de RLS Financeiro')
  console.log('-' .repeat(70))
  console.log('🔐 SEGURANÇA FINANCEIRA MÁXIMA ATIVADA')
  
  // Buscar usuário admin para testes
  const { data: adminUsers, error: userError } = await supabase.auth.admin.listUsers()
  
  if (userError) {
    console.log('❌ CRÍTICO: Erro ao buscar usuários para teste financeiro:', userError.message)
    validationResults.rlsPolicies.userLookup = { error: userError.message }
    return
  }
  
  const testUser = adminUsers.users.find(user => user.email === ADMIN_USER_EMAIL)
  
  if (!testUser) {
    console.log(`❌ CRÍTICO: Usuário de teste financeiro ${ADMIN_USER_EMAIL} não encontrado`)
    validationResults.rlsPolicies.userLookup = { error: 'Financial test user not found' }
    return
  }
  
  console.log(`✅ Usuário de teste financeiro encontrado: ${testUser.email}`)
  console.log(`🆔 User ID: ${testUser.id}`)
  validationResults.rlsPolicies.userLookup = { success: true, userId: testUser.id }
  
  // Criar segundo usuário fictício para teste de isolamento
  const { data: fakeUser, error: fakeUserError } = await supabase.auth.admin.createUser({
    email: 'fake.test@duacoin.test',
    password: 'fake123456',
    email_confirm: true
  })
  
  let fakeUserId = null
  if (!fakeUserError && fakeUser) {
    fakeUserId = fakeUser.user.id
    console.log(`🎭 Usuário fictício criado para teste de isolamento: ${fakeUserId}`)
  }
  
  // Testar RLS com contexto financeiro
  for (const table of DUACOIN_TABLES) {
    try {
      console.log(`🔒 Testando RLS financeiro ultra-seguro em ${table}`)
      
      // Teste 1: Leitura própria (deve funcionar)
      const { data: ownData, error: ownError } = await supabase
        .from(table)
        .select('*')
        .eq('user_id', testUser.id)
        .limit(1)
      
      if (ownError) {
        console.log(`  ❌ FALHA: Erro leitura própria em ${table}: ${ownError.message}`)
        validationResults.rlsPolicies[table] = { ownRead: false, error: ownError.message }
      } else {
        console.log(`  ✅ Leitura própria OK em ${table}`)
        validationResults.rlsPolicies[table] = { ownRead: true }
      }
      
      // Teste 2: Leitura de outros usuários (deve falhar)
      if (fakeUserId) {
        const { data: otherData, error: otherError } = await supabase
          .from(table)
          .select('*')
          .eq('user_id', fakeUserId)
          .limit(1)
        
        if (otherError && otherError.message.includes('row-level security')) {
          console.log(`  ✅ SEGURANÇA OK: RLS bloqueou acesso a dados de outros em ${table}`)
          validationResults.rlsPolicies[table].crossUserBlocked = true
        } else {
          console.log(`  🚨 FALHA DE SEGURANÇA: RLS permitiu acesso a dados de outros em ${table}`)
          validationResults.rlsPolicies[table].crossUserBlocked = false
          validationResults.rlsPolicies[table].securityBreach = true
        }
      }
      
      // Teste 3: Inserção com dados válidos
      if (table === 'duacoin_transactions') {
        const testTransaction = {
          user_id: testUser.id,
          type: 'earn',
          amount: '1.00',
          status: 'pending',
          description: 'Test RLS Transaction'
        }
        
        const { data: insertData, error: insertError } = await supabase
          .from(table)
          .insert(testTransaction)
          .select()
        
        if (insertError) {
          console.log(`  ⚠️ Inserção RLS em ${table}: ${insertError.message}`)
          validationResults.rlsPolicies[table].insert = { allowed: false, error: insertError.message }
        } else {
          console.log(`  ✅ Inserção RLS permitida em ${table}`)
          validationResults.rlsPolicies[table].insert = { allowed: true }
          
          // Limpar dados de teste
          if (insertData && insertData.length > 0) {
            await supabase.from(table).delete().eq('id', insertData[0].id)
            console.log(`  🧹 Dados de teste removidos de ${table}`)
          }
        }
      }
      
    } catch (error) {
      console.log(`🚨 ERRO CRÍTICO no RLS financeiro de ${table}:`, error.message)
      validationResults.rlsPolicies[table] = { criticalError: error.message }
    }
  }
  
  // Limpar usuário fictício
  if (fakeUserId) {
    await supabase.auth.admin.deleteUser(fakeUserId)
    console.log(`🗑️ Usuário fictício removido: ${fakeUserId}`)
  }
}

// ========================================
// FASE 3: VALIDAÇÃO MEGA-RIGOROSA DE TRIGGERS FINANCEIROS
// ========================================
async function validateFinancialTriggersAndCounters() {
  console.log('\n⚙️💰 FASE 3: Validação Mega-Rigorosa de Triggers Financeiros')
  console.log('-' .repeat(70))
  console.log('📊 INTEGRIDADE FINANCEIRA ULTRA-CRÍTICA')
  
  try {
    // Buscar usuário admin
    const { data: users } = await supabase.auth.admin.listUsers()
    const adminUser = users.users.find(user => user.email === ADMIN_USER_EMAIL)
    
    if (!adminUser) {
      console.log('❌ CRÍTICO: Usuário admin não encontrado para teste de triggers financeiros')
      return
    }
    
    console.log(`🧪 Testando triggers financeiros com usuário: ${adminUser.email}`)
    
    // Verificar se duacoin_profiles existe para o usuário
    let { data: profile, error: profileError } = await supabase
      .from('duacoin_profiles')
      .select('*')
      .eq('user_id', adminUser.id)
      .single()
    
    if (profileError && profileError.code === 'PGRST116') {
      console.log('💰 Profile financeiro não existe, testando trigger de criação automática...')
      
      // Simular primeira transação para triggear criação do profile
      const { data: transaction, error: transError } = await supabase
        .from('duacoin_transactions')
        .insert({
          user_id: adminUser.id,
          type: 'earn',
          amount: '10.50',
          status: 'completed',
          description: 'Teste Trigger Profile Creation'
        })
        .select()
        .single()
      
      if (transError) {
        console.log('❌ ERRO: Falha ao criar transação de teste:', transError.message)
        validationResults.triggers.profileCreation = { error: transError.message }
        return
      }
      
      console.log('✅ Transação de teste criada')
      
      // Verificar se o trigger criou o profile financeiro
      const { data: newProfile, error: newProfileError } = await supabase
        .from('duacoin_profiles')
        .select('*')
        .eq('user_id', adminUser.id)
        .single()
      
      if (newProfileError) {
        console.log('❌ CRÍTICO: Trigger de criação de profile financeiro NÃO funcionou:', newProfileError.message)
        validationResults.triggers.profileCreation = { working: false, critical: true, error: newProfileError.message }
      } else {
        console.log('✅ EXCELENTE: Trigger de criação de profile financeiro funcionando!')
        validationResults.triggers.profileCreation = { working: true }
        profile = newProfile
      }
      
      // Limpar transação de teste
      await supabase.from('duacoin_transactions').delete().eq('id', transaction.id)
    } else {
      console.log('✅ Profile financeiro já existe')
      validationResults.triggers.profileCreation = { alreadyExists: true }
    }
    
    // Teste ultra-rigoroso de cálculos financeiros
    if (profile) {
      console.log('💰 Testando cálculos e balanceamentos financeiros...')
      
      const initialBalance = parseFloat(profile.balance) || 0
      const initialEarned = parseFloat(profile.total_earned) || 0
      const initialSpent = parseFloat(profile.total_spent) || 0
      
      console.log(`  �� Saldos iniciais:`)
      console.log(`    Balance: ${initialBalance} DUA`)
      console.log(`    Total Earned: ${initialEarned} DUA`)
      console.log(`    Total Spent: ${initialSpent} DUA`)
      
      // Criar transações de teste para verificar cálculos
      const testTransactions = [
        { type: 'earn', amount: '25.75', status: 'completed', description: 'Test Earn 1' },
        { type: 'earn', amount: '15.25', status: 'completed', description: 'Test Earn 2' },
        { type: 'spend', amount: '10.50', status: 'completed', description: 'Test Spend 1' }
      ]
      
      const createdTransactions = []
      
      for (const trans of testTransactions) {
        const { data: newTrans, error: transError } = await supabase
          .from('duacoin_transactions')
          .insert({
            user_id: adminUser.id,
            ...trans
          })
          .select()
          .single()
        
        if (transError) {
          console.log(`❌ Erro ao criar transação teste: ${transError.message}`)
          continue
        }
        
        createdTransactions.push(newTrans)
        console.log(`  ➕ Transação criada: ${trans.type} ${trans.amount} DUA`)
      }
      
      // Aguardar triggers processarem
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Verificar cálculos atualizados
      const { data: updatedProfile, error: updateError } = await supabase
        .from('duacoin_profiles')
        .select('*')
        .eq('user_id', adminUser.id)
        .single()
      
      if (updateError) {
        console.log('❌ CRÍTICO: Erro ao verificar cálculos atualizados:', updateError.message)
        validationResults.triggers.calculations = { error: updateError.message }
      } else {
        const newBalance = parseFloat(updatedProfile.balance) || 0
        const newEarned = parseFloat(updatedProfile.total_earned) || 0
        const newSpent = parseFloat(updatedProfile.total_spent) || 0
        
        console.log(`  💵 Saldos após transações:`)
        console.log(`    Balance: ${newBalance} DUA`)
        console.log(`    Total Earned: ${newEarned} DUA`)
        console.log(`    Total Spent: ${newSpent} DUA`)
        
        // Verificar cálculos matemáticos
        const expectedEarned = initialEarned + 25.75 + 15.25 // +41.00
        const expectedSpent = initialSpent + 10.50 // +10.50
        const expectedBalance = initialBalance + 41.00 - 10.50 // +30.50
        
        console.log(`  🔢 Cálculos esperados:`)
        console.log(`    Balance esperado: ${expectedBalance} DUA`)
        console.log(`    Total Earned esperado: ${expectedEarned} DUA`)
        console.log(`    Total Spent esperado: ${expectedSpent} DUA`)
        
        const balanceCorrect = Math.abs(newBalance - expectedBalance) < 0.01
        const earnedCorrect = Math.abs(newEarned - expectedEarned) < 0.01
        const spentCorrect = Math.abs(newSpent - expectedSpent) < 0.01
        
        if (balanceCorrect && earnedCorrect && spentCorrect) {
          console.log('✅ PERFEITO: Todos os cálculos financeiros estão corretos!')
          validationResults.triggers.calculations = { 
            working: true,
            balanceCorrect,
            earnedCorrect,
            spentCorrect,
            precision: 'perfect'
          }
        } else {
          console.log('⚠️ PROBLEMA: Alguns cálculos financeiros estão incorretos!')
          console.log(`    Balance: ${balanceCorrect ? 'OK' : 'ERRO'}`)
          console.log(`    Earned: ${earnedCorrect ? 'OK' : 'ERRO'}`)
          console.log(`    Spent: ${spentCorrect ? 'OK' : 'ERRO'}`)
          
          validationResults.triggers.calculations = { 
            working: false,
            balanceCorrect,
            earnedCorrect,
            spentCorrect,
            precision: 'incorrect'
          }
        }
      }
      
      // Limpar transações de teste
      for (const trans of createdTransactions) {
        await supabase.from('duacoin_transactions').delete().eq('id', trans.id)
      }
      console.log('🧹 Transações de teste removidas')
    }
    
  } catch (error) {
    console.log('🚨 ERRO CRÍTICO na validação de triggers financeiros:', error.message)
    validationResults.triggers.criticalError = error.message
  }
}

// ========================================
// FASE 4: VERIFICAÇÃO MEGA-DETALHADA DE CONFLITOS
// ========================================
async function checkFinancialLegacyConflicts() {
  console.log('\n🔍💰 FASE 4: Verificação Mega-Detalhada de Conflitos Financeiros')
  console.log('-' .repeat(70))
  
  const legacyFinancialTables = [
    'transactions',
    'user_balances',
    'staking',
    'wallets',
    'coins'
  ]
  
  for (const legacyTable of legacyFinancialTables) {
    try {
      console.log(`🔎 Investigando conflito: ${legacyTable}`)
      
      // Tentar acessar a tabela diretamente
      const { data, error } = await supabase
        .from(legacyTable)
        .select('id')
        .limit(1)
      
      if (error && error.code === '42P01') {
        console.log(`✅ SEGURO: Tabela legada ${legacyTable} não existe`)
        validationResults.conflicts[legacyTable] = { exists: false, safe: true }
      } else if (error) {
        console.log(`⚠️ Erro ao verificar ${legacyTable}: ${error.message}`)
        validationResults.conflicts[legacyTable] = { error: error.message, investigated: true }
      } else {
        console.log(`🚨 ATENÇÃO: Tabela legada ${legacyTable} ainda existe!`)
        
        // Investigar mais a fundo
        const { data: countData, error: countError } = await supabase
          .from(legacyTable)
          .select('*', { count: 'exact', head: true })
        
        validationResults.conflicts[legacyTable] = { 
          exists: true, 
          needsInvestigation: true,
          potentialConflict: true
        }
        
        if (!countError) {
          console.log(`    📊 Registros encontrados: ${countData?.length || 'unknown'}`)
        }
      }
    } catch (error) {
      console.log(`❌ Erro crítico verificando ${legacyTable}:`, error.message)
      validationResults.conflicts[legacyTable] = { criticalError: error.message }
    }
  }
}

// ========================================
// FASE 5: TESTE E2E MEGA-COMPLETO DO WORKFLOW FINANCEIRO
// ========================================
async function testFinancialE2EWorkflow() {
  console.log('\n🎯💰 FASE 5: Teste E2E Mega-Completo do Workflow Financeiro')
  console.log('-' .repeat(70))
  console.log('💸 SIMULAÇÃO COMPLETA DE OPERAÇÕES FINANCEIRAS')
  
  try {
    const { data: users } = await supabase.auth.admin.listUsers()
    const adminUser = users.users.find(user => user.email === ADMIN_USER_EMAIL)
    
    if (!adminUser) {
      console.log('❌ CRÍTICO: Usuário não encontrado para teste E2E financeiro')
      return
    }
    
    console.log('🎬 Simulando workflow financeiro completo DUA COIN...')
    
    // 1. Verificar/Criar profile financeiro
    console.log('  1️⃣ Verificando profile financeiro...')
    let { data: profile, error: profileError } = await supabase
      .from('duacoin_profiles')
      .select('*')
      .eq('user_id', adminUser.id)
      .single()
    
    if (profileError && profileError.code === 'PGRST116') {
      console.log('     💰 Criando profile financeiro inicial...')
      const { data: newProfile, error: createError } = await supabase
        .from('duacoin_profiles')
        .insert({
          user_id: adminUser.id,
          balance: '0.00',
          total_earned: '0.00',
          total_spent: '0.00'
        })
        .select()
        .single()
      
      if (createError) {
        console.log('❌ Falha ao criar profile:', createError.message)
        validationResults.e2eWorkflow.createProfile = { success: false, error: createError.message }
        return
      }
      
      profile = newProfile
    }
    
    console.log('     ✅ Profile financeiro OK')
    validationResults.e2eWorkflow.createProfile = { success: true, userId: adminUser.id }
    
    // 2. Simular ganho de tokens (earn)
    console.log('  2️⃣ Simulando ganho de tokens...')
    const earnTransactions = [
      { type: 'earn', amount: '50.00', description: 'E2E Test - AI Task Completion' },
      { type: 'earn', amount: '25.50', description: 'E2E Test - Bonus Reward' }
    ]
    
    const createdEarns = []
    for (const earn of earnTransactions) {
      const { data: transaction, error: earnError } = await supabase
        .from('duacoin_transactions')
        .insert({
          user_id: adminUser.id,
          ...earn,
          status: 'completed'
        })
        .select()
        .single()
      
      if (earnError) {
        console.log(`❌ Falha ao criar earn: ${earnError.message}`)
        validationResults.e2eWorkflow.earnTokens = { success: false, error: earnError.message }
        break
      } else {
        createdEarns.push(transaction)
        console.log(`     💰 Ganho registrado: +${earn.amount} DUA`)
      }
    }
    
    if (createdEarns.length === earnTransactions.length) {
      console.log('     ✅ Todos os ganhos registrados')
      validationResults.e2eWorkflow.earnTokens = { success: true, count: createdEarns.length }
    }
    
    // 3. Simular gastos (spend)
    console.log('  3️⃣ Simulando gastos de tokens...')
    const { data: spendTransaction, error: spendError } = await supabase
      .from('duacoin_transactions')
      .insert({
        user_id: adminUser.id,
        type: 'spend',
        amount: '20.00',
        status: 'completed',
        description: 'E2E Test - Premium Feature Purchase'
      })
      .select()
      .single()
    
    if (spendError) {
      console.log('❌ Falha ao criar gasto:', spendError.message)
      validationResults.e2eWorkflow.spendTokens = { success: false, error: spendError.message }
    } else {
      console.log('     💸 Gasto registrado: -20.00 DUA')
      validationResults.e2eWorkflow.spendTokens = { success: true, amount: '20.00' }
    }
    
    // 4. Testar staking
    console.log('  4️⃣ Testando sistema de staking...')
    const { data: stakingRecord, error: stakingError } = await supabase
      .from('duacoin_staking')
      .insert({
        user_id: adminUser.id,
        amount: '30.00',
        start_date: new Date().toISOString(),
        status: 'active'
      })
      .select()
      .single()
    
    if (stakingError) {
      console.log('⚠️ Falha no staking:', stakingError.message)
      validationResults.e2eWorkflow.staking = { success: false, error: stakingError.message }
    } else {
      console.log('     🏦 Staking ativado: 30.00 DUA')
      validationResults.e2eWorkflow.staking = { success: true, amount: '30.00' }
    }
    
    // 5. Aguardar processamento e verificar saldos finais
    console.log('  5️⃣ Aguardando processamento financeiro...')
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    const { data: finalProfile, error: finalError } = await supabase
      .from('duacoin_profiles')
      .select('*')
      .eq('user_id', adminUser.id)
      .single()
    
    if (finalError) {
      console.log('❌ Erro ao verificar saldos finais:', finalError.message)
      validationResults.e2eWorkflow.finalBalance = { success: false, error: finalError.message }
    } else {
      console.log('     💰 Saldos finais:')
      console.log(`       Balance: ${finalProfile.balance} DUA`)
      console.log(`       Total Earned: ${finalProfile.total_earned} DUA`)
      console.log(`       Total Spent: ${finalProfile.total_spent} DUA`)
      
      validationResults.e2eWorkflow.finalBalance = { 
        success: true,
        balance: finalProfile.balance,
        earned: finalProfile.total_earned,
        spent: finalProfile.total_spent
      }
    }
    
    // 6. Limpeza mega-completa
    console.log('  6️⃣ Executando limpeza mega-completa...')
    
    // Limpar transações
    for (const earn of createdEarns) {
      await supabase.from('duacoin_transactions').delete().eq('id', earn.id)
    }
    if (spendTransaction) {
      await supabase.from('duacoin_transactions').delete().eq('id', spendTransaction.id)
    }
    
    // Limpar staking
    if (stakingRecord) {
      await supabase.from('duacoin_staking').delete().eq('id', stakingRecord.id)
    }
    
    console.log('     ✅ Limpeza concluída')
    validationResults.e2eWorkflow.cleanup = { success: true }
    
  } catch (error) {
    console.log('�� ERRO CRÍTICO no teste E2E financeiro:', error.message)
    validationResults.e2eWorkflow.criticalError = error.message
  }
}

// ========================================
// RELATÓRIO MEGA-DETALHADO FINAL
// ========================================
async function generateMegaReport() {
  console.log('\n📊💰 RELATÓRIO MEGA-DETALHADO FINAL - MÓDULO DUA COIN')
  console.log('=' .repeat(80))
  
  let totalTests = 0
  let passedTests = 0
  let criticalIssues = 0
  
  // Análise de estrutura financeira
  console.log('\n🏦 ESTRUTURA FINANCEIRA:')
  for (const [table, result] of Object.entries(validationResults.structure)) {
    totalTests++
    if (result.exists && result.accessible) {
      console.log(`  ✅ ${table}: Estrutura OK`)
      passedTests++
      
      // Verificar colunas críticas
      if (result.criticalColumns) {
        for (const [col, colResult] of Object.entries(result.criticalColumns)) {
          if (colResult.critical && !colResult.valid) {
            criticalIssues++
            console.log(`    🚨 CRÍTICO: Coluna ${col} com problema`)
          }
        }
      }
    } else {
      console.log(`  ❌ ${table}: ${result.error || 'Estrutura com problemas'}`)
      if (result.critical) criticalIssues++
    }
  }
  
  // Análise de segurança RLS
  console.log('\n��️ SEGURANÇA RLS FINANCEIRO:')
  for (const [table, result] of Object.entries(validationResults.rlsPolicies)) {
    if (table === 'userLookup') continue
    totalTests++
    if (result.ownRead && result.crossUserBlocked !== false) {
      console.log(`  ✅ ${table}: Segurança OK`)
      passedTests++
    } else {
      console.log(`  ❌ ${table}: ${result.error || 'Falha de segurança'}`)
      if (result.securityBreach) {
        criticalIssues++
        console.log(`    🚨 CRÍTICO: Falha de segurança detectada`)
      }
    }
  }
  
  // Análise de triggers financeiros
  console.log('\n⚙️💰 TRIGGERS FINANCEIROS:')
  if (validationResults.triggers.profileCreation) {
    totalTests++
    if (validationResults.triggers.profileCreation.working || validationResults.triggers.profileCreation.alreadyExists) {
      console.log('  ✅ Criação automática de profile: OK')
      passedTests++
    } else {
      console.log('  ❌ Criação automática de profile: Falhou')
      if (validationResults.triggers.profileCreation.critical) criticalIssues++
    }
  }
  
  if (validationResults.triggers.calculations) {
    totalTests++
    if (validationResults.triggers.calculations.working && validationResults.triggers.calculations.precision === 'perfect') {
      console.log('  ✅ Cálculos financeiros: PERFEITO')
      passedTests++
    } else {
      console.log('  ❌ Cálculos financeiros: Problemas detectados')
      criticalIssues++
      console.log('    🚨 CRÍTICO: Integridade financeira comprometida')
    }
  }
  
  // Análise E2E financeiro
  console.log('\n🎯💰 WORKFLOW E2E FINANCEIRO:')
  const e2eSteps = ['createProfile', 'earnTokens', 'spendTokens', 'staking', 'finalBalance']
  for (const step of e2eSteps) {
    if (validationResults.e2eWorkflow[step]) {
      totalTests++
      if (validationResults.e2eWorkflow[step].success) {
        console.log(`  ✅ ${step}: OK`)
        passedTests++
      } else {
        console.log(`  ❌ ${step}: Falhou`)
      }
    }
  }
  
  // Análise de performance
  console.log('\n⚡ PERFORMANCE:')
  let performanceIssues = 0
  for (const [table, result] of Object.entries(validationResults.performance)) {
    if (result.queryTest === false) {
      performanceIssues++
      console.log(`  ⚠️ ${table}: Query falhou`)
    } else if (result.slow) {
      performanceIssues++
      console.log(`  ⚠️ ${table}: Query lenta (${result.duration}ms)`)
    } else if (result.duration) {
      console.log(`  ✅ ${table}: Performance OK (${result.duration}ms)`)
    }
  }
  
  // Análise de conflitos
  console.log('\n🔍 CONFLITOS LEGADOS:')
  let conflictsFound = 0
  for (const [table, result] of Object.entries(validationResults.conflicts)) {
    if (result.exists && result.potentialConflict) {
      conflictsFound++
      console.log(`  ⚠️ ${table}: Conflito potencial detectado`)
    } else if (result.safe) {
      console.log(`  ✅ ${table}: Sem conflitos`)
    }
  }
  
  // Resultado mega-final
  const successRate = totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0
  
  console.log('\n' + '=' .repeat(80))
  console.log('🔥 RESULTADO MEGA-FINAL - MÓDULO DUA COIN 🔥')
  console.log('=' .repeat(80))
  console.log(`📊 Taxa de Sucesso: ${passedTests}/${totalTests} (${successRate}%)`)
  console.log(`🚨 Issues Críticos: ${criticalIssues}`)
  console.log(`⚡ Issues Performance: ${performanceIssues}`)
  console.log(`🔍 Conflitos Detectados: ${conflictsFound}`)
  
  // Classificação ultra-rigorosa
  let classification = ''
  let recommendation = ''
  
  if (criticalIssues === 0 && successRate >= 95) {
    classification = '🏆 MÓDULO DUA COIN: ULTRA-APROVADO!'
    recommendation = '🚀 PRONTO PARA PRODUÇÃO IMEDIATA'
  } else if (criticalIssues === 0 && successRate >= 85) {
    classification = '✅ MÓDULO DUA COIN: APROVADO'
    recommendation = '👍 Pronto para deploy com monitoramento'
  } else if (criticalIssues <= 2 && successRate >= 75) {
    classification = '⚠️ MÓDULO DUA COIN: PARCIALMENTE APROVADO'
    recommendation = '🔧 Correções menores necessárias'
  } else if (criticalIssues <= 5) {
    classification = '❌ MÓDULO DUA COIN: REPROVADO - CORREÇÕES NECESSÁRIAS'
    recommendation = '🚨 Resolver issues críticos antes de prosseguir'
  } else {
    classification = '🚨 MÓDULO DUA COIN: CRÍTICO - REFATORAÇÃO NECESSÁRIA'
    recommendation = '⛔ NÃO DEPLOY ATÉ RESOLVER PROBLEMAS CRÍTICOS'
  }
  
  console.log(`\n${classification}`)
  console.log(`${recommendation}`)
  
  console.log('\n📋 Próximos passos mega-detalhados:')
  if (successRate >= 85 && criticalIssues === 0) {
    console.log('   1. ✅ Executar validação cruzada DUA IA + DUA COIN')
    console.log('   2. 🚀 Preparar deploy de produção')
    console.log('   3. 📊 Configurar monitoramento financeiro')
    console.log('   4. 🔐 Ativar alertas de segurança')
  } else {
    console.log('   1. 🔧 Corrigir problemas críticos identificados')
    console.log('   2. 🧪 Re-executar validação DUA COIN')
    console.log('   3. 🔐 Revisar políticas de segurança')
    console.log('   4. ⚡ Otimizar performance se necessário')
  }
  
  return {
    successRate,
    criticalIssues,
    performanceIssues,
    conflictsFound,
    classification,
    recommendation
  }
}

// ========================================
// EXECUÇÃO MEGA-PRINCIPAL
// ========================================
async function main() {
  try {
    await validateFinancialTableStructure()
    await validateFinancialRLSPolicies()
    await validateFinancialTriggersAndCounters()
    await checkFinancialLegacyConflicts()
    await testFinancialE2EWorkflow()
    const results = await generateMegaReport()
    
    console.log('\n🏁💰 Validação Mega-Completa do Módulo DUA COIN concluída!')
    console.log('🔥🚀 MODO ZVP ULTRA MEGA EXECUTADO COM SUCESSO! 🚀🔥')
    
    return results
    
  } catch (error) {
    console.error('\n🚨�� ERRO MEGA-CRÍTICO na validação financeira:', error)
    console.error('Stack trace:', error.stack)
    process.exit(1)
  }
}

// Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  main()
}

export default main
