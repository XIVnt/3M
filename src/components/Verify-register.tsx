import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { verifyRegister } from "../api/userService";

export default function VerifyRegisterPage() {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const email = sessionStorage.getItem("pendingEmail");

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

      sessionStorage.removeItem("pendingEmail");

      navigate("/login");

    } catch (err: any) {
      setError(err?.response?.data || "Código inválido");
    } finally {
      setLoading(false);
    }
  };

  return (
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
  );
}