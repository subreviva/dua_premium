#!/usr/bin/env node

/**
 * setup-mercado-full.mjs
 *
 * Automação completa (local):
 * - Executa a migração SQL no Postgres (SUPABASE_DB_URL)
 * - Cria bucket `mercado` e define como público (SUPABASE_SERVICE_ROLE_KEY)
 * - Cria políticas de storage via SQL
 *
 * Segurança: este script exige credenciais sensíveis (SERVICE_ROLE e DATABASE_URL).
 * Execute localmente no seu ambiente seguro. NÃO envie as credenciais por chat.
 *
 * Instalação:
 *   npm install pg @supabase/supabase-js dotenv
 * Execução:
 *   SUPABASE_URL=https://... SUPABASE_SERVICE_ROLE_KEY=... SUPABASE_DB_URL=postgres://... node setup-mercado-full.mjs
 */

import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE
const SUPABASE_DB_URL = process.env.SUPABASE_DB_URL || process.env.DATABASE_URL

const colors = {
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  reset: '\x1b[0m'
}

const log = {
  info: (m) => console.log(`${colors.blue}📋 ${m}${colors.reset}`),
  success: (m) => console.log(`${colors.green}✅ ${m}${colors.reset}`),
  warn: (m) => console.log(`${colors.yellow}⚠️  ${m}${colors.reset}`),
  error: (m) => console.log(`${colors.red}❌ ${m}${colors.reset}`)
}

async function run() {
  log.info('Iniciando setup-mercado-full')

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !SUPABASE_DB_URL) {
    log.error('Faltam variáveis de ambiente necessárias.')
    console.log('Variáveis necessárias:')
    console.log('- SUPABASE_URL (ex: https://xyz.supabase.co)')
    console.log('- SUPABASE_SERVICE_ROLE_KEY (service_role key do projeto)')
    console.log('- SUPABASE_DB_URL (Postgres connection string)')
    console.log('\nExemplo de execução:')
    console.log('SUPABASE_URL=https://xyz.supabase.co SUPABASE_SERVICE_ROLE_KEY=eyJ... SUPABASE_DB_URL=postgres://user:pass@dbhost:5432/postgres node setup-mercado-full.mjs')
    process.exit(1)
  }

  // Import aqui para evitar carregar sem as envs
  const { Client } = await import('pg')
  const { createClient } = await import('@supabase/supabase-js')

  // 1) Aplicar migração SQL via Postgres
  const sqlPath = join(__dirname, 'sql', 'migrations', '20251107_mercado_criativo.sql')
  let sql
  try {
    sql = readFileSync(sqlPath, 'utf-8')
  } catch (err) {
    log.error(`Não foi possível ler o ficheiro SQL: ${sqlPath}`)
    log.error(err.message)
    process.exit(1)
  }

  const pgClient = new Client({ connectionString: SUPABASE_DB_URL })
  try {
    log.info('Conectando à base de dados Postgres...')
    await pgClient.connect()
    log.success('Conectado ao Postgres')

    log.info('Iniciando transação e aplicando migração SQL...')
    await pgClient.query('BEGIN')

    // Executar todo o SQL dentro de uma única transação
    await pgClient.query(sql)

    await pgClient.query('COMMIT')
    log.success('Migração SQL aplicada com sucesso')
  } catch (err) {
    log.error('Erro ao aplicar migração SQL. Tentando rollback...')
    try { await pgClient.query('ROLLBACK') } catch (e) { /* ignore */ }
    log.error(err.message)
    await pgClient.end()
    process.exit(1)
  }

  // 2) Criar bucket Mercado via Supabase Admin (service_role)
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false }
  })

  try {
    log.info('Criando bucket "mercado" (se não existir)...')
    const { data, error } = await supabase.storage.createBucket('mercado', { public: true })
    if (error) {
      // se já existir, supabase retorna error
      if (error.message && error.message.toLowerCase().includes('already exists')) {
        log.warn('Bucket "mercado" já existe — a operação continua.')
      } else {
        throw error
      }
    } else {
      log.success('Bucket "mercado" criado com sucesso')
    }
  } catch (err) {
    log.error(`Erro ao criar bucket: ${err.message}`)
    log.warn('Verifique se a SUPABASE_SERVICE_ROLE_KEY está correta e com permissões de admin')
    // não fatal — continuar para aplicar políticas via SQL caso possível
  }

  // 3) Criar políticas de Storage via SQL (storage.objects)
  // Nota: estas policies escrevem diretamente na tabela storage.objects
  try {
    log.info('Criando políticas do bucket via SQL...')
    const policies = `
-- Public read
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE polname = 'public_access_storage_objects') THEN
    CREATE POLICY public_access_storage_objects ON storage.objects FOR SELECT
    USING (bucket_id = 'mercado');
  END IF;
END $$;

-- Authenticated upload (INSERT)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE polname = 'authenticated_upload_storage_objects') THEN
    CREATE POLICY authenticated_upload_storage_objects ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'mercado' AND auth.role() = 'authenticated');
  END IF;
END $$;

-- User delete own (DELETE)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE polname = 'user_delete_own_storage_objects') THEN
    CREATE POLICY user_delete_own_storage_objects ON storage.objects FOR DELETE
    USING (bucket_id = 'mercado' AND auth.uid() = owner);
  END IF;
END $$;
`

    await pgClient.query(policies)
    log.success('Políticas criadas (ou já existiam)')
  } catch (err) {
    log.warn('Falha ao criar políticas via SQL — talvez já existam ou a tabela não permita.')
    log.warn(err.message)
  }

  // 4) Conferir que as tabelas do mercado existem
  try {
    log.info('Verificando existência das tabelas mercado_itens e mercado_compras...')
    const res1 = await pgClient.query(`SELECT to_regclass('public.mercado_itens') AS exists`) 
    const res2 = await pgClient.query(`SELECT to_regclass('public.mercado_compras') AS exists`)
    const e1 = res1.rows[0].exists
    const e2 = res2.rows[0].exists
    if (e1) log.success('Tabela mercado_itens encontrada')
    else log.warn('Tabela mercado_itens NÃO encontrada')
    if (e2) log.success('Tabela mercado_compras encontrada')
    else log.warn('Tabela mercado_compras NÃO encontrada')
  } catch (err) {
    log.warn('Erro a verificar tabelas: ' + err.message)
  }

  // Fechar conexão Postgres
  try { await pgClient.end() } catch (e) { /* ignore */ }

  log.success('Setup automático concluído')
  console.log('\nPróximos passos:')
  console.log('- Iniciar aplicação local: npm run dev')
  console.log('- Aceder: http://localhost:3000/mercado')
  console.log('- Testar upload e compra com dois utilizadores')
  console.log('\nNota: Execute este script localmente em ambiente seguro com as variáveis de ambiente definidas.')
}

run().catch(err => {
  console.error('Erro fatal:', err)
  process.exit(1)
})
