import { ReactNode } from 'react';
import { useAuthContext } from '../context/AuthContext';

export function AuthGate({ children }: { children: ReactNode }) {
  const { loading } = useAuthContext();

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return <>{children}</>;
}