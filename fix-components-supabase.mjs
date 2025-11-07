#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

const filesToFix = [
  'components/mercado/item-card.tsx',
  'components/mercado/publicar-item-modal.tsx',
  'components/user-avatar.tsx',
  'components/community-access-gate.tsx'
];

console.log('🔧 Corrigindo componentes com múltiplas instâncias do Supabase...\n');

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
      /import { createClient } from "@supabase\/supabase-js";?/g,
      'import { supabaseClient } from "@/lib/supabase";'
    );
    modified = true;
  }

  if (content.includes("import { createClient } from '@supabase/supabase-js'")) {
    content = content.replace(
      /import { createClient } from '@supabase\/supabase-js';?/g,
      "import { supabaseClient } from '@/lib/supabase';"
    );
    modified = true;
  }

  // Substituir criação do cliente - múltiplos padrões
  const patterns = [
    // Padrão com !
    /const supabase = createClient\(\s*process\.env\.NEXT_PUBLIC_SUPABASE_URL!,\s*process\.env\.NEXT_PUBLIC_SUPABASE_ANON_KEY!\s*\);?/g,
    // Padrão com || ''
    /const supabase = createClient\(\s*process\.env\.NEXT_PUBLIC_SUPABASE_URL \|\| ['"],\s*process\.env\.NEXT_PUBLIC_SUPABASE_ANON_KEY \|\| ['"]\s*\);?/g,
    // Padrão multilinha
    /const supabase = createClient\(\s*process\.env\.NEXT_PUBLIC_SUPABASE_URL[!]?,\s*process\.env\.NEXT_PUBLIC_SUPABASE_ANON_KEY[!]?\s*\)/gs,
  ];

  patterns.forEach(pattern => {
    if (pattern.test(content)) {
      content = content.replace(pattern, 'const supabase = supabaseClient;');
      modified = true;
    }
  });

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Corrigido: ${file}`);
  } else {
    console.log(`⏭️  Sem alterações: ${file}`);
  }
});

console.log('\n✅ Correção de componentes concluída!');
