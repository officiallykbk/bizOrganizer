import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';

interface User {
  id: string;
  email: string;
  user_metadata: {
    name?: string;
    role?: string;
  };
}

interface AuthState {
  user: User | null;
  session: any | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      session: null,
      loading: false,
      error: null,
      
      signIn: async (email: string, password: string) => {
        try {
          set({ loading: true, error: null });
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });
          
          if (error) throw error;
          
          // Ensure we have a valid session before setting the state
          if (!data.session?.access_token || !data.user?.id) {
            throw new Error('Invalid session data received');
          }
          
          set({ 
            user: data.user,
            session: data.session,
            loading: false,
            error: null
          });
        } catch (error: any) {
          set({ 
            error: error.message || 'Failed to sign in',
            loading: false,
            user: null,
            session: null
          });
          throw error;
        }
      },
      
      signOut: async () => {
        try {
          set({ loading: true, error: null });
          const { error } = await supabase.auth.signOut();
          if (error) throw error;
          
          set({ 
            user: null, 
            session: null, 
            loading: false,
            error: null
          });
        } catch (error: any) {
          set({ 
            error: error.message || 'Failed to sign out',
            loading: false 
          });
        }
      },
      
      refreshSession: async () => {
        try {
          set({ loading: true, error: null });
          
          // First get the current session
          const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
          if (sessionError) throw sessionError;
          
          // If we have a valid session, get the user data
          if (sessionData?.session?.access_token) {
            const { data: userData, error: userError } = await supabase.auth.getUser();
            if (userError) throw userError;
            
            if (userData?.user) {
              set({ 
                user: userData.user,
                session: sessionData.session,
                loading: false,
                error: null
              });
              return;
            }
          }
          
          // If we reach here, we don't have a valid session
          set({ 
            user: null, 
            session: null, 
            loading: false,
            error: null
          });
        } catch (error: any) {
          console.error('Session refresh error:', error);
          set({ 
            user: null, 
            session: null, 
            loading: false,
            error: error.message || 'Failed to refresh session'
          });
        }
      },

      clearError: () => {
        set({ error: null });
      }
    }),
    {
      name: 'cargo-auth-storage',
      skipHydration: true,
    }
  )
);