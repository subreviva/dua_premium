#!/usr/bin/env node
import { readFileSync } from 'fs';

const env = {};
readFileSync('.env.local', 'utf-8').split('\n').forEach(line => {
  const match = line.match(/^([^=]+)="?([^"]+)"?$/);
  if (match) {
    env[match[1].trim()] = match[2].trim().replace(/^"/, '').replace(/"$/, '');
  }
});

const url = `${env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/duaia_transactions?select=*&operation=like.design_%&order=created_at.desc&limit=10`;

const response = await fetch(url, {
  headers: {
    'apikey': env.SUPABASE_SERVICE_ROLE_KEY,
    'Authorization': `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
  },
});

const data = await response.json();
console.log(JSON.stringify(data, null, 2));
