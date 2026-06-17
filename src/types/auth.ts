// The raw shape of the decoded JWT payload.
// We use a quoted key for the role claim because the full URI
// is not a valid JavaScript identifier.
export interface DecodedToken {
  "http://schemas.microsoft.com/ws/2008/06/identity/claims/role": string;
  TenantId: string;
  sub: string;       // user ID (standard JWT claim)
  exp: number;       // expiry as Unix timestamp (standard JWT claim)
  FullName: string;
  email: string;
}

// The clean, usable representation of the logged-in user.
// This is what the rest of the app works with — never the raw decoded token.
export interface AuthUser {
  userId: string;
  tenantId: string;
  role: string;
  fullName: string;
  email: string;
}

// The full shape of what AuthContext exposes to the app.
export interface AuthState {
  user: AuthUser | null;   // null means not logged in
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
}