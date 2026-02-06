import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      persistSession: true,
      storageKey: 'cargo-tracker-auth',
      autoRefreshToken: true,
      detectSessionInUrl: true
    },
    global: {
      headers: {
        'X-Client-Info': 'cargo-tracker@1.0.0'
      }
    },
    db: {
      schema: 'public'
    },
    realtime: {
      params: {
        eventsPerSecond: 10
      }
    }
  }
);

// For offline support
export const setupOfflineSupport = () => {
  window.addEventListener('online', () => {
    console.log('Back online, syncing data...');
    // Sync cached data with server
  });

  window.addEventListener('offline', () => {
    console.log('Offline, using cached data...');
    // Use indexed DB or localStorage
  });
};