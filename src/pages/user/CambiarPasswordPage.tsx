import { useState } from "react";
import api from "../../api/axios";
import { useToast } from "../../context/ToastContext";
import { motion } from "framer-motion";

export default function CambiarPassword() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");

  const { showToast } = useToast();

  const submit = async () => {
    try {
      await api.post("/usuarios/change-password", {
        currentPassword: current,
        newPassword: next,
      });

      showToast("Contraseña actualizada correctamente", "success");

      setCurrent("");
      setNext("");
    } catch {
      showToast("Error al cambiar contraseña", "error");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.25 }}
    >
    <div className="cp-form-container">
      <h2 className="cp-title">🔐 Cambiar contraseña</h2>

      <input
        type="password"
        placeholder="Actual"
        value={current}
        onChange={(e) => setCurrent(e.target.value)}
        className="cp-input"
      />

      <input
        type="password"
        placeholder="Nueva"
        value={next}
        onChange={(e) => setNext(e.target.value)}
        className="cp-input"
      />

      <button onClick={submit} className="cp-button">
        Actualizar
      </button>

      <style>{`
        .cp-form-container {
          display: flex;
          flex-direction: column;
          gap: 12px;
          max-width: 320px;

          /* 🔥 NUEVO: centrado */
          margin: 0 auto;
          position: relative;
          top: 50%;
        }

        .cp-title {
          margin-bottom: 6px;
          font-size: 18px;
          color: #c084fc;
          text-shadow: 0 0 8px rgba(192, 132, 252, 0.25);
        }

        .cp-input {
          padding: 10px 12px;
          border-radius: 8px;
          border: 1px solid rgba(147, 51, 234, 0.4);
          background: #0f0f17;
          color: #fff;
          outline: none;
          transition: all 0.2s ease;
        }

        .cp-input:focus {
          border-color: #34d399;
          box-shadow: 0 0 10px rgba(52, 211, 153, 0.35);
        }

        .cp-button {
          margin-top: 4px;
          padding: 10px;
          border-radius: 8px;
          border: none;
          cursor: pointer;
          background: linear-gradient(135deg, #34d399, #10b981);
          color: #0b0b12;
          font-weight: 600;
          transition: all 0.2s ease;
          box-shadow: 0 0 12px rgba(16, 185, 129, 0.25);
        }

        .cp-button:hover {
          transform: translateY(-1px);
          box-shadow: 0 0 18px rgba(16, 185, 129, 0.4);
        }
      `}</style>
    </div>
    </motion.div>
  );
}