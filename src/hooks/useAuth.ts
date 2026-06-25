import { useEffect, useState, useMemo } from 'react';
import { supabase } from '../integrations/supabase';
import type { Profile, UserRole } from '../types';

export function useAuth() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // -----------------------------
  // PROFILE FETCH (SAFE)
  // -----------------------------
  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('Profile fetch error:', error);
        setProfile(null);
        return;
      }

      setProfile(data ?? null);
    } catch (err) {
      console.error('Profile exception:', err);
      setProfile(null);
    }
  };

  // -----------------------------
  // VERIFY EMAIL → BLUE TICK SYNC
  // -----------------------------
  const syncVerification = async (user: any) => {
    try {
      if (user?.email_confirmed_at) {
        await supabase
          .from('profiles')
          .update({ is_verified: true })
          .eq('id', user.id);
      }
    } catch (err) {
      console.error('Verification sync error:', err);
    }
  };

  // -----------------------------
  // INIT AUTH
  // -----------------------------
  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();

        if (!mounted) return;

        if (error) {
          console.error('Session error:', error);
        }

        const sessionUser = data?.session?.user ?? null;

        setUser(sessionUser);

        if (sessionUser) {
          fetchProfile(sessionUser.id);
          syncVerification(sessionUser);
        }
      } catch (err) {
        console.error('Auth init error:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    initAuth();

    // -----------------------------
    // AUTH STATE CHANGES
    // -----------------------------
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;

      const sessionUser = session?.user ?? null;

      setUser(sessionUser);

      if (!sessionUser) {
        setProfile(null);
        setLoading(false);
        return;
      }

      setLoading(false);

      fetchProfile(sessionUser.id);
      syncVerification(sessionUser);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // -----------------------------
  // ROLE SYSTEM (FIXED)
  // -----------------------------
  const activeRoles = useMemo(() => {
    if (!profile) return ['student'] as UserRole[];

    const roles: UserRole[] = [];

    if (profile.roles?.length) {
      roles.push(...profile.roles);
    }

    if (profile.role) {
      roles.push(profile.role as UserRole);
    }

    return [...new Set(roles)];
  }, [profile]);

  const hasRole = (role: UserRole) => activeRoles.includes(role);

  const isOwner = profile?.is_owner === true;
  const isActiveMentor = hasRole('mentor');
  const isActiveAdmin = hasRole('admin');

  // -----------------------------
  // AUTH ACTIONS
  // -----------------------------
  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    return { error };
  };

  // CLEAN SIGNUP (NO CALLBACK DEPENDENCY)
  const signUp = async (
    email: string,
    password: string,
    metadata?: any
  ) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
      },
    });

    return { error };
  };

  const signOut = async () => {
    try {
      setLoading(true);

      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error('SignOut error:', error);
        return { error };
      }

      setUser(null);
      setProfile(null);

      return { error: null };
    } catch (err) {
      console.error('Unexpected signOut error:', err);
      return { error: err };
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id);

    if (error) {
      return { success: false, error: error.message };
    }

    await fetchProfile(user.id);

    return { success: true };
  };

  // -----------------------------
  // RETURN
  // -----------------------------
  return {
    user,
    profile,
    loading,

    activeRoles,
    hasRole,

    isOwner,
    isActiveMentor,
    isActiveAdmin,

    signIn,
    signUp,
    signOut,
    updateProfile,
  };
}