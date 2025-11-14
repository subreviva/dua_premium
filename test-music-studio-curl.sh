#!/bin/bash

set -e

echo "🎵 TESTE COMPLETO MUSIC STUDIO - CURL AUTENTICADO"
echo "=================================================="
echo ""

# Gerar email único
TEST_EMAIL="test-music-$(date +%s)@dua.ia"
echo "🔑 Email de teste: $TEST_EMAIL"
echo ""

# PASSO 1: Registrar usuário
echo "📝 PASSO 1: Registrando usuário..."
REGISTER_RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{
    \"inviteCode\": \"MUSICTEST2024\",
    \"name\": \"Test Music User\",
    \"email\": \"$TEST_EMAIL\",
    \"password\": \"Test@Music123!\",
    \"acceptedTerms\": true
  }")

echo "$REGISTER_RESPONSE" | jq '.'

# Extrair token e userId
TOKEN=$(echo "$REGISTER_RESPONSE" | jq -r '.session.token // empty')
USER_ID=$(echo "$REGISTER_RESPONSE" | jq -r '.user.id // empty')

if [ -z "$TOKEN" ] || [ -z "$USER_ID" ]; then
  echo "❌ ERRO: Falha ao registrar usuário"
  echo "Response: $REGISTER_RESPONSE"
  exit 1
fi

echo ""
echo "✅ Registro bem-sucedido!"
echo "   Token: ${TOKEN:0:50}..."
echo "   User ID: $USER_ID"
echo ""

# PASSO 2: Gerar música
echo "🎵 PASSO 2: Gerando música via Suno API..."
GENERATE_RESPONSE=$(curl -s -X POST http://localhost:3000/api/suno/generate \
  -H "Content-Type: application/json" \
  -H "Cookie: auth-token=$TOKEN" \
  -d "{
    \"userId\": \"$USER_ID\",
    \"prompt\": \"calm relaxing piano music for testing\",
    \"customMode\": false,
    \"instrumental\": true,
    \"model\": \"V3_5\"
  }")

echo "$GENERATE_RESPONSE" | jq '.'

# Extrair taskId
TASK_ID=$(echo "$GENERATE_RESPONSE" | jq -r '.taskId // empty')

if [ -z "$TASK_ID" ]; then
  echo "❌ ERRO: Falha ao gerar música"
  echo "Response: $GENERATE_RESPONSE"
  exit 1
fi

echo ""
echo "✅ Música enviada para geração!"
echo "   Task ID: $TASK_ID"
echo ""

# PASSO 3: Polling do status
echo "⏳ PASSO 3: Aguardando conclusão da geração..."
MAX_ATTEMPTS=24  # 2 minutos (24 * 5s)
ATTEMPT=0

while [ $ATTEMPT -lt $MAX_ATTEMPTS ]; do
  ATTEMPT=$((ATTEMPT + 1))
  echo "   Tentativa $ATTEMPT/$MAX_ATTEMPTS..."
  
  STATUS_RESPONSE=$(curl -s "http://localhost:3000/api/suno/status?taskId=$TASK_ID" \
    -H "Cookie: auth-token=$TOKEN")
  
  STATUS=$(echo "$STATUS_RESPONSE" | jq -r '.status // empty')
  
  if [ "$STATUS" = "SUCCESS" ]; then
    echo ""
    echo "✅ MÚSICA CONCLUÍDA!"
    echo "$STATUS_RESPONSE" | jq '.'
    
    # Extrair URL do áudio
    AUDIO_URL=$(echo "$STATUS_RESPONSE" | jq -r '.audioUrl // empty')
    echo ""
    echo "🎧 URL do áudio: $AUDIO_URL"
    break
  elif [ "$STATUS" = "ERROR" ] || [ "$STATUS" = "FAILED" ]; then
    echo ""
    echo "❌ ERRO na geração:"
    echo "$STATUS_RESPONSE" | jq '.'
    exit 1
  else
    echo "      Status atual: $STATUS"
    sleep 5
  fi
done

if [ $ATTEMPT -ge $MAX_ATTEMPTS ]; then
  echo ""
  echo "⏱️  TIMEOUT: Música ainda não concluída após 2 minutos"
  echo "Último status:"
  echo "$STATUS_RESPONSE" | jq '.'
fi

echo ""
echo "=================================================="
echo "✅ TESTE CONCLUÍDO"
echo "=================================================="
