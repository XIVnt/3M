import { Navigate } from "react-router-dom";

type Props = {
  role: string[];
  allowedRoles: string[];
  children: React.ReactNode;
};

export default function ProtectedRoute({ role, allowedRoles, children }: Props) {
  const hasAccess = role.some(r => allowedRoles.includes(r));

  if (!hasAccess) {
    return <Navigate to="/login" />;
  }

  return children;
}