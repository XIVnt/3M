import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import { getMasVendidos } from "../api/productService";

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
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="home-container">

        {/* HERO */}
        <section className="hero-section">
          <div className="hero-overlay">
            <h1>Bienvenido a 3M Food</h1>

            <p>
              Descubre comida increíble, realiza tus pedidos
              en segundos y disfruta de tus platos favoritos.
            </p>

            <div className="hero-buttons">
              <button
                className="primary-btn"
                onClick={() => navigate("/pedir")}
              >
                Pedir ahora
              </button>

              <button
                className="secondary-btn"
                onClick={() => navigate("/login")}
              >
                Mi cuenta
              </button>
            </div>
          </div>
        </section>

        {/* ESTADÍSTICAS */}
        <section className="stats-section">
          <div className="stat-card">
            <h2>⚡</h2>
            <h3>Rápido</h3>
            <p>Pedidos en segundos</p>
          </div>

          <div className="stat-card">
            <h2>🍴</h2>
            <h3>Calidad</h3>
            <p>Productos seleccionados</p>
          </div>

          <div className="stat-card">
            <h2>🚚</h2>
            <h3>Entrega</h3>
            <p>Servicio eficiente</p>
          </div>
        </section>

        {/* CATEGORÍAS */}
        <section className="categories-section">
          <h2 className="section-title">
            Explora categorías
          </h2>

          <div className="categories-grid">
            <div
              className="category-card hamburguesas"
              onClick={() => navigate("/pedir")}
            >
              <img src="/img/hamburguesas.png" className="category-bg" />
              <div className="category-overlay" />
              <span>Hamburguesas</span>
            </div>

            <div
              className="category-card menestras"
              onClick={() => navigate("/pedir")}
            >
              <img src="/img/menestras.jpg" className="category-bg" />
              <div className="category-overlay" />
              <span>Menestras</span>
            </div>

            <div
              className="category-card bebidas"
              onClick={() => navigate("/pedir")}
            >
              <img src="/img/bebida.jpg" className="category-bg" />
              <div className="category-overlay" />
              <span>Bebidas</span>
            </div>

            <div
              className="category-card pinchos"
              onClick={() => navigate("/pedir")}
            >
              <img src="/img/pincho.jpg" className="category-bg" />
              <div className="category-overlay" />
              <span>Pinchos</span>
            </div>
          </div>
        </section>

        {/* PRODUCTOS DESTACADOS */}
        <section className="featured-products">
          <h2 className="section-title">
            🔥 Productos más vendidos
          </h2>

          <div className="product-grid">
            {featuredProducts.map((product) => (
              <motion.div
                key={product.productoId}
                className="product-card"
                whileHover={{
                  y: -5,
                  scale: 1.03,
                }}
              >
                <div className="product-badge">
                  TOP VENTAS
                </div>

                <img
                  src={product.imagenUrl}
                  alt={product.nombre}
                  className="product-image"
                />

                <h3 className="product-title">
                  {product.nombre}
                </h3>

                <p className="product-price">
                  {product.precio.toFixed(2)} €
                </p>

                <p className="product-sales">
                  🔥 {product.cantidadVendida} vendidos en línea
                </p>

                <button
                  className="product-button"
                  onClick={() => navigate("/pedir")}
                >
                  Pedir ahora
                </button>
              </motion.div>
            ))}
          </div>
        </section>

        {/* CÓMO FUNCIONA */}
        <section className="how-it-works">
          <h2 className="section-title">
            ¿Cómo funciona?
          </h2>

          <div className="steps-grid">
            <div className="step-card">
              <h2>1️⃣</h2>
              <h3>Selecciona</h3>
              <p>Elige tus productos favoritos</p>
            </div>

            <div className="step-card">
              <h2>2️⃣</h2>
              <h3>Confirma</h3>
              <p>Revisa y realiza tu pedido</p>
            </div>

            <div className="step-card">
              <h2>3️⃣</h2>
              <h3>Disfruta</h3>
              <p>Recibe tu comida rápidamente</p>
            </div>
          </div>
        </section>

        {/* CTA FINAL */}
        <section className="cta-section">
          <h2>¿Listo para pedir?</h2>

          <p>
            Descubre nuestros productos y realiza tu
            pedido ahora mismo.
          </p>

          <button
            className="primary-btn"
            onClick={() => navigate("/pedir")}
          >
            Empezar pedido
          </button>
        </section>

      </div>
    </motion.div>
  );
}