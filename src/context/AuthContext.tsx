// src/context/AuthContext.tsx
import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import {
  initDB,
  retrieveLocalSession,
  clearLocalSession,
  loginLocalUser,
  registerLocalUser,
  saveLoggedInUserCache, 
  UserProfile,
  storeLocalSession,
  getLoggedInUserCache,
} from '../hooks/database'; 

interface AuthContextType {
  user: UserProfile | null;
  isLoggedIn: boolean;
  isLoading: boolean; 
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>; 
  logout: () => Promise<void>;
  updateCurrentUsername: (newName: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true); 

   const updateCurrentUsername = (newName: string) => {
    setUser(currentUser => {
      if (currentUser) {
        const updatedUser = { ...currentUser, name: newName };
        return updatedUser;
      }
      return null;
    });
  };

  useEffect(() => {
    const checkAuthState = async () => {
      try {
        await initDB(); 
        const userEmailFromSession = await retrieveLocalSession();
        if (userEmailFromSession) {
          const cachedUser = await getLoggedInUserCache(); 
          if (cachedUser && cachedUser.email === userEmailFromSession) {
            setUser(cachedUser);
            setIsLoggedIn(true);
          } else {
            await clearLocalSession();
            setUser(null);
            setIsLoggedIn(false);
          }
        } else {
          setUser(null);
          setIsLoggedIn(false);
        }
      } catch (e) {
        console.error('[AuthContext] Lỗi khi kiểm tra trạng thái đăng nhập:', e);
        setUser(null);
        setIsLoggedIn(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthState();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const userProfile = await loginLocalUser(email, password);
      if (userProfile && userProfile.email) {
        await storeLocalSession(userProfile.email);

        setUser(userProfile);
        setIsLoggedIn(true);
        setIsLoading(false);
        return true;
      }
      setUser(null);
      setIsLoggedIn(false);
      setIsLoading(false);
      return false;
    } catch (error) {
      console.error('[AuthContext] Lỗi đăng nhập:', error);
      setUser(null);
      setIsLoggedIn(false);
      setIsLoading(false);
      throw error; 
    }
  };

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      await registerLocalUser(name, email, password);
      setIsLoading(false);
      return true; 
    } catch (error) {
      console.error('[AuthContext] Lỗi đăng ký:', error);
      setIsLoading(false);
      throw error;
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await clearLocalSession();
      setUser(null);
      setIsLoggedIn(false);
    } catch (error) {
      console.error('[AuthContext] Lỗi đăng xuất:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
     <AuthContext.Provider value={{ user, isLoggedIn, isLoading, login, register, logout, updateCurrentUsername}}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth phải được sử dụng bên trong một AuthProvider');
  }
  return context;
};