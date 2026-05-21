import { useEffect, useState } from "react";
import DeliveryMap from "./DeliveryMap";
import { getRestaurantes } from "../api/restaurantService";

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
  const [message, setMessage] = useState("");

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
    if (!selected) return;

    const mailto = `mailto:${selected.email}?subject=Consulta cliente - ${selected.nombre}&body=${encodeURIComponent(
      message
    )}`;

    window.location.href = mailto;
  };

  return (
    <div className="contact-page">

      <h1 className="contact-title">📩 Contacto</h1>

      {/* SELECT */}
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

        <textarea
          placeholder="Escribe tu consulta..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />

        <button className="contact-button" onClick={handleSend}>
          Enviar correo 📩
        </button>
      </div>

    </div>
  );
}