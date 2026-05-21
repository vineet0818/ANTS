import { createContext, useState, useContext, useEffect, type ReactNode } from 'react';
import api from '../api';

type UserRole = 'admin' | 'learner' | string;

interface UserState {
  token: string;
  role: UserRole;
  id: number;
  full_name: string;
}

interface AuthContextType {
  user: UserState | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<any>;
  register: (full_name: string, email: string, password: string) => Promise<any>;
  /** Called by SSOCallback after a successful Microsoft SSO redirect. */
  setUserFromSSO: (params: { token: string; userId: number; role: string; full_name: string }) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserState | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    const storedUserId = localStorage.getItem('user_id');
    const full_name = localStorage.getItem('full_name') ?? '';
    if (token && role && storedUserId) {
      setUser({ token, role, id: Number(storedUserId), full_name });
    }
    setLoading(false);
  }, []);

  const persistUser = (token: string, role: string, id: number, full_name: string) => {
    localStorage.setItem('token', token);
    localStorage.setItem('role', role);
    localStorage.setItem('user_id', String(id));
    localStorage.setItem('full_name', full_name);
    setUser({ token, role, id, full_name });
  };

  const login = async (email: string, password: string) => {
    const res = await api.post('/auth/login', { email, password });
    persistUser(res.data.access_token, res.data.role, res.data.user_id, res.data.full_name ?? '');
    return res.data;
  };

  const register = async (full_name: string, email: string, password: string) => {
    const res = await api.post('/auth/register', { full_name, email, password });
    persistUser(res.data.access_token, res.data.role, res.data.user_id, res.data.full_name ?? '');
    return res.data;
  };

  /** Invoked by SSOCallback page after Microsoft redirects back with a JWT. */
  const setUserFromSSO = ({
    token,
    userId,
    role,
    full_name,
  }: {
    token: string;
    userId: number;
    role: string;
    full_name: string;
  }) => {
    persistUser(token, role, userId, full_name);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('user_id');
    localStorage.removeItem('full_name');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, setUserFromSSO, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext) as AuthContextType;
