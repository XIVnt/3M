import { Routes, Route } from "react-router-dom";
import { getUserRole } from "./api/authService";

import { useAuth } from "./context/AuthContext";

import Layout from "./pages/layout/Layout";
import Home from "./components/Home";
import OrderPage from "./components/OrderPage";
import AuthPage from "./components/AuthPage";
import SobreNosotros from "./components/SobreNosotros";
import ProtectedRoute from "./routes/ProtectedRoute";
import AdminPage from "./pages/AdminPage";
import EmployeePage from "./pages/EmployeePage";
import CartPage from "./pages/CartPage";

// AUTH PAGES
import VerifyRegisterPage from "./components/Verify-register";
import VerifyOtpPage from "./components/VerifyOtpPage";

// USER PAGES
import MisPedidosPage from "./pages/user/MisPedidosPage";
import CambiarPasswordPage from "./pages/user/CambiarPasswordPage";
import CambiarTelefonoPage from "./pages/user/CambiarTelefonoPage";
import VerPerfil from "./pages/user/VerPerfil";

// POLICY

import UsePolicy from "./pages/layout/UsePolicy";
import DataPolicy from "./pages/layout/DatesPolicy";


export default function App() {
  const { token } = useAuth();

  const role = getUserRole(token);

  console.log("ROLE REAL:", role);
  console.log("TOKEN:", token);

  return (
    <Routes>
      {/* RUTAS CON LAYOUT */}
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/pedir" element={<OrderPage />} />
        <Route path="/sobre-nosotros" element={<SobreNosotros />} />
        <Route path="/carrito" element={<CartPage />} />

        {/* USER ROUTES */}
        <Route
          path="/mis-pedidos"
          element={
            <ProtectedRoute role={role} allowedRoles={["administrador", "empleado", "user"]}>
              <MisPedidosPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/cambiar-password"
          element={
            <ProtectedRoute role={role} allowedRoles={["administrador", "empleado", "user"]}>
              <CambiarPasswordPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/cambiar-telefono"
          element={
            <ProtectedRoute role={role} allowedRoles={["administrador", "empleado", "user"]}>
              <CambiarTelefonoPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/ver-perfil"
          element={
            <ProtectedRoute role={role} allowedRoles={["administrador", "empleado", "user"]}>
              <VerPerfil />
            </ProtectedRoute>
          }
        />

        {/* ADMIN */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute role={role} allowedRoles={["administrador"]}>
              <AdminPage />
            </ProtectedRoute>
          }
        />

        {/* EMPLOYEE */}
        <Route
          path="/employee"
          element={
            <ProtectedRoute role={role} allowedRoles={["empleado", "administrador"]}>
              <EmployeePage />
            </ProtectedRoute>
          }
        />

        {/* POLICY */}
        <Route path="/uso" element={<UsePolicy />} />
        <Route path="/datos" element={<DataPolicy />} />
        
      </Route>

      {/* AUTH OUTSIDE LAYOUT */}
      <Route path="/login" element={<AuthPage />} />
      <Route path="/verify-register" element={<VerifyRegisterPage />} />
      <Route path="/verify-otp" element={<VerifyOtpPage />} />

      {/* FALLBACK */}
      <Route path="*" element={<Home />} />
    </Routes>
  );
}