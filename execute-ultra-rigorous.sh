#!/bin/bash

# ═══════════════════════════════════════════════════════════════════════════
# EXECUTAR SQL ULTRA RIGOROSO NO SUPABASE
# Método: CURL direto para Supabase Management API
# ═══════════════════════════════════════════════════════════════════════════

echo "═══════════════════════════════════════════════════════════════"
echo "🔐 EXECUTANDO SQL ULTRA RIGOROSO NO SUPABASE"
echo "═══════════════════════════════════════════════════════════════"
echo ""

# Ler credenciais do .env.local
echo "📝 Lendo credenciais..."
source .env.local

# Verificar se as variáveis existem
if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ] || [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    echo "❌ Erro: Credenciais não encontradas em .env.local"
    exit 1
fi

echo "✅ Credenciais carregadas"
echo "   URL: $NEXT_PUBLIC_SUPABASE_URL"
echo ""

# Ler o arquivo SQL
echo "📄 Lendo arquivo SQL..."
SQL_CONTENT=$(cat sql/ultra-rigorous-registration.sql)

if [ -z "$SQL_CONTENT" ]; then
    echo "❌ Erro: Arquivo SQL não encontrado ou vazio"
    exit 1
fi

echo "✅ SQL carregado ($(echo "$SQL_CONTENT" | wc -l) linhas)"
echo ""

# Executar via psql se disponível
if command -v psql &> /dev/null; then
    echo "🚀 Executando SQL via psql..."
    echo ""
    
    # Extrair componentes da URL
    PROJECT_REF=$(echo $NEXT_PUBLIC_SUPABASE_URL | sed 's/https:\/\///' | sed 's/.supabase.co//')
    
    # Construir connection string
    DB_URL="postgresql://postgres:[YOUR-PASSWORD]@db.${PROJECT_REF}.supabase.co:5432/postgres"
    
    echo "⚠️  ATENÇÃO: Você precisa da senha do banco de dados"
    echo "   Acesse: Supabase Dashboard > Settings > Database > Connection string"
    echo ""
    echo "📋 Execute este comando manualmente:"
    echo ""
    echo "psql \"postgresql://postgres:[SUA-SENHA]@db.${PROJECT_REF}.supabase.co:5432/postgres\" -f sql/ultra-rigorous-registration.sql"
    echo ""
else
    echo "⚠️  psql não está instalado"
fi

echo "═══════════════════════════════════════════════════════════════"
echo "📋 MÉTODO ALTERNATIVO: SUPABASE DASHBOARD"
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "Como o psql pode não estar disponível, use o Supabase Dashboard:"
echo ""
echo "1. Acesse: https://supabase.com/dashboard/project/${PROJECT_REF}/sql/new"
echo "2. Copie o conteúdo de: sql/ultra-rigorous-registration.sql"
echo "3. Cole no editor SQL"
echo "4. Clique em 'Run' (▶️)"
echo "5. Verifique os resultados"
echo ""
echo "═══════════════════════════════════════════════════════════════"
echo ""

# Criar HTML para facilitar a execução
cat > execute-sql-dashboard.html << 'HTMLEOF'
<!DOCTYPE html>
<html lang="pt">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Executar SQL Ultra Rigoroso - Supabase</title>
    <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 40px 20px;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px;
            text-align: center;
        }
        .header h1 {
            font-size: 32px;
            font-weight: 700;
            margin-bottom: 10px;
        }
        .header p {
            font-size: 16px;
            opacity: 0.9;
        }
        .content {
            padding: 40px;
        }
        .section {
            margin-bottom: 30px;
            padding: 20px;
            background: #f8f9fa;
            border-radius: 10px;
            border-left: 4px solid #667eea;
        }
        .section h2 {
            font-size: 20px;
            color: #333;
            margin-bottom: 15px;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        .credentials {
            background: #1e1e1e;
            color: #d4d4d4;
            padding: 20px;
            border-radius: 8px;
            font-family: 'Courier New', monospace;
            font-size: 13px;
            margin: 15px 0;
            overflow-x: auto;
        }
        .credentials .label {
            color: #4ec9b0;
            font-weight: bold;
        }
        .credentials .value {
            color: #ce9178;
            word-break: break-all;
        }
        textarea {
            width: 100%;
            min-height: 400px;
            padding: 15px;
            font-family: 'Courier New', monospace;
            font-size: 12px;
            border: 2px solid #ddd;
            border-radius: 8px;
            resize: vertical;
            line-height: 1.5;
        }
        .button {
            display: inline-block;
            padding: 15px 30px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            border: none;
            cursor: pointer;
            transition: transform 0.2s, box-shadow 0.2s;
            margin: 10px 10px 10px 0;
        }
        .button:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
        }
        .button.secondary {
            background: #6c757d;
        }
        .steps {
            list-style: none;
            counter-reset: step-counter;
        }
        .steps li {
            counter-increment: step-counter;
            padding: 15px 15px 15px 50px;
            position: relative;
            margin-bottom: 10px;
        }
        .steps li::before {
            content: counter(step-counter);
            position: absolute;
            left: 0;
            top: 15px;
            width: 35px;
            height: 35px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
        }
        .log {
            background: #1e1e1e;
            color: #d4d4d4;
            padding: 20px;
            border-radius: 8px;
            font-family: 'Courier New', monospace;
            font-size: 13px;
            max-height: 300px;
            overflow-y: auto;
            margin-top: 20px;
            display: none;
        }
        .log.active {
            display: block;
        }
        .log-entry {
            padding: 5px 0;
            border-bottom: 1px solid #333;
        }
        .log-success { color: #4ec9b0; }
        .log-error { color: #f48771; }
        .log-info { color: #569cd6; }
        .alert {
            padding: 15px;
            border-radius: 8px;
            margin: 15px 0;
        }
        .alert-info {
            background: #d1ecf1;
            color: #0c5460;
            border-left: 4px solid #17a2b8;
        }
        .alert-warning {
            background: #fff3cd;
            color: #856404;
            border-left: 4px solid #ffc107;
        }
        .alert-success {
            background: #d4edda;
            color: #155724;
            border-left: 4px solid #28a745;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔐 Executar SQL Ultra Rigoroso</h1>
            <p>Sistema de Registo e Sessões - DUA IA</p>
        </div>

        <div class="content">
            <div class="section">
                <h2>📋 Opção 1: Supabase Dashboard (RECOMENDADO)</h2>
                <ul class="steps">
                    <li>Acesse o Supabase Dashboard</li>
                    <li>Vá para: SQL Editor > New Query</li>
                    <li>Copie o SQL abaixo (botão "Copiar SQL")</li>
                    <li>Cole no editor e clique em "Run" (▶️)</li>
                    <li>Verifique os resultados e mensagens de sucesso</li>
                </ul>
                <button class="button" onclick="copySQL()">📋 Copiar SQL Completo</button>
                <a href="SUPABASE_DASHBOARD_URL" class="button" target="_blank" id="dashboardLink">🚀 Abrir Supabase Dashboard</a>
            </div>

            <div class="section">
                <h2>🔑 Suas Credenciais Supabase</h2>
                <div class="credentials">
                    <div><span class="label">URL:</span> <span class="value" id="supabaseUrl">Carregando...</span></div>
                    <div><span class="label">Service Role Key:</span> <span class="value" id="serviceKey">Carregando...</span></div>
                </div>
            </div>

            <div class="section">
                <h2>📄 Conteúdo SQL</h2>
                <div class="alert alert-info">
                    <strong>ℹ️ Informação:</strong> Este SQL irá criar as tabelas <code>user_sessions</code> e <code>user_activity_logs</code>, além de adicionar colunas de controle na tabela <code>users</code>.
                </div>
                <textarea id="sqlContent" readonly>Carregando SQL...</textarea>
            </div>

            <div class="section">
                <h2>✅ Verificação Pós-Execução</h2>
                <div class="alert alert-warning">
                    Após executar o SQL, verifique se foram criadas:
                </div>
                <ul class="steps">
                    <li>Tabela <code>user_sessions</code> (11 colunas)</li>
                    <li>Tabela <code>user_activity_logs</code> (7 colunas)</li>
                    <li>Colunas adicionadas em <code>users</code>: registration_completed, onboarding_completed, dua_ia_balance, dua_coin_balance, account_type</li>
                    <li>Funções: validate_active_session, terminate_user_sessions, cleanup_expired_sessions</li>
                </ul>
            </div>
        </div>
    </div>

    <script>
        // Carregar SQL do arquivo
        fetch('sql/ultra-rigorous-registration.sql')
            .then(response => response.text())
            .then(sql => {
                document.getElementById('sqlContent').value = sql;
                window.sqlContent = sql;
            })
            .catch(error => {
                document.getElementById('sqlContent').value = 'Erro ao carregar SQL: ' + error.message;
            });

        // Carregar credenciais do .env.local
        fetch('.env.local')
            .then(response => response.text())
            .then(env => {
                const lines = env.split('\n');
                let url = '';
                let key = '';
                
                lines.forEach(line => {
                    if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) {
                        url = line.split('=')[1].trim();
                    }
                    if (line.startsWith('SUPABASE_SERVICE_ROLE_KEY=')) {
                        key = line.split('=')[1].trim();
                    }
                });

                document.getElementById('supabaseUrl').textContent = url;
                document.getElementById('serviceKey').textContent = key.substring(0, 30) + '...';
                
                // Construir URL do dashboard
                const projectRef = url.replace('https://', '').replace('.supabase.co', '');
                const dashboardUrl = `https://supabase.com/dashboard/project/${projectRef}/sql/new`;
                document.getElementById('dashboardLink').href = dashboardUrl;
                document.getElementById('dashboardLink').textContent = '🚀 Abrir SQL Editor';
            })
            .catch(error => {
                document.getElementById('supabaseUrl').textContent = 'Erro ao carregar';
                document.getElementById('serviceKey').textContent = 'Erro ao carregar';
            });

        function copySQL() {
            const textarea = document.getElementById('sqlContent');
            textarea.select();
            document.execCommand('copy');
            
            const btn = event.target;
            const originalText = btn.textContent;
            btn.textContent = '✅ SQL Copiado!';
            setTimeout(() => {
                btn.textContent = originalText;
            }, 2000);
        }
    </script>
</body>
</html>
HTMLEOF

echo "✅ Criado: execute-sql-dashboard.html"
echo ""
echo "🌐 Abrindo interface web..."
echo ""

# Abrir o HTML no navegador
if command -v xdg-open &> /dev/null; then
    xdg-open execute-sql-dashboard.html
elif [ "$BROWSER" != "" ]; then
    $BROWSER execute-sql-dashboard.html
else
    echo "⚠️  Abra manualmente: execute-sql-dashboard.html"
fi

echo "═══════════════════════════════════════════════════════════════"
echo "✅ PROCESSO PREPARADO"
echo "═══════════════════════════════════════════════════════════════"
