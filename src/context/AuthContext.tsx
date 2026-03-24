import { createContext, useContext, useState, type ReactNode } from 'react';
import type { User } from '../types';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  registerUser: (name: string, email: string, password: string) => { ok: boolean; error?: string };
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

    const logout = () =>{
        setUser(null);
    };

    const registerUser = (name: string, email: string, password: string): { ok: boolean; error?: string } => {
        // Mock registration - in a real app this would call an API
        if (!name) {
            return { ok: false, error: 'Le nom est requis' };
        }
        if (!email) {
            return { ok: false, error: 'L\'email est requis' };
        }
        if (!password) {
            return { ok: false, error: 'Le mot de passe est requis' };
        }
        if (password.length < 6) {
            return { ok: false, error: 'Le mot de passe doit contenir au moins 6 caractères' };
        }
        setUser({
            id: `user-${Date.now()}`,
            name,
            email,
            role: 'customer'
        });
        return { ok: true };
    };
    return(
        <AuthContext.Provider value={{user,login,logout,registerUser,isAuthenticated:!!user}}>
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