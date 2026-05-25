import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import ReCAPTCHA from "react-google-recaptcha";

// ===================== 🔐 SANITIZER =====================
const sanitize = (value: string) =>
  value.replace(/[<>]/g, "").trim();

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [telefono, setTelefono] = useState("");

  const [captchaToken, setCaptchaToken] = useState("");
  const [requireCaptcha, setRequireCaptcha] = useState(false);

  const [acceptedPolicies, setAcceptedPolicies] = useState(false);

  const [mode, setMode] = useState<"login" | "register">("login");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { setToken } = useAuth();
  const RECAPTCHA_SITE_KEY = "6Lf4zvssAAAAAPS6DGEehuXlBN-03XRfdE5gKmP2";

  const handleSubmit = async () => {
    if (loading) return;

    setError("");

    const cleanEmail = sanitize(email).toLowerCase();
    const cleanPassword = sanitize(password);
    const cleanTelefono = sanitize(telefono);

    if (!cleanEmail || !cleanPassword) {
      setError("Email y contraseña son obligatorios");
      return;
    }

    if (mode === "register" && !cleanTelefono) {
      setError("El teléfono es obligatorio");
      return;
    }

    // 🔥 POLÍTICAS OBLIGATORIAS
    if (mode === "register" && !acceptedPolicies) {
      setError("Debes aceptar los términos de uso y la política de privacidad");
      return;
    }

    setLoading(true);

    try {
      // ===================== LOGIN =====================
      if (mode === "login") {
        const payload: any = {
          email: cleanEmail,
          password: cleanPassword,
        };

        if (requireCaptcha && captchaToken.trim()) {
          payload.captchaToken = captchaToken.trim();
        }

        const res = await api.post("/usuarios/login", payload);

        setToken(res.data.token);
        localStorage.setItem("refreshToken", res.data.refreshToken);

        setRequireCaptcha(false);
        setCaptchaToken("");

        navigate("/");
      }

      // ===================== REGISTER =====================
      else {
        await api.post("/usuarios/request-register", {
          email: cleanEmail,
          password: cleanPassword,
          telefono: cleanTelefono,
          userName: cleanEmail.split("@")[0],
        });

        sessionStorage.setItem("pendingEmail", cleanEmail);

        navigate("/verify-register");
      }
    } catch (err: any) {
      const data = err?.response?.data;
      const status = err?.response?.status;

      if (data?.requireCaptcha) {
        setRequireCaptcha(true);
        setError("Completa el CAPTCHA");
        return;
      }

      if (status === 401) {
        setError("Credenciales incorrectas");
        return;
      }

      if (status === 403) {
        setError("Acceso bloqueado");
        return;
      }

      setError(data?.message || "Error en la operación");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <h2>{mode === "login" ? "Iniciar sesión" : "Registro"}</h2>

      <input
        className="input"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        className="input"
        placeholder="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      {mode === "register" && (
        <>
          <input
            className="input"
            placeholder="Teléfono"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
          />

          {/* 🔥 POLÍTICAS */}
          <div className="policy-box">
            <label className="policy-check">
              <input
                type="checkbox"
                checked={acceptedPolicies}
                onChange={(e) => setAcceptedPolicies(e.target.checked)}
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

      {requireCaptcha && (
        <div style={{ marginTop: 10 }}>
          <p>Verificación requerida</p>

          <ReCAPTCHA
            sitekey={RECAPTCHA_SITE_KEY}
            onChange={(token) => {
              setCaptchaToken(token || "");
            }}
          />
        </div>
      )}

      {error && <p className="error-text">{error}</p>}

      <button
        className="primary-btn"
        onClick={handleSubmit}
        disabled={loading}
      >
        {loading
          ? "Cargando..."
          : mode === "login"
          ? "Login"
          : "Registrar"}
      </button>

      <button className="secondary-btn" onClick={() => navigate("/")}>
        Volver
      </button>

      <p
        className="toggle-text"
        onClick={() => {
          setMode(mode === "login" ? "register" : "login");
          setError("");
          setRequireCaptcha(false);
        }}
      >
        {mode === "login"
          ? "¿No tienes cuenta? Regístrate"
          : "¿Ya tienes cuenta? Inicia sesión"}
      </p>
    </div>
  );
}