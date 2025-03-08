// File: services/frontend/src/context/UserContext.jsx
import { AuthContextImplementation, useAuthImplementation } from './AuthImplementation'

// Re-export with names expected by components using UserContext
export const UserContext = AuthContextImplementation
export const useUser = useAuthImplementation

// Wrapper provider that uses the implementation
export function UserProvider({ children }) {
  return <AuthProviderImplementation>{children}</AuthProviderImplementation>
}

// Default export for compatibility
export default { UserContext, UserProvider, useUser }