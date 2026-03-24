import { createContext, useContext, useState, type ReactNode } from 'react';
import type { User } from '../types';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => boolean;
  registerUser: (data: { name: string; email: string; password: string }) => { ok: boolean; error?: string };
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children } : {children:ReactNode}){
    const [user,setUser] = useState<User | null>(null);
    
    const login = (email:string,password:string):boolean => {
        if(email === 'admin@restaurant.com' && password === 'Resataurant1234'){
            setUser({
                id : '1',
                name: 'Chef Admin',
                email : 'admin@restaurant.com',
                role : 'admin'
            })
            return true;
        }
        return false;
    };

    const registerUser = (data: { name: string; email: string; password: string }): { ok: boolean; error?: string } => {
        // Basic validation
        if (!data.name || data.name.trim().length < 2) {
            return { ok: false, error: 'Le nom doit contenir au moins 2 caractères' };
        }
        if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
            return { ok: false, error: 'Email invalide' };
        }
        if (!data.password || data.password.length < 6) {
            return { ok: false, error: 'Le mot de passe doit contenir au moins 6 caractères' };
        }

        // Check if email already exists (demo: just check against the hardcoded admin)
        if (data.email === 'admin@restaurant.com') {
            return { ok: false, error: 'Cet email est déjà utilisé' };
        }

        // Create new user
        setUser({
            id: Date.now().toString(),
            name: data.name,
            email: data.email,
            role: 'customer'
        });
        
        return { ok: true };
    };

    const logout = () =>{
        setUser(null);
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
