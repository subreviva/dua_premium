require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createDevAccess() {
  console.log('🔧 Criando acesso de desenvolvedor...\n');

  const devEmail = 'dev@dua.com'; // Você pode mudar este email
  const devPassword = 'devpassword123'; // Você pode mudar esta senha
  const devName = 'Developer Admin';

  try {
    // Opção 1: Criar código especial DEV
    console.log('1️⃣ Criando código especial DEV...');
    
    const { data: devCode, error: codeError } = await supabaseAdmin
      .from('invite_codes')
      .upsert({
        code: 'DEV-ADMIN',
        active: true,
        credits: 999999, // Créditos ilimitados
        created_at: new Date().toISOString()
      }, { onConflict: 'code' });

    if (!codeError) {
      console.log('✅ Código DEV-ADMIN criado/atualizado');
    } else {
      console.log('⚠️ Erro ao criar código:', codeError.message);
    }

    // Opção 2: Criar usuário DEV diretamente
    console.log('\n2️⃣ Criando usuário desenvolvedor...');
    
    // Verificar se já existe
    const { data: existingUser } = await supabaseAdmin.auth.admin.listUsers();
    const devExists = existingUser.users.find(u => u.email === devEmail);

    if (devExists) {
      console.log('✅ Usuário dev já existe:', devEmail);
      
      // Garantir acesso total
      await supabaseAdmin
        .from('users')
        .upsert({
          id: devExists.id,
          email: devEmail,
          has_access: true,
          credits: 999999,
          invite_code_used: 'DEV-ADMIN',
          created_at: new Date().toISOString()
        }, { onConflict: 'id' });

      console.log('✅ Acesso atualizado para total');
      
    } else {
      // Criar novo usuário
      const { data: newUser, error: userError } = await supabaseAdmin.auth.admin.createUser({
        email: devEmail,
        password: devPassword,
        email_confirm: true, // Auto-confirmar email
        user_metadata: {
          name: devName,
          role: 'admin',
          invite_code: 'DEV-ADMIN'
        }
      });

      if (newUser?.user) {
        console.log('✅ Usuário criado:', devEmail);
        
        // Adicionar na tabela users
        await supabaseAdmin
          .from('users')
          .upsert({
            id: newUser.user.id,
            email: devEmail,
            has_access: true,
            credits: 999999,
            invite_code_used: 'DEV-ADMIN',
            created_at: new Date().toISOString()
          });

        console.log('✅ Dados do usuário adicionados na tabela');
      } else {
        console.log('❌ Erro ao criar usuário:', userError?.message);
      }
    }

    // Opção 3: Bypass direto no middleware
    console.log('\n3️⃣ Criando bypass no middleware...');
    
    const middlewareBypass = `
// BYPASS PARA DESENVOLVEDOR
const DEV_EMAILS = ['${devEmail}', 'admin@dua.com', 'developer@dua.com'];

// No middleware.ts, adicione esta verificação:
// if (DEV_EMAILS.includes(user?.email)) {
//   return NextResponse.next();
// }
`;

    console.log('📝 Código para adicionar no middleware:');
    console.log(middlewareBypass);

    // Opção 4: URL de acesso direto
    console.log('\n4️⃣ URLs de acesso direto:');
    console.log('🔗 Login dev: http://localhost:3000/login');
    console.log('📧 Email:', devEmail);
    console.log('🔑 Password:', devPassword);
    console.log('🎫 Código alternativo: DEV-ADMIN');
    
    console.log('\n🎉 ACESSOS CRIADOS COM SUCESSO!');
    console.log('\n📋 RESUMO:');
    console.log(`   Email: ${devEmail}`);
    console.log(`   Password: ${devPassword}`);
    console.log(`   Código: DEV-ADMIN`);
    console.log(`   Créditos: 999999`);
    console.log(`   Acesso: TOTAL`);

  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

createDevAccess();