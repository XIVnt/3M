import { jwtDecode } from "jwt-decode";

export const getUserRole = (token: string | null): string[] => {
  if (!token) return ["user"];

  try {
    const decoded = jwtDecode<any>(token);

    const role =
      decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ??
      decoded["role"] ??
      decoded["roles"];

    if (!role) return ["user"];

    return Array.isArray(role) ? role : [role];
  } catch {
    return ["user"];
  }
};