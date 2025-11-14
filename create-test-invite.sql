-- Criar código de convite para teste
INSERT INTO public.invite_codes (code, active, created_at, used_by, used_at)
VALUES ('MUSICTEST2024', true, NOW(), NULL, NULL)
ON CONFLICT (code) DO UPDATE SET active = true, used_by = NULL, used_at = NULL;
