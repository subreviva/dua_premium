import { describe, it, expect } from 'vitest';
import { supabase } from './setup';

describe('Supabase Database Tests', () => {
  it('should connect to Supabase', async () => {
    const { data, error } = await supabase.from('users').select('count').single();
    
    expect(error).toBeNull();
  });

  it('should have users table', async () => {
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .limit(1);
    
    expect(error).toBeNull();
  });

  it('should have proper RLS policies', async () => {
    // Test that anonymous users cannot access sensitive data
    const { data, error } = await supabase
      .from('users')
      .select('email')
      .limit(1);
    
    // Should fail with RLS error or return empty
    expect(data === null || data.length === 0).toBe(true);
  });
});

describe('Credits System Tests', () => {
  it('should have duaia_user_balances table', async () => {
    const { error } = await supabase
      .from('duaia_user_balances')
      .select('user_id')
      .limit(1);
    
    expect(error).toBeNull();
  });

  it('should have service_costs table', async () => {
    const { data, error } = await supabase
      .from('service_costs')
      .select('*')
      .limit(1);
    
    expect(error).toBeNull();
  });
});
