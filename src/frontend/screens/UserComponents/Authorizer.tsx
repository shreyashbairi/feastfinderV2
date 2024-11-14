import React, { createContext, useContext, useEffect, useState } from 'react';
import { API_BASE_URL } from '../../../config.js';

interface AuthContextType {
  user: any;
  setUserToken: (userToken: string, email: string) => void;
  logout: () => Promise<void>;
  userInfo: any;
  loading: boolean;
  validateToken: () => Promise<boolean>;
}

interface AuthContextProviderProps {
  children: React.ReactNode;
}

// Create the AuthContext with a default value of undefined
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Custom hook to use the AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthContextProvider');
  }
  return context;
};

export const AuthContextProvider: React.FC<AuthContextProviderProps> = ({ children }) => {
  const [user, setUser] = useState<any>(null); // Use this to verify logged in
  const [userInfo, setUserInfo] = useState<any>({}); // Use this for additional info
  const [loading, setLoading] = useState(true); // Use this to ensure this useEffect runs first

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setUser(user);
    }

    setLoading(false); // To prevent redirection too early
    console.log('in Authorizer loading false');
    // setLoading will rerender all components it AuthContext wraps
  }, []);

  useEffect(() => {
    const handleStorageChange = () => {
      console.log('Handling storage change');
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      } else {
        setUser(null);
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const setUserToken = (userToken: string, email: string) => {
    const user = {
      token: userToken,
      email: email,
    };
    setUser(user);
    localStorage.setItem('user', JSON.stringify(user));
  };

  const logout = async () => {
    const token = user?.token;
    const authToken = 'Bearer ' + token;
    try {
      const res = await fetch('${API_BASE_URL}/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: authToken,
        },
      });

      if (res.ok) {
        const data = await res.json();
        console.log('User logged out:', data);
      } else {
        const errorData = await res.json();
        console.error('Error during logout:', errorData);
      }
    } catch (error) {
      console.error('Network error:', error);
    }
    setUser(null);
    setUserInfo(null);
    //localStorage.removeItem('user');
  };

  const validateToken = async () => {
    console.log('in validateToken()');
    try {
      const response = await fetch('${API_BASE_URL}/api/auth/protected', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error:', errorData.msg || 'Server error');
        return false;
      }

      // Parse the response JSON
      const userData = await response.json();
      console.log('User data:', userData);
      if (userData.msg && userData.msg === 'Token is not valid') return false;
      return true; // this isn't a very safe check
    } catch (error) {
      console.error('Fetch error:', error);
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUserToken, logout, userInfo, loading, validateToken }}>
      {loading ? null : children}
    </AuthContext.Provider>
  );
};
