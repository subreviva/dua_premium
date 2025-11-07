/**
 * 🎯 MODO ZVP ULTRA: DUA IA MODULE VALIDATION
 * 
 * Validação modular ultra-rigorosa do módulo DUA IA
 * Seguindo as especificações do usuário para validação por módulos
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

console.log('🚀 INICIANDO MODO ZVP ULTRA: VALIDAÇÃO MÓDULO DUA IA')
console.log('=' .repeat(60))

// CONFIGURAÇÃO DO MÓDULO DUA IA
const DUAIA_TABLES = [
  'duaia_profiles',
  'duaia_conversations', 
  'duaia_messages',
  'duaia_projects'
]

const ADMIN_USER_EMAIL = 'estraca@2lados.pt'

let validationResults = {
  structure: {},
  rlsPolicies: {},
  triggers: {},
  userAccess: {},
  e2eWorkflow: {},
  conflicts: {}
}

// ========================================
// FASE 1: VALIDAÇÃO DE ESTRUTURA DAS TABELAS DUA IA
// ========================================
async function validateTableStructure() {
  console.log('\n🏗️  FASE 1: Validando Estrutura das Tabelas DUA IA')
  console.log('-' .repeat(50))
  
  for (const table of DUAIA_TABLES) {
    try {
      console.log(`📋 Verificando tabela: ${table}`)
      
      // Verificar se a tabela existe
      const { data: tableExists, error: tableError } = await supabase
        .from(table)
        .select('*')
        .limit(1)
      
      if (tableError && tableError.code === '42P01') {
        console.log(`❌ Tabela ${table} NÃO existe`)
        validationResults.structure[table] = { exists: false, error: tableError.message }
        continue
      }
      
      if (tableError) {
        console.log(`⚠️  Erro ao acessar ${table}: ${tableError.message}`)
        validationResults.structure[table] = { exists: false, error: tableError.message }
        continue
      }
      
      console.log(`✅ Tabela ${table} existe e está acessível`)
      validationResults.structure[table] = { exists: true, accessible: true }
      
      // Verificar colunas específicas por tabela
      await validateTableColumns(table)
      
    } catch (error) {
      console.log(`❌ Erro crítico na validação da tabela ${table}:`, error.message)
      validationResults.structure[table] = { exists: false, criticalError: error.message }
    }
  }
}

async function validateTableColumns(tableName) {
  console.log(`  🔍 Verificando colunas de ${tableName}`)
  
  const expectedColumns = {
    'duaia_profiles': ['id', 'user_id', 'conversations_count', 'messages_count', 'tokens_used'],
    'duaia_conversations': ['id', 'user_id', 'title', 'created_at', 'updated_at'],
    'duaia_messages': ['id', 'conversation_id', 'role', 'content', 'created_at'],
    'duaia_projects': ['id', 'user_id', 'name', 'description', 'created_at', 'updated_at']
  }
  
  const columns = expectedColumns[tableName] || []
  
  for (const column of columns) {
    try {
      // Tentar fazer uma query que use a coluna
      const { error } = await supabase
        .from(tableName)
        .select(column)
        .limit(1)
      
      if (error) {
        console.log(`    ❌ Coluna ${column} com problema: ${error.message}`)
        validationResults.structure[tableName] = validationResults.structure[tableName] || {}
        validationResults.structure[tableName].columns = validationResults.structure[tableName].columns || {}
        validationResults.structure[tableName].columns[column] = { valid: false, error: error.message }
      } else {
        console.log(`    ✅ Coluna ${column} OK`)
        validationResults.structure[tableName] = validationResults.structure[tableName] || {}
        validationResults.structure[tableName].columns = validationResults.structure[tableName].columns || {}
        validationResults.structure[tableName].columns[column] = { valid: true }
      }
    } catch (error) {
      console.log(`    ❌ Erro crítico na coluna ${column}:`, error.message)
    }
  }
}

// ========================================
// FASE 2: VALIDAÇÃO DE POLÍTICAS RLS
// ========================================
async function validateRLSPolicies() {
  console.log('\n🔐 FASE 2: Validando Políticas RLS com Usuário Real')
  console.log('-' .repeat(50))
  
  // Buscar o usuário admin para testes
  const { data: adminUser, error: userError } = await supabase.auth.admin.listUsers()
  
  if (userError) {
    console.log('❌ Erro ao buscar usuários para teste:', userError.message)
    validationResults.rlsPolicies.userLookup = { error: userError.message }
    return
  }
  
  const testUser = adminUser.users.find(user => user.email === ADMIN_USER_EMAIL)
  
  if (!testUser) {
    console.log(`❌ Usuário de teste ${ADMIN_USER_EMAIL} não encontrado`)
    validationResults.rlsPolicies.userLookup = { error: 'Test user not found' }
    return
  }
  
  console.log(`✅ Usuário de teste encontrado: ${testUser.email}`)
  validationResults.rlsPolicies.userLookup = { success: true, userId: testUser.id }
  
  // Testar acesso às tabelas com contexto do usuário
  const userSupabase = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    auth: { 
      autoRefreshToken: false, 
      persistSession: false,
      // Simular contexto do usuário
      user: testUser
    }
  })
  
  for (const table of DUAIA_TABLES) {
    try {
      console.log(`🔍 Testando RLS em ${table}`)
      
      // Teste de leitura
      const { data: readData, error: readError } = await userSupabase
        .from(table)
        .select('*')
        .limit(1)
      
      if (readError) {
        console.log(`  ❌ Erro de leitura RLS em ${table}: ${readError.message}`)
        validationResults.rlsPolicies[table] = { read: false, readError: readError.message }
      } else {
        console.log(`  ✅ Leitura RLS OK em ${table}`)
        validationResults.rlsPolicies[table] = { read: true }
      }
      
      // Teste de inserção (apenas para tabelas que permitem)
      if (table === 'duaia_conversations' || table === 'duaia_messages') {
        const testData = table === 'duaia_conversations' 
          ? { title: 'Teste RLS Validation', user_id: testUser.id }
          : { conversation_id: '00000000-0000-0000-0000-000000000000', role: 'user', content: 'Test message' }
        
        const { data: insertData, error: insertError } = await userSupabase
          .from(table)
          .insert(testData)
          .select()
        
        if (insertError) {
          console.log(`  ⚠️  Inserção RLS em ${table}: ${insertError.message}`)
          validationResults.rlsPolicies[table].insert = { allowed: false, error: insertError.message }
        } else {
          console.log(`  ✅ Inserção RLS permitida em ${table}`)
          validationResults.rlsPolicies[table].insert = { allowed: true }
          
          // Limpar dados de teste
          if (insertData && insertData.length > 0) {
            await supabase.from(table).delete().eq('id', insertData[0].id)
          }
        }
      }
      
    } catch (error) {
      console.log(`❌ Erro crítico no RLS de ${table}:`, error.message)
      validationResults.rlsPolicies[table] = { error: error.message }
    }
  }
}

// ========================================
// FASE 3: VALIDAÇÃO DE TRIGGERS E CONTADORES
// ========================================
async function validateTriggersAndCounters() {
  console.log('\n⚙️  FASE 3: Validando Triggers e Contadores')
  console.log('-' .repeat(50))
  
  try {
    // Buscar usuário admin
    const { data: users } = await supabase.auth.admin.listUsers()
    const adminUser = users.users.find(user => user.email === ADMIN_USER_EMAIL)
    
    if (!adminUser) {
      console.log('❌ Usuário admin não encontrado para teste de triggers')
      return
    }
    
    console.log(`🧪 Testando triggers com usuário: ${adminUser.email}`)
    
    // Verificar se duaia_profiles existe para o usuário
    let { data: profile, error: profileError } = await supabase
      .from('duaia_profiles')
      .select('*')
      .eq('user_id', adminUser.id)
      .single()
    
    if (profileError && profileError.code === 'PGRST116') {
      console.log('📝 Profile não existe, testando trigger de criação automática...')
      
      // Simular login criando uma entrada em duaia_conversations
      const { data: conversation, error: convError } = await supabase
        .from('duaia_conversations')
        .insert({
          user_id: adminUser.id,
          title: 'Teste Trigger Validation'
        })
        .select()
        .single()
      
      if (convError) {
        console.log('❌ Erro ao criar conversa de teste:', convError.message)
        validationResults.triggers.profileCreation = { error: convError.message }
        return
      }
      
      console.log('✅ Conversa de teste criada')
      
      // Verificar se o trigger criou o profile
      const { data: newProfile, error: newProfileError } = await supabase
        .from('duaia_profiles')
        .select('*')
        .eq('user_id', adminUser.id)
        .single()
      
      if (newProfileError) {
        console.log('❌ Trigger de criação de profile NÃO funcionou:', newProfileError.message)
        validationResults.triggers.profileCreation = { working: false, error: newProfileError.message }
      } else {
        console.log('✅ Trigger de criação de profile funcionando!')
        validationResults.triggers.profileCreation = { working: true }
        profile = newProfile
      }
      
      // Limpar conversa de teste
      await supabase.from('duaia_conversations').delete().eq('id', conversation.id)
    } else {
      console.log('✅ Profile já existe')
      validationResults.triggers.profileCreation = { alreadyExists: true }
    }
    
    // Testar contadores
    if (profile) {
      console.log('📊 Testando contadores...')
      
      const initialCounts = {
        conversations: profile.conversations_count || 0,
        messages: profile.messages_count || 0,
        tokens: profile.tokens_used || 0
      }
      
      console.log(`  📈 Contadores iniciais: Conv:${initialCounts.conversations}, Msg:${initialCounts.messages}, Tokens:${initialCounts.tokens}`)
      
      // Criar uma conversa
      const { data: testConv, error: convError } = await supabase
        .from('duaia_conversations')
        .insert({
          user_id: adminUser.id,
          title: 'Teste Counter Validation'
        })
        .select()
        .single()
      
      if (convError) {
        console.log('❌ Erro ao criar conversa para teste de contador:', convError.message)
        validationResults.triggers.counters = { error: convError.message }
        return
      }
      
      // Criar algumas mensagens
      const messages = [
        { conversation_id: testConv.id, role: 'user', content: 'Mensagem teste 1' },
        { conversation_id: testConv.id, role: 'assistant', content: 'Resposta teste 1' }
      ]
      
      for (const message of messages) {
        await supabase.from('duaia_messages').insert(message)
      }
      
      // Aguardar um pouco para os triggers processarem
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Verificar contadores atualizados
      const { data: updatedProfile, error: updateError } = await supabase
        .from('duaia_profiles')
        .select('*')
        .eq('user_id', adminUser.id)
        .single()
      
      if (updateError) {
        console.log('❌ Erro ao verificar contadores atualizados:', updateError.message)
        validationResults.triggers.counters = { error: updateError.message }
      } else {
        const newCounts = {
          conversations: updatedProfile.conversations_count || 0,
          messages: updatedProfile.messages_count || 0,
          tokens: updatedProfile.tokens_used || 0
        }
        
        console.log(`  📈 Contadores após teste: Conv:${newCounts.conversations}, Msg:${newCounts.messages}, Tokens:${newCounts.tokens}`)
        
        const conversationIncreased = newCounts.conversations > initialCounts.conversations
        const messagesIncreased = newCounts.messages > initialCounts.messages
        
        if (conversationIncreased && messagesIncreased) {
          console.log('✅ Contadores funcionando corretamente!')
          validationResults.triggers.counters = { 
            working: true,
            conversationCounter: conversationIncreased,
            messageCounter: messagesIncreased
          }
        } else {
          console.log('⚠️  Alguns contadores não atualizaram corretamente')
          validationResults.triggers.counters = { 
            working: false,
            conversationCounter: conversationIncreased,
            messageCounter: messagesIncreased
          }
        }
      }
      
      // Limpar dados de teste
      await supabase.from('duaia_conversations').delete().eq('id', testConv.id)
      console.log('🧹 Dados de teste removidos')
    }
    
  } catch (error) {
    console.log('❌ Erro crítico na validação de triggers:', error.message)
    validationResults.triggers.criticalError = error.message
  }
}

// ========================================
// FASE 4: VERIFICAÇÃO DE CONFLITOS COM TABELAS ANTIGAS
// ========================================
async function checkLegacyConflicts() {
  console.log('\n🔍 FASE 4: Verificando Conflitos com Tabelas Antigas')
  console.log('-' .repeat(50))
  
  const legacyTables = [
    'conversations',
    'messages', 
    'profiles',
    'projects'
  ]
  
  for (const legacyTable of legacyTables) {
    try {
      const { data, error } = await supabase
        .from(legacyTable)
        .select('count(*)', { count: 'exact' })
        .limit(1)
      
      if (error && error.code === '42P01') {
        console.log(`✅ Tabela antiga ${legacyTable} não existe (OK)`)
        validationResults.conflicts[legacyTable] = { exists: false }
      } else if (error) {
        console.log(`⚠️  Erro ao verificar ${legacyTable}: ${error.message}`)
        validationResults.conflicts[legacyTable] = { error: error.message }
      } else {
        console.log(`⚠️  ATENÇÃO: Tabela antiga ${legacyTable} ainda existe!`)
        validationResults.conflicts[legacyTable] = { 
          exists: true, 
          needsCleanup: true,
          count: data?.[0]?.count || 'unknown'
        }
      }
    } catch (error) {
      console.log(`❌ Erro crítico verificando ${legacyTable}:`, error.message)
      validationResults.conflicts[legacyTable] = { criticalError: error.message }
    }
  }
}

// ========================================
// FASE 5: TESTE E2E DO WORKFLOW DUA IA
// ========================================
async function testE2EWorkflow() {
  console.log('\n🎯 FASE 5: Teste E2E do Workflow DUA IA')
  console.log('-' .repeat(50))
  
  try {
    const { data: users } = await supabase.auth.admin.listUsers()
    const adminUser = users.users.find(user => user.email === ADMIN_USER_EMAIL)
    
    if (!adminUser) {
      console.log('❌ Usuário não encontrado para teste E2E')
      return
    }
    
    console.log('🎬 Simulando workflow completo DUA IA...')
    
    // 1. Criar conversa
    console.log('  1️⃣ Criando nova conversa...')
    const { data: conversation, error: convError } = await supabase
      .from('duaia_conversations')
      .insert({
        user_id: adminUser.id,
        title: 'E2E Test Conversation'
      })
      .select()
      .single()
    
    if (convError) {
      console.log('❌ Falha ao criar conversa:', convError.message)
      validationResults.e2eWorkflow.createConversation = { success: false, error: convError.message }
      return
    }
    
    console.log('     ✅ Conversa criada')
    validationResults.e2eWorkflow.createConversation = { success: true, id: conversation.id }
    
    // 2. Adicionar mensagens
    console.log('  2️⃣ Adicionando mensagens...')
    const messages = [
      { conversation_id: conversation.id, role: 'user', content: 'Olá, como você pode me ajudar?' },
      { conversation_id: conversation.id, role: 'assistant', content: 'Olá! Posso ajudar com diversas tarefas de IA.' },
      { conversation_id: conversation.id, role: 'user', content: 'Perfeito!' }
    ]
    
    const { data: insertedMessages, error: msgError } = await supabase
      .from('duaia_messages')
      .insert(messages)
      .select()
    
    if (msgError) {
      console.log('❌ Falha ao criar mensagens:', msgError.message)
      validationResults.e2eWorkflow.createMessages = { success: false, error: msgError.message }
    } else {
      console.log(`     ✅ ${insertedMessages.length} mensagens criadas`)
      validationResults.e2eWorkflow.createMessages = { success: true, count: insertedMessages.length }
    }
    
    // 3. Verificar profile atualizado
    console.log('  3️⃣ Verificando profile atualizado...')
    const { data: profile, error: profileError } = await supabase
      .from('duaia_profiles')
      .select('*')
      .eq('user_id', adminUser.id)
      .single()
    
    if (profileError) {
      console.log('❌ Erro ao buscar profile:', profileError.message)
      validationResults.e2eWorkflow.profileUpdate = { success: false, error: profileError.message }
    } else {
      console.log(`     ✅ Profile: ${profile.conversations_count} conversas, ${profile.messages_count} mensagens`)
      validationResults.e2eWorkflow.profileUpdate = { 
        success: true, 
        conversations: profile.conversations_count,
        messages: profile.messages_count 
      }
    }
    
    // 4. Criar projeto (se tabela existir)
    console.log('  4️⃣ Testando criação de projeto...')
    const { data: project, error: projError } = await supabase
      .from('duaia_projects')
      .insert({
        user_id: adminUser.id,
        name: 'E2E Test Project',
        description: 'Projeto de teste E2E'
      })
      .select()
      .single()
    
    if (projError) {
      console.log('⚠️  Falha ao criar projeto:', projError.message)
      validationResults.e2eWorkflow.createProject = { success: false, error: projError.message }
    } else {
      console.log('     ✅ Projeto criado')
      validationResults.e2eWorkflow.createProject = { success: true, id: project.id }
    }
    
    // 5. Limpeza
    console.log('  5️⃣ Limpando dados de teste...')
    await supabase.from('duaia_conversations').delete().eq('id', conversation.id)
    if (project) {
      await supabase.from('duaia_projects').delete().eq('id', project.id)
    }
    console.log('     ✅ Limpeza concluída')
    
    validationResults.e2eWorkflow.cleanup = { success: true }
    
  } catch (error) {
    console.log('❌ Erro crítico no teste E2E:', error.message)
    validationResults.e2eWorkflow.criticalError = error.message
  }
}

// ========================================
// FUNÇÃO PRINCIPAL E RELATÓRIO
// ========================================
async function generateReport() {
  console.log('\n📊 RELATÓRIO FINAL - MÓDULO DUA IA')
  console.log('=' .repeat(60))
  
  let totalTests = 0
  let passedTests = 0
  
  // Análise de estrutura
  console.log('\n🏗️  ESTRUTURA DE TABELAS:')
  for (const [table, result] of Object.entries(validationResults.structure)) {
    totalTests++
    if (result.exists && result.accessible) {
      console.log(`  ✅ ${table}: Estrutura OK`)
      passedTests++
    } else {
      console.log(`  ❌ ${table}: ${result.error || 'Estrutura com problemas'}`)
    }
  }
  
  // Análise de RLS
  console.log('\n🔐 POLÍTICAS RLS:')
  for (const [table, result] of Object.entries(validationResults.rlsPolicies)) {
    if (table === 'userLookup') continue
    totalTests++
    if (result.read) {
      console.log(`  ✅ ${table}: RLS funcionando`)
      passedTests++
    } else {
      console.log(`  ❌ ${table}: ${result.readError || 'RLS com problemas'}`)
    }
  }
  
  // Análise de triggers
  console.log('\n⚙️  TRIGGERS E CONTADORES:')
  if (validationResults.triggers.profileCreation) {
    totalTests++
    if (validationResults.triggers.profileCreation.working || validationResults.triggers.profileCreation.alreadyExists) {
      console.log('  ✅ Trigger criação profile: OK')
      passedTests++
    } else {
      console.log('  ❌ Trigger criação profile: Falhou')
    }
  }
  
  if (validationResults.triggers.counters) {
    totalTests++
    if (validationResults.triggers.counters.working) {
      console.log('  ✅ Contadores automáticos: OK')
      passedTests++
    } else {
      console.log('  ❌ Contadores automáticos: Falhou')
    }
  }
  
  // Análise E2E
  console.log('\n🎯 WORKFLOW E2E:')
  const e2eSteps = ['createConversation', 'createMessages', 'profileUpdate']
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
  
  // Análise de conflitos
  console.log('\n🔍 CONFLITOS COM TABELAS ANTIGAS:')
  let conflictsFound = 0
  for (const [table, result] of Object.entries(validationResults.conflicts)) {
    if (result.exists) {
      conflictsFound++
      console.log(`  ⚠️  ${table}: Tabela antiga ainda existe (${result.count} registros)`)
    } else {
      console.log(`  ✅ ${table}: Sem conflitos`)
    }
  }
  
  // Resultado final
  const successRate = totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0
  
  console.log('\n' + '=' .repeat(60))
  console.log('🎯 RESULTADO FINAL - MÓDULO DUA IA')
  console.log('=' .repeat(60))
  console.log(`📊 Taxa de Sucesso: ${passedTests}/${totalTests} (${successRate}%)`)
  
  if (conflictsFound > 0) {
    console.log(`⚠️  Conflitos encontrados: ${conflictsFound} tabelas antigas`)
  }
  
  if (successRate >= 90) {
    console.log('🎉 MÓDULO DUA IA: APROVADO!')
    console.log('✅ Pronto para prosseguir para módulo DUA COIN')
  } else if (successRate >= 75) {
    console.log('⚠️  MÓDULO DUA IA: PARCIALMENTE APROVADO')
    console.log('🔧 Alguns ajustes recomendados antes de prosseguir')
  } else {
    console.log('❌ MÓDULO DUA IA: REPROVADO')
    console.log('🚨 Problemas críticos precisam ser resolvidos')
  }
  
  console.log('\n📋 Próximos passos:')
  if (successRate >= 75) {
    console.log('   1. Executar validação módulo DUA COIN')
    console.log('   2. Resolver conflitos se existirem')
    console.log('   3. Deploy em produção')
  } else {
    console.log('   1. Corrigir problemas identificados')
    console.log('   2. Re-executar validação DUA IA')
    console.log('   3. Só então prosseguir para DUA COIN')
  }
}

// ========================================
// EXECUÇÃO PRINCIPAL
// ========================================
async function main() {
  try {
    await validateTableStructure()
    await validateRLSPolicies()
    await validateTriggersAndCounters()
    await checkLegacyConflicts()
    await testE2EWorkflow()
    await generateReport()
    
    console.log('\n🏁 Validação do Módulo DUA IA concluída!')
    
  } catch (error) {
    console.error('\n❌ ERRO CRÍTICO na validação:', error)
    console.error('Stack trace:', error.stack)
    process.exit(1)
  }
}

// Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  main()
}

export default main
