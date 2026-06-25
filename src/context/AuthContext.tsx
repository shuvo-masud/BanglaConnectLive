import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useMemo,
} from "react";

import { User } from "@supabase/supabase-js";
import { supabase } from "../integrations/supabase";
import type { Profile, UserRole } from "../types";

/* -----------------------------
   TYPE
------------------------------ */
export type AuthContextType = {
  user: User | null;
  profile: Profile | null;
  loading: boolean;

  activeRoles: UserRole[];
  hasRole: (role: UserRole) => boolean;

  isOwner: boolean;
  isActiveMentor: boolean;
  isActiveAdmin: boolean;

  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (
    email: string,
    password: string,
    metadata?: any
  ) => Promise<{ error: any }>;

  signOut: () => Promise<{ error: any | null }>;
  updateProfile: (updates: any) => Promise<any>;

  approveUserRole: (
    userId: string,
    role: "mentor" | "admin"
  ) => Promise<void>;

  rejectUserRole: (
    userId: string,
    role: "mentor" | "admin"
  ) => Promise<void>;
};

/* -----------------------------
   CONTEXT
------------------------------ */
const AuthContext = createContext<AuthContextType | null>(null);

/* -----------------------------
   HOOK
------------------------------ */
export const useAuthContext = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("AuthProvider missing");
  return ctx;
};

/* -----------------------------
   PROVIDER
------------------------------ */
type AuthProviderProps = {
  children: ReactNode;
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  /* -----------------------------
     PROFILE FETCH
  ------------------------------ */
  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      if (error) {
        console.error("Profile fetch error:", error);
        setProfile(null);
        return;
      }

      setProfile(data ?? null);
    } catch (err) {
      console.error("Profile exception:", err);
      setProfile(null);
    }
  };

  /* -----------------------------
     INIT AUTH
  ------------------------------ */
  useEffect(() => {
    let mounted = true;

    const init = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();

        if (!mounted) return;

        if (error) {
          console.error("Session error:", error);
        }

        const sessionUser = data.session?.user ?? null;

        setUser(sessionUser);

        if (sessionUser) {
          await fetchProfile(sessionUser.id);
        }
      } catch (err) {
        console.error("Auth init error:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    init();

    /* -----------------------------
       AUTH LISTENER
    ------------------------------ */
    const {
  data: { subscription },
} = supabase.auth.onAuthStateChange((event, session) => {
  const sessionUser = session?.user ?? null;

  // 🔥 IMPORTANT: handle logout explicitly
  if (event === 'SIGNED_OUT') {
    setUser(null);
    setProfile(null);
    setLoading(false);
    return;
  }

  // 🔥 handle login/session restore
  if (!sessionUser) {
    setUser(null);
    setProfile(null);
    setLoading(false);
    return;
  }

  setUser(sessionUser);
  setLoading(false);

  fetchProfile(sessionUser.id);
});

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  /* -----------------------------
     ROLE SYSTEM (FIXED)
  ------------------------------ */
  const activeRoles: UserRole[] = useMemo(() => {
    if (!profile) return ["student"];

    const roles: UserRole[] = [];

    if (profile.role) roles.push(profile.role as UserRole);

    if (profile.roles?.length) {
      roles.push(...profile.roles);
    }

    return [...new Set(roles)];
  }, [profile]);

  const hasRole = (role: UserRole) => activeRoles.includes(role);

  const isOwner = profile?.is_owner === true;
  const isActiveMentor = hasRole("mentor");
  const isActiveAdmin = hasRole("admin");

  /* -----------------------------
     AUTH ACTIONS
  ------------------------------ */
  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    return { error };
  };

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
    const { error } = await supabase.auth.signOut();

    setUser(null);
    setProfile(null);

    return { error };
  };

  const updateProfile = async (updates: any) => {
    if (!user) return { success: false, error: "Not authenticated" };

    const { error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", user.id);

    if (!error) await fetchProfile(user.id);

    return { success: !error, error };
  };



  /*ADMIN Approval*/
  const approveUserRole = async (userId: string, role: 'mentor' | 'admin') => {
  const statusField =
    role === 'mentor' ? 'mentor_status' : 'admin_status';

  const { error } = await supabase
    .from('profiles')
    .update({
      [statusField]: 'approved',
    })
    .eq('id', userId);

  if (error) {
    console.error('Approve error:', error);
  }

  await fetchProfile(userId);
};

const rejectUserRole = async (userId: string, role: 'mentor' | 'admin') => {
  const statusField =
    role === 'mentor' ? 'mentor_status' : 'admin_status';

  const { error } = await supabase
    .from('profiles')
    .update({
      [statusField]: 'rejected',
    })
    .eq('id', userId);

  if (error) {
    console.error('Reject error:', error);
  }

  await fetchProfile(userId);
};


  /* -----------------------------
     PROVIDER VALUE
  ------------------------------ */
  return (
    <AuthContext.Provider
      value={{
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
        approveUserRole,
        rejectUserRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};