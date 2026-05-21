// services/pedidos.ts

import api from "./axios";

import type { Pedido } from "../components/types/Pedido";
import type { PedidoCreate } from "../components/types/PedidoCreate";
import type { MetodoPagoDTO } from "../components/types/MetodoPagoDto";

/* =====================================================
   CREAR PEDIDO
===================================================== */
export const createPedido = (pedido: PedidoCreate) => {
  return api.post<{ id: number }>(
    "/pedidos",
    pedido
  );
};

/* =====================================================
   LISTADOS
===================================================== */

// Todos los pedidos (admin / empleado)
export const getPedidos = (
  page = 1,
  pageSize = 20
) => {
  return api.get<Pedido[]>(
    `/pedidos?page=${page}&pageSize=${pageSize}`
  );
};

// Mis pedidos (cliente)
export const getMisPedidos = (
  page = 1,
  pageSize = 20
) => {
  return api.get<Pedido[]>(
    `/pedidos/mis-pedidos?page=${page}&pageSize=${pageSize}`
  );
};

// detalle pedido
export const getPedidoById = (id: number) => {
  return api.get<Pedido>(`/pedidos/${id}`);
};

/* =====================================================
   ESTADOS DE PEDIDO
===================================================== */

export const setPedidoPreparado = (id: number) => {
  return api.put(`/pedidos/${id}/preparado`);
};

export const setPedidoEntregado = (id: number) => {
  return api.put(`/pedidos/${id}/entregado`);
};

/* =====================================================
   CANCELACIÓN
===================================================== */

export const cancelarPedido = (id: number) => {
  return api.delete<{ refund: number; fee: number }>(
    `/pedidos/${id}`
  );
};

/* =====================================================
   PAGO
===================================================== */

export const marcarPagoCompletado = (id: number) => {
  return api.put<{
    estadoPago: number;
    pagado: boolean;
    fechaPago: string;
  }>(`/pedidos/${id}/pago`);
};

/* alias opcional */
export const toggleEstadoPago = marcarPagoCompletado;

/* =====================================================
   MÉTODOS DE PAGO
===================================================== */

export const getMetodosPago = () => {
  return api.get<MetodoPagoDTO[]>("/pedidos/metodos-pago");
};

export const toggleMetodoPago = (id: number) => {
  return api.put(`/pedidos/metodos-pago/${id}/toggle`);
};