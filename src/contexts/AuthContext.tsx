import React, { createContext, useContext, useState, ReactNode } from 'react';

export type UserRole = 'farmer' | 'buyer' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, role: UserRole) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users for demo
const mockUsers: Record<string, User> = {
  'farmer@demo.com': { id: '1', name: 'John Farmer', email: 'farmer@demo.com', role: 'farmer' },
  'buyer@demo.com': { id: '2', name: 'Sarah Buyer', email: 'buyer@demo.com', role: 'buyer' },
  'admin@demo.com': { id: '3', name: 'Admin User', email: 'admin@demo.com', role: 'admin' },
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = async (email: string, password: string, role: UserRole) => {
    // Mock login - in production, this would call your PHP backend
    const mockUser = mockUsers[email] || {
      id: Date.now().toString(),
      name: email.split('@')[0],
      email,
      role,
    };
    setUser(mockUser);
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
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
