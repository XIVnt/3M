import { useEffect, useState } from "react";
import api from "../api/axios";
import ProductCard from "./ProductCard";
import type { Product } from "./types";
import { useCart } from "../context/CartContext";

type ProductApi = {
  id: number;
  nombre: string;
  precio: number;
  tipo: string;
};

export default function ProductList() {
  const [products, setProducts] = useState<Product[]>([]);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await api.get<ProductApi[]>("/product");

        const mapped: Product[] = res.data.map((p) => ({
          id: p.id.toString(),
          name: p.nombre,
          price: p.precio,
          category: p.tipo,
          image: `${import.meta.env.VITE_API_URL}/api/product/${p.id}/imagen`
        }));

        setProducts(mapped);

      } catch (err) {
        console.error("Error cargando productos:", err);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="product-grid">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          addToCart={addToCart}
        />
      ))}
    </div>
  );
}