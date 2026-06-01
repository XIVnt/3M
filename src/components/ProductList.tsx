import { useEffect, useState } from "react";
import api from "../api/axios";
import ProductCard from "./ProductCard";
import type { Product } from "./types/Product";
import { useCart } from "../context/CartContext";
import { motion } from "framer-motion";

type ProductApi = {
  id: number;
  nombre: string;
  precio: number;
  tipo: string;
  restauranteId:number;
};

export default function ProductList() {
  const [products, setProducts] = useState<Product[]>([]);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await api.get<ProductApi[]>("/product");

        const mapped: Product[] = res.data.map((p) => ({
          id: p.id,
          name: p.nombre,
          price: p.precio,
          category: p.tipo,
          image: `${import.meta.env.VITE_API_URL}/api/product/${p.id}/imagen`,
          restaurantId: p.restauranteId,
        }));

        setProducts(mapped);

      } catch (err) {
        console.error("Error cargando productos:", err);
      }
    };

    fetchProducts();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.25 }}
    >
    <div className="product-grid">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          addToCart={addToCart}
        />
      ))}
    </div>
    </motion.div>
  );
}