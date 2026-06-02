import { useState , useEffect} from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";

import { resetPasswordOtp } from "../api/userService";
import { useToast } from "../context/ToastContext";

export default function ResetPasswordOtp() {
  const navigate = useNavigate();
  const location = useLocation();

  const { showToast } = useToast();

  const email = location.state?.email || "";

  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!email) {
      navigate("/forgot-helper");
    }
  }, [email, navigate]);

  const validate = () => {
    if (!code.trim()) {
      setError("Introduce el código OTP");
      return false;
    }

    if (!/^\d{6}$/.test(code)) {
      setError("El código debe tener 6 dígitos");
      return false;
    }

    if (
      !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{6,}$/.test(
        newPassword
      )
    ) {
      setError(
        "La contraseña debe contener mayúscula, minúscula, número y símbolo"
      );
      return false;
    }

    return true;
  };

  const handleReset = async () => {
    if (loading) return;

    setError("");

    if (!validate()) return;

    try {
      setLoading(true);

      await resetPasswordOtp(
      email,
        code,
        newPassword,
      );

      showToast(
        "Contraseña actualizada correctamente ✅",
        "success"
      );

      navigate("/login");
    } catch (err: any) {
      setError(
        err?.response?.data ||
          "No se pudo actualizar la contraseña"
      );
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
          Hemos enviado un código de verificación a:
        </p>

        <p
          style={{
            marginBottom: "20px",
            fontWeight: "bold",
          }}
        >
          {email}
        </p>

        <input
          className="input"
          placeholder="Código OTP"
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />

        <input
          className="input"
          type="password"
          placeholder="Nueva contraseña"
          value={newPassword}
          onChange={(e) =>
            setNewPassword(e.target.value)
          }
        />

        {error && (
          <p className="error-text">{error}</p>
        )}

        <button
          className="primary-btn"
          onClick={handleReset}
          disabled={loading}
        >
          {loading
            ? "Actualizando..."
            : "Actualizar contraseña"}
        </button>

        <button
          className="secondary-btn"
          onClick={() => navigate("/login")}
        >
          Volver al login
        </button>
      </div>
    </motion.div>
  );
}