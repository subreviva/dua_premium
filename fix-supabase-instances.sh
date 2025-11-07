#!/bin/bash

# Script para corrigir todas as instâncias de createClient do Supabase

echo "🔧 Corrigindo múltiplas instâncias do Supabase Client..."

# Lista de arquivos para corrigir
files=(
  "app/login/page.tsx"
  "app/acesso/page.tsx"
  "app/mercado/page.tsx"
  "app/reset-password/page.tsx"
  "app/perfil/page.tsx"
  "app/esqueci-password/page.tsx"
  "app/profile/[username]/page.tsx"
  "app/community/page.tsx"
  "app/comprar/page.tsx"
)

for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "  ✅ Processando $file"
    
    # Remover import antigo e adicionar novo
    sed -i 's/import { createClient } from "@supabase\/supabase-js";/import { supabaseClient } from "@\/lib\/supabase";/g' "$file"
    sed -i "s/import { createClient } from '@supabase\/supabase-js'/import { supabaseClient } from '@\/lib\/supabase'/g" "$file"
    
    # Substituir criação de cliente
    sed -i 's/const supabase = createClient(/const supabase = supabaseClient; \/\/ OLD: createClient(/g' "$file"
    sed -i '/const supabase = supabaseClient; \/\/ OLD: createClient(/,+2d' "$file"
    
  else
    echo "  ⚠️  Arquivo não encontrado: $file"
  fi
done

echo "✅ Correção concluída!"
