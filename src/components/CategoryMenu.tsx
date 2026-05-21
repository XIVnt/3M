import { Link } from "react-router-dom";

export default function CategoryMenu() {
  return (
    
      <div className="category-menu">
        <Link to="/">Inicio</Link>
        <Link to="/pedir">Pedir</Link>
        <Link to="/sobre-nosotros">Sobre Nosotros</Link>
        <Link to="/contacto">Contacto</Link>
      </div>
  );
}