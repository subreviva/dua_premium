import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const userId = '1f7b923b-3734-4c5a-a791-938f35d11cf3'; // vinhosclassee@gmail.com

console.log('🔧 Confirmando email do user:', userId);

const { data, error } = await supabase.auth.admin.updateUserById(
  userId,
  { 
    email_confirm: true,
    user_metadata: { 
      name: 'carlos',
      email_verified: true,
    }
  }
);

if (error) {
  console.error('❌ Erro:', error);
  process.exit(1);
}

console.log('✅ Email confirmado!');
console.log('📧 Email:', data.user.email);
console.log('✔️  Confirmado em:', data.user.email_confirmed_at);
console.log('\n🎉 Agora podes fazer login com esta conta!');
