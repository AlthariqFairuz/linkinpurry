import { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  token: string | null;
  login: (token: string) => void;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check authentication status on mount using token from cookie
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Verify token validity with the backend
        const response = await fetch('http://localhost:3000/api/verify', {
          method: 'GET',
          credentials: 'include', 
          headers: {
            'Content-Type': 'application/json',
          }
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.token) {
            setIsAuthenticated(true);
            setToken(data.token);
          } else {
            setIsAuthenticated(false);
            setToken(null);
          }
        } else {
          setIsAuthenticated(false);
          setToken(null);
        }
      } catch (error) {
        console.error('Auth check error:', error);
        setIsAuthenticated(false);
        setToken(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = (newToken: string) => {
    setToken(newToken);
    setIsAuthenticated(true);
  };

  const logout = async () => {
    try {
      //logout endpoint to clear the JWT cookie
      await fetch('http://localhost:3000/api/logout', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      setToken(null);
      setIsAuthenticated(false);
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, token, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};