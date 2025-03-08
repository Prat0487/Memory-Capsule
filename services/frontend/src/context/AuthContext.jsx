import { 
  AuthContextImplementation, 
  AuthProviderImplementation, 
  useAuthImplementation 
} from './AuthImplementation';

// Re-export with original names
export const AuthContext = AuthContextImplementation;
export const AuthProvider = AuthProviderImplementation;
export const useAuth = useAuthImplementation;

// Add this to ensure signup is exported directly
export const { signup, signupWithGoogle, login, logout } = 
  AuthContextImplementation._currentValue || {
    signup: () => console.error("signup not initialized"),
    signupWithGoogle: () => console.error("signupWithGoogle not initialized"),
    login: () => console.error("login not initialized"),
    logout: () => console.error("logout not initialized")
  };

// Default export for compatibility
export default { AuthContext, AuthProvider, useAuth };