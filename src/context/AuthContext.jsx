import { createContext, useContext, useState, useEffect } from 'react';
import { getMeApi, loginApi, signupApi, updateMeApi } from '../lib/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // For admin: allows viewing the dashboard as a specific school
  const [viewingSchoolId, setViewingSchoolId] = useState('ALL');

  useEffect(() => {
    async function initAuth() {
      const token = localStorage.getItem('digiboard_token');
      if (token) {
        try {
          const u = await getMeApi();
          setUser(u);
          if (u.role === 'admin') setViewingSchoolId('ALL');
        } catch (error) {
          console.error('Session invalid:', error);
          localStorage.removeItem('digiboard_token');
        }
      }
      setLoading(false);
    }
    initAuth();
  }, []);

  const login = async (email, password) => {
    const { token, user: u } = await loginApi(email, password);
    localStorage.setItem('digiboard_token', token);
    setUser(u);
    if (u.role === 'admin') setViewingSchoolId('ALL');
    return u;
  };

  const signup = async (userData) => {
    const { token, user: u } = await signupApi(userData);
    localStorage.setItem('digiboard_token', token);
    setUser(u);
    if (u.role === 'admin') setViewingSchoolId('ALL');
    return u;
  };

  const logout = () => {
    localStorage.removeItem('digiboard_token');
    setUser(null);
    setViewingSchoolId('ALL');
  };

  const updateUser = async (updates) => {
    const updated = await updateMeApi(updates);
    setUser(updated);
    return updated;
  };

  const switchSchool = (schoolId) => {
    if (user?.role === 'admin') {
      setViewingSchoolId(schoolId);
    }
  };

  const effectiveSchoolId = user?.role === 'admin' ? viewingSchoolId : user?.schoolId;
  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      signup, 
      updateUser,
      loading,
      viewingSchoolId,
      effectiveSchoolId,
      switchSchool,
      isAdmin
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
