import { AuthContextImplementation, AuthProviderImplementation } from './AuthImplementation';

// Re-export with original names
export const AuthContext = AuthContextImplementation;
export const AuthProvider = AuthProviderImplementation;

// Default export for compatibility
export default { AuthContext, AuthProvider };