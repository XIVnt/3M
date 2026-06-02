import { useEffect, useState } from "react";
import { motion } from "framer-motion";


import {
  getProductosByRestaurante,
  createProducto,
  deleteProducto,
  updatePrecio,
} from "../api/productService";

import {
  getAllUsers,
  searchUsers,
  deleteUser,
  updateUser,
  setUserRole,
  removeUserRole,
  blockUser,
  unblockUser,
  assignEmployee,
} from "../api/userService";

import {
  createRestaurante,
  updateRestaurante,
  deleteRestaurante,
  toggleRestauranteActivo,
  getRestaurantes,
} from "../api/restaurantService";

import {
  getFacturas,
  getFacturaById,
} from "../api/facturaService";

import {
  getMetodosPago,
  toggleMetodoPago,
} from "../api/pedidosService";

import { useToast } from "../context/ToastContext";

import RestaurantCarousel from "../components/RestaurantCarousel";

import type { ProductApi } from "../api/productService";
import type { UserApi } from "../api/userService";
import type { Restaurante } from "../components/types/Restaurant";
import type { MetodoPagoDTO } from "../components/types/MetodoPagoDto";

// ===================== FACTURA TYPE =====================
type Factura = {
  id: number;
  total?: number;
  fecha?: string;
  estado?: string;
  usuarioEmail?: string;
};

const MetodoPagoLabel: Record<number , string> = {
  0: "Efectivo",
  1: "Deuna API",
};

// ===================== COMPONENT =====================
export default function AdminPage() {

  // ===================== PRODUCTS =====================
  const [products, setProducts] = useState<ProductApi[]>([]);
  const [loading, setLoading] = useState(false);

  // ===================== FACTURAS =====================
  const [facturas, setFacturas] = useState<Factura[]>([]);
  const [loadingFacturas, setLoadingFacturas] = useState(false);
  const [facturaSearch, setFacturaSearch] = useState("");

  // ===================== USERS =====================
  const [users, setUsers] = useState<UserApi[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const { showToast } = useToast();

  const [search, setSearch] = useState("");

  const [view, setView] = useState<
    | "list"
    | "create"
    | "users"
    | "facturas"
    | "restaurantes"
    | "createRestaurante"
    | "metodosPago"
    | "editUser"
  >("list");

  const [actionLoading, setActionLoading] = useState(false);

  // ===================== RESTAURANTES =====================
  const [restaurantes, setRestaurantes] = useState<Restaurante[]>([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState<number | null>(null);

  const [restNombre, setRestNombre] = useState("");
  const [restEmail, setRestEmail] = useState("");
  const [restDireccion, setRestDireccion] = useState("");
  const [restLat, setRestLat] = useState("");
  const [restLng, setRestLng] = useState("");

  const [editingRestaurante, setEditingRestaurante] =
    useState<Restaurante | null>(null);

  // ===================== PRODUCT EDIT MENU =====================
  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  const [editingProductPrice, setEditingProductPrice] = useState("");

  // ===================== USER ROLE RESTAURANT =====================
  const [selectedEmployeeRestaurant, setSelectedEmployeeRestaurant] =
    useState<Record<string, number | "">>({});

  // ===================== PRODUCT FORM =====================
  const [nombre, setNombre] = useState("");
  const [precio, setPrecio] = useState("");
  const [tipo, setTipo] = useState("");
  const [image, setImage] = useState<File | null>(null);

  const [metodosPago, setMetodosPago] = useState<MetodoPagoDTO[]>([]);

  // ===================== PAY METHOT =====================
  const [loadingMetodosPago, setLoadingMetodosPago] = useState(false);

  const allowedRoles = ["administrador", "empleado"];

  // ===================== FILTER =====================
  const [userFilter] = useState<
    "all" | "administrador" | "empleado" | "cliente"
  >("all");


  // ===================== EDIT USER =====================
  const [editingUser, setEditingUser] = useState<UserApi | null>(null);

  const [, setEditUserName] = useState("");
  const [editTelefono, setEditTelefono] = useState("");
  const [editPassword, setEditPassword] = useState("");


  // ===================== INIT =====================
  useEffect(() => {
    loadRestaurantes();
  }, []);

  useEffect(() => {
    if (selectedRestaurant !== null) {
      loadProducts();
    }
  }, [selectedRestaurant]);

  useEffect(() => {
    if (view === "users") {
      loadUsers();
    }
  }, [view]);

  useEffect(() => {
    if (view === "facturas") {
      loadFacturas();
    }
  }, [view]);

  useEffect(() => {
    if (view !== "users") return;

    const t = setTimeout(() => {
      if (search.trim()) {
        handleSearchUsers(search);
      } else {
        loadUsers();
      }
    }, 400);

    return () => clearTimeout(t);
  }, [search, view]);

  useEffect(() => {
    if (view !== "facturas") return;

    const t = setTimeout(() => {
      if (facturaSearch.trim()) {
        handleSearchFactura();
      } else {
        loadFacturas();
      }
    }, 400);

    return () => clearTimeout(t);
  }, [facturaSearch, view]);

  useEffect(() => {
    if (view === "metodosPago") {
      loadMetodosPago();
    }
  }, [view]);

  // ===================== HELPERS =====================
  const parsePrice = (value: string) =>
    Number(value.replace(",", "."));

  const isValidPrice = (value: string) => {
    const num = parsePrice(value);
    return !isNaN(num) && num >= 0;
  };

  const normalizeRoles = (roles?: string[]) =>
    (roles ?? []).map((r) => r.toLowerCase());

  const filteredUsers = users.filter((u) => {
    if (userFilter === "all") return true;

    const roles = normalizeRoles(u.roles);

    if (userFilter === "cliente") {
      return roles.length === 0;
    }

    return roles.includes(userFilter);
  });

  // ===================== RESTAURANTES =====================
  const loadRestaurantes = async () => {
    try {
      const res = await getRestaurantes();
      setRestaurantes(res.data);
    } catch (err) {
      console.error(err);
      showToast("❌ Error cargando restaurantes", "error");
    }
  };

  // ===================== FACTURAS =====================
  const loadFacturas = async () => {
    setLoadingFacturas(true);

    try {
      const res = await getFacturas();
      setFacturas(res.data ?? []);
    } catch (err) {
      console.error(err);
      showToast("❌ Error cargando facturas", "error");
    } finally {
      setLoadingFacturas(false);
    }
  };

  const handleSearchFactura = async () => {
    if (!facturaSearch.trim()) {
      loadFacturas();
      return;
    }

    setLoadingFacturas(true);

    try {
      const res = await getFacturaById(Number(facturaSearch));

      setFacturas(res.data ? [res.data] : []);
    } catch (err) {
      console.error(err);
      setFacturas([]);
      showToast("❌ Factura no encontrada", "error");
    } finally {
      setLoadingFacturas(false);
    }
  };

  // ===================== LOAD PAY METHOTS =====================

  const loadMetodosPago = async () => {
    setLoadingMetodosPago(true);

    try {
      const res = await getMetodosPago();
      setMetodosPago(res.data ?? []);
    } catch (err) {
      console.error(err);
      showToast("❌ Error cargando métodos de pago", "error");
    } finally {
      setLoadingMetodosPago(false);
    }
  };

  // ===================== CREATE RESTAURANTE =====================
  const handleCreateRestaurante = async () => {
    if (!restNombre || !restEmail || !restDireccion) {
      showToast("❌ Faltan datos", "error");
      return;
    }

    if (!restLat || !restLng) {
      showToast("❌ Coordenadas inválidas", "error");
      return;
    }

    await createRestaurante({
      nombre: restNombre,
      email: restEmail,
      lat: Number(restLat),
      lng: Number(restLng),
      direccion: restDireccion,
    });

    await loadRestaurantes();

    showToast("✅ Restaurante creado", "success");

    setRestNombre("");
    setRestEmail("");
    setRestLat("");
    setRestLng("");
    setRestDireccion("");
  };

  // ===================== PRODUCTS =====================
  const loadProducts = async () => {
    if (selectedRestaurant === null) {
      setProducts([]);
      return;
    }

    setLoading(true);

    try {
      const res = await getProductosByRestaurante(selectedRestaurant);
      setProducts(res.data);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!selectedRestaurant) {
      showToast("Selecciona restaurante", "info");
      return;
    }

    if (!nombre.trim() || !tipo.trim()) {
      showToast("❌ Rellena todos los campos", "error");
      return;
    }

    if (!isValidPrice(precio)) {
      showToast("❌ Precio inválido", "error");
      return;
    }

    const formData = new FormData();

    formData.append("nombre", nombre);
    formData.append("precio", String(parsePrice(precio)));
    formData.append("tipo", tipo);
    formData.append("restauranteId", String(selectedRestaurant));

    if (image) {
      formData.append("imagen", image);
    }

    try {
      setActionLoading(true);

      await createProducto(formData);

      setNombre("");
      setPrecio("");
      setTipo("");
      setImage(null);

      await loadProducts();

      showToast("✅ Producto creado", "success");

      setView("list");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    await deleteProducto(id);

    await loadProducts();

    showToast("🗑 Producto eliminado", "info");
  };

  const openEditProductMenu = (product: ProductApi) => {
    setEditingProductId(product.id);
    setEditingProductPrice(String(product.precio));
  };

  const closeEditProductMenu = () => {
    setEditingProductId(null);
    setEditingProductPrice("");
  };

  const handleConfirmProductPrice = async (id: number) => {
    if (!isValidPrice(editingProductPrice)) {
      showToast("❌ Precio inválido", "error");
      return;
    }

    await updatePrecio(id, parsePrice(editingProductPrice));

    await loadProducts();

    closeEditProductMenu();

    showToast("✏️ Precio actualizado", "info");
  };

  // ===================== USERS =====================
  const loadUsers = async () => {
    setLoadingUsers(true);

    try {
      const res = await getAllUsers();
      setUsers(res.data ?? []);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleSearchUsers = async (q: string) => {
    setLoadingUsers(true);

    try {
      const res = await searchUsers(q);
      setUsers(res.data);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleDeleteUser = async (id: string) => {
    await deleteUser(id);

    await loadUsers();

    showToast("🗑 Usuario eliminado", "info");
  };

  const handleBlockUser = async (id: string) => {
    await blockUser(id);

    setUsers(prev =>
      prev.map(u =>
        u.id === id ? { ...u, isLocked: true } : u
      )
    );

    showToast("🚫 Usuario bloqueado", "info");
  };

  const handleUnblockUser = async (id: string) => {
    await unblockUser(id);

    setUsers(prev =>
      prev.map(u =>
        u.id === id ? { ...u, isLocked: false } : u
      )
    );

    showToast("✅ Usuario desbloqueado", "info");
  };

  const handleRoleChange = async (id: string, role: string) => {
    if (!allowedRoles.includes(role)) {
      showToast("❌ Rol no permitido", "error");
      return;
    }

    const user = users.find((u) => u.id === id);
    const roles = normalizeRoles(user?.roles);

    if (roles.includes(role)) {
      showToast("⚠️ Ya tiene este rol", "info");
      return;
    }

    if (role === "empleado") {
      const restaurantId = selectedEmployeeRestaurant[id];

      if (!restaurantId) {
        showToast("❌ Selecciona un restaurante", "error");
        return;
      }

      await assignEmployee(id, Number(restaurantId));
    } else {
      await setUserRole(id, role);
    }

    await loadUsers();

    showToast("👤 Rol asignado", "info");
  };

  const handleRemoveRole = async (id: string, role: string) => {
    await removeUserRole(id, role);

    await loadUsers();

    showToast("🧹 Rol eliminado", "info");
  };

  // ===================== RESTAURANTES ACTIONS =====================
  const resetRestForm = () => {
    setRestNombre("");
    setRestDireccion("");
    setRestLat("");
    setRestLng("");
    setEditingRestaurante(null);
  };

  const handleDeleteRestaurante = async (id: number) => {
    await deleteRestaurante(id);

    await loadRestaurantes();

    showToast("🗑 Restaurante eliminado", "info");
  };

  const handleToggleRestaurante = async (id: number) => {
    await toggleRestauranteActivo(id);

    await loadRestaurantes();

    showToast("🔄 Estado actualizado", "info");
  };

  const handleUpdateRestaurante = async (id: number) => {
    if (!restNombre || !restDireccion || !restLat || !restLng) {
      showToast("❌ Faltan datos");
      return;
    }

    await updateRestaurante(id, {
      nombre: restNombre,
      direccion: restDireccion,
      lat: Number(restLat),
      lng: Number(restLng),
    });

    await loadRestaurantes();

    showToast("✏️ Restaurante actualizado");

    resetRestForm();

    setView("createRestaurante");
  };

  // ===================== EDIT USER =====================
  const openEditUser = (user: UserApi) => {
    setEditingUser(user);
    setEditUserName(user.userName ?? "");
    setEditTelefono(user.telefono ?? "");
    setView("editUser");
  };

  const goBackToUsers = () => {
    setView("users");
    setEditingUser(null);
    setEditUserName("");
    setEditTelefono("");
  };

  const handleUpdateUser = async () => {
    
    try {
      if (!editingUser?.userName) {
        showToast("Usuario inválido", "error");
        return;
      }

      await updateUser(editingUser.userName, {
        telefono: editTelefono,
        password: editPassword,
      });

      showToast("✅ Usuario actualizado", "success");

      await loadUsers();

      goBackToUsers();
    } catch (err) {
      console.error(err);
      showToast("❌ Error actualizando usuario", "error");
    }
  };

  // ===================== UI =====================
  return (
     <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.25 }}
    >

    <div className="admin-layout">
      <aside className="admin-sidebar">
        <h2 className="admin-title">Admin</h2>

        <RestaurantCarousel
          restaurantes={restaurantes}
          selected={selectedRestaurant}
          onSelect={setSelectedRestaurant}
          onToggle={handleToggleRestaurante}
          onDelete={handleDeleteRestaurante}
        />

        <button
          className={`admin-nav-btn ${view === "list" ? "active" : ""}`}
          onClick={() => setView("list")}
        >
          📦 Productos
        </button>

        <button
          className={`admin-nav-btn ${view === "create" ? "active" : ""}`}
          onClick={() => setView("create")}
        >
          ➕ Crear Producto
        </button>

        <button
          className={`admin-nav-btn ${view === "facturas" ? "active" : ""}`}
          onClick={() => setView("facturas")}
        >
          🧾 Facturas
        </button>

        <button
          className={`admin-nav-btn ${view === "users" ? "active" : ""}`}
          onClick={() => setView("users")}
        >
          👥 Gestior de Usuarios
        </button>

        <button
          className={`admin-nav-btn ${view === "createRestaurante" ? "active" : ""
            }`}
          onClick={() => {
            setEditingRestaurante(null);
            setView("createRestaurante");
          }}
        >
          🏪 Crear Restaurantes
        </button>
        <button
          className={`admin-nav-btn ${
            view === "metodosPago" ? "active" : ""
          }`}
          onClick={() => setView("metodosPago")}
        >
          💳 Métodos de Pago
        </button>
      </aside>

      <main className="admin-content">

        {/* ===================== PRODUCTS ===================== */}
        {view === "list" && (
          <div className="admin-card">
            <h2>Productos</h2>

            {loading && <p className="muted">Cargando...</p>}

            <div className="product-list">
              {products.map((p, index) => (
                <div
                  key={p.id ? String(p.id) : `product-${index}`}
                  className="product-item"
                >
                  <div>
                    <b>{p.nombre}</b>

                    <p className="muted">
                      {p.tipo} · {p.precio}$
                    </p>

                    {editingProductId === p.id && (
                      <div
                        style={{
                          marginTop: "10px",
                          display: "flex",
                          flexDirection: "column",
                          gap: "10px",
                        }}
                      >
                        <input
                          className="input"
                          value={editingProductPrice}
                          onChange={(e) =>
                            setEditingProductPrice(e.target.value)
                          }
                          placeholder="Nuevo precio"
                        />

                        <div
                          style={{
                            display: "flex",
                            gap: "10px",
                          }}
                        >
                          <button
                            className="icon-btn"
                            onClick={closeEditProductMenu}
                          >
                            ↩ Volver
                          </button>

                          <button
                            className="primary-btn"
                            onClick={() =>
                              handleConfirmProductPrice(p.id)
                            }
                          >
                            ✅ Confirmar
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="actions">
                    <button
                      className="icon-btn"
                      onClick={() => openEditProductMenu(p)}
                    >
                      ✏️
                    </button>

                    <button
                      className="icon-btn danger"
                      onClick={() => handleDelete(p.id)}
                    >
                      🗑
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ===================== CREATE PRODUCT ===================== */}
        {view === "create" && (
          <div className="admin-card">
            <h2>Crear producto</h2>

            <div className="form">
              <input
                className="input"
                placeholder="Nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
              />

              <input
                className="input"
                placeholder="Precio"
                value={precio}
                onChange={(e) => setPrecio(e.target.value)}
              />

              <input
                className="input"
                placeholder="Tipo"
                value={tipo}
                onChange={(e) => setTipo(e.target.value)}
              />

              <input
                className="input"
                type="file"
                onChange={(e) =>
                  setImage(e.target.files?.[0] || null)
                }
              />

              <button
                className="primary-btn"
                onClick={handleCreate}
                disabled={actionLoading}
              >
                {actionLoading
                  ? "Creando..."
                  : "Crear producto"}
              </button>
            </div>
          </div>
        )}

        {/* ===================== FACTURAS ===================== */}
        {view === "facturas" && (
          <div className="admin-card">
            <h2>Facturas</h2>

            <input
              className="input"
              placeholder="Buscar factura por ID..."
              value={facturaSearch}
              onChange={(e) => setFacturaSearch(e.target.value)}
            />

            {loadingFacturas && (
              <p className="muted">Cargando facturas...</p>
            )}

            <div className="product-list">
              {facturas.map((f, index) => (
                <div
                  key={f.id ? String(f.id) : `factura-${index}`}
                  className="product-item"
                >
                  <div>
                    <b>Factura #{f.id}</b>

                    <p className="muted">
                      Total: {f.total ?? 0}$
                    </p>

                    {f.usuarioEmail && (
                      <p className="muted">
                        Usuario: {f.usuarioEmail}
                      </p>
                    )}

                    {f.estado && (
                      <p className="muted">
                        Estado: {f.estado}
                      </p>
                    )}

                    {f.fecha && (
                      <p className="muted">
                        Fecha:{" "}
                        {new Date(f.fecha).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
              ))}

              {!loadingFacturas && facturas.length === 0 && (
                <p className="muted">
                  No hay facturas disponibles
                </p>
              )}
            </div>
          </div>
        )}

        {/* ===================== USERS ===================== */}
        {view === "users" && (
          <div className="admin-card">
            <h2>Usuarios</h2>

            <input
              className="input"
              placeholder="Buscar usuario..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            {loadingUsers && (
              <p className="muted">Cargando usuarios...</p>
            )}

            <div className="product-list">
              {filteredUsers.map((u) => {
                const roles = normalizeRoles(u.roles);
                const isBlocked = u.isLocked;

                return (
                  <div
                    key={`user-${u.id ?? u.email}`}
                    className="product-item"
                  >
                    <div>
                      <b>{u.email}</b>

                      <p className="muted">
                        Roles:{" "}
                        {roles.length
                          ? roles.join(" | ")
                          : "sin roles"}
                      </p>

                      <select
                        className="input"
                        value={
                          selectedEmployeeRestaurant[u.id] ?? ""
                        }
                        onChange={(e) =>
                          setSelectedEmployeeRestaurant((prev) => ({
                            ...prev,
                            [u.id]: e.target.value
                              ? Number(e.target.value)
                              : "",
                          }))
                        }
                      >
                        <option value="">
                          Seleccionar restaurante (empleado)
                        </option>

                        {restaurantes.map((r) => (
                          <option key={r.id} value={r.id}>
                            {r.nombre}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="actions">
                      <select
                        className="icon-btn"
                        onChange={(e) => {
                          if (!e.target.value) return;

                          handleRoleChange(
                            u.id,
                            e.target.value
                          );

                          e.target.value = "";
                        }}
                        defaultValue=""
                      >
                        <option value="" disabled>
                          👤 Añadir rol
                        </option>

                        {allowedRoles.map((r) => (
                          <option
                            key={`role-${r}`}
                            value={r}
                            disabled={roles.includes(r)}
                          >
                            {r}
                          </option>
                        ))}
                      </select>

                      {roles.map((r) => (
                        <button
                          key={`user-${u.id}-role-${r}`}
                          className="icon-btn"
                          onClick={() =>
                            handleRemoveRole(u.id, r)
                          }
                        >
                          ❌ {r}
                        </button>
                      ))}

                      {!isBlocked ? (
                        <button
                          className="icon-btn"
                          onClick={() =>
                            handleBlockUser(u.id)
                          }
                        >
                          🚫
                        </button>
                      ) : (
                        <button
                          className="icon-btn"
                          onClick={() =>
                            handleUnblockUser(u.id)
                          }
                        >
                          🔓
                        </button>
                      )}

                      <button
                        className="icon-btn danger"
                        onClick={() =>
                          handleDeleteUser(u.id)
                        }
                      >
                        🗑
                      </button>

                      <button
                        className="icon-btn"
                        onClick={() => openEditUser(u)}
                      >
                        ✏️
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ===================== EDIT USER PAGE ===================== */}
        {view === "editUser" && editingUser && (
          <div className="admin-card">
            <h2>Editar usuario</h2>

            <p className="muted">{editingUser.userName}</p>

            <div className="form">
              <input
                className="input"
                placeholder="Password"
                value={editPassword}
                onChange={(e) => setEditPassword(e.target.value)}
              />

              <input
                className="input"
                placeholder="Teléfono"
                value={editTelefono}
                onChange={(e) => setEditTelefono(e.target.value)}
              />

              <button className="primary-btn" onClick={handleUpdateUser}>
                💾 Guardar cambios
              </button>

              <button className="icon-btn" onClick={goBackToUsers}>
                ↩ Volver
              </button>
            </div>
          </div>
        )}

        {/* ===================== RESTAURANTES ===================== */}
        {view === "createRestaurante" && (
          <div className="admin-card">
            <h2>
              {editingRestaurante
                ? "Editar restaurante"
                : "Crear restaurante"}
            </h2>

            <div className="form">
              <input
                className="input"
                placeholder="Nombre"
                value={restNombre}
                onChange={(e) =>
                  setRestNombre(e.target.value)
                }
              />

              <input
                className="input"
                placeholder="Email"
                value={restEmail}
                onChange={(e) =>
                  setRestEmail(e.target.value)
                }
              />

              <input
                className="input"
                placeholder="Dirección"
                value={restDireccion}
                onChange={(e) =>
                  setRestDireccion(e.target.value)
                }
              />

              <input
                className="input"
                placeholder="Latitud"
                value={restLat}
                onChange={(e) =>
                  setRestLat(e.target.value)
                }
              />

              <input
                className="input"
                placeholder="Longitud"
                value={restLng}
                onChange={(e) =>
                  setRestLng(e.target.value)
                }
              />

              <button
                className="primary-btn"
                onClick={() => {
                  if (editingRestaurante) {
                    handleUpdateRestaurante(
                      editingRestaurante.id
                    );
                  } else {
                    handleCreateRestaurante();
                  }
                }}
              >
                {editingRestaurante
                  ? "Actualizar restaurante"
                  : "Crear restaurante"}
              </button>
            </div>
          </div>
        )}
        {/* ===================== METODOS DE PAGO ===================== */}
        {view === "metodosPago" && (
          <div className="admin-card">
            <h2>Métodos de Pago</h2>

            {loadingMetodosPago && (
              <p className="muted">Cargando métodos...</p>
            )}

            <div className="product-list">
              {metodosPago.map((m) => (
                <div key={m.id} className="product-item">
                  <div>
                    <b>{MetodoPagoLabel[m.metodo]}</b>

                    <p className="muted">
                      Estado:{" "}
                      <span style={{ color: m.activo ? "#22c55e" : "#ef4444" }}>
                        {m.activo ? "Activo" : "Desactivado"}
                      </span>
                    </p>
                  </div>

                  <div className="actions">
                    <button
                      className="icon-btn"
                      onClick={async () => {
                        await toggleMetodoPago(m.id);
                        await loadMetodosPago();

                        showToast(
                          m.activo
                            ? "❌ Método desactivado"
                            : "✅ Método activado",
                          "info"
                        );
                      }}
                    >
                      {m.activo ? "🔴" : "🟢"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
    </motion.div>
  );
}