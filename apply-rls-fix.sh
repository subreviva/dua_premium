#!/bin/bash

# Script para aplicar o fix de RLS no Supabase

echo "🔧 Aplicando fix de RLS no Supabase..."
echo ""
echo "INSTRUÇÕES:"
echo "1. Abra o Supabase Dashboard: https://supabase.com/dashboard"
echo "2. Selecione seu projeto"
echo "3. Vá em 'SQL Editor' no menu lateral"
echo "4. Copie e cole o conteúdo do arquivo: FIX_RLS_ERRORS.sql"
echo "5. Clique em 'Run' (▶️)"
echo ""
echo "Ou execute via linha de comando:"
echo ""
echo "supabase db execute --file FIX_RLS_ERRORS.sql"
echo ""
echo "Após executar, os erros 403, 406 e 409 serão corrigidos! ✅"
