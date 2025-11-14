#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const SUPABASE_URL = 'https://lhvymocfsyypjxslcqfh.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxodnltb2Nmc3l5cGp4c2xjcWZoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMDgxOTIwMywiZXhwIjoyMDQ2Mzk1MjAzfQ.yjUNdtBGW9jHNPCLK4TA9IwzMO0-pxMVpv-8Gm0AZlU';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const sql = readFileSync('create-invite-test.sql', 'utf8');

const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });

if (error) {
  console.error('❌ Error:', error);
  process.exit(1);
}

console.log('✅ Código criado: DESIGNTEST2025');
