import { createContext, useContext, useState, useRef } from "react";
import type { ReactNode } from "react";

type ToastType = "success" | "error" | "info";

type ToastState = {
  message: string | null;
  type: ToastType;
  visible: boolean;
};

type ToastContextType = {
  toast: ToastState;
  showToast: (message: string, type?: ToastType) => void;
};

const ToastContext = createContext<ToastContextType | null>(null);

const ANIMATION_TIME = 800;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastState>({
    message: null,
    type: "info",
    visible: false,
  });

  const timeoutRef = useRef<number | null>(null);

  const showToast = (message: string, type: ToastType = "info") => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    // 1️⃣ montar toast invisible primero
    setToast({
      message,
      type,
      visible: false,
    });

    // 2️⃣ forzar siguiente frame para activar animación
    requestAnimationFrame(() => {
      setToast({
        message,
        type,
        visible: true,
      });
    });

    // 3️⃣ ocultar
    timeoutRef.current = window.setTimeout(() => {
      setToast((prev) => ({
        ...prev,
        visible: false,
      }));

      // 4️⃣ desmontar después de animación
      timeoutRef.current = window.setTimeout(() => {
        setToast({
          message: null,
          type: "info",
          visible: false,
        });
      }, ANIMATION_TIME);
    }, 2000);
  };

  return (
    <ToastContext.Provider value={{ toast, showToast }}>
      {children}

      {toast.message && (
        <div className={`toast toast-${toast.type} ${toast.visible ? "show" : "hide"}`}>
          {toast.message}
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast debe usarse dentro de ToastProvider");
  return context;
}