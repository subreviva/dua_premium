#!/usr/bin/env node

/**
 * 🔧 Aplicar função de teste no Supabase
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const COLORS = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
};

console.log(`${COLORS.cyan}🔧 Aplicando função de teste no Supabase...${COLORS.reset}\n`);

// Carregar variáveis
const envContent = readFileSync(join(__dirname, '.env.local'), 'utf8');
const SUPABASE_URL = envContent.match(/NEXT_PUBLIC_SUPABASE_URL=(.+)/)?.[1]?.trim();
const SUPABASE_SERVICE_ROLE_KEY = envContent.match(/SUPABASE_SERVICE_ROLE_KEY=(.+)/)?.[1]?.trim();

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error(`${COLORS.red}❌ Variáveis Supabase não encontradas${COLORS.reset}`);
  process.exit(1);
}

// Carregar SQL
const sql = readFileSync(join(__dirname, 'supabase/create-test-user-function.sql'), 'utf8');

// Executar SQL via API REST
const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'apikey': SUPABASE_SERVICE_ROLE_KEY,
    'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
  },
  body: JSON.stringify({ sql }),
});

if (response.ok) {
  console.log(`${COLORS.green}✅ Função criada com sucesso!${COLORS.reset}\n`);
} else {
  console.error(`${COLORS.red}❌ Erro: ${response.status} ${response.statusText}${COLORS.reset}`);
  const error = await response.text();
  console.error(error);
  
  console.log(`\n${COLORS.yellow}💡 Aplicar manualmente no Supabase SQL Editor:${COLORS.reset}`);
  console.log(`${COLORS.gray}supabase/create-test-user-function.sql${COLORS.reset}\n`);
}
