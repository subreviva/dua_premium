-- 04_insert_existing_mappings.sql
-- Inserir mapeamentos de users que já existem na DUA COIN

BEGIN;

INSERT INTO migration_user_mapping (old_id, new_id, email) VALUES ('a3261e1f-4b05-49e3-ac06-2f430d007c3a', '3606c797-0eb8-4fdb-a150-50d51ffaf460', 'estracaofficial@gmail.com');

COMMIT;

-- Total: 1 mapeamentos existentes
