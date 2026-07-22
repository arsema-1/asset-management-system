'use client';

import { useEffect, createContext, useContext, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getToken, getUser, removeToken, logoutUser } from '@/lib/api';

interface AuthContextValue {
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue>({ logout: () => {} });

export function useAuth() {
  return useContext(AuthContext);
}

export default function AuthGuard({ children, requiredRole }: { children: React.ReactNode; requiredRole: 'admin' | 'employee' }) {
  const router = useRouter();

  const logout = useCallback(async () => {
    await logoutUser();
    router.push('/login');
  }, [router]);

  useEffect(() => {
    const token = getToken();
    const user = getUser();

    if (!token || !user) {
      router.replace('/login');
      return;
    }

    // Check role matches the required role for this section
    if (user.role !== requiredRole) {
      router.replace(user.role === 'admin' ? '/admin/dashboard' : '/employee/dashboard');
      return;
    }

    // Check token expiry by decoding the JWT payload (no signature verification needed here — server does that)
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.exp && Date.now() / 1000 > payload.exp) {
        removeToken();
        router.replace('/login');
      }
    } catch {
      removeToken();
      router.replace('/login');
    }
  }, [router, requiredRole]);

  return (
    <AuthContext.Provider value={{ logout }}>
      {children}
    </AuthContext.Provider>
  );
}
