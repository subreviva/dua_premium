-- Criar código de convite para testes
INSERT INTO invite_codes (code, active, unlimited, created_at)
VALUES ('DESIGNTEST2025', true, true, NOW())
ON CONFLICT (code) DO UPDATE
SET active = true, unlimited = true;
