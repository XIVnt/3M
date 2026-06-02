import { Navigate } from "react-router-dom";

type Props = {
  role?: string[];          // 👈 puede ser undefined
  allowedRoles: string[];
  children: React.ReactNode;
  loading?: boolean;        // 👈 importante
};

export default function ProtectedRoute({
  role,
  allowedRoles,
  children,
  loading = false
}: Props) {

  // 1. mientras carga sesión
  if (loading) {
    return <div>Cargando...</div>;
  }

  // 2. no logeado o sin roles
  if (!role || role.length === 0) {
    return <Navigate to="/login" replace />;
  }

  // 3. check permisos
  const hasAccess = role.some(r => allowedRoles.includes(r));

  if (!hasAccess) {
    return <Navigate to="/403" replace />;
  }

  return children;
}