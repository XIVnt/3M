import { useEffect, useState } from "react";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import { getMetodosPago } from "../api/pedidosService";

export default function CartPage() {
  const {
    cart,
    removeFromCart,
    decreaseOne,
    total,
    clearCart,
    order,
  } = useCart();

  const { showToast } = useToast();
  const navigate = useNavigate();

  const isLogged = !!localStorage.getItem("token");

  // =========================
  // MÉTODOS DE PAGO (DINÁMICO)
  // =========================
  const [availableMethods, setAvailableMethods] = useState<number[]>([]);

  const MetodoPagoLabel: Record<number, string> = {
    0: "Efectivo",
    1: "Deuna API",
  };
    
  const [payment, setPayment] = useState<number | null>(null);

  const MetodoPagoIcon: Record<number, string> = {
    0: "💵",
    1: "💳",
  };

  const [orderSuccess, setOrderSuccess] = useState(false);

  // =========================
  // COMENTARIO (LOCAL UI STATE)
  // =========================
  const [comment, setComment] = useState(order.comentario ?? "");

  // =========================
  // LOAD PAYMENT METHODS
  // =========================
  useEffect(() => {
    const loadMethods = async () => {
      try {
        const res = await getMetodosPago();
        setAvailableMethods(
          res.data
            .filter(m => m.activo)
            .map(m => m.metodo)
        );
      } catch (err) {
        console.error(err);
      }
    };

    loadMethods();
  }, []);

  const handleRemoveOne = (id: number) => {
    decreaseOne(id);
    showToast("Se eliminó una unidad", "info");
  };

  // =========================
  // ORDER
  // =========================
  const handleOrder = async () => {
    if (!isLogged) {
      showToast("Debes iniciar sesión", "error");
      return;
    }

    if (!payment) {
      showToast("Selecciona método de pago", "error");
      return;
    }

    if (!order.restauranteId) {
      showToast("Falta restaurante", "error");
      return;
    }

    if (!order.service) {
      showToast("Falta servicio", "error");
      return;
    }

    const payload = {
      restauranteId: order.restauranteId,

      servicio: order.service,

      metodoPago: payment,
      location: order.location,

      productos: cart.map((p) => ({
        productoId: p.id,
        cantidad: p.quantity,
      })),

      // =========================
      // 🆕 COMENTARIO
      // =========================
      comentario: comment?.trim() ? comment.trim() : null,
    };

    console.log("PAYLOAD:", payload);

    try {
      await api.post("/pedidos", payload, {
        timeout: 60000,
      });

      clearCart();
      setOrderSuccess(true);
      showToast("Pedido realizado correctamente", "success");

    } catch (err: any) {
      console.error(err);

      if (err.code === "ECONNABORTED") {
        showToast("El servidor está tardando, pero el pedido puede haberse creado", "info");
        setOrderSuccess(true); // 👈 opcional UX recovery
        clearCart();
        return;
      }

      showToast("Error al enviar el pedido", "error");
    }
  };

  // =========================
  // SUCCESS SCREEN
  // =========================
  if (orderSuccess) {
    return (
      <div className="step-wrapper" style={{ textAlign: "center" }}>
        <h2 style={{ color: "#22c55e", fontSize: "28px" }}>
          🎉 Pedido enviado correctamente
        </h2>

        <button
          className="checkout-button"
          style={{ marginTop: "20px" }}
          onClick={() => navigate("/mis-pedidos")}
        >
          📦 Ver mis pedidos
        </button>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="cart-list step-wrapper" style={{ textAlign: "center" }}>
        <h2>🛒 Tu pedido</h2>
        <p>Añade algo al carrito primero</p>
      </div>
    );
  }

  return (
    <div className="cart-list step-wrapper">
      <h2>🛒 Tu pedido</h2>

      {cart.map((item, i) => (
        <div key={`${item.id}-${i}`} className="cart-item">
          <span>
            {item.name} x{item.quantity} -{" "}
            {item.price * item.quantity} $
          </span>

          <div style={{ display: "flex", gap: "8px" }}>
            <button onClick={() => handleRemoveOne(item.id)}>
              ➖
            </button>

            <button
              onClick={() => {
                removeFromCart(item.id);
                showToast("Producto eliminado", "info");
              }}
            >
              ❌
            </button>
          </div>
        </div>
      ))}

      <h3>Total: {total.toFixed(2)} $</h3>

      {/* PAYMENT */}
      <div className="option-group">
        {Object.entries(MetodoPagoLabel).map(([key, label]) => {
          const id = Number(key);
          const isAvailable = availableMethods.includes(id);

          return (
            <div
              key={id}
              className={`option-card ${payment === id ? "active" : ""}`}
              onClick={() => {
                if (!isAvailable) return;
                setPayment(id);
              }}
              style={{
                opacity: isAvailable ? 1 : 0.4,
                cursor: isAvailable ? "pointer" : "not-allowed",
                border:
                  payment === id ? "1px solid #22c55e" : "1px solid transparent",
              }}
            >
              {MetodoPagoIcon[id]} {label}

              {!isAvailable && (
                <div style={{ fontSize: "10px", color: "#ff4d6d" }}>
                  Próximamente
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* COMMENT BOX (APARECE SOLO SI HAY MÉTODO SELECCIONADO) */}
      {payment && (
        <div style={{ marginTop: "15px" }}>
          <textarea
            value={comment}
            maxLength={120}
            placeholder="Alergias, extras o peticiones (opcional)"
            onChange={(e) => {
              setComment(e.target.value);
            }}
            style={{
              width: "100%",
              minHeight: "80px",
              padding: "10px",
              borderRadius: "10px",
              background: "#0b0b12",
              color: "#eaeaff",
              border: "1px solid #9333ea",
              outline: "none",
              resize: "none",
            }}
          />

          <div style={{ fontSize: "12px", color: "#a7f3d0" }}>
            {comment.length}/120
          </div>
        </div>
      )}

      <div className="option-group">
        <button className="checkout-button" onClick={handleOrder}>
          Confirmar pedido
        </button>
      </div>
    </div>
  );
}