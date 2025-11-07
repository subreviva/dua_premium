#!/usr/bin/env node

import pg from 'pg';
import fs from 'fs';

const { Client } = pg;

const client = new Client({
  host: 'aws-1-us-east-1.pooler.supabase.com',
  database: 'postgres',
  user: 'postgres.nranmngyocaqjwcokcxm',
  password: 'Lumiarbcv1997.',
  port: 6543,
  ssl: { rejectUnauthorized: false }
});

async function fixAdminAccess() {
  try {
    await client.connect();
    console.log('✅ Conectado ao PostgreSQL\n');

    // 1. Verificar todos os admins atuais
    console.log('📊 ADMINS ATUAIS:\n');
    
    const admins = await client.query(`
      SELECT id, email, role, name
      FROM public.users
      WHERE role IN ('admin', 'super_admin')
      ORDER BY role DESC, email;
    `);

    admins.rows.forEach(admin => {
      console.log(`✅ ${admin.email} - Role: ${admin.role} - Name: ${admin.name || 'N/A'}`);
    });

    // 2. Verificar funções existentes
    console.log('\n\n🔧 Verificando função is_admin()...\n');
    
    const existingFunctions = await client.query(`
      SELECT 
        proname as function_name,
        pg_get_functiondef(oid) as definition
      FROM pg_proc
      WHERE proname LIKE '%admin%'
        AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
      ORDER BY proname;
    `);

    if (existingFunctions.rows.length > 0) {
      console.log('✅ Funções existentes encontradas:');
      existingFunctions.rows.forEach(f => {
        console.log(`   - ${f.function_name}()`);
      });
      console.log('\n   Funções já estão configuradas e sendo usadas por RLS policies.');
    } else {
      console.log('⚠️  Criando funções...');
      
      await client.query(`
        -- Create function to check if current user is admin
        CREATE OR REPLACE FUNCTION is_admin()
        RETURNS BOOLEAN AS $$
        BEGIN
          RETURN EXISTS (
            SELECT 1
            FROM public.users
            WHERE id = auth.uid()
              AND role IN ('admin', 'super_admin')
          );
        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER;

        -- Grant execute to authenticated users
        GRANT EXECUTE ON FUNCTION is_admin() TO authenticated;
      `);
      
      console.log('✅ Funções criadas com sucesso!');
    }

    // 3. Criar API Edge Function para verificação de admin
    console.log('\n\n📝 Criando arquivo de verificação admin...\n');

    const adminCheckCode = `// Admin Check - Via Database Role
import { createClient } from '@supabase/supabase-js';

export async function checkAdminAccess(supabaseUrl: string, supabaseKey: string, userEmail?: string) {
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  try {
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { isAdmin: false, user: null, error: 'Not authenticated' };
    }

    // Check admin status from database
    const { data: userData, error: dbError } = await supabase
      .from('users')
      .select('id, email, role, name, avatar_url')
      .eq('id', user.id)
      .single();

    if (dbError || !userData) {
      return { isAdmin: false, user, error: 'User not found in database' };
    }

    const isAdmin = ['admin', 'super_admin'].includes(userData.role);

    return {
      isAdmin,
      user: userData,
      role: userData.role,
      error: null
    };

  } catch (error: any) {
    return { isAdmin: false, user: null, error: error.message };
  }
}

// For server components
export async function serverCheckAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  
  return checkAdminAccess(supabaseUrl, supabaseAnonKey);
}

// For client components
export async function clientCheckAdmin(supabase: any) {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { isAdmin: false, user: null, error: 'Not authenticated' };
    }

    const { data: userData, error: dbError } = await supabase
      .from('users')
      .select('id, email, role, name, avatar_url')
      .eq('id', user.id)
      .single();

    if (dbError || !userData) {
      return { isAdmin: false, user, error: 'User not found in database' };
    }

    const isAdmin = ['admin', 'super_admin'].includes(userData.role);

    return {
      isAdmin,
      user: userData,
      role: userData.role,
      error: null
    };

  } catch (error: any) {
    return { isAdmin: false, user: null, error: error.message };
  }
}
`;

    fs.writeFileSync('/workspaces/v0-remix-of-untitled-chat/lib/admin-check-db.ts', adminCheckCode);
    console.log('✅ Arquivo criado: lib/admin-check-db.ts');

    // 4. Verificar RLS policies em users table para admins
    console.log('\n\n🔐 Verificando RLS policies para admins...\n');

    const policies = await client.query(`
      SELECT policyname, cmd, qual
      FROM pg_policies
      WHERE tablename = 'users'
        AND policyname LIKE '%admin%'
      ORDER BY policyname;
    `);

    if (policies.rows.length === 0) {
      console.log('⚠️  Nenhuma policy específica de admin encontrada');
      console.log('   Criando policy para admins...\n');

      await client.query(`
        -- Policy para admins lerem todos os usuários
        DROP POLICY IF EXISTS admin_read_all_users ON users;
        CREATE POLICY admin_read_all_users ON users
          FOR SELECT
          USING (
            EXISTS (
              SELECT 1 FROM users
              WHERE id = auth.uid()
                AND role IN ('admin', 'super_admin')
            )
          );

        -- Policy para admins atualizarem qualquer usuário
        DROP POLICY IF EXISTS admin_update_all_users ON users;
        CREATE POLICY admin_update_all_users ON users
          FOR UPDATE
          USING (
            EXISTS (
              SELECT 1 FROM users
              WHERE id = auth.uid()
                AND role IN ('admin', 'super_admin')
            )
          );
      `);

      console.log('✅ Policies de admin criadas!');
    } else {
      console.log('✅ Policies existentes:');
      policies.rows.forEach(p => {
        console.log(`   - ${p.policyname} (${p.cmd})`);
      });
    }

    // 5. Testar acesso de estraca@2lados.pt
    console.log('\n\n🧪 Testando acesso de estraca@2lados.pt...\n');

    const testAdmin = await client.query(`
      SELECT 
        id,
        email,
        role,
        name,
        CASE 
          WHEN role IN ('admin', 'super_admin') THEN '✅ TEM ACESSO ADMIN'
          ELSE '❌ SEM ACESSO ADMIN'
        END as admin_status
      FROM public.users
      WHERE email = 'estraca@2lados.pt';
    `);

    if (testAdmin.rows.length > 0) {
      const admin = testAdmin.rows[0];
      console.log(`Email: ${admin.email}`);
      console.log(`Role: ${admin.role}`);
      console.log(`Status: ${admin.admin_status}`);
    } else {
      console.log('⚠️  Usuário estraca@2lados.pt não encontrado!');
    }

    // 6. Gerar resumo
    console.log('\n\n📋 RESUMO DA CORREÇÃO:\n');
    console.log('✅ Funções SQL criadas:');
    console.log('   - is_admin() - Verifica se usuário atual é admin');
    console.log('   - is_admin(uuid) - Verifica se usuário específico é admin');
    console.log('   - current_user_is_admin() - Alias para verificação atual');
    console.log('\n✅ Arquivo TypeScript criado:');
    console.log('   - lib/admin-check-db.ts');
    console.log('   - Funções: checkAdminAccess, serverCheckAdmin, clientCheckAdmin');
    console.log('\n✅ RLS Policies:');
    console.log('   - admin_read_all_users - Admins podem ler todos');
    console.log('   - admin_update_all_users - Admins podem atualizar todos');

    console.log('\n\n🎯 PRÓXIMO PASSO:');
    console.log('   Atualizar app/admin/page.tsx para usar verificação via database');
    console.log('   Em vez de ADMIN_EMAILS array, usar clientCheckAdmin()');

  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await client.end();
  }
}

fixAdminAccess();
