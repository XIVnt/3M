import { useEffect, useState } from "react";
import {
  getPedidos,
  setPedidoPreparado,
  setPedidoEntregado,
  cancelarPedido,
  marcarPagoCompletado,
} from "../api/pedidosService";

import type { Pedido } from "../components/types/Pedido";
import { EstadoPedido } from "../components/types/EstadoPedido";

/* =========================
   TIPOS UI FILTRO
========================= */
type FiltroPedidos =
  | "todos"
  | "pendientes"
  | "preparados"
  | "entregados"
  | "pagosPendientes"
  | "cancelados";

/* =========================
   FILTRO SERVICIO (NUEVO)
========================= */
type FiltroServicio = "todos" | "domicilio" | "recoger";

/* =========================
   HELPERS ESTADOS
========================= */
const getEstadoPedidoText = (estado: any) => {
  switch (Number(estado)) {
    case EstadoPedido.Preparando:
      return "Preparando";
    case EstadoPedido.Finalizado:
      return "Preparado";
    case EstadoPedido.Entregado:
      return "Entregado";
    case EstadoPedido.Cancelado:
      return "Cancelado";
    default:
      return "Desconocido";
  }
};

const getEstadoPedidoColor = (estado: any) => {
  switch (Number(estado)) {
    case EstadoPedido.Preparando:
      return "yellow";
    case EstadoPedido.Finalizado:
      return "#c084fc";
    case EstadoPedido.Entregado:
      return "lightgreen";
    case EstadoPedido.Cancelado:
      return "#ff6b6b";
    default:
      return "white";
  }
};

const getEstadoPagoText = (estado: number | string) => {
  switch (Number(estado)) {
    case 0:
      return "Pendiente";
    case 1:
      return "Completado";
    case 2:
      return "Reembolsado";
    default:
      return "Desconocido";
  }
};

const getEstadoPagoColor = (estado: number | string) => {
  const texto = getEstadoPagoText(estado);

  switch (texto) {
    case "Completado":
      return "lightgreen";
    case "Reembolsado":
      return "orange";
    case "Pendiente":
      return "yellow";
    default:
      return "white";
  }
};

/* =========================
   EMPLOYEE PAGE
========================= */
export default function EmployeePage() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState<FiltroPedidos>("todos");

  const [filtroServicio, setFiltroServicio] =
    useState<FiltroServicio>("todos");

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const [modal, setModal] = useState<{
    open: boolean;
    action?: () => void;
    text: string;
  }>({
    open: false,
    text: "",
  });

  /* =========================
     LOAD PEDIDOS
  ========================= */
  const loadPedidos = async (nextPage = 1, append = false) => {
    try {
      setLoading(true);

      const res = await getPedidos(nextPage);
      const data = res.data;

      if (data.length < 20) setHasMore(false);

      setPedidos((prev) =>
        append ? [...prev, ...data] : data
      );
    } catch (err) {
      console.error("Error cargando pedidos", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPedidos(1, false);
  }, []);

  const cargarMas = () => {
    const next = page + 1;
    setPage(next);
    loadPedidos(next, true);
  };

  /* =========================
     MODAL
  ========================= */
  const openConfirm = (text: string, action: () => void) => {
    setModal({ open: true, text, action });
  };

  /* =========================
     ACCIONES (NO TOCAR)
  ========================= */
  const marcarPreparado = async (id: number) => {
    await setPedidoPreparado(id);
    loadPedidos(1, false);
  };

  const marcarEntregado = async (id: number) => {
    await setPedidoEntregado(id);
    loadPedidos(1, false);
  };

  const cancelar = async (id: number) => {
    await cancelarPedido(id);
    loadPedidos(1, false);
  };

  const completarPago = async (id: number) => {
    await marcarPagoCompletado(id);
    loadPedidos(1, false);
  };

  /* =========================
     FILTRO
  ========================= */
  const hoy = new Date().toDateString();

  const pedidosFiltrados = pedidos.filter((p: any) => {
    const fecha = new Date(p.fecha).toDateString();
    const estado = Number(p.estadoPedido);
    const estadoPago = getEstadoPagoText(p.estadoPago);

    // ✅ CANCELADOS SOLO EN SU CATEGORÍA
    if (estado === EstadoPedido.Cancelado && filtro !== "cancelados") {
      return false;
    }

    if (
      filtroServicio !== "todos" &&
      p.servicio !== filtroServicio
    ) {
      return false;
    }

    switch (filtro) {
      case "pendientes":
        return estado === EstadoPedido.Preparando && estadoPago !== "Pendiente";

      case "preparados":
        return estado === EstadoPedido.Finalizado && estadoPago !== "Pendiente";

      case "entregados":
        return estado === EstadoPedido.Entregado && fecha === hoy;

      case "pagosPendientes":
        return estadoPago === "Pendiente";

      case "cancelados":
        return estado === EstadoPedido.Cancelado;

      default:
        return estadoPago !== "Pendiente";
    }
  });

  const formatTelefono = (tel: string) => {
    if (!tel) return "";

    const cleaned = tel.replace(/\D/g, "");
    if (cleaned.length !== 9) return tel;

    return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6, 9)}`;
  };

  /* =========================
     RENDER
  ========================= */
  return (
    <div className="container">
      <div className="order-page-container">

        {/* SIDEBAR */}
        <div className="category-sidebar" style={{ display: "flex", flexDirection: "column", height: "100%" }}>
          <button className={filtro === "todos" ? "active" : ""} onClick={() => setFiltro("todos")}>📋 Todos</button>
          <button className={filtro === "pendientes" ? "active" : ""} onClick={() => setFiltro("pendientes")}>🟡 Pendientes</button>
          <button className={filtro === "preparados" ? "active" : ""} onClick={() => setFiltro("preparados")}>🟣 Preparados</button>
          <button className={filtro === "entregados" ? "active" : ""} onClick={() => setFiltro("entregados")}>🟢 Entregados hoy</button>
          <button className={filtro === "pagosPendientes" ? "active" : ""} onClick={() => setFiltro("pagosPendientes")}>💳 Pagos pendientes</button>

          {/* 🆕 CANCELADOS */}
          <button className={filtro === "cancelados" ? "active" : ""} onClick={() => setFiltro("cancelados")}>
            ❌ Cancelados
          </button>
        </div>

        {/* SERVICIO */}
        <div className="service-filter-bar">
          <button className={`neon-button ${filtroServicio === "todos" ? "active" : ""}`} onClick={() => setFiltroServicio("todos")}>🌐 Todos</button>
          <button className={`neon-button ${filtroServicio === "domicilio" ? "active" : ""}`} onClick={() => setFiltroServicio("domicilio")}>🚚 Domicilio</button>
          <button className={`neon-button ${filtroServicio === "recoger" ? "active" : ""}`} onClick={() => setFiltroServicio("recoger")}>🏪 Recogida</button>
        </div>

        {/* LISTA */}
        <div style={{ flex: 1 }}>
          <h1 style={{ color: "#c084fc", marginBottom: "20px" }}>
            👨‍🍳 Panel de Empleado
          </h1>

          {loading ? (
            <p>Cargando pedidos...</p>
          ) : pedidosFiltrados.length === 0 ? (
            <p>No hay pedidos en este estado.</p>
          ) : (
            <>
              <div className="order-products">

                {pedidosFiltrados.map((p: any) => {
                  const estado = Number(p.estadoPedido);
                  const estadoPago = getEstadoPagoText(p.estadoPago);

                  return (
                    <div className="product-card" key={p.id}>
                      <div className="product-title">Pedido #{p.id}</div>

                      <div className="product-description">
                        <p><b>Email:</b> {p.email}</p>

                        <p>
                          <b>📞 Teléfono:</b>{" "}
                          {p.telefono ? formatTelefono(p.telefono) : "No disponible"}
                        </p>

                        <p>
                          <b>Servicio:</b>{" "}
                          {p.servicio === "recoger" ? "🏪 Recogida" : "🚚 Domicilio"}
                        </p>

                        <p><b>Total:</b> {p.total} $</p>

                        <p>
                          <b>Estado pedido:</b>{" "}
                          <span style={{ color: getEstadoPedidoColor(estado), fontWeight: "bold" }}>
                            {getEstadoPedidoText(estado)}
                          </span>
                        </p>

                        <p>
                          <b>Estado pago:</b>{" "}
                          <span style={{ color: getEstadoPagoColor(p.estadoPago), fontWeight: "bold" }}>
                            {getEstadoPagoText(p.estadoPago)}
                          </span>
                        </p>

                        <p><b>Fecha:</b> {new Date(p.fecha).toLocaleString()}</p>

                        {p.comentario && (
                          <p><b>📝 Comentario:</b> {p.comentario}</p>
                        )}
                      </div>

                      {/* BOTONES (INTACTOS) */}
                      <div style={{ marginTop: "10px" }}>

                        {estadoPago === "Pendiente" && (
                          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                            <button className="product-button"
                              onClick={() => openConfirm("¿Marcar pago como completado?", () => completarPago(p.id))}>
                              💳 Confirmar pago
                            </button>

                            <button className="remove-button"
                              onClick={() => openConfirm("¿Cancelar pedido?", () => cancelar(p.id))}>
                              ❌ Cancelar
                            </button>
                          </div>
                        )}

                        {estado !== EstadoPedido.Entregado &&
                          estado !== EstadoPedido.Cancelado &&
                          estadoPago !== "Pendiente" && (
                            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "10px" }}>

                              {estado === EstadoPedido.Preparando && (
                                <button className="product-button"
                                  onClick={() => openConfirm("Marcar como preparado?", () => marcarPreparado(p.id))}>
                                  🟡 Preparar
                                </button>
                              )}

                              {estado === EstadoPedido.Finalizado && (
                                <button className="product-button"
                                  onClick={() => openConfirm("Marcar como entregado?", () => marcarEntregado(p.id))}>
                                  🟢 Entregar
                                </button>
                              )}

                            </div>
                          )}
                      </div>

                    </div>
                  );
                })}
              </div>

              {hasMore && filtro === "todos" && (
                <div style={{ textAlign: "center", marginTop: "20px" }}>
                  <button className="product-button" onClick={cargarMas}>
                    📦 Cargar 20 más
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* MODAL */}
      {modal.open && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.7)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 9999,
        }}>
          <div style={{
            background: "#12121a",
            padding: "20px",
            borderRadius: "12px",
            border: "1px solid #9333ea",
            textAlign: "center",
            minWidth: "320px",
          }}>
            <p style={{ marginBottom: "15px" }}>{modal.text}</p>

            <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
              <button className="success-button"
                onClick={() => { modal.action?.(); setModal({ open: false, text: "" }); }}>
                Sí
              </button>

              <button className="remove-button"
                onClick={() => setModal({ open: false, text: "" })}>
                No
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}