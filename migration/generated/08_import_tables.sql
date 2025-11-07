-- 08_import_tables.sql
-- Importar tabelas com foreign keys corrigidas via mapeamento

BEGIN;

-- Criar tabelas de destino se não existirem (ajustar schemas conforme necessário)

CREATE TABLE IF NOT EXISTS codigos_acesso (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  usado BOOLEAN DEFAULT FALSE,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS perfis_usuarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  nome TEXT,
  bio TEXT,
  avatar_url TEXT,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS convites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  email_convidado TEXT,
  codigo TEXT,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS users_extra_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  metadata JSONB,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);


COMMIT;
