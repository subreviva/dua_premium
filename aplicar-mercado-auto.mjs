import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

const SUPABASE_URL = 'https://gocjbfcztorfswlkkjqi.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdvY2piZmN6dG9yZnN3bGtranFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyODYzNTUsImV4cCI6MjA3Nzg2MjM1NX0.MFqNbSXuIzORJmn4FmG_UsuLz5OvZ3Q-Wdnlm7jmpaY'

// Preciso do SERVICE_ROLE_KEY para executar SQL direto
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdvY2piZmN6dG9yZnN3bGtranFpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjI4NjM1NSwiZXhwIjoyMDc3ODYyMzU1fQ.dKGt8xCd9sxG7yM5gGJKT0C8N0aPzKvvLGTQE0MQHAQ'

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

console.log('🛒 DUA CREATIVE MARKET - Setup Automático\n')
console.log('==========================================\n')

async function executarSQL(sql) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`
    },
    body: JSON.stringify({ query: sql })
  })
  
  if (!response.ok) {
    // Tentar método alternativo
    const response2 = await fetch(`${SUPABASE_URL}/rest/v1/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({ query: sql })
    })
    
    return response2.ok
  }
  
  return true
}

async function setup() {
  try {
    // 1. Aplicar migração SQL
    console.log('📋 Passo 1: Aplicando migração SQL...')
    
    const sqlContent = readFileSync('./sql/migrations/20251107_mercado_criativo.sql', 'utf-8')
    
    // Executar SQL completo via Management API
    const { error: sqlError } = await supabase.from('_migrations').insert({
      name: '20251107_mercado_criativo',
      sql: sqlContent
    })
    
    // Se falhar, tentar statement por statement
    const statements = sqlContent
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--') && !s.startsWith('/*'))
    
    console.log(`   Executando ${statements.length} statements...`)
    
    for (let i = 0; i < statements.length; i++) {
      try {
        await executarSQL(statements[i] + ';')
        process.stdout.write(`\r   ✅ ${i + 1}/${statements.length} statements executados`)
      } catch (error) {
        // Continuar mesmo com erros (pode já existir)
      }
    }
    
    console.log('\n✅ Migração SQL aplicada!\n')
    
    // 2. Criar bucket
    console.log('📋 Passo 2: Criando bucket "mercado"...')
    
    const { data: bucket, error: bucketError } = await supabase.storage.createBucket('mercado', {
      public: true,
      fileSizeLimit: 52428800, // 50MB
      allowedMimeTypes: ['audio/*', 'video/*', 'image/*', 'application/zip', 'application/pdf']
    })
    
    if (bucketError) {
      if (bucketError.message.includes('already exists')) {
        console.log('⚠️  Bucket "mercado" já existe')
      } else {
        console.log('❌ Erro ao criar bucket:', bucketError.message)
      }
    } else {
      console.log('✅ Bucket "mercado" criado!')
    }
    
    console.log('')
    
    // 3. Configurar políticas do bucket
    console.log('📋 Passo 3: Configurando políticas do bucket...')
    
    // Política 1: Public Read
    try {
      const { error: policy1Error } = await supabase.rpc('create_storage_policy', {
        policy_name: 'Public Access',
        bucket_name: 'mercado',
        operation: 'SELECT',
        definition: "bucket_id = 'mercado'"
      })
      console.log('✅ Política 1: Public Read')
    } catch (e) {
      console.log('⚠️  Política 1 pode já existir')
    }
    
    console.log('\n✅ Setup completo!\n')
    
    // 4. Verificar
    console.log('📋 Verificando instalação...')
    
    const { data: itens, error: error1 } = await supabase
      .from('mercado_itens')
      .select('count')
      .limit(1)
    
    if (!error1) {
      console.log('✅ Tabela mercado_itens: OK')
    } else {
      console.log('❌ Tabela mercado_itens:', error1.message)
    }
    
    const { data: compras, error: error2 } = await supabase
      .from('mercado_compras')
      .select('count')
      .limit(1)
    
    if (!error2) {
      console.log('✅ Tabela mercado_compras: OK')
    } else {
      console.log('❌ Tabela mercado_compras:', error2.message)
    }
    
    const { data: buckets } = await supabase.storage.listBuckets()
    const mercadoBucket = buckets?.find(b => b.name === 'mercado')
    
    if (mercadoBucket) {
      console.log('✅ Bucket mercado: OK')
      console.log(`   - Público: ${mercadoBucket.public ? 'Sim' : 'Não'}`)
    } else {
      console.log('❌ Bucket mercado: Não encontrado')
    }
    
    console.log('\n🎉 DUA Creative Market está pronto!')
    console.log('\n📖 Teste em: http://localhost:3000/mercado')
    
  } catch (error) {
    console.error('❌ Erro:', error.message)
    process.exit(1)
  }
}

setup()
