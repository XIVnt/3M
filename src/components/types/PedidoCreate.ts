export type PedidoCreate = {
  restauranteId: number;

  servicio: "domicilio" | "recoger";

  metodoPago?: string;

  location?: {
    lat: number;
    lng: number;
  };

  productos: {
    productoId: number;
    cantidad: number;
  }[];
};