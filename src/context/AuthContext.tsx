import { createContext, useContext, useReducer, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import type { AuthState, AuthUser, DecodedToken } from "../types/auth";
import apiClient, { setAccessToken, getNewAccessToken } from "../api/axiosInstance";

// The two possible actions that can change auth state.
type AuthAction =
  | { type: "LOGIN"; payload: { user: AuthUser; token: string } }
  | { type: "LOGOUT" };

// The shape of state managed by the reducer.
// Separate from AuthState because AuthState includes the functions too.
  interface AuthReducerState {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
}

const initialState: AuthReducerState = {
  user: null,
  token: null,
  isLoading: true,
};

// The reducer: receives current state + action, returns new state.
// Never mutates — always returns a fresh object.
function authReducer(
  state: AuthReducerState, 
  action: AuthAction): AuthReducerState {
  switch (action.type) {
    case "LOGIN":
      return { 
        user: action.payload.user, 
        token: action.payload.token, 
        isLoading: false };
    case "LOGOUT":
      return { 
        user: null, 
        token: null, 
        isLoading: false };
    default:
      return state;
  }
}

// Helper: decodes a JWT string and returns a clean AuthUser.
// This is the only place in the app that knows about the ugly URI claim key.
function decodeToken(token: string): AuthUser {
  const decoded = jwtDecode<DecodedToken>(token);
  return {
    userId: decoded.sub,
    tenantId: decoded.TenantId,
    role: decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"],
    fullName: decoded.FullName,
    email: decoded.email,
  };
}

// The context itself. Undefined by default — the hook will guard against
// using it outside the provider.
const AuthContext = createContext<AuthState | undefined>(undefined);

// The provider component. Wraps your app and makes auth state available
// to every component in the tree.
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // On first load: no token in memory yet (page was just refreshed).
  // Ask the server for a new one using the refreshToken cookie.
  useEffect(() => {
    getNewAccessToken()
      .then((token) => {
        const user = decodeToken(token);
        dispatch({ type: "LOGIN", payload: { user, token } });
      })
      .catch(() => {
        dispatch({ type: "LOGOUT" });
      });
  }, []);

  const login = (token: string) => {
    setAccessToken(token); // tells axios's plain variable
    const user = decodeToken(token);
    dispatch({ type: "LOGIN", payload: { user, token } }); // tells React's state
  };

  const logout = async () => {
    try {
      await apiClient.post("/api/auth/logout");
    } catch {
      // ignore — clear local state regardless
    }
    setAccessToken(null);
    dispatch({ type: "LOGOUT" });
  };

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// The hook: the only way components should access auth state.
// Throws if used outside AuthProvider — catches mistakes at development time.
export function useAuth(): AuthState {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}