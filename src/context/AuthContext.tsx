import { createContext, useContext, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";

type AuthContextType = {
  token: string | null;
  roles: string[];
  setToken: (t: string | null) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

type JwtPayload = {
  roles?: string[] | string;
  role?: string;
  "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"?: string | string[];
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setTokenState] = useState<string | null>(
    localStorage.getItem("token")
  );

  const [roles, setRoles] = useState<string[]>([]);

  const extractRoles = (decoded: JwtPayload): string[] => {
    const roleClaim =
      decoded.roles ??
      decoded.role ??
      decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];

    if (!roleClaim) return [];

    return Array.isArray(roleClaim)
      ? roleClaim.map((r) => r.toLowerCase())
      : [roleClaim.toLowerCase()];
  };

  // 🔥 IMPORTANTE: recalcular roles al cargar la app
  useEffect(() => {
    const storedToken = localStorage.getItem("token");

    if (!storedToken) return;

    try {
      const decoded = jwtDecode<JwtPayload>(storedToken);
      setRoles(extractRoles(decoded));
      setTokenState(storedToken);
    } catch {
      localStorage.removeItem("token");
      setRoles([]);
      setTokenState(null);
    }
  }, []);

  const setToken = (t: string | null) => {
    if (t) {
      localStorage.setItem("token", t);

      try {
        const decoded = jwtDecode<JwtPayload>(t);
        const extractedRoles = extractRoles(decoded);

        console.log("DECODED TOKEN:", decoded);
        console.log("ROLES:", extractedRoles);

        setRoles(extractedRoles);
        setTokenState(t);
      } catch (err) {
        console.error("JWT decode error:", err);
        setRoles([]);
        setTokenState(null);
      }
    } else {
      localStorage.removeItem("token");
      setRoles([]);
      setTokenState(null);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    setTokenState(null);
    setRoles([]);
  };

  return (
    <AuthContext.Provider value={{ token, roles, setToken, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};