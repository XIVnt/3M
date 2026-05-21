import api from "./axios";
import type { RestauranteCreateDto } from "../components/types/RestaurantCreateDto";
import type { Restaurante } from "../components/types/Restaurant";
import type { RestauranteUpdateDto } from "../components/types/RestaurantUpdateDto";

/**
 * =========================
 * GET ALL (solo activos)
 * =========================
 */
export const getRestaurantes = () => {
  return api.get<Restaurante[]>("/restaurantes");
};

/**
 * =========================
 * GET BY ID
 * =========================
 */
export const getRestauranteById = (id: number) => {
  return api.get<Restaurante>(`/restaurantes/${id}`);
};

/**
 * =========================
 * CREATE (ADMIN)
 * =========================
 */
export const createRestaurante = (data: RestauranteCreateDto) => {
  return api.post("/restaurantes", data);
};

/**
 * =========================
 * UPDATE (ADMIN) ✅ FIX AQUÍ
 * =========================
 */
export const updateRestaurante = (
  id: number,
  data: RestauranteUpdateDto
) => {
  return api.put(`/restaurantes/${id}`, data);
};

/**
 * =========================
 * DELETE (ADMIN)
 * =========================
 */
export const deleteRestaurante = (id: number) => {
  return api.delete(`/restaurantes/${id}`);
};

/**
 * =========================
 * TOGGLE ACTIVO (ADMIN)
 * =========================
 */
export const toggleRestauranteActivo = (id: number) => {
  return api.put(`/restaurantes/${id}/toggle`);
};