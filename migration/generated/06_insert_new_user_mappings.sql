-- 06_insert_new_user_mappings.sql
-- IMPORTANTE: Executar APÓS criar os novos users via Admin API
-- Substituir <NEW_UUID> pelos UUIDs retornados pela API

BEGIN;

-- Email: dev@dua.com (old_id: 4108aea5-9e82-4620-8c1c-a6a8b5878f7b)
INSERT INTO migration_user_mapping (old_id, new_id, email) VALUES ('4108aea5-9e82-4620-8c1c-a6a8b5878f7b', '<NEW_UUID_FOR_dev@dua.com>', 'dev@dua.com');

COMMIT;

-- Total: 1 utilizadores novos a criar
