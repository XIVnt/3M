import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { CartProvider } from "./context/CartContext";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";

import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3";

import App from "./App";

import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <GoogleReCaptchaProvider
      reCaptchaKey="6LfZHwEtAAAAAEnMFCj7-KToTwN_Ga8_4YlRyFgC"
    >
      <AuthProvider>
        <CartProvider>
          <ToastProvider>
            <App />
          </ToastProvider>
        </CartProvider>
      </AuthProvider>
    </GoogleReCaptchaProvider>
  </BrowserRouter>
);