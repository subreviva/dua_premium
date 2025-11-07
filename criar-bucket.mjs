#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://gocjbfcztorfswlkkjqi.supabase.co'
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdvY2piZmN6dG9yZnN3bGtranFpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjI4NjM1NSwiZXhwIjoyMDc3ODYyMzU1fQ.dKGt8xCd9sxG7yM5gGJKT0C8N0aPzKvvLGTQE0MQHAQ'

const log = {
  info: (m) => console.log(`\x1b[34m📋 ${m}\x1b[0m`),
  success: (m) => console.log(`\x1b[32m✅ ${m}\x1b[0m`),
  error: (m) => console.log(`\x1b[31m❌ ${m}\x1b[0m`)
}

async function criarBucket() {
  console.log('\n🪣 Criando Bucket Mercado via SQL\n')
  
  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { persistSession: false }
  })

  // Criar bucket via INSERT direto na tabela storage.buckets
  log.info('Inserindo bucket na tabela storage.buckets...')
  try {
    await supabase.rpc('exec', {
      query: `
        INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
        VALUES (
          'mercado',
          'mercado',
          true,
          52428800,
          ARRAY['audio/*', 'video/*', 'image/*', 'application/zip', 'application/pdf']
        )
        ON CONFLICT (id) DO UPDATE SET
          public = true,
          file_size_limit = 52428800;
      `
    })
    log.success('Bucket "mercado" criado via SQL!')
  } catch (err) {
    if (err.message?.includes('duplicate') || err.message?.includes('already exists')) {
      log.success('Bucket "mercado" já existe!')
    } else {
      log.error(`Erro: ${err.message}`)
    }
  }

  // Criar políticas de storage via SQL
  log.info('Criando políticas de storage...')
  try {
    await supabase.rpc('exec', {
      query: `
        -- Habilitar RLS na tabela storage.objects
        ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

        -- Policy 1: Public read
        DROP POLICY IF EXISTS "mercado_public_read" ON storage.objects;
        CREATE POLICY "mercado_public_read"
        ON storage.objects FOR SELECT
        USING (bucket_id = 'mercado');

        -- Policy 2: Authenticated upload
        DROP POLICY IF EXISTS "mercado_auth_upload" ON storage.objects;
        CREATE POLICY "mercado_auth_upload"
        ON storage.objects FOR INSERT
        WITH CHECK (
          bucket_id = 'mercado' 
          AND auth.role() = 'authenticated'
        );

        -- Policy 3: User delete own
        DROP POLICY IF EXISTS "mercado_user_delete" ON storage.objects;
        CREATE POLICY "mercado_user_delete"
        ON storage.objects FOR DELETE
        USING (
          bucket_id = 'mercado' 
          AND auth.uid() = owner
        );

        -- Policy 4: User update own
        DROP POLICY IF EXISTS "mercado_user_update" ON storage.objects;
        CREATE POLICY "mercado_user_update"
        ON storage.objects FOR UPDATE
        USING (
          bucket_id = 'mercado' 
          AND auth.uid() = owner
        );
      `
    })
    log.success('Políticas de storage criadas!')
  } catch (err) {
    log.error(`Políticas: ${err.message}`)
  }

  // Verificar bucket
  log.info('Verificando bucket criado...')
  try {
    const { data } = await supabase.rpc('exec', {
      query: `SELECT id, name, public FROM storage.buckets WHERE id = 'mercado';`
    })
    log.success('Bucket "mercado" verificado e ativo!')
  } catch (err) {
    log.error(`Verificação: ${err.message}`)
  }

  console.log('\n' + '='.repeat(50))
  log.success('Bucket e políticas configurados!')
  console.log()
}

criarBucket().catch(err => {
  console.error('Erro:', err.message)
  process.exit(1)
})
