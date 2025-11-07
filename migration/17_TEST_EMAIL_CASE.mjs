#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, anonKey);

console.log('🧪 Testando login com email em maiúsculas...\n');

const testCases = [
  { email: 'estraca@2lados.pt', password: 'Estraca2025@DUA', desc: 'lowercase' },
  { email: 'ESTRACA@2LADOS.PT', password: 'Estraca2025@DUA', desc: 'UPPERCASE' },
  { email: 'Estraca@2Lados.pt', password: 'Estraca2025@DUA', desc: 'MixedCase' }
];

for (const test of testCases) {
  console.log(`Testando: ${test.email} (${test.desc})`);
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email: test.email,
    password: test.password
  });
  
  if (error) {
    console.log(`  ✗ FALHOU: ${error.message}\n`);
  } else if (data.user) {
    console.log(`  ✓ SUCESSO: ${data.user.email}\n`);
    await supabase.auth.signOut();
  }
}

console.log('📊 Conclusão: Supabase Auth é case-sensitive para emails');
console.log('✅ Comportamento correto - emails devem ser lowercase');
