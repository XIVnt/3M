import { createContext, useContext, useEffect, useState } from "react";
import type { Product } from "../components/types/Product";

// =========================
// TYPES
// =========================
type CartItem = {
  id: number;
  name: string;
  price: number;
  quantity: number;
  restaurantId: number;
};

type OrderData = {
  restauranteId: number | null;
  service: "domicilio" | "recoger" | null;
  location: {
    lat: number;
    lng: number;
  } | null;

  // =========================
  // 🆕 NUEVO CAMPO
  // =========================
  comentario: string | null;
};

type CartContextType = {
  cart: CartItem[];

  addToCart: (product: Product) => boolean;
  removeFromCart: (id: number) => void;
  decreaseOne: (id: number) => void;
  clearCart: () => void;

  total: number;

  // 🆕 ORDER GLOBAL
  order: OrderData;
  setOrder: (
    data:
      | Partial<OrderData>
      | ((prev: OrderData) => OrderData)
  ) => void;

  resetOrder: () => void;
};

// =========================
// CONTEXT
// =========================
const CartContext = createContext<CartContextType | undefined>(undefined);

// =========================
// PROVIDER
// =========================
export function CartProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // =========================
  // CART STATE
  // =========================
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem("cart");

      if (!saved) return [];

      const parsed = JSON.parse(saved);

      return parsed.map((item: CartItem) => ({
        ...item,
        quantity: item.quantity ?? 1,
      }));
    } catch {
      return [];
    }
  });

  // =========================
  // ORDER STATE
  // =========================
  const [order, setOrderState] = useState<OrderData>(() => {
    try {
      const saved = localStorage.getItem("order");

      return saved
        ? {
            ...JSON.parse(saved),
            comentario: JSON.parse(saved).comentario ?? null
          }
        : {
            restauranteId: null,
            service: null,
            location: null,
            comentario: null,
          };
    } catch {
      return {
        restauranteId: null,
        service: null,
        location: null,
        comentario: null,
      };
    }
  });

  // =========================
  // PERSIST CART
  // =========================
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  // =========================
  // PERSIST ORDER
  // =========================
  useEffect(() => {
    localStorage.setItem("order", JSON.stringify(order));
  }, [order]);

  // =========================
  // ADD TO CART
  // =========================
  const addToCart = (product: Product): boolean => {
    let allowed = true;

    setCart((prev) => {
      if (
        prev.length > 0 &&
        prev[0].restaurantId !== product.restaurantId
      ) {
        allowed = false;
        return prev;
      }

      const existing = prev.find((p) => p.id === product.id);

      if (existing) {
        return prev.map((p) =>
          p.id === product.id
            ? {
                ...p,
                quantity: p.quantity + 1,
              }
            : p
        );
      }

      return [
        ...prev,
        {
          id: product.id,
          name: product.name,
          price: product.price,
          quantity: 1,
          restaurantId: product.restaurantId,
        },
      ];
    });

    return allowed;
  };

  // =========================
  // REMOVE PRODUCT
  // =========================
  const removeFromCart = (id: number) => {
    setCart((prev) => prev.filter((p) => p.id !== id));
  };

  // =========================
  // REMOVE ONE
  // =========================
  const decreaseOne = (id: number) => {
    setCart((prev) =>
      prev
        .map((p) =>
          p.id === id
            ? { ...p, quantity: p.quantity - 1 }
            : p
        )
        .filter((p) => p.quantity > 0)
    );
  };

  // =========================
  // CLEAR CART
  // =========================
  const clearCart = () => {
    setCart([]);
  };

  // =========================
  // ORDER UPDATE
  // =========================
  const setOrder = (
    data:
      | Partial<OrderData>
      | ((prev: OrderData) => OrderData)
  ) => {
    setOrderState((prev) => {
      const newState =
        typeof data === "function"
          ? data(prev)
          : { ...prev, ...data };

      return {
        ...newState,
        comentario: newState.comentario ?? null,
      };
    });
  };

  // =========================
  // RESET ORDER
  // =========================
  const resetOrder = () => {
    const emptyOrder = {
      restauranteId: null,
      service: null,
      location: null,
      comentario: null,
    };

    setOrderState(emptyOrder);
    localStorage.setItem("order", JSON.stringify(emptyOrder));
  };

  // =========================
  // TOTAL
  // =========================
  const total = cart.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  // =========================
  // PROVIDER
  // =========================
  return (
    <CartContext.Provider
      value={{
        cart,

        addToCart,
        removeFromCart,
        decreaseOne,
        clearCart,

        total,

        order,
        setOrder,
        resetOrder,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

// =========================
// HOOK
// =========================
export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used inside CartProvider");
  }

  return context;
}