// components/shared/toast.js
import { toast, ToastContainer, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Reusable Toast Container Component
export const AppToastContainer = () => (
  <ToastContainer
    position="top-right"
    autoClose={5000}
    hideProgressBar={false}
    newestOnTop={true}
    closeOnClick
    rtl={false}
    pauseOnFocusLoss
    draggable
    pauseOnHover
    theme="light"
    transition={Bounce}
  />
);

// Common reusable toasts
export const toastSuccess = (msg) => toast.success(msg, { transition: Bounce });

export const toastError = (msg) => toast.error(msg, { transition: Bounce });

export const toastInfo = (msg) => toast.info(msg, { transition: Bounce });

export const toastWarn = (msg) => toast.warn(msg, { transition: Bounce });

export const toast = (msg) => toast(msg, { transition: Bounce });
