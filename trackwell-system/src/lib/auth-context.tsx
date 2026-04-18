import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type AppRole = "admin" | "customer" | "agent" | "center_operator";

export type User = {
  _id: string;
  name: string;
  email: string;
  role: string;
  phone: string;
  address: string;
  isActive: boolean;
  createdAt?: string;
};

interface AuthContextValue {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (userData: User, authToken: string, refreshToken: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
  hasRole: (role: AppRole) => boolean;
  hasAnyRole: (roles: AppRole[]) => boolean;
  getRoles: () => AppRole[];
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Load user from localStorage on initial load
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing stored user:', error);
        // Clear invalid data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('refreshToken');
      }
    }
    setLoading(false);
  }, []);

  // Login function
  const login = (userData: User, authToken: string, refreshToken: string) => {
    setUser(userData);
    setToken(authToken);
    
    // Store in localStorage
    localStorage.setItem('token', authToken);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('refreshToken', refreshToken);
  };

  // Logout function
  const logout = () => {
    setUser(null);
    setToken(null);
    
    // Clear localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('refreshToken');
  };

  // Check if user has specific role
  const hasRole = (role: AppRole): boolean => {
    return user ? user.role === role : false;
  };

  // Check if user has any of the specified roles
  const hasAnyRole = (roles: AppRole[]): boolean => {
    return user ? roles.includes(user.role as AppRole) : false;
  };

  // Get user roles
  const getRoles = () => {
    return user ? [user.role as AppRole] : [];
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      loading, 
      login, 
      logout, 
      isAuthenticated: !!token,
      hasRole,
      hasAnyRole,
      getRoles
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export function useHasRole(role: AppRole) {
  const { getRoles } = useAuth();
  const roles = getRoles();
  return roles.includes(role);
}
