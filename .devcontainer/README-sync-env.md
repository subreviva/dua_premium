# Sync de Variáveis (Vercel + Supabase)

Este diretório contém um script que sincroniza automaticamente as variáveis de ambiente da Vercel para um `.env.local` no Codespace e (opcionalmente) sincroniza o schema e tipos do Supabase.

Como funciona (automático):

- Ao abrir o Codespace, o `postCreateCommand` em `.devcontainer/devcontainer.json` executa:
  ```bash
  bash .devcontainer/sync-env.sh
  ```
- O script faz:
  1. Instala `vercel` CLI se necessário
 2. Executa `vercel env pull .env.local` para criar/atualizar o `.env.local`
 3. Sourcing do `.env.local` (localmente no script)
 4. Instala `supabase` CLI se necessário
 5. Se existir `SUPABASE_PROJECT_REF` em `.env.local`, tenta:
     - `supabase link --project-ref <PROJECT_REF>`
     - `supabase db pull --project-ref <PROJECT_REF> --file supabase/schema.sql`
     - `supabase gen types typescript --project-id <PROJECT_REF> > src/lib/supabase.types.ts`

Manual (passos exatos que o script executa):

1. Faça login na Vercel (localmente, se ainda não):

```bash
npm i -g vercel
vercel login
vercel link
vercel env pull .env.local
```

2. Faça login na Supabase CLI e link ao projeto (obter `PROJECT_REF` no dashboard Supabase):

```bash
npm i -g supabase
supabase login --token <SUPABASE_ACCESS_TOKEN>
supabase link --project-ref <PROJECT_REF>
supabase db pull --project-ref <PROJECT_REF> --file supabase/schema.sql
supabase gen types typescript --project-id <PROJECT_REF> > src/lib/supabase.types.ts
```

Notas de segurança:
- Nunca commit o `.env.local` no Git (já está no `.gitignore`).
- As variáveis oficiais devem estar na Vercel. O `.env.local` no Codespace é apenas uma cópia para desenvolvimento.

Se preferir não rodar o script automaticamente, remova/edite `postCreateCommand` em `.devcontainer/devcontainer.json`.
