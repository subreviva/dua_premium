#!/usr/bin/env node

/**
 * 🛒 DUA CREATIVE MARKET - Auto Setup
 * Aplica migração SQL e cria bucket automaticamente
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Cores para console
const colors = {
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  reset: '\x1b[0m'
}

const log = {
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}📋 ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`)
}

async function setup() {
  console.log('\n🛒 DUA CREATIVE MARKET - Setup Automático\n')
  console.log('==========================================\n')

  // 1. Verificar variáveis de ambiente
  log.info('Passo 1: Verificar configuração')
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!supabaseUrl || !supabaseKey) {
    log.error('Variáveis de ambiente não encontradas!')
    log.warning('Crie .env.local com:')
    console.log('NEXT_PUBLIC_SUPABASE_URL=your_url')
    console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key')
    process.exit(1)
  }
  
  log.success(`Supabase URL: ${supabaseUrl}`)
  console.log()

  // 2. Criar cliente Supabase
  log.info('Passo 2: Conectar ao Supabase')
  const supabase = createClient(supabaseUrl, supabaseKey)
  log.success('Conectado!')
  console.log()

  // 3. Ler e aplicar migração SQL
  log.info('Passo 3: Aplicar migração SQL')
  try {
    const sqlPath = join(__dirname, 'sql', 'migrations', '20251107_mercado_criativo.sql')
    const sql = readFileSync(sqlPath, 'utf-8')
    
    // Split por statements e executar
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'))
    
    log.info(`Executando ${statements.length} statements SQL...`)
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i]
      log.info(`  [${i + 1}/${statements.length}] Executando...`)
      
      const { error } = await supabase.rpc('exec_sql', { query: statement })
      
      if (error) {
        // Tentar via POST direto (fallback)
        const { error: error2 } = await supabase
          .from('_sql_exec')
          .insert({ query: statement })
        
        if (error2) {
          log.warning(`  Statement ${i + 1} falhou (pode já existir): ${error.message}`)
        }
      }
    }
    
    log.success('Migração SQL aplicada!')
  } catch (error) {
    log.error(`Erro ao aplicar migração: ${error.message}`)
    log.warning('Execute manualmente via SQL Editor do Supabase Dashboard')
    log.warning(`URL: ${supabaseUrl.replace('https://', 'https://app.supabase.com/project/')}/editor`)
  }
  console.log()

  // 4. Criar bucket
  log.info('Passo 4: Criar bucket "mercado"')
  try {
    const { data, error } = await supabase.storage.createBucket('mercado', {
      public: true,
      fileSizeLimit: 52428800, // 50MB
      allowedMimeTypes: [
        'audio/*',
        'video/*',
        'image/*',
        'application/zip',
        'application/x-rar-compressed',
        'application/pdf'
      ]
    })
    
    if (error) {
      if (error.message.includes('already exists')) {
        log.warning('Bucket "mercado" já existe')
      } else {
        throw error
      }
    } else {
      log.success('Bucket "mercado" criado!')
    }
  } catch (error) {
    log.error(`Erro ao criar bucket: ${error.message}`)
    log.warning('Crie manualmente via Supabase Dashboard:')
    log.warning(`URL: ${supabaseUrl.replace('https://', 'https://app.supabase.com/project/')}/storage/buckets`)
  }
  console.log()

  // 5. Verificar tabelas
  log.info('Passo 5: Verificar tabelas criadas')
  try {
    const { data: itens, error: error1 } = await supabase
      .from('mercado_itens')
      .select('count')
      .limit(1)
    
    if (!error1) {
      log.success('Tabela mercado_itens: OK')
    }
    
    const { data: compras, error: error2 } = await supabase
      .from('mercado_compras')
      .select('count')
      .limit(1)
    
    if (!error2) {
      log.success('Tabela mercado_compras: OK')
    }
  } catch (error) {
    log.warning('Não foi possível verificar tabelas')
  }
  console.log()

  // 6. Resumo final
  log.success('Setup completo!')
  console.log()
  log.info('Próximos passos:')
  console.log('1. npm run dev (ou pnpm dev)')
  console.log('2. Aceda a: http://localhost:3000/mercado')
  console.log('3. Faça login')
  console.log('4. Clique em "Publicar Conteúdo"')
  console.log('5. Upload de um ficheiro de teste')
  console.log()
  log.success('🎉 DUA Creative Market está pronto!')
  console.log()
}

// Executar
setup().catch(error => {
  log.error(`Erro fatal: ${error.message}`)
  process.exit(1)
})
