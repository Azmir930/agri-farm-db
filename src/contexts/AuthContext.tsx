import React, { createContext, useContext, ReactNode } from 'react';
import { useAuth as useAuthHook } from '@/hooks/useAuth';
import type { Database } from '@/integrations/supabase/types';

type AppRole = Database['public']['Enums']['app_role'];

// Legacy support - map old UserRole type to new AppRole
export type UserRole = AppRole;

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, role?: UserRole) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
  role: UserRole | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const auth = useAuthHook();

  // Transform the Supabase user to our legacy User format
  const user: User | null = auth.user
    ? {
        id: auth.user.id,
        name: auth.user.profile
          ? `${auth.user.profile.first_name || ''} ${auth.user.profile.last_name || ''}`.trim() || auth.user.email || ''
          : auth.user.email || '',
        email: auth.user.email || '',
        role: auth.role || 'buyer',
        avatar: auth.user.profile?.avatar_url || undefined,
      }
    : null;

  const login = async (email: string, password: string, _role?: UserRole) => {
    const { error } = await auth.signIn(email, password);
    if (error) throw error;
  };

  const logout = async () => {
    await auth.signOut();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: auth.isAuthenticated,
        isLoading: auth.loading,
        role: auth.role,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
