-- Inserir novos mapeamentos
BEGIN;

INSERT INTO migration_user_mapping (old_id, new_id, email) VALUES ('4108aea5-9e82-4620-8c1c-a6a8b5878f7b', '22b7436c-41be-4332-859e-9d2315bcfe1f', 'dev@dua.com');

COMMIT;
