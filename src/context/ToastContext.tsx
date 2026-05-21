import { createContext, useContext, useState, useRef } from "react";
import type { ReactNode } from "react";

type ToastType = "success" | "error" | "info";

type ToastState = {
  message: string | null;
  type: ToastType;
};

type ToastContextType = {
  toast: ToastState;
  showToast: (message: string, type?: ToastType) => void;
};

const ToastContext = createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastState>({
    message: null,
    type: "info",
  });

  const timeoutRef = useRef<number | null>(null);

  const showToast = (message: string, type: ToastType = "info") => {
    setToast({ message, type });

    // 🔥 limpia timeout anterior si existe
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = window.setTimeout(() => {
      setToast({ message: null, type: "info" });
    }, 2000);
  };

  return (
    <ToastContext.Provider value={{ toast, showToast }}>
      {children}

      {/* UI GLOBAL */}
      {toast.message && (
        <div className={`toast toast-${toast.type}`}>
          {toast.message}
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast debe usarse dentro de ToastProvider");
  }
  return context;
}