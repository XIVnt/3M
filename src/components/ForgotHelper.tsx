import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import { forgotPassword } from "../api/userService";
import { useToast } from "../context/ToastContext";

export default function ForgotHelper() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { showToast } = useToast();

  const handleSend = async () => {
    if (!email.trim()) {
      setError("Introduce un correo electrónico");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await forgotPassword(email.trim().toLowerCase());

      showToast("📩 Código enviado al correo", "success");

      navigate("/reset-password", {
        state: {
          email: email.trim().toLowerCase(),
        },
      });
    } catch (err: any) {
      console.error(err);

      setError(
        err?.response?.data ||
        "No se pudo enviar el código de recuperación"
      );

      showToast("❌ Error al enviar el código", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.25 }}
    >
      <div className="login-container">
        <h2>Recuperar contraseña</h2>

        <p>
          Introduce el correo asociado a tu cuenta y te enviaremos un código de
          recuperación.
        </p>

        <input
          className="input"
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {error && <p className="error-text">{error}</p>}

        <button
          className="primary-btn"
          onClick={handleSend}
          disabled={loading}
        >
          {loading ? "Enviando..." : "Enviar código"}
        </button>

        <button
          className="secondary-btn"
          onClick={() => navigate("/")}
          disabled={loading}
        >
          Volver
        </button>
      </div>
    </motion.div>
  );
}