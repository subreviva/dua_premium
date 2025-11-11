import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE) {
  console.error('Missing env vars');
  process.exit(1);
}

const admin = createClient(SUPABASE_URL, SERVICE_ROLE, { auth: { autoRefreshToken: false, persistSession: false }});

const email = `qa+${Date.now()}@2lados.pt`;
const password = 'QAtest#123';
const name = 'QA E2E';
const inviteCode = 'DUA-03G3-24V';

console.log('🧪 E2E start with', { email, inviteCode });

// 1) Create user
const { data: created, error: createErr } = await admin.auth.admin.createUser({ email, password, email_confirm: true, user_metadata: { name, invite_code: inviteCode } });
if (createErr) { console.error('createUser error', createErr); process.exit(1); }
const userId = created.user.id;
console.log('✅ user created', userId);

// 2) Create profile
await admin.from('users').upsert({ id: userId, email, name, has_access: true, creditos_servicos: 150 });

// 3) Create balance
await admin.from('duaia_user_balances').upsert({ user_id: userId, servicos_creditos: 150, duacoin_balance: 0 });

// 4) Mark code used
await admin.from('invite_codes').update({ active: false, used_by: userId, used_at: new Date().toISOString() }).eq('code', inviteCode);

// 5) Verify
const { data: bal } = await admin.from('duaia_user_balances').select('servicos_creditos').eq('user_id', userId).single();
if (!bal || bal.servicos_creditos < 150) { console.error('❌ balance not set'); process.exit(1); }

console.log('🎉 E2E OK: user ready with 150 credits');
