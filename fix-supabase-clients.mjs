#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

const filesToFix = [
  'app/acesso/page.tsx',
  'app/mercado/page.tsx',
  'app/reset-password/page.tsx',
  'app/esqueci-password/page.tsx',
  'app/profile/[username]/page.tsx',
  'app/community/page.tsx',
  'app/comprar/page.tsx'
];

console.log('🔧 Corrigindo múltiplas instâncias do Supabase Client...\n');

filesToFix.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  Arquivo não encontrado: ${file}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Substituir import
  if (content.includes('import { createClient } from "@supabase/supabase-js"')) {
    content = content.replace(
      'import { createClient } from "@supabase/supabase-js";',
      'import { supabaseClient } from "@/lib/supabase";'
    );
    modified = true;
  }

  if (content.includes("import { createClient } from '@supabase/supabase-js'")) {
    content = content.replace(
      "import { createClient } from '@supabase/supabase-js'",
      "import { supabaseClient } from '@/lib/supabase'"
    );
    modified = true;
  }

  // Substituir criação do cliente - padrão 1
  const pattern1 = /const supabase = createClient\(\s*process\.env\.NEXT_PUBLIC_SUPABASE_URL[!]?,\s*process\.env\.NEXT_PUBLIC_SUPABASE_ANON_KEY[!]?\s*\);?/g;
  if (pattern1.test(content)) {
    content = content.replace(pattern1, 'const supabase = supabaseClient;');
    modified = true;
  }

  // Substituir criação do cliente - padrão 2 (com || '')
  const pattern2 = /const supabase = createClient\(\s*process\.env\.NEXT_PUBLIC_SUPABASE_URL \|\| ['"],\s*process\.env\.NEXT_PUBLIC_SUPABASE_ANON_KEY \|\| ['"]\s*\);?/g;
  if (pattern2.test(content)) {
    content = content.replace(pattern2, 'const supabase = supabaseClient;');
    modified = true;
  }

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Corrigido: ${file}`);
  } else {
    console.log(`⏭️  Sem alterações: ${file}`);
  }
});

console.log('\n✅ Correção concluída!');
