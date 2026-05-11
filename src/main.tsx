import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Service worker only runs in the web version — Capacitor has its own asset bundling
const isNative = (window as any).Capacitor?.isNativePlatform?.() ?? false;

if (!isNative && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js", { scope: "/" })
      .catch((error) => {
        if (import.meta.env.DEV) {
          console.log("PWA: Service Worker registration failed:", error);
        }
      });
  });
}

createRoot(document.getElementById("root")!).render(<App />);
