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
      reCaptchaKey="6Lf4zvssAAAAAPS6DGEehuXlBN-03XRfdE5gKmP2"
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