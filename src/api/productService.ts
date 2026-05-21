import api from "./axios";

/* =========================
   TYPES
========================= */

export type ProductApi = {
  id: number;
  nombre: string;
  precio: number;
  tipo: string;
  imagenUrl: string;
  restauranteId: number;
  disponible: boolean;
};

export type MasVendidoApi = {
  productoId: number;
  nombre: string;
  precio: number;
  tipo: string;
  imagenUrl: string;
  restauranteId: number;
  cantidadVendida: number;
};

/* =========================
   GET PRODUCTS
========================= */
export const getMisProductos = () => {
  return api.get<ProductApi[]>("/productos/mis-productos");
};

export const getProductosByRestaurante = (id: number) => {
  return api.get<ProductApi[]>(`/productos/restaurante/${id}`);
};

export const getProductosByTipo = (tipo: string, restauranteId: number) => {
  const token = localStorage.getItem("token"); // o donde guardes tu JWT
  return api.get(`/productos/tipo/${tipo}/restaurante/${restauranteId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const getProducto = (id: number) => {
  return api.get<ProductApi>(`/productos/${id}`);
};

/* =========================
   HOME - MAS VENDIDOS
========================= */

export const getMasVendidos = (top: number = 10) => {
  return api.get<MasVendidoApi[]>(`/productos/mas-vendidos?top=${top}`);
};

/* =========================
   CREATE PRODUCTO
========================= */

export const createProducto = (formData: FormData) => {
  return api.post("/productos", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

/* =========================
   DELETE PRODUCTO
========================= */

export const deleteProducto = (id: number) => {
  return api.delete(`/productos/${id}`);
};

/* =========================
   UPDATE PRECIO
========================= */

export const updatePrecio = (id: number, precio: number) => {
  return api.put(
    `/productos/${id}`,
    { nuevoPrecio: precio },
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
};

/* =========================
   TOGGLE DISPONIBILIDAD
========================= */

export const toggleEstadoProducto = (id: number) => {
  return api.patch(`/productos/${id}/toggle-estado`);
};

/* =========================
   (OPCIONAL FUTURO) SET DISPONIBILIDAD EXPLÍCITA
========================= */

export const setDisponibilidadProducto = (id: number, disponible: boolean) => {
  return api.patch(`/productos/${id}/disponibilidad`, {
    disponible,
  });
};