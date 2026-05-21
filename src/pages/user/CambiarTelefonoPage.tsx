import { useState } from "react";
import { changePhone } from "../../api/userService";
import { useToast } from "../../context/ToastContext";

export default function CambiarTelefono() {
  const [telefono, setTelefono] = useState("");
  const { showToast } = useToast();

  const submit = async () => {
    try {
      await changePhone(telefono);

      showToast("Teléfono actualizado correctamente", "success");
      setTelefono("");
    } catch {
      showToast("Error al actualizar teléfono", "error");
    }
  };

  return (
    <div className="cp-form-container">
      <h2 className="cp-title">📱 Cambiar teléfono</h2>

      <input
        placeholder="Nuevo teléfono"
        value={telefono}
        onChange={(e) => setTelefono(e.target.value)}
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

          /* mismo comportamiento que el otro */
          margin: 0 auto;
          position: relative;
        }

        .cp-title {
          margin-bottom: 6px;
          font-size: 18px;
          color: #34d399;
          text-shadow: 0 0 8px rgba(52, 211, 153, 0.25);
        }

        .cp-input {
          padding: 10px 12px;
          border-radius: 8px;
          border: 1px solid rgba(52, 211, 153, 0.4);
          background: #0f0f17;
          color: #fff;
          outline: none;
          transition: all 0.2s ease;
        }

        .cp-input:focus {
          border-color: #c084fc;
          box-shadow: 0 0 10px rgba(192, 132, 252, 0.35);
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
  );
}