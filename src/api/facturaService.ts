import api from "./axios";

/* =========================
   ADMIN - TODAS LAS FACTURAS
========================= */
export const getFacturas = () => {
  return api.get("/facturas");
};

/* =========================
   ADMIN - DETALLE FACTURA
========================= */
export const getFacturaById = (id: number) => {
  return api.get(`/facturas/${id}`);
};

/* =========================
   USUARIO - MIS FACTURAS
========================= */
export const getMisFacturas = () => {
  return api.get("/facturas/mis-facturas");
};