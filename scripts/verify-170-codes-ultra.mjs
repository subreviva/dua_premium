#!/usr/bin/env node
/**
 * Ultra-rigoroso: verify all 170 invite codes exist in DB and check status
 */
import fs from 'fs'
import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'

const envPath = fs.existsSync('.env.local') ? '.env.local' : '.env'
dotenv.config({ path: envPath })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('❌ Missing Supabase env vars')
  process.exit(1)
}

const admin = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false }
})

const EXPECTED_CODES = [
  'DUA-03BN-9QT', 'DUA-044P-OYM', 'DUA-09P2-GDD', 'DUA-11SF-3GX', 'DUA-11UF-1ZR',
  'DUA-17OL-JNL', 'DUA-17Q2-DCZ', 'DUA-1AG9-T4T', 'DUA-1F71-A68', 'DUA-1KVM-WND',
  'DUA-1WG9-7U7', 'DUA-2OZG-PSG', 'DUA-2PH0-G3I', 'DUA-2TEJ-SK9', 'DUA-352J-L4R',
  'DUA-3CTK-MVZ', 'DUA-3E3Z-CR1', 'DUA-3FUG-4QE', 'DUA-3UKV-FA8', 'DUA-44MD-4VD',
  'DUA-4ASV-JAN', 'DUA-4L9D-PR5', 'DUA-578K-5QX', 'DUA-58FX-ZAP', 'DUA-595N-EWJ',
  'DUA-5DG2-MHJ', 'DUA-5GDU-GU4', 'DUA-5HX2-OTO', 'DUA-5ME0-1UZ', 'DUA-5MEO-FFQ',
  'DUA-5T39-ON3', 'DUA-6AAL-KAW', 'DUA-6FQ8-0ZR', 'DUA-6IXL-JID', 'DUA-6SCP-2AR',
  'DUA-6XTN-9NK', 'DUA-6Z1U-9PT', 'DUA-7EUY-DZR', 'DUA-7F5Q-H6A', 'DUA-7FSW-HQH',
  'DUA-7N7T-LD7', 'DUA-8HC5-7SM', 'DUA-8NET-YUG', 'DUA-8O80-GKM', 'DUA-8T1M-4J5',
  'DUA-9P5N-QG0', 'DUA-9S9L-D3W', 'DUA-A77V-408', 'DUA-A7IE-4G4', 'DUA-B5KG-MDT',
  'DUA-B6OT-18R', 'DUA-B7TZ-SRS', 'DUA-BISN-J7T', 'DUA-CJBX-MVP', 'DUA-COPC-B57',
  'DUA-D164-YBU', 'DUA-D5PU-4O2', 'DUA-D7ST-NZR', 'DUA-DC94-L6M', 'DUA-DPOE-8GD',
  'DUA-DS9H-THR', 'DUA-DW7K-F3R', 'DUA-DWE8-MUM', 'DUA-EZS1-2WZ', 'DUA-F1WZ-QN2',
  'DUA-FS8I-EZT', 'DUA-FUG1-XRG', 'DUA-G7WJ-FGS', 'DUA-GFYE-A04', 'DUA-GHVM-R78',
  'DUA-GKD7-2BR', 'DUA-GUFZ-0TT', 'DUA-I3BP-FJC', 'DUA-ICJH-5CO', 'DUA-IFAL-T5L',
  'DUA-IVZX-8A8', 'DUA-J4G2-VLJ', 'DUA-JCZK-A5A', 'DUA-JDVL-FTY', 'DUA-JL3M-FY3',
  'DUA-JNK9-22G', 'DUA-JXC1-Z12', 'DUA-JY3R-IOE', 'DUA-K5JE-H8K', 'DUA-K89W-NE7',
  'DUA-KAWU-ZWV', 'DUA-KJ6G-UCM', 'DUA-KON4-TGW', 'DUA-KRTT-BMU', 'DUA-L8JQ-UX5',
  'DUA-LA1J-SEW', 'DUA-LG12-ZO3', 'DUA-LKDW-PIT', 'DUA-LO44-C89', 'DUA-LOXY-Q41',
  'DUA-LWOW-T1Y', 'DUA-LZMS-6FO', 'DUA-MAA6-QIO', 'DUA-MDDY-PIW', 'DUA-MGP7-MA5',
  'DUA-MJ45-2XO', 'DUA-MLD2-2UM', 'DUA-MNVM-LHW', 'DUA-MTVV-V38', 'DUA-MU56-Z05',
  'DUA-MUTS-JSV', 'DUA-N0AP-HWB', 'DUA-N0WJ-XLG', 'DUA-N9SE-4C1', 'DUA-NJFT-HH8',
  'DUA-NL2B-7NK', 'DUA-NL8B-MJS', 'DUA-NORV-63I', 'DUA-NVM9-ESS', 'DUA-NVYT-G77',
  'DUA-NWUS-5SG', 'DUA-NYB3-4PF', 'DUA-O8T0-M9P', 'DUA-OLGI-Q24', 'DUA-OO81-UP4',
  'DUA-PC2X-2NY', 'DUA-PJ8I-9BN', 'DUA-PKQU-6XP', 'DUA-Q32A-SW3', 'DUA-Q4Q8-18T',
  'DUA-QF11-UWY', 'DUA-QTQ0-RMJ', 'DUA-QULD-ZO8', 'DUA-R0R9-FTT', 'DUA-R9IP-A9A',
  'DUA-REKC-XIP', 'DUA-RM5K-KIQ', 'DUA-RO7R-578', 'DUA-RYIN-TAC', 'DUA-S1HE-BM9',
  'DUA-S8VM-GCH', 'DUA-SS9O-3N5', 'DUA-SZY0-37F', 'DUA-T8H5-240', 'DUA-TH5G-4OB',
  'DUA-TMGC-L07', 'DUA-TQY2-L5H', 'DUA-TWT8-4U1', 'DUA-TXPY-5KF', 'DUA-TZ3L-03T',
  'DUA-U450-QT6', 'DUA-U5YA-J46', 'DUA-UI2I-83Y', 'DUA-UNSP-K53', 'DUA-US35-PBZ',
  'DUA-UWTP-HHP', 'DUA-V3I6-RPH', 'DUA-V58K-LF0', 'DUA-VB8L-2RB', 'DUA-VCJQ-N9F',
  'DUA-VDY7-A55', 'DUA-VI43-SGG', 'DUA-VV41-4D5', 'DUA-W0E2-3II', 'DUA-WEPL-437',
  'DUA-WZY0-3MJ', 'DUA-XDZN-I5I', 'DUA-XE2X-W1E', 'DUA-XH7J-B6X', 'DUA-XYTJ-M6R',
  'DUA-YC38-04D', 'DUA-ZDSQ-45B', 'DUA-ZL1Z-CAF', 'DUA-ZLJZ-3TH', 'DUA-ZPZW-3QS'
]

async function main() {
  console.log('🔍 Verificando 170 códigos de acesso...\n')

  // Fetch all codes from DB
  const { data: dbCodes, error } = await admin
    .from('invite_codes')
    .select('code, active, used_by, used_at, created_at')
    .order('code')

  if (error) {
    console.error('❌ Erro ao buscar códigos:', error)
    process.exit(1)
  }

  const dbCodeMap = new Map(dbCodes.map(c => [c.code.toUpperCase(), c]))
  
  let allPresent = true
  let activeCount = 0
  let usedCount = 0
  const missing = []
  const statusSummary = []

  for (const code of EXPECTED_CODES) {
    const dbCode = dbCodeMap.get(code.toUpperCase())
    if (!dbCode) {
      allPresent = false
      missing.push(code)
      console.log(`❌ FALTA: ${code}`)
    } else {
      if (dbCode.active) {
        activeCount++
        statusSummary.push(`✅ ${code} - ATIVO`)
      } else {
        usedCount++
        statusSummary.push(`🔒 ${code} - USADO (${dbCode.used_at ? new Date(dbCode.used_at).toLocaleDateString('pt-PT') : 'data desconhecida'})`)
      }
    }
  }

  console.log('\n═══════════════════════════════════════════════════════════')
  console.log('   RELATÓRIO ULTRA-RIGOROSO - 170 CÓDIGOS')
  console.log('═══════════════════════════════════════════════════════════\n')

  console.log(`📊 Total esperado: ${EXPECTED_CODES.length}`)
  console.log(`📊 Total na DB: ${dbCodes.length}`)
  console.log(`✅ Códigos ativos: ${activeCount}`)
  console.log(`🔒 Códigos usados: ${usedCount}`)
  console.log(`❌ Códigos em falta: ${missing.length}\n`)

  if (missing.length > 0) {
    console.log('❌ CÓDIGOS EM FALTA:')
    missing.forEach(c => console.log(`   • ${c}`))
    console.log()
  }

  if (allPresent) {
    console.log('✅ TODOS OS 170 CÓDIGOS ESTÃO NA BASE DE DADOS!\n')
  }

  // Show first 10 active codes for testing
  const activeCodes = dbCodes.filter(c => c.active).slice(0, 10)
  if (activeCodes.length > 0) {
    console.log('🎯 CÓDIGOS ATIVOS PARA TESTE (primeiros 10):')
    activeCodes.forEach((c, i) => console.log(`   ${String(i+1).padStart(2, '0')}. ${c.code}`))
    console.log()
  }

  // Pick one random active code for E2E test
  if (activeCount > 0) {
    const randomActive = dbCodes.filter(c => c.active)[Math.floor(Math.random() * activeCount)]
    console.log('═══════════════════════════════════════════════════════════')
    console.log('   TESTE E2E RECOMENDADO')
    console.log('═══════════════════════════════════════════════════════════\n')
    console.log(`🎲 Código aleatório selecionado: ${randomActive.code}`)
    console.log('\n📋 PASSOS PARA TESTE MANUAL:\n')
    console.log('1. Abra: https://dua.2lados.pt/acesso')
    console.log(`2. Insira o código: ${randomActive.code}`)
    console.log('3. Insira seu email')
    console.log('4. Complete o registo')
    console.log('5. Verifique que recebeu 150 créditos de serviços')
    console.log('6. Teste um serviço (ex: música) e confirme dedução\n')
    console.log('═══════════════════════════════════════════════════════════\n')
  } else {
    console.log('⚠️  NENHUM CÓDIGO ATIVO DISPONÍVEL PARA TESTE\n')
  }

  if (!allPresent) {
    process.exit(1)
  }
}

main().catch((e) => {
  console.error('💥 Erro fatal:', e)
  process.exit(10)
})
