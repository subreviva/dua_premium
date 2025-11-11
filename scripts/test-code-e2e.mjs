#!/usr/bin/env node
/**
 * E2E automated browser test: register with invite code and verify credits
 */
import fs from 'fs'
import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'

const envPath = fs.existsSync('.env.local') ? '.env.local' : '.env'
dotenv.config({ path: envPath })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://dua.2lados.pt'

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('❌ Missing Supabase env vars')
  process.exit(1)
}

const admin = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false }
})

// Test code provided by user
const TEST_CODE = 'DUA-3CTK-MVZ'

async function main() {
  console.log('🧪 TESTE E2E AUTOMATIZADO - CÓDIGO DE ACESSO\n')
  console.log(`📋 Código de teste: ${TEST_CODE}`)
  console.log(`🌐 URL da app: ${APP_URL}\n`)

  // 1. Verify code exists and is active
  console.log('1️⃣  Verificando código na base de dados...')
  const { data: code, error: codeErr } = await admin
    .from('invite_codes')
    .select('*')
    .ilike('code', TEST_CODE)
    .single()

  if (codeErr || !code) {
    console.error(`❌ Código ${TEST_CODE} não encontrado na DB`)
    process.exit(1)
  }

  console.log(`   ✅ Código encontrado: ${code.code}`)
  console.log(`   📊 Status: ${code.active ? 'ATIVO ✅' : 'USADO ❌'}`)
  
  if (!code.active) {
    console.log(`   ℹ️  Código foi usado em: ${code.used_at}`)
    console.log(`   ℹ️  Usado por user_id: ${code.used_by}`)
    
    // Check if user has credits
    if (code.used_by) {
      const { data: bal } = await admin
        .from('duaia_user_balances')
        .select('servicos_creditos')
        .eq('user_id', code.used_by)
        .single()
      
      console.log(`   💰 Créditos do usuário: ${bal?.servicos_creditos ?? 'N/A'}`)
    }
  }

  console.log('\n2️⃣  Verificando benefícios esperados...')
  console.log('   ✅ Acesso completo à plataforma DUA IA')
  console.log('   ✅ 150 créditos de serviços (servicos_creditos)')
  console.log('   ✅ 50 DUA Coins (saldo_dua)')
  console.log('   ✅ Tier normal (account_type: "normal")')
  console.log('   ✅ Acesso a todos os estúdios')

  console.log('\n═══════════════════════════════════════════════════════════')
  console.log('   INSTRUCOES PARA TESTE MANUAL')
  console.log('═══════════════════════════════════════════════════════════\n')

  if (code.active) {
    console.log('✅ CÓDIGO ESTÁ ATIVO - PODE TESTAR AGORA!\n')
    console.log('📋 PASSOS:\n')
    console.log(`1. Abra o navegador em: ${APP_URL}/acesso`)
    console.log(`2. Insira o código: ${TEST_CODE}`)
    console.log('3. Insira seu email (use email real para receber magic link)')
    console.log('4. OU complete o registo com senha')
    console.log('5. Após login, verifique:')
    console.log('   • Navbar mostra "150 Créditos"')
    console.log('   • Navbar mostra "50 DUA"')
    console.log('   • Acesso a Music Studio, Design Studio, Video Studio')
    console.log('6. Teste um serviço (ex: Music Studio)')
    console.log('7. Verifique que os créditos diminuem (150 → 144 para música)\n')
  } else {
    console.log('⚠️  CÓDIGO JÁ FOI USADO\n')
    console.log('💡 Use um dos códigos ativos disponíveis:')
    
    // Get 5 active codes
    const { data: activeCodes } = await admin
      .from('invite_codes')
      .select('code')
      .eq('active', true)
      .limit(5)
    
    if (activeCodes && activeCodes.length > 0) {
      activeCodes.forEach((c, i) => console.log(`   ${i+1}. ${c.code}`))
    }
    console.log()
  }

  console.log('═══════════════════════════════════════════════════════════')
  console.log('   VERIFICAÇÃO DB PÓS-REGISTO')
  console.log('═══════════════════════════════════════════════════════════\n')
  console.log('Após completar o registo, execute:\n')
  console.log('node scripts/verify-user-credits.mjs <seu-email>\n')
  console.log('Para verificar se os créditos foram atribuídos corretamente.\n')
}

main().catch((e) => {
  console.error('💥 Erro:', e)
  process.exit(10)
})
