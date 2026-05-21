export type Restaurante = {
  id: number;
  nombre: string;
  email?: string;
  lat: number;
  lng: number;
  direccion: string;
  activo: boolean;
};