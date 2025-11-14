#!/bin/bash

# =====================================================
# 🚀 DEPLOY AUTOMÁTICO - Sistema de Chat Sessions
# =====================================================

set -e  # Parar em caso de erro

echo "======================================================="
echo "🚀 DEPLOY: Sistema de Chat com Histórico Persistente"
echo "======================================================="
echo ""

# Cores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Verificar variáveis de ambiente
if [ -z "$SUPABASE_DB_URL" ]; then
    echo -e "${RED}❌ ERRO: SUPABASE_DB_URL não configurada${NC}"
    echo ""
    echo "Configure a variável de ambiente:"
    echo "export SUPABASE_DB_URL='postgresql://postgres:[password]@[project-ref].supabase.co:5432/postgres'"
    echo ""
    exit 1
fi

echo -e "${BLUE}📋 Verificando arquivos...${NC}"
SQL_FILE="sql/create-chat-sessions.sql"

if [ ! -f "$SQL_FILE" ]; then
    echo -e "${RED}❌ Arquivo não encontrado: $SQL_FILE${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Arquivo encontrado${NC}"
echo ""

# Executar SQL
echo -e "${BLUE}🔧 Aplicando schema no Supabase...${NC}"
echo ""

psql "$SUPABASE_DB_URL" -f "$SQL_FILE"

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ Schema aplicado com sucesso!${NC}"
    echo ""
    
    # Verificar tabelas criadas
    echo -e "${BLUE}🔍 Verificando tabelas criadas...${NC}"
    psql "$SUPABASE_DB_URL" -c "
        SELECT 
            table_name,
            (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
        FROM information_schema.tables t
        WHERE table_schema = 'public'
        AND table_name IN ('chat_sessions', 'chat_messages')
        ORDER BY table_name;
    "
    
    echo ""
    echo -e "${BLUE}🔍 Verificando funções criadas...${NC}"
    psql "$SUPABASE_DB_URL" -c "
        SELECT 
            routine_name as function_name,
            routine_type as type
        FROM information_schema.routines
        WHERE routine_schema = 'public'
        AND routine_name LIKE '%chat%'
        ORDER BY routine_name;
    "
    
    echo ""
    echo -e "${BLUE}🔍 Verificando índices criados...${NC}"
    psql "$SUPABASE_DB_URL" -c "
        SELECT 
            tablename,
            indexname,
            indexdef
        FROM pg_indexes
        WHERE schemaname = 'public'
        AND tablename IN ('chat_sessions', 'chat_messages')
        ORDER BY tablename, indexname;
    "
    
    echo ""
    echo "======================================================="
    echo -e "${GREEN}🎉 DEPLOY CONCLUÍDO COM SUCESSO!${NC}"
    echo "======================================================="
    echo ""
    echo "📚 Próximos passos:"
    echo ""
    echo "1. ✅ Tabelas criadas:"
    echo "   • chat_sessions"
    echo "   • chat_messages"
    echo ""
    echo "2. ✅ Funções criadas:"
    echo "   • create_new_chat_session()"
    echo "   • search_chat_messages()"
    echo "   • get_user_chat_stats()"
    echo "   • auto_archive_old_sessions()"
    echo "   • cleanup_very_old_sessions()"
    echo ""
    echo "3. ✅ RLS habilitado e configurado"
    echo ""
    echo "4. 🚀 Integrar no código:"
    echo "   • import { useChatSessions } from '@/hooks/useChatSessions'"
    echo "   • Ver CHAT_SESSIONS_README.md para exemplos"
    echo ""
    echo "5. 🧪 Testar:"
    echo "   • Fazer login na aplicação"
    echo "   • Nova sessão deve ser criada automaticamente"
    echo "   • Enviar mensagens e verificar salvamento"
    echo "   • Trocar entre conversas"
    echo ""
    
else
    echo ""
    echo -e "${RED}❌ Erro ao aplicar schema${NC}"
    echo "Verifique a conexão com o Supabase"
    exit 1
fi
