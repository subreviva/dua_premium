require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createSimpleProfileSystem() {
  console.log('🔧 CRIANDO SISTEMA SIMPLES DE PERFIL...\n');

  try {
    // 1. Criar tabela de perfis
    console.log('1️⃣ Criando tabela user_profiles...');
    
    // Primeiro, vamos expandir a tabela users existente
    const expandUsersSQL = `
    -- Expandir tabela users com campos de perfil
    ALTER TABLE users ADD COLUMN IF NOT EXISTS full_name VARCHAR(255);
    ALTER TABLE users ADD COLUMN IF NOT EXISTS display_name VARCHAR(100);
    ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS location VARCHAR(255);
    ALTER TABLE users ADD COLUMN IF NOT EXISTS website VARCHAR(500);
    ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(50);
    
    -- Campos de tokens
    ALTER TABLE users ADD COLUMN IF NOT EXISTS total_tokens INTEGER DEFAULT 100;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS tokens_used INTEGER DEFAULT 0;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_tier VARCHAR(50) DEFAULT 'free';
    
    -- Configurações
    ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_visibility VARCHAR(20) DEFAULT 'public';
    ALTER TABLE users ADD COLUMN IF NOT EXISTS email_notifications BOOLEAN DEFAULT true;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS push_notifications BOOLEAN DEFAULT true;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS marketing_emails BOOLEAN DEFAULT false;
    
    -- Estatísticas
    ALTER TABLE users ADD COLUMN IF NOT EXISTS total_projects INTEGER DEFAULT 0;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS total_generated_content INTEGER DEFAULT 0;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login TIMESTAMPTZ;
    `;

    const { error: alterError } = await supabaseAdmin.rpc('exec_sql', { 
      sql: expandUsersSQL 
    });

    if (alterError) {
      console.log('⚠️ Erro ao expandir tabela users:', alterError.message);
    } else {
      console.log('✅ Tabela users expandida com campos de perfil');
    }

    // 2. Criar tabela de pacotes de tokens
    console.log('\n2️⃣ Criando tabela de pacotes...');
    
    const packagesSQL = `
    CREATE TABLE IF NOT EXISTS token_packages (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL UNIQUE,
      description TEXT,
      tokens_amount INTEGER NOT NULL,
      price DECIMAL(10,2) NOT NULL,
      currency VARCHAR(3) DEFAULT 'EUR',
      is_active BOOLEAN DEFAULT true,
      is_featured BOOLEAN DEFAULT false,
      sort_order INTEGER DEFAULT 0,
      discount_percentage INTEGER DEFAULT 0,
      promotional_price DECIMAL(10,2),
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- Inserir pacotes padrão
    INSERT INTO token_packages (name, description, tokens_amount, price, is_featured, sort_order)
    VALUES 
      ('Pack Inicial', 'Perfeito para começar', 100, 4.99, false, 1),
      ('Pack Popular', 'Melhor custo-benefício', 500, 19.99, true, 2),
      ('Pack Profissional', 'Para criadores avançados', 1000, 34.99, false, 3),
      ('Pack Ultimate', 'Máxima criatividade', 2500, 79.99, false, 4),
      ('Pack Mega', 'Para estúdios', 5000, 149.99, false, 5)
    ON CONFLICT (name) DO NOTHING;
    `;

    const { error: packagesError } = await supabaseAdmin.rpc('exec_sql', { 
      sql: packagesSQL 
    });

    if (packagesError) {
      console.log('⚠️ Erro ao criar pacotes:', packagesError.message);
    } else {
      console.log('✅ Tabela de pacotes criada com sucesso');
    }

    // 3. Criar tabela de compras
    console.log('\n3️⃣ Criando tabela de compras...');
    
    const purchasesSQL = `
    CREATE TABLE IF NOT EXISTS user_purchases (
      id SERIAL PRIMARY KEY,
      user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      package_name VARCHAR(100) NOT NULL,
      tokens_amount INTEGER NOT NULL,
      price_paid DECIMAL(10,2) NOT NULL,
      currency VARCHAR(3) DEFAULT 'EUR',
      payment_method VARCHAR(50) DEFAULT 'stripe',
      payment_status VARCHAR(20) DEFAULT 'pending',
      transaction_id VARCHAR(255),
      purchased_at TIMESTAMPTZ DEFAULT NOW(),
      processed_at TIMESTAMPTZ,
      
      CONSTRAINT valid_payment_status CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded'))
    );

    -- Índices para performance
    CREATE INDEX IF NOT EXISTS idx_user_purchases_user_id ON user_purchases(user_id);
    CREATE INDEX IF NOT EXISTS idx_user_purchases_status ON user_purchases(payment_status);
    CREATE INDEX IF NOT EXISTS idx_user_purchases_date ON user_purchases(purchased_at DESC);
    `;

    const { error: purchasesError } = await supabaseAdmin.rpc('exec_sql', { 
      sql: purchasesSQL 
    });

    if (purchasesError) {
      console.log('⚠️ Erro ao criar tabela compras:', purchasesError.message);
    } else {
      console.log('✅ Tabela de compras criada');
    }

    // 4. Criar tabela de uso de tokens
    console.log('\n4️⃣ Criando tabela de uso...');
    
    const usageSQL = `
    CREATE TABLE IF NOT EXISTS token_usage_log (
      id SERIAL PRIMARY KEY,
      user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      action_type VARCHAR(100) NOT NULL,
      tokens_used INTEGER NOT NULL,
      content_generated TEXT,
      session_id VARCHAR(255),
      used_at TIMESTAMPTZ DEFAULT NOW(),
      metadata JSONB DEFAULT '{}'
    );

    -- Índices para performance
    CREATE INDEX IF NOT EXISTS idx_token_usage_user_id ON token_usage_log(user_id);
    CREATE INDEX IF NOT EXISTS idx_token_usage_action ON token_usage_log(action_type);
    CREATE INDEX IF NOT EXISTS idx_token_usage_date ON token_usage_log(used_at DESC);
    `;

    const { error: usageError } = await supabaseAdmin.rpc('exec_sql', { 
      sql: usageSQL 
    });

    if (usageError) {
      console.log('⚠️ Erro ao criar tabela uso:', usageError.message);
    } else {
      console.log('✅ Tabela de uso criada');
    }

    // 5. Habilitar RLS
    console.log('\n5️⃣ Configurando Row Level Security...');
    
    const rlsSQL = `
    -- Habilitar RLS nas novas tabelas
    ALTER TABLE token_packages ENABLE ROW LEVEL SECURITY;
    ALTER TABLE user_purchases ENABLE ROW LEVEL SECURITY;
    ALTER TABLE token_usage_log ENABLE ROW LEVEL SECURITY;

    -- Políticas para token_packages (todos podem ver pacotes ativos)
    DROP POLICY IF EXISTS "Anyone can view active packages" ON token_packages;
    CREATE POLICY "Anyone can view active packages" ON token_packages
      FOR SELECT USING (is_active = true);

    -- Políticas para user_purchases (usuários só veem suas compras)
    DROP POLICY IF EXISTS "Users can view own purchases" ON user_purchases;
    CREATE POLICY "Users can view own purchases" ON user_purchases
      FOR SELECT USING (auth.uid() = user_id);

    DROP POLICY IF EXISTS "Users can insert own purchases" ON user_purchases;
    CREATE POLICY "Users can insert own purchases" ON user_purchases
      FOR INSERT WITH CHECK (auth.uid() = user_id);

    -- Políticas para token_usage_log (usuários só veem seu uso)
    DROP POLICY IF EXISTS "Users can view own usage" ON token_usage_log;
    CREATE POLICY "Users can view own usage" ON token_usage_log
      FOR SELECT USING (auth.uid() = user_id);

    DROP POLICY IF EXISTS "System can log usage" ON token_usage_log;
    CREATE POLICY "System can log usage" ON token_usage_log
      FOR INSERT WITH CHECK (true);
    `;

    const { error: rlsError } = await supabaseAdmin.rpc('exec_sql', { 
      sql: rlsSQL 
    });

    if (rlsError) {
      console.log('⚠️ Erro ao configurar RLS:', rlsError.message);
    } else {
      console.log('✅ Row Level Security configurado');
    }

    // 6. Atualizar usuários existentes
    console.log('\n6️⃣ Atualizando usuários existentes...');
    
    const { data: existingUsers } = await supabaseAdmin
      .from('users')
      .select('id, name, email')
      .is('full_name', null);

    if (existingUsers && existingUsers.length > 0) {
      for (const user of existingUsers) {
        await supabaseAdmin
          .from('users')
          .update({
            full_name: user.name || 'Usuário',
            total_tokens: 100, // Tokens gratuitos iniciais
            tokens_used: 0,
            subscription_tier: 'free'
          })
          .eq('id', user.id);

        console.log(`✅ Perfil atualizado: ${user.name || user.email}`);
      }
    }

    // 7. Verificar resultado
    console.log('\n7️⃣ Verificando sistema...');
    
    const { data: packages } = await supabaseAdmin
      .from('token_packages')
      .select('*')
      .eq('is_active', true);

    const { data: users } = await supabaseAdmin
      .from('users')
      .select('id, name, email, total_tokens, subscription_tier');

    console.log(`\n📊 RESULTADO:`);
    console.log(`💎 ${packages?.length || 0} pacotes de tokens disponíveis`);
    console.log(`👤 ${users?.length || 0} usuários com perfil`);
    
    if (packages && packages.length > 0) {
      console.log(`\n📦 PACOTES DISPONÍVEIS:`);
      packages.forEach(pkg => {
        console.log(`   ${pkg.name}: ${pkg.tokens_amount} tokens por €${pkg.price}`);
      });
    }

    if (users && users.length > 0) {
      console.log(`\n👥 USUÁRIOS:`);
      users.forEach(user => {
        console.log(`   ${user.name || user.email}: ${user.total_tokens} tokens (${user.subscription_tier})`);
      });
    }

    console.log('\n🎉 SISTEMA DE PERFIL CRIADO COM SUCESSO!\n');

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

createSimpleProfileSystem().catch(console.error);