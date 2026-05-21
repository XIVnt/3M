import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { verifyOtp } from "../api/userService";

export default function VerifyOtpPage() {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const email = sessionStorage.getItem("userEmail");

  // 🔥 AHORA VIENE DEL ROUTE STATE (NO SESSION STORAGE)
  const purpose = location.state?.purpose;
  const targetRoute = location.state?.targetRoute;

  const handleVerify = async () => {
    if (!code.trim()) {
      setError("Introduce el código");
      return;
    }

    if (purpose === undefined || purpose === null) {
      setError("No se ha definido el propósito del OTP");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await verifyOtp(code, purpose);

      sessionStorage.removeItem("userEmail");

      // 🔥 redirección dinámica del Layout
      if (targetRoute) {
        navigate(targetRoute);
      } else {
        navigate("/");
      }

    } catch (err: any) {
      setError(err?.response?.data || "Código inválido");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <h2>Verificación de seguridad</h2>

      {email && (
        <p>
          Código enviado a: <b>{email}</b>
        </p>
      )}

      <input
        className="input"
        placeholder="Código OTP"
        value={code}
        onChange={(e) => setCode(e.target.value)}
      />

      {error && <p className="error-text">{error}</p>}

      <button
        className="primary-btn"
        onClick={handleVerify}
        disabled={loading}
      >
        {loading ? "Verificando..." : "Verificar"}
      </button>

      <button
        className="secondary-btn"
        onClick={() => navigate(-1)}
      >
        Volver
      </button>
    </div>
  );
}