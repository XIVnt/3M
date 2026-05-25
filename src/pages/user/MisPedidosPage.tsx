import { useEffect, useMemo, useState } from "react";
import api from "../../api/axios";
import { getMisFacturas } from "../../api/facturaService";
import { cancelarPedido } from "../../api/pedidosService";

const TAKE = 10;

const estadoPedidoMap: Record<number, string> = {
  0: "Preparando",
  1: "Finalizado",
  2: "Entregado",
  3: "Cancelado",
};

type ViewMode =
  | { mode: "list" }
  | { mode: "pedido"; id: number }
  | { mode: "factura"; id: number };

export default function MisPedidos() {
  const [pedidos, setPedidos] = useState<any[]>([]);
  const [facturas, setFacturas] = useState<any[]>([]);

  const [tab, setTab] = useState<"pedidos" | "facturas">("pedidos");

  const [skip, setSkip] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const [view, setView] = useState<ViewMode>({ mode: "list" });

  const [detallePedido, setDetallePedido] = useState<any>(null);
  const [detalleFactura, setDetalleFactura] = useState<any>(null);

  const [estadoFilter, setEstadoFilter] = useState<number | null>(null);

  // 🔥 NUEVO: filtro pagos
  const [showPendientesPago, setShowPendientesPago] = useState(false);

  const metodoPagoMap: Record<number, string> = {
    0: "💵 Efectivo",
    1: "💳 Tarjeta",
  };

  useEffect(() => {
    load(true);
  }, []);

  const load = async (reset = false) => {
    try {
      setLoading(true);

      const currentSkip = reset ? 0 : skip;

      const [pedidosRes, facturasRes] = await Promise.all([
        api.get(`/pedidos/mis-pedidos?skip=${currentSkip}&take=${TAKE}`),
        getMisFacturas(),
      ]);

      const newPedidos = pedidosRes.data;

      setPedidos((prev) =>
        reset ? newPedidos : [...prev, ...newPedidos]
      );

      setFacturas(facturasRes.data);

      setSkip(currentSkip + TAKE);

      if (newPedidos.length < TAKE) setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  // 🔥 FILTRO PRINCIPAL
  const filteredPedidos = useMemo(() => {
    let result = [...pedidos];

    // 🔥 NUEVO:
    // En "Preparando" SOLO mostrar pagados
    result = result.filter((p) => {
      if (p.estadoPedido === 0) {
        return p.estadoPago === 1;
      }

      return true;
    });

    // filtro estado
    if (estadoFilter !== null) {
      result = result.filter((p) => p.estadoPedido === estadoFilter);
    }

    // 🔥 NUEVO:
    // pendientes de pago = preparación + NO pagado
    if (showPendientesPago) {
      result = pedidos.filter(
        (p) =>
          p.estadoPedido === 0 &&
          p.estadoPago !== 1
      );
    }

    return result;
  }, [pedidos, estadoFilter, showPendientesPago]);

  const counts = useMemo(() => {
    const visibles = pedidos.filter((p) => {
      if (p.estadoPedido === 0) {
        return p.estadoPago === 1;
      }

      return true;
    });

    const c: Record<number, number> = {
      0: 0,
      1: 0,
      2: 0,
      3: 0,
    };

    visibles.forEach((p) => {
      c[p.estadoPedido] = (c[p.estadoPedido] || 0) + 1;
    });

    return c;
  }, [pedidos]);

  // 🔥 NUEVO:
  const pendientesPagoCount = useMemo(() => {
    return pedidos.filter(
      (p) =>
        p.estadoPedido === 0 &&
        p.estadoPago !== 1
    ).length;
  }, [pedidos]);

  const handleCancelPedido = async (id: number) => {
    try {
      await cancelarPedido(id);

      setPedidos((prev) =>
        prev.map((p) =>
          p.id === id ? { ...p, estadoPedido: 3 } : p
        )
      );

      if (detallePedido?.id === id) {
        setDetallePedido((prev: any) => ({
          ...prev,
          estadoPedido: 3,
        }));
      }
    } catch (err) {
      console.error("Error cancelando pedido", err);
    }
  };

  const openPedido = async (id: number) => {
    const res = await api.get(`/pedidos/${id}`);
    setDetallePedido(res.data);
    setView({ mode: "pedido", id });
  };

  const openFactura = async (id: number) => {
    const res = await api.get(`/facturas/${id}`);
    setDetalleFactura(res.data);
    setView({ mode: "factura", id });
  };

  const facturasFiltradas = useMemo(() => {
    return facturas.filter((f) => {
      const estado = pedidos.find((p) => p.id === f.pedidoId)?.estadoPedido;
      return estado !== 3;
    });
  }, [facturas, pedidos]);

  // ================= DETALLE PEDIDO =================
  if (view.mode === "pedido") {
    return (
      <div className="orders-page">

        <button
          className="orders-back-button"
          onClick={() => setView({ mode: "list" })}
        >
          ← Volver
        </button>

        <div className="orders-header">
          <h2>Pedido #{detallePedido?.id}</h2>
        </div>

        <div className="order-card">
          <div className="order-top">
            <span className="order-id">
              Pedido #{detallePedido?.id}
            </span>
            <span className="order-total">
              {detallePedido?.total} $
            </span>
          </div>

          <div className="order-status">
            Estado:{" "}
            <span className="status-badge">
              {estadoPedidoMap[detallePedido?.estadoPedido]}
            </span>
          </div>

          {/* 🔥 SOLO SI ESTÁ EN PREPARACIÓN */}
          {detallePedido?.estadoPedido === 0 && (
            <button
              className="order-cancel-button"
              onClick={() => handleCancelPedido(detallePedido.id)}
            >
              ❌ Cancelar pedido
            </button>
          )}
        </div>

        <h3 className="orders-header p">Productos</h3>

        <div className="orders-grid">
          {detallePedido?.pedidoProductos?.map((pp: any, index: number) => (
            <div
              key={`${pp.nombre}-${index}`}
              className="order-card"
            >
              <div className="order-top">
                <span className="order-id">
                  {pp.nombre}
                </span>

                <span className="order-total">
                  {pp.precioUnitario} $
                </span>
              </div>

              <div className="order-status">
                Cantidad: {pp.cantidad}
              </div>
            </div>
          ))}
        </div>

      </div>
    );
  }

  // ================= DETALLE FACTURA =================
  if (view.mode === "factura") {
    return (
      <div className="orders-page">

        <button
          className="orders-back-button"
          onClick={() => setView({ mode: "list" })}
        >
          ← Volver
        </button>

        <div className="orders-header">
          <h2>Factura #{detalleFactura?.numeroFactura}</h2>
        </div>

        <div className="order-card">
          <div className="order-top">
            <span className="order-id">
              Factura #{detalleFactura?.numeroFactura}
            </span>

            <span className="order-total">
              {detalleFactura?.total} $
            </span>
          </div>

          <div className="order-status">
            Fecha: {new Date(detalleFactura?.fechaEmision).toLocaleDateString()}
          </div>

          <div className="order-status">
            Pagada:{" "}
            <span className="status-badge">
              {detalleFactura?.pagada ? "Sí" : "No"}
            </span>
          </div>
        </div>

        <h3 className="orders-header p">Pedido asociado</h3>

          <div className="order-card">

            <div className="order-status">
              <b>Email:</b> {detalleFactura?.pedido?.email}
            </div>

            <div className="order-status">
              <b>Fecha:</b>{" "}
              {new Date(detalleFactura?.pedido?.fecha).toLocaleString()}
            </div>

            <div className="order-status">
              <b>Método de pago:</b>{" "}
              {
                metodoPagoMap[detalleFactura?.pedido?.metodoPago]
                || "Desconocido"
              }
            </div>

            <div className="order-status">
              <b>Servicio:</b>{" "}
              {detalleFactura?.pedido?.servicio === "recoger"
                ? "🏪 Recogida"
                : "🚚 Domicilio"}
            </div>

            {detalleFactura?.pedido?.comentario && (
              <div className="order-status">
                <b>Comentario:</b>{" "}
                {detalleFactura?.pedido?.comentario}
              </div>
            )}

            <div
              className="order-status"
              style={{
                marginTop: 12,
                paddingTop: 12,
                borderTop: "1px solid rgba(255,255,255,0.08)"
              }}
            >
              <div style={{ marginBottom: 6 }}>
                <b>Subtotal:</b>{" "}
                {(detalleFactura?.pedido?.total * 0.85).toFixed(2)} $
              </div>

              <div style={{ marginBottom: 6 }}>
                <b>IVA (15%):</b>{" "}
                {(detalleFactura?.pedido?.total * 0.15).toFixed(2)} $
              </div>

              <div
                style={{
                  fontWeight: 700,
                  color: "#34d399",
                  marginTop: 8
                }}
              >
                <b>Total:</b>{" "}
                {detalleFactura?.pedido?.total.toFixed(2)} $
              </div>
            </div>

          </div>

        <h3 className="orders-header p">Productos</h3>

        <div className="orders-grid">
          {detalleFactura?.pedido?.productos?.map((p: any, index: number) => (
            <div
              key={`${p.productoId}-${index}`}
              className="order-card"
            >
              <div className="order-top">
                <span className="order-id">
                  {p.nombre}
                </span>

                <span className="order-total">
                  {p.precioUnitario} $
                </span>
              </div>

              <div className="order-status">
                Cantidad: {p.cantidad}
              </div>
            </div>
          ))}
        </div>

      </div>
    );
  }

  // ================= LISTA =================
  return (
    <div className="orders-layout">

      {tab === "pedidos" && (
        <aside className="orders-sidebar">

          <button
            className={estadoFilter === null && !showPendientesPago ? "active" : ""}
            onClick={() => {
              setEstadoFilter(null);
              setShowPendientesPago(false);
            }}
            key="all"
          >
            📦 Todos
          </button>

          {/* 🔥 NUEVO SIDE OPTION */}
          <button
            className={showPendientesPago ? "active" : ""}
            onClick={() => {
              setEstadoFilter(null);
              setShowPendientesPago(true);
            }}
          >
            ⏳ Pendientes de pago ({pendientesPagoCount})
          </button>

          {Object.entries(estadoPedidoMap).map(([key, label]) => (
            <button
              key={`estado-${key}`}
              className={estadoFilter === Number(key) ? "active" : ""}
              onClick={() => {
                setEstadoFilter(Number(key));
                setShowPendientesPago(false);
              }}
            >
              {label} ({counts[Number(key)] || 0})
            </button>
          ))}

        </aside>
      )}

      <div className="orders-page">

        <div className="orders-header">
          <h2>🧾 Mi cuenta</h2>
          <p>Consulta tus pedidos y facturas</p>
        </div>

        <div className="orders-tabs">

          <button
            className={tab === "pedidos" ? "active" : ""}
            onClick={() => setTab("pedidos")}
            key="tab-pedidos"
          >
            Mis pedidos
          </button>

          <button
            className={tab === "facturas" ? "active" : ""}
            onClick={() => setTab("facturas")}
            key="tab-facturas"
          >
            Mis facturas
          </button>

        </div>

        {tab === "pedidos" && (
          <div className="orders-grid">

            {filteredPedidos.length === 0 ? (
              <p className="empty">
                No tienes pedidos en este estado
              </p>
            ) : (
              filteredPedidos.map((p) => (
                <div
                  key={`pedido-${p.id}`}
                  className="order-card"
                  onClick={() => openPedido(p.id)}
                >
                  <div className="order-top">

                    <span className="order-id">
                      Pedido #{p.id}
                    </span>

                    <span className="order-total">
                      {p.total} $
                    </span>

                  </div>

                  <div className="order-status">
                    Estado:{" "}

                    <span className="status-badge">
                      {estadoPedidoMap[p.estadoPedido]}
                    </span>
                  </div>
                </div>
              ))
            )}

          </div>
        )}

        {tab === "facturas" && (
          <div className="orders-grid">

            {facturasFiltradas.length === 0 ? (
              <p className="empty">
                No tienes facturas disponibles
              </p>
            ) : (
              facturasFiltradas.map((f) => (
                <div
                  key={`factura-${f.id}`}
                  className="order-card"
                  onClick={() => openFactura(f.id)}
                >
                  <div className="order-top">

                    <span className="order-id">
                      Factura #{f.numeroFactura}
                    </span>

                    <span className="order-total">
                      {f.total} $
                    </span>

                  </div>

                  <div className="order-status">
                    {new Date(f.fechaEmision).toLocaleDateString()}
                  </div>
                </div>
              ))
            )}

          </div>
        )}

      </div>
    </div>
  );
}