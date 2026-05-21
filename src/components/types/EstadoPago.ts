export const EstadoPago = {
  Pendiente: "Pendiente",
  Completado: "Completado",
} as const;

export type EstadoPago =
  (typeof EstadoPago)[keyof typeof EstadoPago];
