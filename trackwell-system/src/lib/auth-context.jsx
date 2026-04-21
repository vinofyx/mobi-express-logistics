import React, { createContext, useContext, useEffect, useState } from "react";

// Role types
export const AppRole = {
  ADMIN: "admin",
  CUSTOMER: "customer", 
  AGENT: "agent",
  CENTER_OPERATOR: "center_operator"
};

// User shape for reference
export const UserShape = {
  _id: "",
  name: "",
  email: "",
  role: "",
  phone: "",
  address: "",
  isActive: true,
  createdAt: "",
};

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
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
  const login = (userData, authToken, refreshToken) => {
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
  const hasRole = (role) => {
    return user ? user.role === role : false;
  };

  // Check if user has any of the specified roles
  const hasAnyRole = (roles) => {
    return user ? roles.includes(user.role) : false;
  };

  // Get user roles
  const getRoles = () => {
    return user ? [user.role] : [];
  };

  const roles = user ? [user.role] : [];

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      login,
      logout,
      signOut: logout,
      isAuthenticated: !!token,
      hasRole,
      hasAnyRole,
      getRoles,
      roles,
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

export function useHasRole(role) {
  const { getRoles } = useAuth();
  const roles = getRoles();
  return roles.includes(role);
}

export default AuthContext;
