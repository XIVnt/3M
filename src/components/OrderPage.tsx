// =========================
// IMPORTS
// =========================
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import ProductCard from "./ProductCard";
import type { Product } from "./types/Product";
import { useToast } from "../context/ToastContext";
import {
  toggleEstadoProducto,
  getProductosByRestaurante,
} from "../api/productService";
import { useCart } from "../context/CartContext";
import DeliveryMap from "./DeliveryMap";
import { getRestaurantes } from "../api/restaurantService";

// =========================
// TYPES
// =========================
type RestauranteSelect = {
  id: number;
  nombre: string;
  lat: number;
  lng: number;
  direccion: string;
  activo: boolean;
};

export default function OrderPage() {

  // =========================
  // URL / CATEGORY
  // =========================
  const routerLocation = useLocation();

  const urlCategory =
    new URLSearchParams(routerLocation.search).get("category") || "Todo";

  // =========================
  // CONTEXT
  // =========================
  const {
    addToCart,
    cart,
    order,
    setOrder,
    clearCart,
  } = useCart();

  const { showToast } = useToast();

  // =========================
  // CART COMO FUENTE REAL
  // =========================
  const hasCartItems = cart.length > 0;

  const activeRestaurantId =
    hasCartItems ? cart[0].restaurantId : order.restauranteId;

  // =========================
  // STATE
  // =========================
  const [loadingToggle, setLoadingToggle] =
    useState<number | null>(null);

  const [products, setProducts] =
    useState<Product[]>([]);

  const [categories, setCategories] =
    useState<string[]>([]);

  const [selectedCategory, setSelectedCategory] =
    useState<string>(urlCategory);

  const [restaurantes, setRestaurantes] =
    useState<RestauranteSelect[]>([]);

  // =========================
  // MAPA STATE
  // =========================
  const [location, setLocation] =
    useState<{ lat: number; lng: number } | null>(null);

  const [isInsideZone, setIsInsideZone] =
    useState(false);

  const [locationConfirmed, setLocationConfirmed] =
    useState(false);

  const [mapMsg, setMapMsg] = useState<{
    text: string;
    type: "ok" | "error" | null;
  }>({
    text: "",
    type: null,
  });

  // =========================
  // RESTAURANTE SELECCIONADO
  // =========================
  const restauranteSeleccionado =
    restaurantes.find((r) => r.id === order.restauranteId);

  const restauranteMap =
    restauranteSeleccionado ?? undefined; 
  // =========================
  // FLAGS
  // =========================
  const isDomicilio = order.service === "domicilio";
  const isRecoger = order.service === "recoger";

  const mapMode =
    order.service === "recoger"
      ? "recoger"
      : order.service === "domicilio"
        ? "domicilio"
        : null;

  const hasBaseSelection =
    order.restauranteId !== null &&
    order.service !== null;

  // =========================
  // FIX FLUJO
  // =========================
  const hasValidLocation = isRecoger
    ? !!order.location
    : (locationConfirmed && !!location);

  const isOrderReady =
    hasCartItems || (hasBaseSelection && hasValidLocation);

const hasConfirmedRecoger =
  order.service === "recoger" &&
  order.location !== null &&
  locationConfirmed === true;

const hasConfirmedDomicilio =
  order.service === "domicilio" &&
  order.location !== null &&
  locationConfirmed === true;

const hasConfirmedFlow =
  hasConfirmedRecoger || hasConfirmedDomicilio;

const canShowMenu =
  hasCartItems || (hasBaseSelection && hasConfirmedFlow);

  // =========================
  // SYNC LOCATION
  // =========================
  useEffect(() => {
    if (order.location) {
      setLocation(order.location);
      setIsInsideZone(true);
    }
  }, [order.location]);

  // =========================
  // RESET SOLO SI CARRITO VACÍO
  // =========================
  useEffect(() => {
    if (!hasCartItems) {
      setLocation(null);
      setIsInsideZone(false);
      setLocationConfirmed(false);
      setMapMsg({ text: "", type: null });

      setOrder({
        restauranteId: null,
        service: null,
        location: null,
      });
    }
  }, [hasCartItems]);

  // =========================
  // RESTAURANTES
  // =========================
  useEffect(() => {
    (async () => {
      try {
        const res = await getRestaurantes();
        setRestaurantes(res.data);
      } catch (err) {
        console.error(err);
      }
    })();
  }, []);

  // =========================
  // PRODUCTS
  // =========================
  useEffect(() => {
    if (!activeRestaurantId) return;

    (async () => {
      try {
        const res = await getProductosByRestaurante(activeRestaurantId);

        const mapped: Product[] = res.data.map((p: any) => ({
          id: p.id,
          name: p.nombre,
          price: p.precio,
          category: p.tipo,
          image: p.imagenUrl,
          restaurantId: p.restauranteId,
          available: p.disponible,
        }));

        const filtered =
          selectedCategory === "Todo"
            ? mapped
            : mapped.filter((p) => p.category === selectedCategory);

        setProducts(filtered);

        setCategories([
          "Todo",
          ...Array.from(new Set(mapped.map((p) => p.category))),
        ]);

      } catch (err) {
        console.error(err);
      }
    })();
  }, [selectedCategory, activeRestaurantId]);

  // =========================
  // ADD TO CART
  // =========================
  const handleAddToCart = (product: Product) => {
    if (!isOrderReady) {
      showToast("⚠️ Completa restaurante, servicio y ubicación", "info");
      return;
    }

    if (!product.available) return;

    if (hasCartItems && cart[0].restaurantId !== product.restaurantId) {
      showToast("❌ Vacía el carrito antes de cambiar de restaurante", "error");
      return;
    }

    addToCart(product);
    showToast(`✅ ${product.name} añadido al carrito`, "success");
  };

  // =========================
  // TOGGLE PRODUCT
  // =========================
  const handleToggleProducto = async (id: number) => {
    try {
      setLoadingToggle(id);

      setProducts((prev) =>
        prev.map((p) =>
          p.id === id ? { ...p, available: !p.available } : p
        )
      );

      await toggleEstadoProducto(id);
    } catch (err) {
      console.error(err);
      showToast("❌ Error al actualizar producto", "error");
    } finally {
      setLoadingToggle(null);
    }
  };

  // =========================
  // STEP UI
  // =========================
  if (!canShowMenu) {

    return (
      <div className="step-wrapper" style={{ textAlign: "center" }}>

        <h2>🍽️ Antes de empezar tu pedido</h2>

        {/* RESTAURANTE */}
        <div className="option-group" style={{ marginTop: 20 }}>
          <div className="option-card" style={{ width: "100%" }}>
            <h3>🏪 Restaurante</h3>

            <select
              className="custom-select"
              value={order.restauranteId ?? ""}
              onChange={(e) => {

                const newId = e.target.value ? Number(e.target.value) : null;

                setOrder({
                  restauranteId: newId,
                  service: null,
                  location: null,
                });

                setLocation(null);
                setIsInsideZone(false);
                setLocationConfirmed(false);
                setMapMsg({ text: "", type: null });

                clearCart();
              }}
            >
              <option value="">Selecciona restaurante</option>

              {restaurantes.map((r) => (
                <option key={r.id} value={r.id} disabled={!r.activo}>
                  {r.nombre}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* SERVICIO */}
        <div className="option-group" style={{ marginTop: 20 }}>

          {/* DOMICILIO */}
          <div
            className={`option-card ${isDomicilio ? "active" : ""}`}
            onClick={() => {
              if (!order.restauranteId) return;

              setOrder({
                restauranteId: order.restauranteId,
                service: "domicilio",
                location: null,
              });

              setLocation(null);
              setIsInsideZone(false);
              setLocationConfirmed(false);

              setMapMsg({ text: "", type: null });

              clearCart();

              showToast("🚚 Seleccionado domicilio", "info");
            }}
          >
            🚚 Domicilio
          </div>

          {/* RECOGER */}
          <div
            className={`option-card ${isRecoger ? "active" : ""}`}
            onClick={() => {

              if (!restauranteSeleccionado) return;

              clearCart();

              const restoLocation = {
                lat: restauranteSeleccionado.lat,
                lng: restauranteSeleccionado.lng,
              };

              setOrder({
                restauranteId: order.restauranteId, // NO prev
                service: "recoger",
                location: restoLocation,
              });
              setLocation(restoLocation);
              setIsInsideZone(true);

              showToast("🏪 Recogida seleccionada", "success");
            }}
          >
            🏪 Recoger
          </div>
        </div>

        {/* MAPA */}
        {mapMode === "domicilio" && restauranteMap && (
          <>
            <DeliveryMap
              restaurante={restauranteMap}
              location={
                location || {
                  lat: restauranteMap.lat,
                  lng: restauranteMap.lng,
                }
              }
              onSelect={(pos) => {
                if (isRecoger) return;

                setLocation(pos);

                const ok =
                  Math.hypot(
                    pos.lat - restauranteMap.lat,
                    pos.lng - restauranteMap.lng
                  ) < 0.05;

                setIsInsideZone(ok);

                setLocationConfirmed(false);

                setMapMsg({
                  text: ok ? "✔️ Dirección válida" : "❌ Fuera de rango",
                  type: ok ? "ok" : "error",
                });

                setOrder((prev: any) => ({
                  ...prev,
                  location: null,
                }));
              }}
              onDrag={(pos, inside) => {
                setLocation(pos);
                setIsInsideZone(inside);
              }}
              mode="domicilio"
            />

            {/* BOTÓN DOMICILIO */}
            {location && isInsideZone && !locationConfirmed && (
              <button
                className="checkout-button"
                onClick={() => {
                  setLocationConfirmed(true);

                  setOrder((prev: any) => ({
                    ...prev,
                    location,
                  }));

                  showToast("📍 Ubicación confirmada", "success");
                }}
              >
                ✔️ Confirmar ubicación
              </button>
            )}
          </>
        )}
        {mapMode === "recoger" && (
          restauranteSeleccionado && (
          <div style={{ position: "relative" }}>

            {/* 🔥 MAPA SOLO VISUAL */}
            <div
              style={{
                filter: "grayscale(1)",   // 👈 estilo diferente
                pointerEvents: "none"     // 👈 bloquea interacción
              }}
            >
              <DeliveryMap
                restaurante={restauranteSeleccionado}
                location={{
                  lat: restauranteSeleccionado.lat,
                  lng: restauranteSeleccionado.lng,
                }}
                onSelect={() => {}}
                onDrag={() => {}}
                mode ="recoger"
              />
            </div>

            {/* INFO */}
            <div style={{ marginTop: 10 }}>
              <p style={{ fontWeight: "bold" }}>
                🏪 Estás en modo recogida en restaurante
              </p>
              <p>
                📍 Dirección: {restauranteSeleccionado.direccion}
              </p>
            </div>

            {/* BOTÓN CONFIRMAR */}
            <button
              className="checkout-button"
              onClick={() => {
                const restoLocation = {
                  lat: restauranteSeleccionado.lat,
                  lng: restauranteSeleccionado.lng,
                };

                setLocation(restoLocation);
                setIsInsideZone(true);

                setLocationConfirmed(true); // ✅ AQUÍ es donde debe ir

                setOrder((prev: any) => ({
                  ...prev,
                  location: restoLocation,
                }));

                showToast("🏪 Recogida confirmada", "success");
              }}
            >
              ✔️ Confirmar recogida
            </button>

          </div>
        ))}

      </div>
    );
  }

  // =========================
  // MENU
  // =========================
  return (
    <div className="order-page-container">

      <aside className="category-sidebar">

        {categories.map((cat) => (
          <button
            key={cat}
            className={`category-sidebar-btn ${
              selectedCategory === cat ? "active" : ""
            }`}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat}
          </button>
        ))}

      </aside>

      <main style={{ flex: 1 }}>

        <div className="product-grid">

          {products.length === 0 ? (
            <h2 style={{ textAlign: "center", padding: "40px" }}>
              🍽️ Sin productos
            </h2>
          ) : (
            products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                addToCart={handleAddToCart}
                onToggle={handleToggleProducto}
                loadingToggle={loadingToggle}
              />
            ))
          )}

        </div>

      </main>

    </div>
  );
}