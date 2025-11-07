#!/bin/bash

echo "🛒 DUA CREATIVE MARKET - Setup Automático"
echo "=========================================="
echo ""

# Cores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Verificar .env.local
if [ ! -f .env.local ]; then
    echo -e "${RED}❌ Erro: .env.local não encontrado${NC}"
    echo "Crie o ficheiro com:"
    echo "NEXT_PUBLIC_SUPABASE_URL=your_url"
    echo "NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key"
    exit 1
fi

# Carregar variáveis
source .env.local

echo -e "${BLUE}📋 Passo 1: Verificar configuração${NC}"
echo "Supabase URL: ${NEXT_PUBLIC_SUPABASE_URL}"
echo ""

echo -e "${YELLOW}⚠️  ATENÇÃO: Execute os seguintes passos MANUALMENTE no Supabase Dashboard${NC}"
echo ""

echo -e "${BLUE}📋 Passo 2: Aplicar Migração SQL${NC}"
echo "1. Aceda a: ${NEXT_PUBLIC_SUPABASE_URL/https:\/\//https://app.supabase.com/project/}/editor"
echo "2. Abra o SQL Editor"
echo "3. Copie o conteúdo de: sql/migrations/20251107_mercado_criativo.sql"
echo "4. Cole e execute no SQL Editor"
echo ""
read -p "Pressione ENTER quando completar o Passo 2..."

echo ""
echo -e "${BLUE}📋 Passo 3: Criar Bucket Storage 'mercado'${NC}"
echo "1. Aceda a: ${NEXT_PUBLIC_SUPABASE_URL/https:\/\//https://app.supabase.com/project/}/storage/buckets"
echo "2. Clique em 'New bucket'"
echo "3. Nome: mercado"
echo "4. Public bucket: ✅ YES"
echo "5. File size limit: 50MB"
echo "6. Allowed MIME types: audio/*, video/*, image/*, application/zip, application/pdf"
echo "7. Clique em 'Create bucket'"
echo ""
read -p "Pressione ENTER quando completar o Passo 3..."

echo ""
echo -e "${BLUE}📋 Passo 4: Configurar Políticas do Bucket${NC}"
echo "1. Aceda ao bucket 'mercado' criado"
echo "2. Clique em 'Policies'"
echo "3. Crie 3 políticas:"
echo ""
echo "   POLÍTICA 1 - Public Access (SELECT):"
echo "   CREATE POLICY \"Public Access\""
echo "   ON storage.objects FOR SELECT"
echo "   USING (bucket_id = 'mercado');"
echo ""
echo "   POLÍTICA 2 - Authenticated Upload (INSERT):"
echo "   CREATE POLICY \"Authenticated Upload\""
echo "   ON storage.objects FOR INSERT"
echo "   WITH CHECK (bucket_id = 'mercado' AND auth.role() = 'authenticated');"
echo ""
echo "   POLÍTICA 3 - User Delete Own (DELETE):"
echo "   CREATE POLICY \"User Delete Own\""
echo "   ON storage.objects FOR DELETE"
echo "   USING (bucket_id = 'mercado' AND auth.uid() = owner);"
echo ""
read -p "Pressione ENTER quando completar o Passo 4..."

echo ""
echo -e "${GREEN}✅ Setup Completo!${NC}"
echo ""
echo -e "${BLUE}📋 Passo 5: Testar o Mercado${NC}"
echo "1. npm run dev (ou pnpm dev)"
echo "2. Aceda a: http://localhost:3000/mercado"
echo "3. Faça login"
echo "4. Clique em 'Publicar Conteúdo'"
echo "5. Upload de um ficheiro de teste"
echo "6. Verifique se aparece na grid"
echo ""
echo -e "${GREEN}🎉 DUA Creative Market está pronto!${NC}"
