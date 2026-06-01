import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMasVendidos } from "../api/productService";
import { motion } from "framer-motion";

type Product = {
  productoId: number;
  nombre: string;
  precio: number;
  tipo: string;
  imagenUrl: string;
  restauranteId: number;
  cantidadVendida: number;
};

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await getMasVendidos(10);
        setFeaturedProducts(res.data);
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
    <div className="home-container">
      
      <section className="welcome-section">
        <div className="welcome-overlay">
          <h1>Bienvenido a 3M Food</h1>
          <p>Descubre nuestros productos frescos y deliciosos</p>
        </div>
      </section>

      <section className="featured-products">
        <h2 className="section-title">Productos Destacados</h2>

        <div className="product-grid">
          {featuredProducts.map((product) => (
            <div key={product.productoId} className="product-card">
              <img
                src={product.imagenUrl}
                alt={product.nombre}
                className="product-image"
              />

              <h3 className="product-title">{product.nombre}</h3>
              <p className="product-price">{product.precio} $</p>

              <button
                className="product-button"
                onClick={() => navigate("/pedir")}
              >
                Pedir ya
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
    </motion.div>
  );
}