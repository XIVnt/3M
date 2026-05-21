// components/types/Pedido.ts

export type Pedido = {
  id: number;

  email: string;
  telefono: string;

  total: number;
  restauranteId: number;

  estadoPedido: string;
  estadoPago: string;

  pagado: boolean;

  fecha: string;

  servicio?: string;

  lat?: number;
  lng?: number;

  comentario?: string;

  productos?: {
    id?: number;
    productoId?: number;

    nombre: string;

    cantidad: number;
    precioUnitario: number;
  }[];
};