import { beforeAll, afterAll } from 'vitest';
import { createClient } from '@supabase/supabase-js';

// Setup Supabase client for tests
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

beforeAll(async () => {
  console.log('🧪 Setting up tests...');
  // You can add global test setup here
});

afterAll(async () => {
  console.log('🧹 Cleaning up tests...');
  // You can add global test cleanup here
});
