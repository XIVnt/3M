import { useEffect, useState } from "react";
import DeliveryMap from "./DeliveryMap";
import { getRestaurantes } from "../api/restaurantService";
import { motion } from "framer-motion";

type Restaurante = {
  id: number;
  nombre: string;
  email: string | null;
  direccion: string;
  lat: number;
  lng: number;
  activo: boolean;
};

export default function ContactPage() {
  const [restaurantes, setRestaurantes] = useState<Restaurante[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [reason, setReason] = useState("");
  const [sending, setSending] = useState(false);

  const selected = restaurantes.find(r => r.id === selectedId);

  useEffect(() => {
    (async () => {
      try {
        const res = await getRestaurantes();
        setRestaurantes(
          res.data.map(r => ({
            ...r,
            email: r.email ?? "",
          }))
        );
      } catch (err) {
        console.error(err);
      }
    })();
  }, []);

  const handleSend = () => {
    if (!selected || sending || !reason) return;

    if (!selected.email || selected.email.trim() === "") {
      alert("Este restaurante no tiene email configurado");
      return;
    }

    setSending(true);

    const subject = `Consulta cliente (${reason}) - ${selected.nombre}`;

    const body = `Motivo: ${reason}\n\nEscribe tu mensaje aquí:\n`;

    const mailto = `mailto:${selected.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    window.open(mailto, "_self");

    setTimeout(() => {
      setSending(false);
    }, 3000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.25 }}
    >
    <div className="contact-page">

      <h1 className="contact-title">📩 Contacto</h1>

      {/* SELECT RESTAURANTE */}
      <div className="contact-card">
        <label>Selecciona restaurante</label>

        <select
          className="contact-select"
          value={selectedId ?? ""}
          onChange={(e) => setSelectedId(Number(e.target.value))}
        >
          <option value="">-- elegir restaurante --</option>
          {restaurantes.map(r => (
            <option key={r.id} value={r.id}>
              {r.nombre}
            </option>
          ))}
        </select>
      </div>

      {/* INFO RESTAURANTE */}
      {selected && (
        <div className="contact-info-grid">

          <div className="contact-card glow-purple">
            <h3>🏪 Información</h3>

            <p><strong>Nombre:</strong> {selected.nombre}</p>
            <p><strong>Email:</strong> {selected.email}</p>

            <p>
              <strong>Estado:</strong>{" "}
              <span className={selected.activo ? "ok" : "off"}>
                {selected.activo ? "Activo 🟢" : "Cerrado 🔴"}
              </span>
            </p>

            <p><strong>Dirección:</strong> {selected.direccion}</p>
          </div>

          {/* MAPA */}
          <div className="contact-map">
            <DeliveryMap
              restaurante={selected}
              location={{ lat: selected.lat, lng: selected.lng }}
              mode="recoger"
              onSelect={() => {}}
              onDrag={() => {}}
            />
          </div>
        </div>
      )}

      {/* CONTACT FORM GLOBAL */}
      <div className="contact-card glow-green">
        <h3>✉️ Envíanos tu consulta</h3>

        <p className="contact-note">
          También puedes escribir directamente a{" "}
          <strong>vega.micky10@gmail.com</strong> para soporte o información general.
        </p>

        {/* MOTIVO (ANTES ERA TEXTAREA) */}
        <select
          className="contact-select"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        >
          <option value="">-- Selecciona motivo --</option>
          <option value="Pedido">Problema con un pedido</option>
          <option value="Reparto">Reparto / entrega</option>
          <option value="Pago">Problema de pago</option>
          <option value="Restaurante">Información del restaurante</option>
          <option value="Soporte">Soporte técnico</option>
          <option value="Otro">Otro</option>
        </select>

        <button
          className="contact-button"
          onClick={handleSend}
          disabled={sending || !selected || !reason}
          style={{
            marginTop: "15px",
            opacity: sending || !reason ? 0.5 : 1,
            cursor: sending || !reason ? "not-allowed" : "pointer"
          }}
        >
          {sending ? "Enviando..." : "Abrir correo 📩"}
        </button>
      </div>

    </div>
    </motion.div>
  );
}