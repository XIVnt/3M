import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";

// ===================== 🔐 SANITIZER =====================
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

  const navigate = useNavigate();
  const { setToken } = useAuth();
  const { executeRecaptcha } = useGoogleReCaptcha();

  const handleSubmit = async () => {
  if (loading) return;

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

    setRequireCaptcha(false);
    navigate("/");
    } 
    catch (err: any) {
      const data = err?.response?.data;
      const status = err?.response?.status;

      // 🔥 ESTE ES EL CASO CLAVE
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
    } 
    finally {
      setLoading(false);
    }
  };

  return (
    <form
      className="login-container"
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit();
      }}
    >
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

      {error && <p className="error-text">{error}</p>}

      <button
        className="primary-btn"
        type="submit"
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
    </form>
  );
}