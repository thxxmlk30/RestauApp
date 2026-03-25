/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { User } from '../types';

type RegisterData = { name: string; email: string; password: string };

type StoredUser = User & { password: string };

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => boolean;
  registerUser: (data: RegisterData) => { ok: boolean; error?: string };
  logout: () => void;
  isAuthenticated: boolean;
}

const USERS_KEY = 'restauapp.users.v1';
const SESSION_KEY = 'restauapp.session.v1';
const validRoles = new Set<User['role']>(['admin', 'waiter', 'chef', 'customer']);

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

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

function normalizeUser(value: unknown): User | null {
  if (!value || typeof value !== 'object') return null;
  const user = value as Record<string, unknown>;

  const id = asString(user.id);
  const name = asString(user.name);
  const email = asString(user.email);
  const role = asString(user.role);

  if (!id || !name || !email || !role || !validRoles.has(role as User['role'])) return null;

  return { id, name, email, role: role as User['role'] };
}

function normalizeStoredUser(value: unknown): StoredUser | null {
  if (!value || typeof value !== 'object') return null;
  const user = value as Record<string, unknown>;

  const normalized = normalizeUser(user);
  const password = asString(user.password);

  if (!normalized || !password) return null;
  return { ...normalized, password };
}

function loadStoredUsers(): StoredUser[] {
  if (!isBrowserStorageAvailable()) return [];
  try {
    const raw = window.localStorage.getItem(USERS_KEY);
    if (!raw) return [];
    const parsed = safeJsonParse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map(normalizeStoredUser).filter(Boolean) as StoredUser[];
  } catch {
    return [];
  }
}

function saveStoredUsers(users: StoredUser[]) {
  if (!isBrowserStorageAvailable()) return;
  try {
    window.localStorage.setItem(USERS_KEY, JSON.stringify(users));
  } catch {
    // ignore write errors
  }
}

function loadSessionUser(): User | null {
  if (!isBrowserStorageAvailable()) return null;
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return normalizeUser(safeJsonParse(raw));
  } catch {
    return null;
  }
}

function saveSessionUser(nextUser: User | null) {
  if (!isBrowserStorageAvailable()) return;
  try {
    if (nextUser) {
      window.localStorage.setItem(SESSION_KEY, JSON.stringify(nextUser));
    } else {
      window.localStorage.removeItem(SESSION_KEY);
    }
  } catch {
    // ignore write errors
  }
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children } : {children:ReactNode}){
    const [user,setUser] = useState<User | null>(() => loadSessionUser());

    useEffect(() => {
        const sessionUser = loadSessionUser();
        if (sessionUser) setUser(sessionUser);
    }, []);
    
    const login = (email:string,password:string):boolean => {
        const emailNormalized = normalizeEmail(email);

        if(emailNormalized === 'admin@linguere.sn' && password === 'Linguere1234'){
            const adminUser: User = {
                id : '1',
                name: 'Chef Admin',
                email : 'admin@linguere.sn',
                role : 'admin'
            };
            setUser(adminUser);
            saveSessionUser(adminUser);
            return true;
        }

        const users = loadStoredUsers();
        const match = users.find((u) => normalizeEmail(u.email) === emailNormalized && u.password === password);
        if (!match) return false;

        const nextUser: User = { id: match.id, name: match.name, email: match.email, role: match.role };
        setUser(nextUser);
        saveSessionUser(nextUser);
        return true;
    };

    const registerUser = (data: RegisterData): { ok: boolean; error?: string } => {
        const name = data.name.trim();
        const email = normalizeEmail(data.email);
        const password = data.password;

        // Basic validation
        if (!name || name.length < 2) {
            return { ok: false, error: 'Le nom doit contenir au moins 2 caractères' };
        }
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return { ok: false, error: 'Email invalide' };
        }
        if (!password || password.length < 6) {
            return { ok: false, error: 'Le mot de passe doit contenir au moins 6 caractères' };
        }

        // Check if email already exists (demo: just check against the hardcoded admin)
        if (email === 'admin@linguere.sn') {
            return { ok: false, error: 'Cet email est déjà utilisé' };
        }

        const existingUsers = loadStoredUsers();
        if (existingUsers.some((u) => normalizeEmail(u.email) === email)) {
            return { ok: false, error: 'Cet email est déjà utilisé' };
        }

        const nextUser: User = {
            id: Date.now().toString(),
            name,
            email,
            role: 'customer'
        };

        const nextStoredUser: StoredUser = { ...nextUser, password };
        saveStoredUsers([nextStoredUser, ...existingUsers]);

        // Connexion automatique après inscription
        setUser(nextUser);
        saveSessionUser(nextUser);
        
        return { ok: true };
    };

    const logout = () =>{
        setUser(null);
        saveSessionUser(null);
    };
    
    return(
        <AuthContext.Provider value={{user,login,registerUser,logout,isAuthenticated:!!user}}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth(){
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
