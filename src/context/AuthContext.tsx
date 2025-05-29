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
} from '../hooks/database'; // Đường dẫn tới file database.ts của bạn

interface AuthContextType {
  user: UserProfile | null;
  isLoggedIn: boolean;
  isLoading: boolean; // Trạng thái đang kiểm tra session ban đầu
  login: (email: string, password: string) => Promise<boolean>; // Trả về true nếu thành công
  register: (name: string, email: string, password: string) => Promise<boolean>; // Trả về true nếu thành công
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true); // Bắt đầu với trạng thái loading

  // Kiểm tra session khi AuthProvider được mount lần đầu
  useEffect(() => {
    const checkAuthState = async () => {
      try {
        await initDB(); // Đảm bảo DB đã được khởi tạo
        const userEmailFromSession = await retrieveLocalSession();
        if (userEmailFromSession) {
          const cachedUser = await getLoggedInUserCache(); // Lấy thông tin user từ cache
          if (cachedUser && cachedUser.email === userEmailFromSession) {
            setUser(cachedUser);
            setIsLoggedIn(true);
          } else {
            // Session có nhưng không có cache user hợp lệ, xóa session
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
      throw error; // Ném lỗi ra để màn hình Login có thể bắt và hiển thị
    }
  };

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      await registerLocalUser(name, email, password);
      // Sau khi đăng ký, người dùng cần đăng nhập lại, hoặc bạn có thể tự động đăng nhập họ
      // Nếu tự động đăng nhập, bạn sẽ gọi login() ở đây hoặc lấy userProfile và set state
      setIsLoading(false);
      return true; // Đăng ký thành công (nhưng chưa đăng nhập)
    } catch (error) {
      console.error('[AuthContext] Lỗi đăng ký:', error);
      setIsLoading(false);
      throw error; // Ném lỗi ra để màn hình Register có thể bắt và hiển thị
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      // Lấy email của user hiện tại để có thể xóa vé của họ nếu cần
      // const currentUserEmail = user?.email;
      await clearLocalSession(); // Hàm này đã bao gồm clearLoggedInUserCache()
      // if (currentUserEmail) {
      //   await clearUserTicketsCacheForUser(currentUserEmail);
      // }
      setUser(null);
      setIsLoggedIn(false);
    } catch (error) {
      console.error('[AuthContext] Lỗi đăng xuất:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoggedIn, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook để dễ dàng sử dụng AuthContext
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth phải được sử dụng bên trong một AuthProvider');
  }
  return context;
};