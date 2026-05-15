import { useEffect, useState } from "react";

/**
 * useOnlineStatus — devuelve `true` si hay conexión, `false` si está offline.
 * Escucha los eventos `online` / `offline` del navegador.
 *
 * A la Gloria requiere conexión (auth, partidas, ranking, torneos pasan por backend).
 * Este hook permite avisar al usuario y bloquear acciones cuando no hay red,
 * en lugar de mostrar errores genéricos de fetch.
 */
export const useOnlineStatus = (): boolean => {
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== "undefined" ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return isOnline;
};
