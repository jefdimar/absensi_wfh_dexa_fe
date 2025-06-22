import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

// Re-export the main useAuth hook from AuthContext
export { useAuth } from '../contexts/AuthContext';

// Additional auth-related hooks
export const useAuthActions = () => {
  const { login, logout, register, updateProfile } = useAuth();

  return {
    login,
    logout,
    register,
    updateProfile
  };
};

export const useAuthStatus = () => {
  const { user, isAuthenticated, isLoading } = useAuth();

  return {
    user,
    isAuthenticated,
    isLoading,
    isAdmin: user?.role === 'admin',
    isEmployee: user?.role === 'employee'
  };
};