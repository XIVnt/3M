import axios from "axios";

const api = axios.create({
  baseURL: "https://localhost:7068/api",
});

// ===================== STATE =====================
let isRefreshing = false;
let refreshPromise: Promise<string> | null = null;
let refreshAttempts = 0;

const MAX_REFRESH_ATTEMPTS = 10;

// ===================== REQUEST =====================
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// ===================== RESPONSE =====================
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalRequest = err.config;
    const status = err.response?.status;

    if (!originalRequest) return Promise.reject(err);

    // ❌ no tocar login
    if (originalRequest.url?.includes("/usuarios/login")) {
      return Promise.reject(err);
    }

    // ❌ solo manejar 401
    if (status !== 401) {
      return Promise.reject(err);
    }

    // 🔥 evitar loop infinito en misma request
    if (originalRequest._retry) {
      return Promise.reject(err);
    }

    originalRequest._retry = true;

    const refreshToken = localStorage.getItem("refreshToken");

    if (!refreshToken) {
      localStorage.clear();
      return Promise.reject(err);
    }

    // ===================== MAX ATTEMPTS CHECK =====================
    if (refreshAttempts >= MAX_REFRESH_ATTEMPTS) {
      localStorage.clear();
      refreshAttempts = 0;
      return Promise.reject(err);
    }

    // ===================== SINGLE REFRESH =====================
    if (!isRefreshing) {
      isRefreshing = true;

      refreshAttempts++;

      refreshPromise = axios
        .post("https://localhost:7068/api/usuarios/refresh-token", {
          token: refreshToken,
        })
        .then((res) => {
          const newToken = res.data.token;
          const newRefreshToken = res.data.refreshToken;

          localStorage.setItem("token", newToken);
          localStorage.setItem("refreshToken", newRefreshToken);

          api.defaults.headers.common.Authorization = `Bearer ${newToken}`;

          return newToken;
        })
        .catch((e) => {
          return Promise.reject(e);
        })
        .finally(() => {
          isRefreshing = false;
          refreshPromise = null;
        });
    }

    // ===================== WAIT FOR REFRESH =====================
    try {
      const newToken = await refreshPromise;

      if (originalRequest.headers) {
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
      }

      return api(originalRequest);
    } catch (e) {
      // 🔥 solo logout si realmente falla refresh
      if (refreshAttempts >= MAX_REFRESH_ATTEMPTS) {
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
      }

      return Promise.reject(e);
    }
  }
);

export default api;