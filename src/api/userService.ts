import api from "./axios";

// =========================
// TIPOS
// =========================

export interface UpdateUserDto {
  userName?: string;
  telefono?: string;
}

export interface RoleDto {
  role: string;
}

export interface AssignEmployeeDto {
  userId: string;
  restauranteId: number;
}

export interface ResetPasswordDto {
  newPassword: string;
}

export interface UserApi {
  id: string;
  email: string;
  userName?: string;
  telefono?: string;
  roles?: string[];
  isLocked?: boolean;
}

// =========================
// LISTAR USUARIOS (PAGINADO)
// =========================
export const getAllUsers = (role?: string, page = 1, pageSize = 20) => {
  return api.get<UserApi[]>("/usuarios", {
    params: {
      role,
      page,
      pageSize,
    },
  });
};

// =========================
// SEARCH USERS (PAGINADO)
// =========================
export const searchUsers = (q: string, page = 1, pageSize = 20) => {
  return api.get<UserApi[]>("/usuarios/search", {
    params: {
      q,
      page,
      pageSize,
    },
  });
};

// =========================
// UPDATE USER
// =========================
export const updateUser = (id: string, data: UpdateUserDto) => {
  return api.put(`/usuarios/${encodeURIComponent(id)}`, data);
};

// =========================
// DELETE USER
// =========================
export const deleteUser = (id: string) => {
  return api.delete(`/usuarios/${encodeURIComponent(id)}`);
};

// =========================
// BLOCK / UNBLOCK
// =========================
export const blockUser = (id: string) => {
  return api.post(`/usuarios/${encodeURIComponent(id)}/block`);
};

export const unblockUser = (id: string) => {
  return api.post(`/usuarios/${encodeURIComponent(id)}/unblock`);
};

// =========================
// RESET PASSWORD (ADMIN)
// =========================
export interface ResetPasswordAdminDto {
  email: string;
  token: string;
  newPassword: string;
}

export const resetPassword = (data: ResetPasswordAdminDto) => {
  return api.post("/usuarios/reset-password", data);
};

// =========================
// ROLES
// =========================
export const setUserRole = (id: string, role: string) => {
  return api.post(`/usuarios/${encodeURIComponent(id)}/role`, {
    role,
  } as RoleDto);
};

export const removeUserRole = (id: string, role: string) => {
  return api.post(`/usuarios/${encodeURIComponent(id)}/remove-role`, {
    role,
  } as RoleDto);
};

// =========================
// AUTH SESSIONS
// =========================
export const logout = (token: string) => {
  return api.post("/usuarios/logout", { token });
};

// =========================
// OTP
// =========================
export const sendOtp = (purpose: number) => {
  return api.post("/usuarios/send-otp", { purpose });
};

export const verifyOtp = (code: string, purpose: number) => {
  return api.post("/usuarios/verify-otp", { code, purpose });
};

// =========================
// PASSWORD RESET FLOW
// =========================
export const forgotPassword = (email: string) => {
  return api.post("/usuarios/forgot-password", { email });
};

export const resetPasswordOtp = (
  email: string,
  code: string,
  newPassword: string
) => {
  return api.post("/usuarios/reset-password-otp", {
    email,
    code,
    newPassword,
  });
};

export const changePassword = (
  currentPassword: string,
  newPassword: string
) => {
  return api.post("/usuarios/change-password", {
    currentPassword,
    newPassword,
  });
};

// =========================
// REGISTER VERIFICATION
// =========================
export const verifyRegister = (email: string, code: string) => {
  return api.post("/usuarios/verify-register", {
    email,
    code,
  });
};

// =========================
// PHONE
// =========================
export const changePhone = (telefono: string) => {
  return api.put("/usuarios/change-phone", {
    telefono,
  });
};

// =========================
// PROFILE
// =========================
export const getMyProfile = () => {
  return api.get("/usuarios/me");
};

export const assignEmployee = (
  userId: string,
  restauranteId: number
) => {
  return api.post("/usuarios/assign-employee", {
    userId,
    restauranteId,
  } as AssignEmployeeDto);
};