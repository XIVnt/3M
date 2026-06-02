import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
import { motion } from "framer-motion";

import { useToast } from "../context/ToastContext";

const sanitize = (value: string) =>
  value.replace(/[<>]/g, "").trim();

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [telefono, setTelefono] = useState("");

  const [requireCaptcha, setRequireCaptcha] = useState(false);
  const [acceptedPolicies, setAcceptedPolicies] = useState(false);

  const [mode, setMode] = useState<"login" | "register">("login");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { showToast } = useToast();

  type FieldErrors = Partial<{
    email: string;
    password: string;
    telefono: string;
    confirmPassword: string;
  }>;

  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");

  const navigate = useNavigate();
  const { setToken } = useAuth();
  const { executeRecaptcha } = useGoogleReCaptcha();

  // -----------------------------
  // VALIDACIÓN FRONTEND
  // -----------------------------
  const validateForm = () => {
    const errors: any = {};

    const cleanEmail = sanitize(email);

    if (!cleanEmail) {
      errors.email = "El email es obligatorio";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      errors.email = "Email inválido";
    }

    if (!password) {
      errors.password = "La contraseña es obligatoria";
    } else if (
      !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{6,}$/.test(password)
    ) {
      errors.password =
        "Mínimo 6 caracteres, mayúscula, minúscula, número y símbolo";
    }

    if (mode === "register") {
      if (!telefono) {
        errors.telefono = "El teléfono es obligatorio";
      } else if (!/^\d{9}$/.test(telefono)) {
        errors.telefono = "Debe tener 9 dígitos";
      }

      if (!confirmPassword) {
        errors.confirmPassword = "Repite la contraseña";
      } else if (confirmPassword !== password) {
        errors.confirmPassword = "Las contraseñas no coinciden";
      }
    }

    setFieldErrors(errors);

    return Object.keys(errors).length === 0;
  };

  // -----------------------------
  // LOGIN
  // -----------------------------
  const handleLogin = async () => {
    if (loading) return;

    if (!validateForm()) return;

    setError("");
    setLoading(true);

    try {
      const cleanEmail = sanitize(email).toLowerCase();
      const cleanPassword = sanitize(password);

      let captchaToken = "";

      if (requireCaptcha && executeRecaptcha) {
        captchaToken = await executeRecaptcha("login");
      }

      const payload: any = {
        email: cleanEmail,
        password: cleanPassword,
        captchaToken: captchaToken || undefined,
      };

      const res = await api.post("/usuarios/login", payload);

      setToken(res.data.token);
      localStorage.setItem("refreshToken", res.data.refreshToken);

      showToast("Bienvenido 👋", "success");

      setRequireCaptcha(false);
      navigate("/");
    } catch (err: any) {
      const data = err?.response?.data;
      const status = err?.response?.status;

      if (data?.requireCaptcha) {
        setRequireCaptcha(true);
        setError("Vuelve a intentar");
        return;
      }

      if (status === 401) {
        setError("Credenciales incorrectas");
        return;
      }

      setError(data?.message || "Error en la operación");
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------
  // REGISTER
  // -----------------------------
  const handleRegister = async () => {
    if (loading) return;

    if (!validateForm()) return;

    if (!acceptedPolicies) {
      setError("Debes aceptar las políticas");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const cleanEmail = sanitize(email).toLowerCase();
      const cleanPassword = sanitize(password);

      await api.post("/usuarios/request-register", {
        email: cleanEmail,
        userName: cleanEmail,
        telefono,
        password: cleanPassword,
      });

      showToast("Código enviado a tu correo 📩", "success");

      navigate("/verify-register", {
        state: { email: cleanEmail },
      });
    } catch (err: any) {
      setError(err?.response?.data || "Error al registrar");
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------
  // UI
  // -----------------------------
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.25 }}
    >
    <form
      className="login-container"
      onSubmit={(e) => {
        e.preventDefault();
        mode === "login" ? handleLogin() : handleRegister();
      }}
    >
      <h2>{mode === "login" ? "Iniciar sesión" : "Registro"}</h2>

      {/* EMAIL */}
      <input
        className={`input ${fieldErrors.email ? "input-error" : ""}`}
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      {fieldErrors.email && (
        <p className="field-error">{fieldErrors.email}</p>
      )}
      {mode === "login" && (
        <p
          className="forgot-password-link"
          onClick={() => navigate("/forgot-helper")}
        >
        ¿Has olvidado tu contraseña?
        </p>
      )}

      {/* PASSWORD */}
      <div className="password-wrapper">
        <input
          className={`input ${fieldErrors.password ? "input-error" : ""}`}
          placeholder="Password"
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <span className="eye" onClick={() => setShowPassword((prev) => !prev)}>
          {showPassword ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M3 3l18 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d="M10.58 10.58A2 2 0 0012 14a2 2 0 001.42-.58"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d="M9.88 4.24A10.94 10.94 0 0112 4c5 0 9.27 3.11 11 8
                  a11.64 11.64 0 01-2.06 3.4"
                stroke="currentColor"
                strokeWidth="2"
              />
              <path
                d="M6.61 6.61A11.75 11.75 0 001 12c1.73 5 6 8 11 8
                  a10.94 10.94 0 005.12-1.28"
                stroke="currentColor"
                strokeWidth="2"
              />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
                stroke="currentColor"
                strokeWidth="2"
              />
              <circle
                cx="12"
                cy="12"
                r="3"
                stroke="currentColor"
                strokeWidth="2"
              />
            </svg>
          )}
        </span>
      </div>
      {fieldErrors.password && (
        <p className="field-error">{fieldErrors.password}</p>
      )}

      {/* REGISTER ONLY */}
      {mode === "register" && (
        <>
        
        <div className="password-wrapper">
          <input
            className={`input ${fieldErrors.confirmPassword ? "input-error" : ""}`}
            placeholder="Repite la contraseña"
            type={showConfirmPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          <span className="eye"onClick={() => setShowConfirmPassword((prev) => !prev)}>
          {showConfirmPassword ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M3 3l18 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d="M10.58 10.58A2 2 0 0012 14a2 2 0 001.42-.58"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d="M9.88 4.24A10.94 10.94 0 0112 4c5 0 9.27 3.11 11 8
                  a11.64 11.64 0 01-2.06 3.4"
                stroke="currentColor"
                strokeWidth="2"
              />
              <path
                d="M6.61 6.61A11.75 11.75 0 001 12c1.73 5 6 8 11 8
                  a10.94 10.94 0 005.12-1.28"
                stroke="currentColor"
                strokeWidth="2"
              />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
                stroke="currentColor"
                strokeWidth="2"
              />
              <circle
                cx="12"
                cy="12"
                r="3"
                stroke="currentColor"
                strokeWidth="2"
              />
            </svg>
          )}
        </span>
        </div>

        {fieldErrors.confirmPassword && (
          <p className="field-error">{fieldErrors.confirmPassword}</p>
        )}
          {/* TELEFONO */}
          <input
            className={`input ${fieldErrors.telefono ? "input-error" : ""}`}
            placeholder="Teléfono"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
          />
          {fieldErrors.telefono && (
            <p className="field-error">{fieldErrors.telefono}</p>
          )}

          {/* POLÍTICAS */}
          <div className="policy-box">
            <label className="policy-check">
              <input
                type="checkbox"
                checked={acceptedPolicies}
                onChange={(e) =>
                  setAcceptedPolicies(e.target.checked)
                }
              />

              <span>
                Acepto los{" "}
                <span
                  className="policy-link"
                  onClick={() => navigate("/uso")}
                >
                  términos de uso
                </span>{" "}
                y la{" "}
                <span
                  className="policy-link"
                  onClick={() => navigate("/datos")}
                >
                  política de privacidad
                </span>
              </span>
            </label>
          </div>
        </>
      )}

      {/* ERROR GENERAL */}
      {error && <p className="error-text">{error}</p>}

      {/* BUTTON */}
      <button className="primary-btn" type="submit" disabled={loading}>
        {loading
          ? "Cargando..."
          : mode === "login"
          ? "Login"
          : "Registrar"}
      </button>

      {/* BACK */}
      <button
        className="secondary-btn"
        onClick={() => navigate("/")}
        type="button"
      >
        Volver
      </button>

      {/* TOGGLE */}
      <p
        className="toggle-text"
        onClick={() => {
          setMode(mode === "login" ? "register" : "login");
          setError("");
          setFieldErrors({});
          setRequireCaptcha(false);
        }}
      >
        {mode === "login"
          ? "¿No tienes cuenta? Regístrate"
          : "¿Ya tienes cuenta? Inicia sesión"}
      </p>
    </form>
    </motion.div>
  );
}