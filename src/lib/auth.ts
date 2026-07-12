import { useEffect } from 'react'
import { supabase } from './supabaseClient'

export type UserRole = 'admin' | 'assetManager' | 'departmentHead' | 'employee';

export interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  department_id: string | null;
  status: 'active' | 'inactive';
  created_at?: string;
}

/**
 * Pre-seeded demo credentials for quick reviewer logins.
 * // TODO: seed these 4 demo users in Supabase before the demo
 */
export const DEMO_ACCOUNTS = {
  admin: {
    email: import.meta.env.VITE_DEMO_ADMIN_EMAIL || 'demo.admin@assetflow.dev',
    password: import.meta.env.VITE_DEMO_ADMIN_PASSWORD || 'DemoAdmin123!'
  },
  assetManager: {
    email: import.meta.env.VITE_DEMO_ASSET_MANAGER_EMAIL || 'demo.manager@assetflow.dev',
    password: import.meta.env.VITE_DEMO_ASSET_MANAGER_PASSWORD || 'DemoManager123!'
  },
  departmentHead: {
    email: import.meta.env.VITE_DEMO_DEPT_HEAD_EMAIL || 'demo.head@assetflow.dev',
    password: import.meta.env.VITE_DEMO_DEPT_HEAD_PASSWORD || 'DemoHead123!'
  },
  employee: {
    email: import.meta.env.VITE_DEMO_EMPLOYEE_EMAIL || 'demo.employee@assetflow.dev',
    password: import.meta.env.VITE_DEMO_EMPLOYEE_PASSWORD || 'DemoEmployee123!'
  }
};

/**
 * Registers a new user with an email and password.
 * Automatically inserts a profile record as 'employee' on success.
 */
export async function signUpWithEmail(name: string, email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: name,
        role: 'employee' as UserRole
      }
    }
  });

  if (error) throw error;
  if (!data.user) throw new Error('No user returned after registration');

  // Insert standard profile row in the profiles table
  const { error: profileError } = await supabase
    .from('profiles')
    .insert([
      {
        id: data.user.id,
        full_name: name,
        email: email,
        role: 'employee' as UserRole,
        department_id: null,
        status: 'active'
      }
    ]);

  if (profileError) {
    console.error('Failed to create user profile record:', profileError);
    // Note: Do not throw here since user authentication actually succeeded.
  }

  return data;
}

/**
 * Signs in a user using email and password, and returns their role-aware profile.
 */
export async function signInWithEmail(email: string, password: string): Promise<{ session: any; profile: UserProfile | null }> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) throw error;
  if (!data.session || !data.user) throw new Error('No session returned after login');

  // Fetch the user's role and details from the profiles table
  try {
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (profileError) {
      console.warn('Could not retrieve database profile, falling back to metadata:', profileError);
      return {
        session: data.session,
        profile: {
          id: data.user.id,
          full_name: data.user.user_metadata?.full_name || 'User',
          email: data.user.email || email,
          role: (data.user.user_metadata?.role as UserRole) || 'employee',
          department_id: null,
          status: 'active'
        }
      };
    }

    return { session: data.session, profile: profileData as UserProfile };
  } catch (err) {
    return {
      session: data.session,
      profile: {
        id: data.user.id,
        full_name: data.user.user_metadata?.full_name || 'User',
        email: data.user.email || email,
        role: 'employee',
        department_id: null,
        status: 'active'
      }
    };
  }
}

/**
 * Initiates the Google OAuth login flow.
 * 
 * TODO: Add this SQL trigger in your Supabase DB to handle automatic profiles insertion on OAuth:
 * 
 * CREATE OR REPLACE FUNCTION public.handle_new_user()
 * RETURNS trigger AS $$
 * BEGIN
 *   INSERT INTO public.profiles (id, full_name, email, role, department_id, status)
 *   VALUES (
 *     new.id,
 *     coalesce(new.raw_user_meta_data->>'full_name', 'Google User'),
 *     new.email,
 *     'employee',
 *     null,
 *     'active'
 *   ) ON CONFLICT (id) DO NOTHING;
 *   RETURN new;
 * END;
 * $$ LANGUAGE plpgsql SECURITY DEFINER;
 * 
 * CREATE TRIGGER on_auth_user_created
 *   AFTER INSERT ON auth.users
 *   FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
 */
export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin + '/auth/callback'
    }
  });

  if (error) throw error;
  return data;
}

/**
 * Convenience method to sign in with pre-configured developer demo credentials.
 */
export async function signInWithDemoAccount(role: UserRole) {
  const account = DEMO_ACCOUNTS[role];
  if (!account) {
    throw new Error(`Demo account role '${role}' is not pre-configured.`);
  }
  return signInWithEmail(account.email, account.password);
}

/**
 * Hook to redirect already logged-in users.
 */
export function useAuthRedirect(onRedirect: (profile: UserProfile) => void) {
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session && session.user) {
        supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
          .then(({ data, error }) => {
            if (!error && data) {
              onRedirect(data as UserProfile);
            } else {
              onRedirect({
                id: session.user.id,
                full_name: session.user.user_metadata?.full_name || 'User',
                email: session.user.email || '',
                role: (session.user.user_metadata?.role as UserRole) || 'employee',
                department_id: null,
                status: 'active'
              });
            }
          });
      }
    });

    // Optional: listen to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session && session.user) {
        supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
          .then(({ data, error }) => {
            if (!error && data) {
              onRedirect(data as UserProfile);
            }
          });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [onRedirect]);
}
