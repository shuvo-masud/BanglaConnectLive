import { createContext, useContext, ReactNode, useMemo } from 'react';
import { useAuth } from '../hooks/useAuth';

type AuthType = ReturnType<typeof useAuth>;

const AuthContext = createContext<AuthType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useAuth();

  // Normalize roles safely (THIS fixes your issue)
  const enhancedAuth = useMemo(() => {
    const profile = auth.profile;

    const isOwner = profile?.is_owner === true;

    const isAdmin =
      profile?.role === 'admin' &&
      profile?.admin_status === 'approved';

    const isMentor =
      profile?.roles?.includes('mentor') &&
      profile?.mentor_status === 'approved';

    const isStudent =
      profile?.role === 'student' || !profile?.role;

    return {
      ...auth,
      isOwner,
      isAdmin,
      isMentor,
      isStudent,
    };
  }, [auth]);

  return (
    <AuthContext.Provider value={enhancedAuth}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const ctx = useContext(AuthContext);

  if (!ctx) {
    throw new Error('AuthContext must be used inside AuthProvider');
  }

  return ctx;
}