import { useEffect, useState, useMemo } from 'react';
import { supabase } from '../integrations/supabase';
import type { Profile, UserRole } from '../types';

export function useAuth() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // ---------------------------
  // FETCH PROFILE
  // ---------------------------
  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error || !data) {
        setProfile(null);
        return;
      }

      setProfile(data as Profile);
    } catch (err) {
      console.error('Profile fetch error:', err);
      setProfile(null);
    }
  };

  // ---------------------------
  // ROLE NORMALIZER (SINGLE SOURCE OF TRUTH)
  // ---------------------------
  const getUserRoles = (profile: Profile | null): UserRole[] => {
    if (!profile) return ['student'];

    return profile.roles?.length
      ? profile.roles
      : profile.role
      ? [profile.role as UserRole]
      : ['student'];
  };

  // ---------------------------
  // ACTIVE ROLES
  // ---------------------------
  const activeRoles = useMemo(() => {
    if (!profile) return ['student'] as UserRole[];

    const roles: UserRole[] = [];
    const userRoles = getUserRoles(profile);

    if (userRoles.includes('student')) {
      roles.push('student');
    }

    if (
      userRoles.includes('mentor') &&
      profile.mentor_status === 'approved'
    ) {
      roles.push('mentor');
    }

    if (
      userRoles.includes('admin') &&
      profile.admin_status === 'approved'
    ) {
      roles.push('admin');
    }

    // OWNER = absolute override (no dependency on roles[])
    if (profile.is_owner) {
      roles.push('owner');
    }

    return roles.length ? roles : ['student'];
  }, [profile]);

  // ---------------------------
  // ROLE HELPERS
  // ---------------------------
  const hasRole = (role: UserRole) => activeRoles.includes(role);

  const isActiveMentor = useMemo(() => hasRole('mentor'), [activeRoles]);
  const isActiveAdmin = useMemo(() => hasRole('admin'), [activeRoles]);
  const isOwner = useMemo(() => profile?.is_owner === true, [profile]);

  // ---------------------------
  // PENDING STATES
  // ---------------------------
  const pendingMentorApproval = useMemo(() => {
    if (!profile) return false;

    const userRoles = getUserRoles(profile);

    return (
      userRoles.includes('mentor') &&
      profile.mentor_status === 'pending'
    );
  }, [profile]);

  const pendingAdminApproval = useMemo(() => {
    if (!profile) return false;

    const userRoles = getUserRoles(profile);

    return (
      userRoles.includes('admin') &&
      profile.admin_status === 'pending'
    );
  }, [profile]);

  // ---------------------------
  // INIT AUTH SESSION
  // ---------------------------
  useEffect(() => {
    let mounted = true;

    const init = async () => {
      setLoading(true);

      const { data } = await supabase.auth.getSession();
      const session = data?.session;

      if (!mounted) return;

      if (!session?.user) {
        setUser(null);
        setProfile(null);
        setLoading(false);
        return;
      }

      setUser(session.user);
      await fetchProfile(session.user.id);

      setLoading(false);
    };

    init();

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (!session?.user) {
          setUser(null);
          setProfile(null);
          return;
        }

        setUser(session.user);
        await fetchProfile(session.user.id);
      }
    );

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  // ---------------------------
  // AUTH ACTIONS
  // ---------------------------
  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signUp = async (email: string, password: string, metadata?: any) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: metadata },
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  // ---------------------------
  // UPDATE PROFILE
  // ---------------------------
  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return { success: false, error: 'Not authenticated' };

    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id);

    if (error) return { success: false, error: error.message };

    await fetchProfile(user.id);
    return { success: true };
  };

  // ---------------------------
  // APPROVAL ACTIONS (OWNER ONLY)
  // ---------------------------
  const approveUserRole = async (
    targetUserId: string,
    role: 'mentor' | 'admin'
  ) => {
    if (!isOwner) return { success: false, error: 'Only owner allowed' };

    const field = role === 'mentor' ? 'mentor_status' : 'admin_status';

    const { error } = await supabase
      .from('profiles')
      .update({ [field]: 'approved' })
      .eq('id', targetUserId);

    if (error) return { success: false, error: error.message };

    return { success: true };
  };

  const rejectUserRole = async (
    targetUserId: string,
    role: 'mentor' | 'admin'
  ) => {
    if (!isOwner) return { success: false, error: 'Only owner allowed' };

    const field = role === 'mentor' ? 'mentor_status' : 'admin_status';

    const { error } = await supabase
      .from('profiles')
      .update({ [field]: 'rejected' })
      .eq('id', targetUserId);

    if (error) return { success: false, error: error.message };

    return { success: true };
  };

  // ---------------------------
  // RETURN
  // ---------------------------
  return {
    user,
    profile,
    loading,

    activeRoles,
    hasRole,

    isActiveMentor,
    isActiveAdmin,
    isOwner,

    pendingMentorApproval,
    pendingAdminApproval,

    signIn,
    signUp,
    signOut,
    updateProfile,
    approveUserRole,
    rejectUserRole,
  };
}