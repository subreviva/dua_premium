require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createUserProfileSystem() {
  console.log('🔧 CRIANDO SISTEMA DE PERFIL DE USUÁRIO...\n');

  const profileSystemSQL = `
  -- =====================================================
  -- SISTEMA DE PERFIL DE USUÁRIO COM TOKENS
  -- =====================================================

  -- 1. Tabela de perfis de usuário
  CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    display_name VARCHAR(100),
    email VARCHAR(255) NOT NULL UNIQUE,
    avatar_url TEXT,
    bio TEXT,
    location VARCHAR(255),
    website VARCHAR(500),
    phone VARCHAR(50),
    birth_date DATE,
    
    -- Configurações de conta
    subscription_tier VARCHAR(50) DEFAULT 'free',
    total_tokens INTEGER DEFAULT 0,
    tokens_used INTEGER DEFAULT 0,
    tokens_remaining INTEGER GENERATED ALWAYS AS (total_tokens - tokens_used) STORED,
    
    -- Configurações de perfil
    profile_visibility VARCHAR(20) DEFAULT 'public',
    email_notifications BOOLEAN DEFAULT true,
    push_notifications BOOLEAN DEFAULT true,
    marketing_emails BOOLEAN DEFAULT false,
    
    -- Estatísticas
    total_projects INTEGER DEFAULT 0,
    total_generated_content INTEGER DEFAULT 0,
    account_creation_date TIMESTAMPTZ DEFAULT NOW(),
    last_login TIMESTAMPTZ,
    
    -- Metadados
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  );

  -- 2. Tabela de compras de tokens
  CREATE TABLE IF NOT EXISTS token_purchases (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Detalhes da compra
    package_name VARCHAR(100) NOT NULL,
    tokens_amount INTEGER NOT NULL,
    price_paid DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    
    -- Informações de pagamento
    payment_method VARCHAR(50),
    payment_provider VARCHAR(50),
    transaction_id VARCHAR(255) UNIQUE,
    payment_status VARCHAR(20) DEFAULT 'pending',
    
    -- Timestamps
    purchased_at TIMESTAMPTZ DEFAULT NOW(),
    processed_at TIMESTAMPTZ,
    
    -- Metadados
    metadata JSONB DEFAULT '{}',
    
    CONSTRAINT valid_payment_status CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded'))
  );

  -- 3. Tabela de uso de tokens
  CREATE TABLE IF NOT EXISTS token_usage (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Detalhes do uso
    action_type VARCHAR(100) NOT NULL,
    tokens_used INTEGER NOT NULL,
    content_generated TEXT,
    
    -- Contexto
    project_id UUID,
    session_id VARCHAR(255),
    
    -- Timestamps
    used_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Metadados
    metadata JSONB DEFAULT '{}'
  );

  -- 4. Tabela de pacotes de tokens
  CREATE TABLE IF NOT EXISTS token_packages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Detalhes do pacote
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    tokens_amount INTEGER NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    
    -- Configurações
    is_active BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    sort_order INTEGER DEFAULT 0,
    
    -- Descontos e promoções
    discount_percentage INTEGER DEFAULT 0,
    promotional_price DECIMAL(10,2),
    promotion_valid_until TIMESTAMPTZ,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT valid_discount CHECK (discount_percentage >= 0 AND discount_percentage <= 100)
  );

  -- 5. Tabela de atividades do usuário
  CREATE TABLE IF NOT EXISTS user_activities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Detalhes da atividade
    activity_type VARCHAR(100) NOT NULL,
    description TEXT,
    metadata JSONB DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Índices para performance
    INDEX idx_user_activities_user_id (user_id),
    INDEX idx_user_activities_type (activity_type),
    INDEX idx_user_activities_created_at (created_at DESC)
  );

  -- =====================================================
  -- ÍNDICES PARA PERFORMANCE
  -- =====================================================
  
  CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
  CREATE INDEX IF NOT EXISTS idx_user_profiles_subscription ON user_profiles(subscription_tier);
  CREATE INDEX IF NOT EXISTS idx_user_profiles_tokens ON user_profiles(tokens_remaining DESC);
  
  CREATE INDEX IF NOT EXISTS idx_token_purchases_user_id ON token_purchases(user_id);
  CREATE INDEX IF NOT EXISTS idx_token_purchases_status ON token_purchases(payment_status);
  CREATE INDEX IF NOT EXISTS idx_token_purchases_date ON token_purchases(purchased_at DESC);
  
  CREATE INDEX IF NOT EXISTS idx_token_usage_user_id ON token_usage(user_id);
  CREATE INDEX IF NOT EXISTS idx_token_usage_action ON token_usage(action_type);
  CREATE INDEX IF NOT EXISTS idx_token_usage_date ON token_usage(used_at DESC);
  
  CREATE INDEX IF NOT EXISTS idx_token_packages_active ON token_packages(is_active) WHERE is_active = true;
  CREATE INDEX IF NOT EXISTS idx_token_packages_featured ON token_packages(is_featured) WHERE is_featured = true;

  -- =====================================================
  -- TRIGGERS E FUNÇÕES
  -- =====================================================

  -- Função para atualizar updated_at
  CREATE OR REPLACE FUNCTION update_updated_at_column()
  RETURNS TRIGGER AS $$
  BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
  END;
  $$ language 'plpgsql';

  -- Trigger para user_profiles
  DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
  CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

  -- Trigger para token_packages
  DROP TRIGGER IF EXISTS update_token_packages_updated_at ON token_packages;
  CREATE TRIGGER update_token_packages_updated_at
    BEFORE UPDATE ON token_packages
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

  -- Função para processar compra de tokens
  CREATE OR REPLACE FUNCTION process_token_purchase()
  RETURNS TRIGGER AS $$
  BEGIN
    -- Quando uma compra é completada, adicionar tokens ao usuário
    IF NEW.payment_status = 'completed' AND OLD.payment_status != 'completed' THEN
      UPDATE user_profiles 
      SET 
        total_tokens = total_tokens + NEW.tokens_amount,
        updated_at = NOW()
      WHERE id = NEW.user_id;
      
      -- Registrar atividade
      INSERT INTO user_activities (user_id, activity_type, description, metadata)
      VALUES (
        NEW.user_id, 
        'token_purchase', 
        'Comprou ' || NEW.tokens_amount || ' tokens',
        jsonb_build_object(
          'purchase_id', NEW.id,
          'package', NEW.package_name,
          'amount', NEW.tokens_amount,
          'price', NEW.price_paid
        )
      );
    END IF;
    
    RETURN NEW;
  END;
  $$ language 'plpgsql';

  -- Trigger para processar compras
  DROP TRIGGER IF EXISTS process_token_purchase_trigger ON token_purchases;
  CREATE TRIGGER process_token_purchase_trigger
    AFTER UPDATE ON token_purchases
    FOR EACH ROW
    EXECUTE FUNCTION process_token_purchase();

  -- Função para registrar uso de tokens
  CREATE OR REPLACE FUNCTION record_token_usage()
  RETURNS TRIGGER AS $$
  BEGIN
    -- Atualizar contadores no perfil
    UPDATE user_profiles 
    SET 
      tokens_used = tokens_used + NEW.tokens_used,
      total_generated_content = total_generated_content + 1,
      updated_at = NOW()
    WHERE id = NEW.user_id;
    
    -- Registrar atividade
    INSERT INTO user_activities (user_id, activity_type, description, metadata)
    VALUES (
      NEW.user_id, 
      'token_usage', 
      'Usou ' || NEW.tokens_used || ' tokens para ' || NEW.action_type,
      jsonb_build_object(
        'usage_id', NEW.id,
        'action', NEW.action_type,
        'tokens', NEW.tokens_used
      )
    );
    
    RETURN NEW;
  END;
  $$ language 'plpgsql';

  -- Trigger para uso de tokens
  DROP TRIGGER IF EXISTS record_token_usage_trigger ON token_usage;
  CREATE TRIGGER record_token_usage_trigger
    AFTER INSERT ON token_usage
    FOR EACH ROW
    EXECUTE FUNCTION record_token_usage();

  -- =====================================================
  -- ROW LEVEL SECURITY (RLS)
  -- =====================================================

  -- Habilitar RLS
  ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
  ALTER TABLE token_purchases ENABLE ROW LEVEL SECURITY;
  ALTER TABLE token_usage ENABLE ROW LEVEL SECURITY;
  ALTER TABLE token_packages ENABLE ROW LEVEL SECURITY;
  ALTER TABLE user_activities ENABLE ROW LEVEL SECURITY;

  -- Políticas para user_profiles
  DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
  CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = id);

  DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
  CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = id);

  DROP POLICY IF EXISTS "Public profiles are viewable" ON user_profiles;
  CREATE POLICY "Public profiles are viewable" ON user_profiles
    FOR SELECT USING (profile_visibility = 'public');

  -- Políticas para token_purchases
  DROP POLICY IF EXISTS "Users can view own purchases" ON token_purchases;
  CREATE POLICY "Users can view own purchases" ON token_purchases
    FOR SELECT USING (auth.uid() = user_id);

  DROP POLICY IF EXISTS "Users can insert own purchases" ON token_purchases;
  CREATE POLICY "Users can insert own purchases" ON token_purchases
    FOR INSERT WITH CHECK (auth.uid() = user_id);

  -- Políticas para token_usage
  DROP POLICY IF EXISTS "Users can view own usage" ON token_usage;
  CREATE POLICY "Users can view own usage" ON token_usage
    FOR SELECT USING (auth.uid() = user_id);

  DROP POLICY IF EXISTS "System can insert usage" ON token_usage;
  CREATE POLICY "System can insert usage" ON token_usage
    FOR INSERT WITH CHECK (true);

  -- Políticas para token_packages
  DROP POLICY IF EXISTS "Everyone can view active packages" ON token_packages;
  CREATE POLICY "Everyone can view active packages" ON token_packages
    FOR SELECT USING (is_active = true);

  -- Políticas para user_activities
  DROP POLICY IF EXISTS "Users can view own activities" ON user_activities;
  CREATE POLICY "Users can view own activities" ON user_activities
    FOR SELECT USING (auth.uid() = user_id);

  -- =====================================================
  -- DADOS INICIAIS
  -- =====================================================

  -- Inserir pacotes de tokens padrão
  INSERT INTO token_packages (name, description, tokens_amount, price, is_featured, sort_order)
  VALUES 
    ('Starter Pack', 'Perfeito para começar', 100, 9.99, false, 1),
    ('Popular Pack', 'Melhor custo-benefício', 500, 39.99, true, 2),
    ('Pro Pack', 'Para usuários avançados', 1000, 69.99, false, 3),
    ('Ultimate Pack', 'Máximo valor', 2500, 149.99, false, 4)
  ON CONFLICT (name) DO NOTHING;

  `;

  try {
    console.log('1️⃣ Criando tabelas do sistema de perfil...');
    
    // Executar SQL usando a função exec_sql personalizada ou diretamente
    const { error } = await supabaseAdmin.rpc('exec_sql', { 
      sql: profileSystemSQL 
    });

    if (error) {
      console.log('⚠️ Usando método alternativo para criar tabelas...');
      // Se rpc falhar, tentar executar partes individuais
      await executeAlternativeSQL(supabaseAdmin);
    } else {
      console.log('✅ Sistema de perfil criado com sucesso!');
    }

    console.log('\n2️⃣ Criando perfis para usuários existentes...');
    await createProfilesForExistingUsers(supabaseAdmin);

    console.log('\n3️⃣ Verificando integridade do sistema...');
    await verifySystemIntegrity(supabaseAdmin);

    console.log('\n🎉 SISTEMA DE PERFIL COMPLETO!\n');

  } catch (error) {
    console.error('❌ Erro ao criar sistema:', error);
  }
}

async function executeAlternativeSQL(supabase) {
  // Criar tabelas uma por uma se o método rpc falhar
  const tables = [
    `CREATE TABLE IF NOT EXISTS user_profiles (
      id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
      full_name VARCHAR(255) NOT NULL,
      display_name VARCHAR(100),
      email VARCHAR(255) NOT NULL UNIQUE,
      avatar_url TEXT,
      bio TEXT,
      location VARCHAR(255),
      website VARCHAR(500),
      phone VARCHAR(50),
      birth_date DATE,
      subscription_tier VARCHAR(50) DEFAULT 'free',
      total_tokens INTEGER DEFAULT 0,
      tokens_used INTEGER DEFAULT 0,
      profile_visibility VARCHAR(20) DEFAULT 'public',
      email_notifications BOOLEAN DEFAULT true,
      push_notifications BOOLEAN DEFAULT true,
      marketing_emails BOOLEAN DEFAULT false,
      total_projects INTEGER DEFAULT 0,
      total_generated_content INTEGER DEFAULT 0,
      account_creation_date TIMESTAMPTZ DEFAULT NOW(),
      last_login TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )`,
    
    `CREATE TABLE IF NOT EXISTS token_purchases (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      package_name VARCHAR(100) NOT NULL,
      tokens_amount INTEGER NOT NULL,
      price_paid DECIMAL(10,2) NOT NULL,
      currency VARCHAR(3) DEFAULT 'USD',
      payment_method VARCHAR(50),
      payment_provider VARCHAR(50),
      transaction_id VARCHAR(255) UNIQUE,
      payment_status VARCHAR(20) DEFAULT 'pending',
      purchased_at TIMESTAMPTZ DEFAULT NOW(),
      processed_at TIMESTAMPTZ,
      metadata JSONB DEFAULT '{}'
    )`,

    `CREATE TABLE IF NOT EXISTS token_packages (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      name VARCHAR(100) NOT NULL UNIQUE,
      description TEXT,
      tokens_amount INTEGER NOT NULL,
      price DECIMAL(10,2) NOT NULL,
      currency VARCHAR(3) DEFAULT 'USD',
      is_active BOOLEAN DEFAULT true,
      is_featured BOOLEAN DEFAULT false,
      sort_order INTEGER DEFAULT 0,
      discount_percentage INTEGER DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )`
  ];

  for (const table of tables) {
    try {
      await supabase.rpc('exec_sql', { sql: table });
    } catch (e) {
      console.log(`⚠️ Tabela pode já existir: ${e.message.substring(0, 50)}...`);
    }
  }
}

async function createProfilesForExistingUsers(supabase) {
  try {
    // Buscar usuários existentes
    const { data: users } = await supabase
      .from('users')
      .select('id, name, email');

    if (users && users.length > 0) {
      console.log(`📋 Encontrados ${users.length} usuários para criar perfis`);

      for (const user of users) {
        try {
          await supabase
            .from('user_profiles')
            .upsert({
              id: user.id,
              full_name: user.name || 'Usuário',
              email: user.email,
              total_tokens: 100, // Tokens gratuitos iniciais
              subscription_tier: 'free'
            }, { 
              onConflict: 'id',
              ignoreDuplicates: false 
            });

          console.log(`✅ Perfil criado para: ${user.name || user.email}`);
        } catch (error) {
          console.log(`⚠️ Erro ao criar perfil para ${user.email}: ${error.message}`);
        }
      }
    }
  } catch (error) {
    console.log('⚠️ Erro ao criar perfis:', error.message);
  }
}

async function verifySystemIntegrity(supabase) {
  try {
    // Verificar se as tabelas existem
    const tables = ['user_profiles', 'token_purchases', 'token_packages'];
    
    for (const table of tables) {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);

      if (error) {
        console.log(`❌ Erro ao acessar tabela ${table}: ${error.message}`);
      } else {
        console.log(`✅ Tabela ${table} acessível`);
      }
    }

    // Verificar pacotes de tokens
    const { data: packages } = await supabase
      .from('token_packages')
      .select('*');

    console.log(`📦 ${packages?.length || 0} pacotes de tokens disponíveis`);

    // Verificar perfis de usuário
    const { data: profiles } = await supabase
      .from('user_profiles')
      .select('*');

    console.log(`👤 ${profiles?.length || 0} perfis de usuário criados`);

  } catch (error) {
    console.log('⚠️ Erro na verificação:', error.message);
  }
}

createUserProfileSystem().catch(console.error);