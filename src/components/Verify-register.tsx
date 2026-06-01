import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { verifyRegister } from "../api/userService";
import { useToast } from "../context/ToastContext";
import { motion } from "framer-motion";

export default function VerifyRegisterPage() {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email;

  const { showToast } = useToast();


  const handleVerify = async () => {
    if (!email) {
      setError("No hay email pendiente");
      return;
    }

    if (!code.trim()) {
      setError("Introduce el código");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await verifyRegister(email, code);

      showToast("Registro completado 🎉 Ahora puedes iniciar sesión", "success");

      navigate("/login");
    } catch (err: any) {
      setError(err?.response?.data || "Código inválido");
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // 🔥 BLOQUE IMPORTANTE
  // =========================
  if (!email) {
    return (
      <div className="login-container">
        <h2>Sesión inválida</h2>
        <p>No hay email de verificación.</p>

        <button
          className="primary-btn"
          onClick={() => navigate("/login")}
        >
          Volver al login
        </button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.25 }}
    >
    <div className="login-container">
      <h2>Verificar código OTP</h2>

      <p>
        Te hemos enviado un código a: <b>{email}</b>
      </p>

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
        onClick={() => navigate("/login")}
      >
        Volver
      </button>
    </div>
    </motion.div>
  );
}