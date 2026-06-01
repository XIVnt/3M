import type { Product } from "./types/Product";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";

type ProductCardProps = {
  product: Product;
  addToCart: (product: Product) => void;
  onToggle?: (id: number) => void;
  loadingToggle?: number | null;
};

export default function ProductCard({
  product,
  addToCart,
  onToggle,
  loadingToggle,
}: ProductCardProps) {

  const { roles } = useAuth();

  const isAdmin =
    roles.includes("administrador") ||
    roles.includes("empleado");

  const isLoading = loadingToggle === product.id;
  const isDisabled = product.available === false;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.25 }}
    >
    <div className={`product-card ${isDisabled ? "disabled" : ""}`}>

      <img
        src={product.image}
        alt={product.name}
        className="product-image"
      />

      <h3 className="product-title">{product.name}</h3>

      <p className="product-price">{product.price} $</p>

      

      {/* BOTÓN CARRITO */}
      <button
        className="product-button"
        onClick={() => addToCart(product)}
        disabled={isDisabled}
      >
        {isDisabled ? "No disponible" : "Añadir al carrito"}
      </button>

      {/* BOTÓN ADMIN */}
      {isAdmin && (
        <button
          className="product-admin-button"
          onClick={() => onToggle?.(product.id)}
          disabled={isLoading}
          style={{
            backgroundColor: product.available ? "#22c55e" : "#ef4444",
            color: "white",
            marginTop: 8,
            border: "none",
            padding: "6px 10px",
            borderRadius: "8px",
            cursor: "pointer",
            opacity: isLoading ? 0.6 : 1,
          }}
        >
          {isLoading
            ? "Procesando..."
            : product.available
              ? "Desactivar"
              : "Activar"}
        </button>
      )}
    </div>
    </motion.div>
  );
}