import { useEffect, useState, useMemo } from 'react';
import { supabase } from '../integrations/supabase';
import type { Profile, UserRole } from '../types';

export function useAuth() {

  const [user, setUser] =
    useState<any>(null);

  const [profile, setProfile] =
    useState<Profile | null>(null);

  const [loading, setLoading] =
    useState(true);

  // -----------------------------
  // FETCH PROFILE
  // -----------------------------
  const fetchProfile = async (
    userId: string
  ) => {

    try {

      const {
        data,
        error
      } =
      await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {

        console.error(
          'Profile fetch error:',
          error
        );

        setProfile(null);

        return null;
      }

      setProfile(
        data || null
      );

      return data || null;

    } catch (err) {

      console.error(
        'Profile exception:',
        err
      );

      setProfile(null);

      return null;

    }

  };

  // -----------------------------
  // INIT + AUTH LISTENER
  // -----------------------------
  useEffect(() => {

    let mounted = true;

    const init =
      async () => {

      setLoading(true);

      const {
        data: {
          session
        },
        error
      } =
      await supabase
        .auth
        .getSession();

      if (!mounted)
        return;

      if (error) {

        console.error(
          'Session error:',
          error
        );

      }

      if (
        !session?.user
      ) {

        setUser(null);

        setProfile(null);

        setLoading(false);

        return;

      }

      setUser(
        session.user
      );

      await fetchProfile(
        session.user.id
      );

      setLoading(false);

    };

    init();

    const {
      data: {
        subscription
      }
    } =
    supabase.auth.onAuthStateChange(
      async (
        event,
        session
      ) => {

        if (!mounted)
          return;

        if (
          !session?.user
        ) {

          setUser(null);

          setProfile(null);

          return;
        }

        setUser(
          session.user
        );

        await fetchProfile(
          session.user.id
        );
      }
    );

    return () => {

      mounted = false;

      subscription.unsubscribe();

    };

  }, []);

  // -----------------------------
  // ROLE NORMALIZATION
  // -----------------------------
  const getUserRoles = (
    profile: Profile | null
  ): UserRole[] => {

    if (!profile)
      return ['student'];

    return profile.roles?.length
      ? profile.roles
      : profile.role
      ? [
          profile.role as UserRole
        ]
      : ['student'];

  };

  const activeRoles =
    useMemo(() => {

    if (!profile)
      return ['student'] as UserRole[];

    const roles: UserRole[] = [];

    const userRoles =
      getUserRoles(profile);

    if (
      userRoles.includes(
        'student'
      )
    ) {
      roles.push(
        'student'
      );
    }

    if (
      userRoles.includes(
        'mentor'
      ) &&
      profile.mentor_status ===
      'approved'
    ) {

      roles.push(
        'mentor'
      );

    }

    if (
      userRoles.includes(
        'admin'
      ) &&
      profile.admin_status ===
      'approved'
    ) {

      roles.push(
        'admin'
      );

    }

    if (
      profile.is_owner
    ) {

      roles.push(
        'owner'
      );

    }

    return roles.length
      ? roles
      : ['student'];

  }, [profile]);

  const hasRole = (
    role: UserRole
  ) =>
    activeRoles.includes(
      role
    );

  const isOwner =
    profile?.is_owner === true;

  const isActiveMentor =
    hasRole('mentor');

  const isActiveAdmin =
    hasRole('admin');

  // -----------------------------
  // AUTH ACTIONS
  // -----------------------------
  const signIn = async (
    email: string,
    password: string
  ) => {

    const { error } =
      await supabase
        .auth
        .signInWithPassword({
          email,
          password
        });

    return {
      error
    };

  };

  const signUp = async (
    email: string,
    password: string,
    metadata?: any,
    redirectUrl?: string
  ) => {

    const { error } =
      await supabase
        .auth
        .signUp({

          email,
          password,

          options: {

            emailRedirectTo:
              redirectUrl ||
              `${window.location.origin}/auth/callback`

          }

        });

    return {
      error
    };

  };

  const signOut = async () => {
  try {
    setLoading(true);

    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error('SignOut error:', error);
      return { error };
    }

    // IMPORTANT: clear ALL local auth state immediately
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

  const updateProfile =
    async (
      updates:
      Partial<Profile>
    ) => {

    if (!user) {

      return {
        success:false,
        error:
        'Not authenticated'
      };

    }

    const {
      error
    } =
    await supabase
      .from(
        'profiles'
      )
      .update(
        updates
      )
      .eq(
        'id',
        user.id
      );

    if (error) {

      return {

        success:false,

        error:
          error.message

      };

    }

    await fetchProfile(
      user.id
    );

    return {
      success:true
    };

  };

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
    updateProfile

  };

}