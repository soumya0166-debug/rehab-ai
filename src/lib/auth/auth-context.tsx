'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { UserProfile, CanonicalRole } from '@/types';
import {
  getCurrentUserProfile,
  signInUser,
  signUpUser,
  signOutUser,
  getRoleDashboardPath,
  normalizeRole,
  SignUpParams,
} from './auth-service';
import { getSupabaseBrowserClient } from './supabase-client';

interface AuthContextType {
  user: UserProfile | null;
  role: CanonicalRole | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string, roleHint?: CanonicalRole) => Promise<{ success: boolean; error?: string; role?: CanonicalRole }>;
  signup: (params: SignUpParams) => Promise<{ success: boolean; error?: string; role?: CanonicalRole }>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load session on initial mount & handle refresh preservation
  const refreshSession = useCallback(async () => {
    try {
      const profile = await getCurrentUserProfile();
      setUser(profile);
    } catch (err) {
      console.error('Error refreshing session:', err);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshSession();

    // Listen to Supabase auth state change events
    const supabase = getSupabaseBrowserClient();
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event) => {
      if (event === 'SIGNED_OUT') {
        setUser(null);
        setIsLoading(false);
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        await refreshSession();
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [refreshSession]);

  const login = async (email: string, password: string, roleHint?: CanonicalRole) => {
    setIsLoading(true);
    const result = await signInUser(email, password, roleHint);
    setIsLoading(false);

    if (result.error || !result.data) {
      return { success: false, error: result.error || 'Authentication failed' };
    }

    const verifiedProfile = result.data;
    setUser(verifiedProfile);
    const canonical = normalizeRole(verifiedProfile.role);

    // Redirect user to the correct dashboard after login
    const targetDashboard = getRoleDashboardPath(canonical);
    router.push(targetDashboard);

    return { success: true, role: canonical };
  };

  const signup = async (params: SignUpParams) => {
    setIsLoading(true);
    const result = await signUpUser(params);
    setIsLoading(false);

    if (result.error || !result.data) {
      return { success: false, error: result.error || 'Signup failed' };
    }

    const newProfile = result.data;
    setUser(newProfile);
    const canonical = normalizeRole(newProfile.role);

    // Redirect to correct dashboard after signup
    const targetDashboard = getRoleDashboardPath(canonical);
    router.push(targetDashboard);

    return { success: true, role: canonical };
  };

  const logout = async () => {
    setIsLoading(true);
    await signOutUser();
    setUser(null);
    setIsLoading(false);
    router.push('/login');
  };

  const canonicalRole = user ? normalizeRole(user.role) : null;

  return (
    <AuthContext.Provider
      value={{
        user,
        role: canonicalRole,
        isLoading,
        isAuthenticated: !!user,
        login,
        signup,
        logout,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
