/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { User, UserRole } from '../types';
import { clearApiToken, getApiToken } from '../services/apiClient';
import { ApiError } from '../services/apiClient';
import { restaurantApi } from '../services/restaurantApi';

type RegisterData = { name: string; email: string; password: string };

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, rememberUser?: boolean) => Promise<{ ok: boolean; error?: string }>;
  registerUser: (data: RegisterData) => Promise<{ ok: boolean; error?: string; email?: string; message?: string; devOtpCode?: string }>;
  logout: () => void;
  isAuthenticated: boolean;
}

const SESSION_KEY = 'restauapp.session.v2';
const validRoles = new Set<UserRole>(['admin', 'waiter', 'chef', 'delivery', 'customer', 'client']);

function isBrowserStorageAvailable() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function safeJsonParse(value: string) {
  try {
    return JSON.parse(value) as unknown;
  } catch {
    return null;
  }
}

function asString(value: unknown) {
  return typeof value === 'string' ? value : null;
}

function normalizeUser(value: unknown): User | null {
  if (!value || typeof value !== 'object') return null;
  const user = value as Record<string, unknown>;

  const id = asString(user.id);
  const name = asString(user.name);
  const email = asString(user.email);
  const role = asString(user.role);

  if (!id || !name || !email || !role || !validRoles.has(role as UserRole)) return null;
  return { id, name, email, role: role as UserRole };
}

function clearSessionUser() {
  if (!isBrowserStorageAvailable()) return;
  try {
    window.localStorage.removeItem(SESSION_KEY);
    window.sessionStorage.removeItem(SESSION_KEY);
  } catch {
    // ignore storage errors
  }
}

function loadSessionUser(): User | null {
  if (!isBrowserStorageAvailable()) return null;
  try {
    const localSession = window.localStorage.getItem(SESSION_KEY);
    if (localSession) return normalizeUser(safeJsonParse(localSession));

    const tabSession = window.sessionStorage.getItem(SESSION_KEY);
    if (!tabSession) return null;
    return normalizeUser(safeJsonParse(tabSession));
  } catch {
    return null;
  }
}

function saveSessionUser(nextUser: User | null, rememberUser = true) {
  if (!isBrowserStorageAvailable()) return;
  try {
    clearSessionUser();
    if (!nextUser) return;

    const storage = rememberUser ? window.localStorage : window.sessionStorage;
    storage.setItem(SESSION_KEY, JSON.stringify(nextUser));
  } catch {
    // ignore write errors
  }
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => loadSessionUser());

  useEffect(() => {
    const sessionUser = loadSessionUser();
    const token = getApiToken();

    const handleAuthExpired = () => {
      clearSessionUser();
      clearApiToken();
      setUser(null);
    };

    window.addEventListener('restauapp:auth-expired', handleAuthExpired);

    if (token) {
      restaurantApi
        .me()
        .then((nextUser) => {
          const normalized = normalizeUser(nextUser);
          if (!normalized) throw new Error('Profil invalide.');
          setUser(normalized);
          saveSessionUser(normalized);
        })
        .catch((error) => {
          if (error instanceof ApiError && error.status === 401) {
            handleAuthExpired();
            return;
          }
          clearApiToken();
          if (sessionUser) {
            setUser(sessionUser);
          } else {
            clearSessionUser();
            setUser(null);
          }
        });

      return () => {
        window.removeEventListener('restauapp:auth-expired', handleAuthExpired);
      };
    }

    if (sessionUser) setUser(sessionUser);
    return () => {
      window.removeEventListener('restauapp:auth-expired', handleAuthExpired);
    };
  }, []);

  const login = async (email: string, password: string, rememberUser = true) => {
    try {
      const response = await restaurantApi.login(email, password);
      const nextUser = normalizeUser(response.user);
      if (!nextUser) return { ok: false, error: 'Profil de connexion invalide.' };
      setUser(nextUser);
      saveSessionUser(nextUser, rememberUser);
      return { ok: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Connexion impossible.';
      return { ok: false, error: message };
    }
  };

  const registerUser = async (data: RegisterData) => {
    const name = data.name.trim();
    const email = data.email.trim().toLowerCase();
    const password = data.password;

    if (!name || name.length < 2) return { ok: false, error: 'Le nom doit contenir au moins 2 caracteres.' };
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { ok: false, error: 'Email invalide.' };
    if (!password || password.length < 6) return { ok: false, error: 'Le mot de passe doit contenir au moins 6 caracteres.' };

    try {
      const response = await restaurantApi.register(name, email, password);
      return { ok: true, email: response.email ?? email, message: response.message, devOtpCode: response.devOtpCode };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Impossible de creer le compte.';
      return { ok: false, error: message };
    }
  };

  const logout = () => {
    setUser(null);
    clearSessionUser();
    clearApiToken();
  };

  return <AuthContext.Provider value={{ user, login, registerUser, logout, isAuthenticated: !!user }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
