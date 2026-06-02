import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <motion.div
      className="notfound-container"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
    >
      <div className="notfound-card">
        <h1>404</h1>
        <h2>Página no encontrada</h2>

        <p>
          La ruta que intentas acceder no existe o fue movida.
        </p>

        <div className="notfound-actions">
          <button
            className="primary-btn"
            onClick={() => navigate("/")}
          >
            Volver al inicio
          </button>

          <button
            className="secondary-btn"
            onClick={() => navigate("/pedir")}
          >
            Ver menú
          </button>
        </div>
      </div>
    </motion.div>
  );
}