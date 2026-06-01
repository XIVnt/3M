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

  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    password?: string;
    telefono?: string;
  }>({});

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

      {/* PASSWORD */}
      <input
        className={`input ${fieldErrors.password ? "input-error" : ""}`}
        placeholder="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      {fieldErrors.password && (
        <p className="field-error">{fieldErrors.password}</p>
      )}

      {/* REGISTER ONLY */}
      {mode === "register" && (
        <>
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