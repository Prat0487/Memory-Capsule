import { AuthContextImplementation, AuthProviderImplementation, useAuthImplementation } from './AuthImplementation';

// Re-export with original names
export const AuthContext = AuthContextImplementation;
export const AuthProvider = AuthProviderImplementation;
export const useAuth = useAuthImplementation;

// Default export for compatibility
export default { AuthContext, AuthProvider, useAuth };