import CategoryMenu from "../../components/CategoryMenu";
import { Outlet, useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useEffect, useState } from "react";
import { useToast } from "../../context/ToastContext";

import {
  sendOtp,
  logout as apiLogout,
} from "../../api/userService";

export default function Layout() {
  const { cart } = useCart();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [token, setToken] = useState<string | null>(null);
  const [roles, setRoles] = useState<string[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [authReady, setAuthReady] = useState(false);

  // =========================
  // ROLE DECODER
  // =========================
  const safeDecodeRoles = (jwt: string | null): string[] => {
    if (!jwt) return [];

    try {
      const payload = JSON.parse(atob(jwt.split(".")[1]));

      const roleClaim =
        payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ??
        payload["role"] ??
        payload["roles"] ??
        [];

      if (Array.isArray(roleClaim)) {
        return roleClaim.map((r) => r.toLowerCase());
      }

      return roleClaim ? [roleClaim.toLowerCase()] : [];
    } catch {
      return [];
    }
  };

  // =========================
  // AUTH SYNC
  // =========================
  const syncAuth = () => {
    const t = localStorage.getItem("token");

    if (!t) {
      setToken(null);
      setRoles([]);
      setAuthReady(true);
      return;
    }

    try {
      setToken(t);
      setRoles(safeDecodeRoles(t));
    } catch {
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      setToken(null);
      setRoles([]);
    }

    setAuthReady(true);
  };

  useEffect(() => {
    syncAuth();

    const handler = () => syncAuth();

    window.addEventListener("storage", handler);
    window.addEventListener("auth-change", handler);

    return () => {
      window.removeEventListener("storage", handler);
      window.removeEventListener("auth-change", handler);
    };
  }, []);

  useEffect(() => {
    if (!token) setMenuOpen(false);
  }, [token]);

  // =========================
  // LOGOUT
  // =========================
  const logout = async () => {
    try {
      const refresh = localStorage.getItem("refreshToken");
      if (refresh) await apiLogout(refresh);
    } catch {}

    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");

    setToken(null);
    setRoles([]);
    setMenuOpen(false);

    window.dispatchEvent(new Event("auth-change"));
    navigate("/");

    showToast("Sesión cerrada", "success");
  };

  // =========================
  // OTP FLOW (CORREGIDO)
  // =========================
  const startOtpFlow = async (purpose: number, targetRoute: string) => {
    try {
      await sendOtp(purpose);

      showToast("📩 Código OTP enviado", "success");

      navigate("/verify-otp", {
        state: {
          purpose,
          targetRoute,
        },
      });
    } catch (err) {
      console.error(err);
      showToast("❌ Error enviando OTP", "error");
    }
  };

  // =========================
  // ACCIONES PROTEGIDAS
  // =========================

  const goChangePassword = () => {
    setMenuOpen(false);
    startOtpFlow(1, "/cambiar-password");
  };

  const goChangePhone = () => {
    setMenuOpen(false);
    startOtpFlow(2, "/cambiar-telefono");
  };

  const goMyOrders = () => {
    setMenuOpen(false);
    navigate("/mis-pedidos");
  };

  const goProfile = () => {
    setMenuOpen(false);
    navigate("/ver-perfil");
  };


  // =========================
  // GUARD
  // =========================
  if (!authReady) return null;

  const isAdmin = roles.includes("administrador");
  const isEmployee = roles.includes("empleado");
  const isStaff = isAdmin || isEmployee;

  return (
    <>
      {/* ROLE BAR */}
      {isStaff && (
        <div className="role-bar">
          {isAdmin && (
            <button className="cart-button" onClick={() => navigate("/admin")}>
              🛠️ Admin
            </button>
          )}

          {isEmployee && (
            <button className="cart-button" onClick={() => navigate("/employee")}>
              👨‍🍳 Empleado
            </button>
          )}
        </div>
      )}

      <div className="container">
        {/* HEADER */}
        <header className="app-header">
          <div className="header-left" onClick={() => navigate("/")}>
            <img src="/img/logo.png" alt="logo" className="logo" />
            <h1>Restaurante</h1>
          </div>

          <div className="header-right">
            <button className="cart-button" onClick={() => navigate("/carrito")}>
              🛒 Carrito ({cart.length})
            </button>

            {token && (
              <button className="cart-button" onClick={() => setMenuOpen(true)}>
                👤 Mi cuenta
              </button>
            )}

            {token ? (
              <button className="cart-button" onClick={logout}>
                🔓 Logout
              </button>
            ) : (
              <button className="cart-button" onClick={() => navigate("/login")}>
                🔐 Login
              </button>
            )}
          </div>
        </header>

        {/* SIDEMENU */}
        {menuOpen && (
          <>
            <div
              onClick={() => setMenuOpen(false)}
              style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,0.5)",
                zIndex: 1000,
              }}
            />

            <div className="side-menu">
              <h3 className="side-menu-title">👤 Mi cuenta</h3>

              <div className="side-menu-content">
                <button className="cart-button side-btn" onClick={goProfile}>
                  👤 Mis datos
                </button>
                <button className="cart-button side-btn" onClick={goMyOrders}>
                  🧾 Mis pedidos
                </button>

                <button className="cart-button side-btn" onClick={goChangePassword}>
                  🔐 Cambiar contraseña
                </button>

                <button className="cart-button side-btn" onClick={goChangePhone}>
                  📱 Cambiar teléfono
                </button>
                <button
                  className="remove-button side-btn"
                  onClick={() => setMenuOpen(false)}
                >
                  Cerrar
                </button>
              </div>
            </div>
          </>
        )}

        {/* NAV + CONTENT */}
        <CategoryMenu />

        <main className="main-content">
          <Outlet />
        </main>
        <footer className="app-footer">
          <div className="footer-inner">
            <div className="footer-left">
              © {new Date().getFullYear()} 3M Fast Food
            </div>

            <div className="footer-center">
              <button onClick={() => navigate("/uso")} className="footer-link">
                Política de uso
              </button>

              <span className="footer-separator">|</span>

              <button onClick={() => navigate("/datos")} className="footer-link">
                Protección de datos
              </button>
            </div>

            <div className="footer-right">
              <button className="footer-link">
                v1.0.1
              </button>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}