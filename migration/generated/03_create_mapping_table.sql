-- 03_create_mapping_table.sql
-- Criar tabela de mapeamento na DUA COIN

CREATE TABLE IF NOT EXISTS migration_user_mapping (
  old_id UUID PRIMARY KEY,
  new_id UUID NOT NULL,
  email TEXT NOT NULL,
  migrated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_migration_mapping_new_id ON migration_user_mapping(new_id);
CREATE INDEX IF NOT EXISTS idx_migration_mapping_email ON migration_user_mapping(email);
