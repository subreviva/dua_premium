#!/usr/bin/env node
import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load .env.local
config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function addChatImagesColumn() {
  console.log('📊 Adicionando coluna chat_images_generated...\n');

  const { data, error } = await supabase.rpc('exec_sql', {
    sql_query: `
      ALTER TABLE public.users 
      ADD COLUMN IF NOT EXISTS chat_images_generated INTEGER DEFAULT 0;
      
      COMMENT ON COLUMN public.users.chat_images_generated IS 
        'Number of images generated in chat (2 free, then 1 credit each)';
    `
  });

  if (error) {
    console.error('❌ Erro:', error.message);
    
    // Tentar diretamente sem RPC
    console.log('\n🔄 Tentando método alternativo...');
    
    const { error: alterError } = await supabase
      .from('users')
      .select('chat_images_generated')
      .limit(1);
    
    if (alterError && alterError.message.includes('column')) {
      console.log('✅ Coluna não existe, criando manualmente via SQL...');
      console.log('\n📝 Execute este SQL no Supabase Dashboard:');
      console.log('─'.repeat(60));
      console.log(`
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS chat_images_generated INTEGER DEFAULT 0;

COMMENT ON COLUMN public.users.chat_images_generated IS 
  'Number of images generated in chat (2 free, then 1 credit each)';
      `);
      console.log('─'.repeat(60));
    } else {
      console.log('✅ Coluna já existe!');
    }
    
    return;
  }

  console.log('✅ Coluna chat_images_generated adicionada com sucesso!');
  console.log('📊 Todos os usuários começam com 0 imagens geradas');
  console.log('🎁 Oferta: 2 imagens grátis, depois 1 crédito cada');
}

addChatImagesColumn().catch(console.error);
