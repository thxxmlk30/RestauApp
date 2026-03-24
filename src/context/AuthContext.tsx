import { createContext, useContext, useState, type ReactNode } from 'react';
import type { User } from '../types';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => boolean;
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

    const logout = () =>{
        setUser(null);
    };
    return(
        <AuthContext.Provider value={{user,login,logout,isAuthenticated:!!user}}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth(){
    const context = useContext(AuthContext);
    return context;
}