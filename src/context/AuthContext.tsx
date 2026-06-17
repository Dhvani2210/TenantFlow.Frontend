import { createContext, useContext, useReducer, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import type { AuthState, AuthUser, DecodedToken } from "../types/auth";

// The two possible actions that can change auth state.
type AuthAction =
  | { type: "LOGIN"; payload: { user: AuthUser; token: string } }
  | { type: "LOGOUT" };

// The shape of state managed by the reducer.
// Separate from AuthState because AuthState includes the functions too.
  interface AuthReducerState {
  user: AuthUser | null;
  token: string | null;
}

const initialState: AuthReducerState = {
  user: null,
  token: null,
};

// The reducer: receives current state + action, returns new state.
// Never mutates — always returns a fresh object.
function authReducer(
  state: AuthReducerState,
  action: AuthAction
): AuthReducerState {
  switch (action.type) {
    case "LOGIN":
      return {
        user: action.payload.user,
        token: action.payload.token,
      };
    case "LOGOUT":
      return {
        user: null,
        token: null,
      };
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

  // On first load, check if a token already exists in localStorage.
  // This keeps the user logged in across page refreshes.
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const user = decodeToken(token);
      dispatch({ type: "LOGIN", payload: { user, token } });
    }
  }, []);

  const login = (token: string) => {
    localStorage.setItem("token", token);
    const user = decodeToken(token);
    dispatch({ type: "LOGIN", payload: { user, token } });
  };

  const logout = () => {
    localStorage.removeItem("token");
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