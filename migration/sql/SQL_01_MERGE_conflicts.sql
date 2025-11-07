-- ════════════════════════════════════════════════════════════════
-- SQL PARTE 1: MERGE DE UTILIZADORES CONFLITANTES
-- ════════════════════════════════════════════════════════════════
-- Data: 2025-11-07T03:33:55.497Z
-- Conflitos: 2
-- REGRA: UUID da DUA COIN é preservado, dados da DUA IA são mesclados
-- ════════════════════════════════════════════════════════════════


-- ────────────────────────────────────────────────────────────────
-- MERGE: dev@dua.com
-- UUID DUA COIN (mantido): 22b7436c-41be-4332-859e-9d2315bcfe1f
-- UUID DUA IA (descartado): 4108aea5-9e82-4620-8c1c-a6a8b5878f7b
-- ────────────────────────────────────────────────────────────────

-- Atualizar profile com dados mesclados
UPDATE public.profiles SET
  full_name = 'Usuário',
  avatar_url = 'https://api.dicebear.com/9.x/notionists/svg?seed=Bella&backgroundColor=b6e3f4&radius=50',
  credits = COALESCE(credits, 0) + 999999,
  updated_at = NOW()
WHERE id = '22b7436c-41be-4332-859e-9d2315bcfe1f';

-- Criar/atualizar na tabela users
INSERT INTO public.users (id, email, display_name, has_access, subscription_tier, total_tokens, created_at)
VALUES (
  '22b7436c-41be-4332-859e-9d2315bcfe1f',
  'dev@dua.com',
  'Usuário',
  true,
  'free',
  999999,
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  total_tokens = public.users.total_tokens + EXCLUDED.total_tokens,
  updated_at = NOW();

-- Migrar 60 audit logs
INSERT INTO public.audit_logs (user_id, action, details, ip_address, user_agent, created_at)
VALUES (
  '22b7436c-41be-4332-859e-9d2315bcfe1f',
  'custom.sw_registered',
  '{"url":"https://v0-remix-of-untitled-chat-liard-one.vercel.app/chat","scope":"https://v0-remix-of-untitled-chat-liard-one.vercel.app/","sessionId":"session_1762389686094_knckibwdaea","timestamp":"2025-11-06T15:18:12.490Z","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36"}',
  '85.240.177.102',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',
  '2025-11-06T15:18:17.961941+00:00'
);

INSERT INTO public.audit_logs (user_id, action, details, ip_address, user_agent, created_at)
VALUES (
  '22b7436c-41be-4332-859e-9d2315bcfe1f',
  'custom.sw_registered',
  '{"url":"https://v0-remix-of-untitled-chat-liard-one.vercel.app/chat","scope":"https://v0-remix-of-untitled-chat-liard-one.vercel.app/","sessionId":"session_1762389686094_knckibwdaea","timestamp":"2025-11-06T15:18:12.491Z","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36"}',
  '85.240.177.102',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',
  '2025-11-06T15:18:18.430936+00:00'
);

INSERT INTO public.audit_logs (user_id, action, details, ip_address, user_agent, created_at)
VALUES (
  '22b7436c-41be-4332-859e-9d2315bcfe1f',
  'custom.sw_registered',
  '{"url":"https://v0-remix-of-untitled-chat-liard-one.vercel.app/","scope":"https://v0-remix-of-untitled-chat-liard-one.vercel.app/","sessionId":"session_1762389686094_knckibwdaea","timestamp":"2025-11-06T15:57:27.790Z","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36"}',
  '85.240.177.102',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',
  '2025-11-06T15:57:43.179187+00:00'
);

INSERT INTO public.audit_logs (user_id, action, details, ip_address, user_agent, created_at)
VALUES (
  '22b7436c-41be-4332-859e-9d2315bcfe1f',
  'custom.sw_registered',
  '{"url":"https://v0-remix-of-untitled-chat-liard-one.vercel.app/","scope":"https://v0-remix-of-untitled-chat-liard-one.vercel.app/","sessionId":"session_1762389686094_knckibwdaea","timestamp":"2025-11-06T15:57:27.959Z","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36"}',
  '85.240.177.102',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',
  '2025-11-06T15:57:43.771384+00:00'
);

INSERT INTO public.audit_logs (user_id, action, details, ip_address, user_agent, created_at)
VALUES (
  '22b7436c-41be-4332-859e-9d2315bcfe1f',
  'custom.sw_registered',
  '{"url":"https://v0-remix-of-untitled-chat-liard-one.vercel.app/chat","scope":"https://v0-remix-of-untitled-chat-liard-one.vercel.app/","sessionId":"session_1762389686094_knckibwdaea","timestamp":"2025-11-06T15:58:04.972Z","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36"}',
  '85.240.177.102',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',
  '2025-11-06T15:58:08.245857+00:00'
);

INSERT INTO public.audit_logs (user_id, action, details, ip_address, user_agent, created_at)
VALUES (
  '22b7436c-41be-4332-859e-9d2315bcfe1f',
  'custom.sw_registered',
  '{"url":"https://v0-remix-of-untitled-chat-liard-one.vercel.app/chat","scope":"https://v0-remix-of-untitled-chat-liard-one.vercel.app/","sessionId":"session_1762389686094_knckibwdaea","timestamp":"2025-11-06T15:58:04.972Z","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36"}',
  '85.240.177.102',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',
  '2025-11-06T15:58:08.599251+00:00'
);

INSERT INTO public.audit_logs (user_id, action, details, ip_address, user_agent, created_at)
VALUES (
  '22b7436c-41be-4332-859e-9d2315bcfe1f',
  'custom.sw_registered',
  '{"url":"https://v0-remix-of-untitled-chat-liard-one.vercel.app/admin","scope":"https://v0-remix-of-untitled-chat-liard-one.vercel.app/","sessionId":"session_1762389686094_knckibwdaea","timestamp":"2025-11-06T16:02:45.792Z","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36"}',
  '85.240.177.102',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',
  '2025-11-06T16:02:51.252838+00:00'
);

INSERT INTO public.audit_logs (user_id, action, details, ip_address, user_agent, created_at)
VALUES (
  '22b7436c-41be-4332-859e-9d2315bcfe1f',
  'custom.sw_registered',
  '{"url":"https://v0-remix-of-untitled-chat-liard-one.vercel.app/admin","scope":"https://v0-remix-of-untitled-chat-liard-one.vercel.app/","sessionId":"session_1762389686094_knckibwdaea","timestamp":"2025-11-06T16:02:45.793Z","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36"}',
  '85.240.177.102',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',
  '2025-11-06T16:02:51.698313+00:00'
);

INSERT INTO public.audit_logs (user_id, action, details, ip_address, user_agent, created_at)
VALUES (
  '22b7436c-41be-4332-859e-9d2315bcfe1f',
  'custom.sw_registered',
  '{"url":"https://v0-remix-of-untitled-chat-liard-one.vercel.app/admin","scope":"https://v0-remix-of-untitled-chat-liard-one.vercel.app/","sessionId":"session_1762389686094_knckibwdaea","timestamp":"2025-11-06T16:04:40.808Z","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36"}',
  '85.240.177.102',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',
  '2025-11-06T16:04:46.292664+00:00'
);

INSERT INTO public.audit_logs (user_id, action, details, ip_address, user_agent, created_at)
VALUES (
  '22b7436c-41be-4332-859e-9d2315bcfe1f',
  'custom.sw_registered',
  '{"url":"https://v0-remix-of-untitled-chat-liard-one.vercel.app/admin","scope":"https://v0-remix-of-untitled-chat-liard-one.vercel.app/","sessionId":"session_1762389686094_knckibwdaea","timestamp":"2025-11-06T16:04:40.808Z","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36"}',
  '85.240.177.102',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',
  '2025-11-06T16:04:46.680576+00:00'
);

INSERT INTO public.audit_logs (user_id, action, details, ip_address, user_agent, created_at)
VALUES (
  '22b7436c-41be-4332-859e-9d2315bcfe1f',
  'custom.sw_registered',
  '{"url":"https://v0-remix-of-untitled-chat-liard-one.vercel.app/","scope":"https://v0-remix-of-untitled-chat-liard-one.vercel.app/","sessionId":"session_1762389686094_knckibwdaea","timestamp":"2025-11-06T16:19:45.814Z","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36"}',
  '85.240.177.102',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',
  '2025-11-06T16:19:57.550761+00:00'
);

INSERT INTO public.audit_logs (user_id, action, details, ip_address, user_agent, created_at)
VALUES (
  '22b7436c-41be-4332-859e-9d2315bcfe1f',
  'custom.sw_registered',
  '{"url":"https://v0-remix-of-untitled-chat-liard-one.vercel.app/","scope":"https://v0-remix-of-untitled-chat-liard-one.vercel.app/","sessionId":"session_1762389686094_knckibwdaea","timestamp":"2025-11-06T16:19:45.961Z","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36"}',
  '85.240.177.102',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',
  '2025-11-06T16:19:58.062528+00:00'
);

INSERT INTO public.audit_logs (user_id, action, details, ip_address, user_agent, created_at)
VALUES (
  '22b7436c-41be-4332-859e-9d2315bcfe1f',
  'custom.sw_registered',
  '{"url":"https://v0-remix-of-untitled-chat-liard-one.vercel.app/","scope":"https://v0-remix-of-untitled-chat-liard-one.vercel.app/","sessionId":"session_1762389686094_knckibwdaea","timestamp":"2025-11-06T16:24:31.317Z","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36"}',
  '85.240.177.102',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',
  '2025-11-06T16:33:19.839351+00:00'
);

INSERT INTO public.audit_logs (user_id, action, details, ip_address, user_agent, created_at)
VALUES (
  '22b7436c-41be-4332-859e-9d2315bcfe1f',
  'custom.sw_registered',
  '{"url":"https://v0-remix-of-untitled-chat-liard-one.vercel.app/admin","scope":"https://v0-remix-of-untitled-chat-liard-one.vercel.app/","sessionId":"session_1762389686094_knckibwdaea","timestamp":"2025-11-06T16:40:46.272Z","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36"}',
  '85.240.177.102',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',
  '2025-11-06T16:40:51.734528+00:00'
);

INSERT INTO public.audit_logs (user_id, action, details, ip_address, user_agent, created_at)
VALUES (
  '22b7436c-41be-4332-859e-9d2315bcfe1f',
  'custom.sw_registered',
  '{"url":"https://v0-remix-of-untitled-chat-liard-one.vercel.app/admin","scope":"https://v0-remix-of-untitled-chat-liard-one.vercel.app/","sessionId":"session_1762389686094_knckibwdaea","timestamp":"2025-11-06T16:40:46.272Z","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36"}',
  '85.240.177.102',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',
  '2025-11-06T16:40:52.157618+00:00'
);

INSERT INTO public.audit_logs (user_id, action, details, ip_address, user_agent, created_at)
VALUES (
  '22b7436c-41be-4332-859e-9d2315bcfe1f',
  'custom.sw_registered',
  '{"url":"https://v0-remix-of-untitled-chat-liard-one.vercel.app/chat","scope":"https://v0-remix-of-untitled-chat-liard-one.vercel.app/","sessionId":"session_1762389686094_knckibwdaea","timestamp":"2025-11-06T16:41:07.235Z","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36"}',
  '85.240.177.102',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',
  '2025-11-06T16:41:12.613952+00:00'
);

INSERT INTO public.audit_logs (user_id, action, details, ip_address, user_agent, created_at)
VALUES (
  '22b7436c-41be-4332-859e-9d2315bcfe1f',
  'custom.sw_registered',
  '{"url":"https://v0-remix-of-untitled-chat-liard-one.vercel.app/chat","scope":"https://v0-remix-of-untitled-chat-liard-one.vercel.app/","sessionId":"session_1762389686094_knckibwdaea","timestamp":"2025-11-06T16:41:07.235Z","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36"}',
  '85.240.177.102',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',
  '2025-11-06T16:41:12.950509+00:00'
);

INSERT INTO public.audit_logs (user_id, action, details, ip_address, user_agent, created_at)
VALUES (
  '22b7436c-41be-4332-859e-9d2315bcfe1f',
  'auth.login',
  '{"url":"https://v0-remix-of-untitled-chat-liard-one.vercel.app/login","method":"email","success":true,"sessionId":"session_1762389686094_knckibwdaea","timestamp":"2025-11-06T16:43:53.512Z","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36"}',
  '85.240.177.102',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',
  '2025-11-06T16:43:56.110975+00:00'
);

INSERT INTO public.audit_logs (user_id, action, details, ip_address, user_agent, created_at)
VALUES (
  '22b7436c-41be-4332-859e-9d2315bcfe1f',
  'custom.sw_registered',
  '{"url":"https://v0-remix-of-untitled-chat-liard-one.vercel.app/chat","scope":"https://v0-remix-of-untitled-chat-liard-one.vercel.app/","sessionId":"session_1762389686094_knckibwdaea","timestamp":"2025-11-06T16:50:29.691Z","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36"}',
  '85.240.177.102',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',
  '2025-11-06T16:50:35.031742+00:00'
);

INSERT INTO public.audit_logs (user_id, action, details, ip_address, user_agent, created_at)
VALUES (
  '22b7436c-41be-4332-859e-9d2315bcfe1f',
  'custom.sw_registered',
  '{"url":"https://v0-remix-of-untitled-chat-liard-one.vercel.app/chat","scope":"https://v0-remix-of-untitled-chat-liard-one.vercel.app/","sessionId":"session_1762389686094_knckibwdaea","timestamp":"2025-11-06T16:50:29.691Z","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36"}',
  '85.240.177.102',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',
  '2025-11-06T16:50:35.39487+00:00'
);

INSERT INTO public.audit_logs (user_id, action, details, ip_address, user_agent, created_at)
VALUES (
  '22b7436c-41be-4332-859e-9d2315bcfe1f',
  'custom.sw_registered',
  '{"url":"https://v0-remix-of-untitled-chat-liard-one.vercel.app/","scope":"https://v0-remix-of-untitled-chat-liard-one.vercel.app/","sessionId":"session_1762389686094_knckibwdaea","timestamp":"2025-11-06T18:55:00.318Z","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36"}',
  '85.240.177.102',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',
  '2025-11-06T18:55:30.635241+00:00'
);

INSERT INTO public.audit_logs (user_id, action, details, ip_address, user_agent, created_at)
VALUES (
  '22b7436c-41be-4332-859e-9d2315bcfe1f',
  'custom.sw_registered',
  '{"url":"https://v0-remix-of-untitled-chat-liard-one.vercel.app/","scope":"https://v0-remix-of-untitled-chat-liard-one.vercel.app/","sessionId":"session_1762389686094_knckibwdaea","timestamp":"2025-11-06T18:55:00.318Z","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36"}',
  '85.240.177.102',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',
  '2025-11-06T18:55:31.310591+00:00'
);

INSERT INTO public.audit_logs (user_id, action, details, ip_address, user_agent, created_at)
VALUES (
  '22b7436c-41be-4332-859e-9d2315bcfe1f',
  'custom.sw_registered',
  '{"url":"https://v0-remix-of-untitled-chat-liard-one.vercel.app/chat","scope":"https://v0-remix-of-untitled-chat-liard-one.vercel.app/","sessionId":"session_1762389686094_knckibwdaea","timestamp":"2025-11-06T18:55:53.712Z","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36"}',
  '85.240.177.102',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',
  '2025-11-06T18:55:56.601873+00:00'
);

INSERT INTO public.audit_logs (user_id, action, details, ip_address, user_agent, created_at)
VALUES (
  '22b7436c-41be-4332-859e-9d2315bcfe1f',
  'custom.sw_registered',
  '{"url":"https://v0-remix-of-untitled-chat-liard-one.vercel.app/chat","scope":"https://v0-remix-of-untitled-chat-liard-one.vercel.app/","sessionId":"session_1762389686094_knckibwdaea","timestamp":"2025-11-06T18:55:53.712Z","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36"}',
  '85.240.177.102',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',
  '2025-11-06T18:55:57.006935+00:00'
);

INSERT INTO public.audit_logs (user_id, action, details, ip_address, user_agent, created_at)
VALUES (
  '22b7436c-41be-4332-859e-9d2315bcfe1f',
  'custom.sw_registered',
  '{"url":"https://v0-remix-of-untitled-chat-liard-one.vercel.app/chat","scope":"https://v0-remix-of-untitled-chat-liard-one.vercel.app/","sessionId":"session_1762389686094_knckibwdaea","timestamp":"2025-11-06T18:59:14.681Z","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36"}',
  '85.240.177.102',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',
  '2025-11-06T18:59:20.098576+00:00'
);

INSERT INTO public.audit_logs (user_id, action, details, ip_address, user_agent, created_at)
VALUES (
  '22b7436c-41be-4332-859e-9d2315bcfe1f',
  'custom.sw_registered',
  '{"url":"https://v0-remix-of-untitled-chat-liard-one.vercel.app/chat","scope":"https://v0-remix-of-untitled-chat-liard-one.vercel.app/","sessionId":"session_1762389686094_knckibwdaea","timestamp":"2025-11-06T18:59:14.682Z","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36"}',
  '85.240.177.102',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',
  '2025-11-06T18:59:20.479499+00:00'
);

INSERT INTO public.audit_logs (user_id, action, details, ip_address, user_agent, created_at)
VALUES (
  '22b7436c-41be-4332-859e-9d2315bcfe1f',
  'custom.sw_registered',
  '{"url":"https://v0-remix-of-untitled-chat-liard-one.vercel.app/","scope":"https://v0-remix-of-untitled-chat-liard-one.vercel.app/","sessionId":"session_1762389686094_knckibwdaea","timestamp":"2025-11-06T19:14:13.245Z","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36"}',
  '85.240.177.102',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',
  '2025-11-06T19:14:27.384497+00:00'
);

INSERT INTO public.audit_logs (user_id, action, details, ip_address, user_agent, created_at)
VALUES (
  '22b7436c-41be-4332-859e-9d2315bcfe1f',
  'custom.sw_registered',
  '{"url":"https://v0-remix-of-untitled-chat-liard-one.vercel.app/","scope":"https://v0-remix-of-untitled-chat-liard-one.vercel.app/","sessionId":"session_1762389686094_knckibwdaea","timestamp":"2025-11-06T19:14:13.412Z","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36"}',
  '85.240.177.102',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',
  '2025-11-06T19:14:27.941012+00:00'
);

INSERT INTO public.audit_logs (user_id, action, details, ip_address, user_agent, created_at)
VALUES (
  '22b7436c-41be-4332-859e-9d2315bcfe1f',
  'custom.sw_registered',
  '{"url":"https://v0-remix-of-untitled-chat-liard-one.vercel.app/perfil","scope":"https://v0-remix-of-untitled-chat-liard-one.vercel.app/","sessionId":"session_1762389686094_knckibwdaea","timestamp":"2025-11-06T19:14:28.067Z","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36"}',
  '85.240.177.102',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',
  '2025-11-06T19:14:33.540472+00:00'
);

INSERT INTO public.audit_logs (user_id, action, details, ip_address, user_agent, created_at)
VALUES (
  '22b7436c-41be-4332-859e-9d2315bcfe1f',
  'custom.sw_registered',
  '{"url":"https://v0-remix-of-untitled-chat-liard-one.vercel.app/perfil","scope":"https://v0-remix-of-untitled-chat-liard-one.vercel.app/","sessionId":"session_1762389686094_knckibwdaea","timestamp":"2025-11-06T19:14:28.067Z","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36"}',
  '85.240.177.102',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',
  '2025-11-06T19:14:33.939559+00:00'
);

INSERT INTO public.audit_logs (user_id, action, details, ip_address, user_agent, created_at)
VALUES (
  '22b7436c-41be-4332-859e-9d2315bcfe1f',
  'custom.sw_registered',
  '{"url":"https://v0-remix-of-untitled-chat-liard-one.vercel.app/chat","scope":"https://v0-remix-of-untitled-chat-liard-one.vercel.app/","sessionId":"session_1762389686094_knckibwdaea","timestamp":"2025-11-06T19:22:09.406Z","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36"}',
  '85.240.177.102',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',
  '2025-11-06T19:22:14.478781+00:00'
);

INSERT INTO public.audit_logs (user_id, action, details, ip_address, user_agent, created_at)
VALUES (
  '22b7436c-41be-4332-859e-9d2315bcfe1f',
  'custom.sw_registered',
  '{"url":"https://v0-remix-of-untitled-chat-liard-one.vercel.app/chat","scope":"https://v0-remix-of-untitled-chat-liard-one.vercel.app/","sessionId":"session_1762389686094_knckibwdaea","timestamp":"2025-11-06T19:22:09.406Z","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36"}',
  '85.240.177.102',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',
  '2025-11-06T19:22:14.85755+00:00'
);

INSERT INTO public.audit_logs (user_id, action, details, ip_address, user_agent, created_at)
VALUES (
  '22b7436c-41be-4332-859e-9d2315bcfe1f',
  'custom.sw_registered',
  '{"url":"https://v0-remix-of-untitled-chat-liard-one.vercel.app/chat","scope":"https://v0-remix-of-untitled-chat-liard-one.vercel.app/","sessionId":"session_1762389686094_knckibwdaea","timestamp":"2025-11-06T19:22:22.742Z","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36"}',
  '85.240.177.102',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',
  '2025-11-06T19:22:28.331974+00:00'
);

INSERT INTO public.audit_logs (user_id, action, details, ip_address, user_agent, created_at)
VALUES (
  '22b7436c-41be-4332-859e-9d2315bcfe1f',
  'custom.sw_registered',
  '{"url":"https://v0-remix-of-untitled-chat-liard-one.vercel.app/chat","scope":"https://v0-remix-of-untitled-chat-liard-one.vercel.app/","sessionId":"session_1762389686094_knckibwdaea","timestamp":"2025-11-06T19:22:22.742Z","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36"}',
  '85.240.177.102',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',
  '2025-11-06T19:22:28.715894+00:00'
);

INSERT INTO public.audit_logs (user_id, action, details, ip_address, user_agent, created_at)
VALUES (
  '22b7436c-41be-4332-859e-9d2315bcfe1f',
  'custom.sw_registered',
  '{"url":"https://v0-remix-of-untitled-chat-liard-one.vercel.app/chat","scope":"https://v0-remix-of-untitled-chat-liard-one.vercel.app/","sessionId":"session_1762389686094_knckibwdaea","timestamp":"2025-11-06T19:37:12.734Z","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36"}',
  '85.240.177.102',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',
  '2025-11-06T19:37:18.185689+00:00'
);

INSERT INTO public.audit_logs (user_id, action, details, ip_address, user_agent, created_at)
VALUES (
  '22b7436c-41be-4332-859e-9d2315bcfe1f',
  'custom.sw_registered',
  '{"url":"https://v0-remix-of-untitled-chat-liard-one.vercel.app/chat","scope":"https://v0-remix-of-untitled-chat-liard-one.vercel.app/","sessionId":"session_1762389686094_knckibwdaea","timestamp":"2025-11-06T19:37:12.734Z","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36"}',
  '85.240.177.102',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',
  '2025-11-06T19:37:18.569569+00:00'
);

INSERT INTO public.audit_logs (user_id, action, details, ip_address, user_agent, created_at)
VALUES (
  '22b7436c-41be-4332-859e-9d2315bcfe1f',
  'custom.sw_registered',
  '{"url":"https://v0-remix-of-untitled-chat-liard-one.vercel.app/chat","scope":"https://v0-remix-of-untitled-chat-liard-one.vercel.app/","sessionId":"session_1762389686094_knckibwdaea","timestamp":"2025-11-06T19:43:20.090Z","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36"}',
  '85.240.177.102',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',
  '2025-11-06T19:43:25.468511+00:00'
);

INSERT INTO public.audit_logs (user_id, action, details, ip_address, user_agent, created_at)
VALUES (
  '22b7436c-41be-4332-859e-9d2315bcfe1f',
  'custom.sw_registered',
  '{"url":"https://v0-remix-of-untitled-chat-liard-one.vercel.app/chat","scope":"https://v0-remix-of-untitled-chat-liard-one.vercel.app/","sessionId":"session_1762389686094_knckibwdaea","timestamp":"2025-11-06T19:43:20.090Z","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36"}',
  '85.240.177.102',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',
  '2025-11-06T19:43:25.835545+00:00'
);

INSERT INTO public.audit_logs (user_id, action, details, ip_address, user_agent, created_at)
VALUES (
  '22b7436c-41be-4332-859e-9d2315bcfe1f',
  'custom.sw_registered',
  '{"url":"https://v0-remix-of-untitled-chat-liard-one.vercel.app/","scope":"https://v0-remix-of-untitled-chat-liard-one.vercel.app/","sessionId":"session_1762389686094_knckibwdaea","timestamp":"2025-11-06T20:08:37.162Z","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36"}',
  '85.240.177.102',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',
  '2025-11-06T20:09:52.085096+00:00'
);

INSERT INTO public.audit_logs (user_id, action, details, ip_address, user_agent, created_at)
VALUES (
  '22b7436c-41be-4332-859e-9d2315bcfe1f',
  'custom.sw_registered',
  '{"url":"https://v0-remix-of-untitled-chat-liard-one.vercel.app/","scope":"https://v0-remix-of-untitled-chat-liard-one.vercel.app/","sessionId":"session_1762389686094_knckibwdaea","timestamp":"2025-11-06T20:12:03.759Z","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36"}',
  '85.240.177.102',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',
  '2025-11-06T20:13:32.01271+00:00'
);

INSERT INTO public.audit_logs (user_id, action, details, ip_address, user_agent, created_at)
VALUES (
  '22b7436c-41be-4332-859e-9d2315bcfe1f',
  'custom.sw_registered',
  '{"url":"https://v0-remix-of-untitled-chat-liard-one.vercel.app/","scope":"https://v0-remix-of-untitled-chat-liard-one.vercel.app/","sessionId":"session_1762389686094_knckibwdaea","timestamp":"2025-11-06T20:12:03.759Z","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36"}',
  '85.240.177.102',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',
  '2025-11-06T22:31:22.190097+00:00'
);

INSERT INTO public.audit_logs (user_id, action, details, ip_address, user_agent, created_at)
VALUES (
  '22b7436c-41be-4332-859e-9d2315bcfe1f',
  'custom.sw_registered',
  '{"url":"https://v0-remix-of-untitled-chat-liard-one.vercel.app/","scope":"https://v0-remix-of-untitled-chat-liard-one.vercel.app/","sessionId":"session_1762389686094_knckibwdaea","timestamp":"2025-11-06T23:53:42.299Z","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36"}',
  '85.240.177.102',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',
  '2025-11-06T23:55:21.507979+00:00'
);

INSERT INTO public.audit_logs (user_id, action, details, ip_address, user_agent, created_at)
VALUES (
  '22b7436c-41be-4332-859e-9d2315bcfe1f',
  'custom.sw_registered',
  '{"url":"https://v0-remix-of-untitled-chat-liard-one.vercel.app/","scope":"https://v0-remix-of-untitled-chat-liard-one.vercel.app/","sessionId":"session_1762389686094_knckibwdaea","timestamp":"2025-11-07T00:07:00.503Z","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36"}',
  '85.240.177.102',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',
  '2025-11-07T00:09:45.337582+00:00'
);

INSERT INTO public.audit_logs (user_id, action, details, ip_address, user_agent, created_at)
VALUES (
  '22b7436c-41be-4332-859e-9d2315bcfe1f',
  'custom.sw_registered',
  '{"url":"https://v0-remix-of-untitled-chat-liard-one.vercel.app/","scope":"https://v0-remix-of-untitled-chat-liard-one.vercel.app/","sessionId":"session_1762389686094_knckibwdaea","timestamp":"2025-11-07T00:07:00.732Z","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36"}',
  '85.240.177.102',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',
  '2025-11-07T00:09:45.812741+00:00'
);

INSERT INTO public.audit_logs (user_id, action, details, ip_address, user_agent, created_at)
VALUES (
  '22b7436c-41be-4332-859e-9d2315bcfe1f',
  'custom.sw_registered',
  '{"url":"https://v0-remix-of-untitled-chat-liard-one.vercel.app/","scope":"https://v0-remix-of-untitled-chat-liard-one.vercel.app/","sessionId":"session_1762389686094_knckibwdaea","timestamp":"2025-11-07T01:20:41.236Z","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36"}',
  '85.240.177.102',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',
  '2025-11-07T01:21:24.289264+00:00'
);

INSERT INTO public.audit_logs (user_id, action, details, ip_address, user_agent, created_at)
VALUES (
  '22b7436c-41be-4332-859e-9d2315bcfe1f',
  'custom.sw_registered',
  '{"url":"https://v0-remix-of-untitled-chat-liard-one.vercel.app/community","scope":"https://v0-remix-of-untitled-chat-liard-one.vercel.app/","sessionId":"session_1762389686094_knckibwdaea","timestamp":"2025-11-07T02:02:17.454Z","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36"}',
  '85.240.177.102',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',
  '2025-11-07T02:02:24.014388+00:00'
);

INSERT INTO public.audit_logs (user_id, action, details, ip_address, user_agent, created_at)
VALUES (
  '22b7436c-41be-4332-859e-9d2315bcfe1f',
  'custom.sw_registered',
  '{"url":"https://v0-remix-of-untitled-chat-liard-one.vercel.app/community","scope":"https://v0-remix-of-untitled-chat-liard-one.vercel.app/","sessionId":"session_1762389686094_knckibwdaea","timestamp":"2025-11-07T02:02:17.454Z","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36"}',
  '85.240.177.102',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',
  '2025-11-07T02:02:27.043908+00:00'
);

INSERT INTO public.audit_logs (user_id, action, details, ip_address, user_agent, created_at)
VALUES (
  '22b7436c-41be-4332-859e-9d2315bcfe1f',
  'custom.sw_registered',
  '{"url":"https://v0-remix-of-untitled-chat-liard-one.vercel.app/community","scope":"https://v0-remix-of-untitled-chat-liard-one.vercel.app/","sessionId":"session_1762389686094_knckibwdaea","timestamp":"2025-11-07T02:07:50.297Z","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36"}',
  '85.240.177.102',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',
  '2025-11-07T02:07:55.785332+00:00'
);

INSERT INTO public.audit_logs (user_id, action, details, ip_address, user_agent, created_at)
VALUES (
  '22b7436c-41be-4332-859e-9d2315bcfe1f',
  'custom.sw_registered',
  '{"url":"https://v0-remix-of-untitled-chat-liard-one.vercel.app/community","scope":"https://v0-remix-of-untitled-chat-liard-one.vercel.app/","sessionId":"session_1762389686094_knckibwdaea","timestamp":"2025-11-07T02:07:50.297Z","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36"}',
  '85.240.177.102',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',
  '2025-11-07T02:07:56.172002+00:00'
);

INSERT INTO public.audit_logs (user_id, action, details, ip_address, user_agent, created_at)
VALUES (
  '22b7436c-41be-4332-859e-9d2315bcfe1f',
  'custom.sw_registered',
  '{"url":"https://v0-remix-of-untitled-chat-liard-one.vercel.app/imagestudio","scope":"https://v0-remix-of-untitled-chat-liard-one.vercel.app/","sessionId":"session_1762389686094_knckibwdaea","timestamp":"2025-11-07T02:16:43.083Z","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36"}',
  '85.240.177.102',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',
  '2025-11-07T02:16:48.403342+00:00'
);

INSERT INTO public.audit_logs (user_id, action, details, ip_address, user_agent, created_at)
VALUES (
  '22b7436c-41be-4332-859e-9d2315bcfe1f',
  'custom.sw_registered',
  '{"url":"https://v0-remix-of-untitled-chat-liard-one.vercel.app/imagestudio","scope":"https://v0-remix-of-untitled-chat-liard-one.vercel.app/","sessionId":"session_1762389686094_knckibwdaea","timestamp":"2025-11-07T02:16:43.083Z","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36"}',
  '85.240.177.102',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',
  '2025-11-07T02:16:48.754953+00:00'
);

INSERT INTO public.audit_logs (user_id, action, details, ip_address, user_agent, created_at)
VALUES (
  '22b7436c-41be-4332-859e-9d2315bcfe1f',
  'navigation.page_access',
  '{"url":"https://v0-remix-of-untitled-chat-liard-one.vercel.app/acesso","page":"/acesso","sessionId":"session_1762389686094_knckibwdaea","timestamp":"2025-11-07T02:16:59.565Z","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36"}',
  '85.240.177.102',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',
  '2025-11-07T02:17:03.815512+00:00'
);

INSERT INTO public.audit_logs (user_id, action, details, ip_address, user_agent, created_at)
VALUES (
  '22b7436c-41be-4332-859e-9d2315bcfe1f',
  'custom.sw_registered',
  '{"url":"https://v0-remix-of-untitled-chat-liard-one.vercel.app/","scope":"https://v0-remix-of-untitled-chat-liard-one.vercel.app/","sessionId":"session_1762389686094_knckibwdaea","timestamp":"2025-11-07T02:55:17.238Z","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36"}',
  '149.22.86.247',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',
  '2025-11-07T02:55:28.58432+00:00'
);

INSERT INTO public.audit_logs (user_id, action, details, ip_address, user_agent, created_at)
VALUES (
  '22b7436c-41be-4332-859e-9d2315bcfe1f',
  'custom.sw_registered',
  '{"url":"https://v0-remix-of-untitled-chat-liard-one.vercel.app/","scope":"https://v0-remix-of-untitled-chat-liard-one.vercel.app/","sessionId":"session_1762389686094_knckibwdaea","timestamp":"2025-11-07T02:55:17.239Z","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36"}',
  '149.22.86.247',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',
  '2025-11-07T02:55:29.176759+00:00'
);

INSERT INTO public.audit_logs (user_id, action, details, ip_address, user_agent, created_at)
VALUES (
  '22b7436c-41be-4332-859e-9d2315bcfe1f',
  'custom.sw_registered',
  '{"url":"https://v0-remix-of-untitled-chat-liard-one.vercel.app/admin","scope":"https://v0-remix-of-untitled-chat-liard-one.vercel.app/","sessionId":"session_1762389686094_knckibwdaea","timestamp":"2025-11-07T02:56:41.142Z","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36"}',
  '149.22.86.247',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',
  '2025-11-07T02:56:46.600004+00:00'
);

INSERT INTO public.audit_logs (user_id, action, details, ip_address, user_agent, created_at)
VALUES (
  '22b7436c-41be-4332-859e-9d2315bcfe1f',
  'custom.sw_registered',
  '{"url":"https://v0-remix-of-untitled-chat-liard-one.vercel.app/admin","scope":"https://v0-remix-of-untitled-chat-liard-one.vercel.app/","sessionId":"session_1762389686094_knckibwdaea","timestamp":"2025-11-07T02:56:41.142Z","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36"}',
  '149.22.86.247',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',
  '2025-11-07T02:56:46.96644+00:00'
);

INSERT INTO public.audit_logs (user_id, action, details, ip_address, user_agent, created_at)
VALUES (
  '22b7436c-41be-4332-859e-9d2315bcfe1f',
  'custom.sw_registered',
  '{"url":"https://v0-remix-of-untitled-chat-liard-one.vercel.app/","scope":"https://v0-remix-of-untitled-chat-liard-one.vercel.app/","sessionId":"session_1762389686094_knckibwdaea","timestamp":"2025-11-07T02:57:20.602Z","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36"}',
  '149.22.86.247',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',
  '2025-11-07T02:57:26.030963+00:00'
);

INSERT INTO public.audit_logs (user_id, action, details, ip_address, user_agent, created_at)
VALUES (
  '22b7436c-41be-4332-859e-9d2315bcfe1f',
  'custom.sw_registered',
  '{"url":"https://v0-remix-of-untitled-chat-liard-one.vercel.app/","scope":"https://v0-remix-of-untitled-chat-liard-one.vercel.app/","sessionId":"session_1762389686094_knckibwdaea","timestamp":"2025-11-07T02:57:20.603Z","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36"}',
  '149.22.86.247',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',
  '2025-11-07T02:57:26.367817+00:00'
);

INSERT INTO public.audit_logs (user_id, action, details, ip_address, user_agent, created_at)
VALUES (
  '22b7436c-41be-4332-859e-9d2315bcfe1f',
  'custom.sw_registered',
  '{"url":"https://v0-remix-of-untitled-chat-liard-one.vercel.app/chat","scope":"https://v0-remix-of-untitled-chat-liard-one.vercel.app/","sessionId":"session_1762389686094_knckibwdaea","timestamp":"2025-11-07T02:57:43.472Z","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36"}',
  '149.22.86.247',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',
  '2025-11-07T02:57:46.021296+00:00'
);

INSERT INTO public.audit_logs (user_id, action, details, ip_address, user_agent, created_at)
VALUES (
  '22b7436c-41be-4332-859e-9d2315bcfe1f',
  'custom.sw_registered',
  '{"url":"https://v0-remix-of-untitled-chat-liard-one.vercel.app/chat","scope":"https://v0-remix-of-untitled-chat-liard-one.vercel.app/","sessionId":"session_1762389686094_knckibwdaea","timestamp":"2025-11-07T02:57:43.472Z","userAgent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36"}',
  '149.22.86.247',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',
  '2025-11-07T02:57:46.357234+00:00'
);


-- ────────────────────────────────────────────────────────────────
-- MERGE: estracaofficial@gmail.com
-- UUID DUA COIN (mantido): 3606c797-0eb8-4fdb-a150-50d51ffaf460
-- UUID DUA IA (descartado): a3261e1f-4b05-49e3-ac06-2f430d007c3a
-- ────────────────────────────────────────────────────────────────

-- Atualizar profile com dados mesclados
UPDATE public.profiles SET
  full_name = 'Usuário',
  credits = COALESCE(credits, 0) + 60,
  updated_at = NOW()
WHERE id = '3606c797-0eb8-4fdb-a150-50d51ffaf460';

-- Criar/atualizar na tabela users
INSERT INTO public.users (id, email, display_name, has_access, subscription_tier, total_tokens, created_at)
VALUES (
  '3606c797-0eb8-4fdb-a150-50d51ffaf460',
  'estracaofficial@gmail.com',
  'Usuário',
  true,
  'free',
  60,
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  total_tokens = public.users.total_tokens + EXCLUDED.total_tokens,
  updated_at = NOW();

-- Migrar 2 audit logs
INSERT INTO public.audit_logs (user_id, action, details, ip_address, user_agent, created_at)
VALUES (
  '3606c797-0eb8-4fdb-a150-50d51ffaf460',
  'tokens_injected',
  '{"amount":100,"injected_by":"4108aea5-9e82-4620-8c1c-a6a8b5878f7b","new_balance":200,"previous_balance":100}',
  '::1/128',
  NULL,
  '2025-11-06T16:06:17.012277+00:00'
);

INSERT INTO public.audit_logs (user_id, action, details, ip_address, user_agent, created_at)
VALUES (
  '3606c797-0eb8-4fdb-a150-50d51ffaf460',
  'tokens_injected',
  '{"amount":100,"injected_by":"4108aea5-9e82-4620-8c1c-a6a8b5878f7b","new_balance":300,"previous_balance":200}',
  '::1/128',
  NULL,
  '2025-11-06T16:06:29.781327+00:00'
);

