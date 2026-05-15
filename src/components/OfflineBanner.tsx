import { WifiOff } from "lucide-react";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";

/**
 * OfflineBanner — banner sticky superior que aparece solo cuando no hay conexión.
 * A la Gloria necesita internet para funcionar; este aviso evita errores feos
 * y cumple con las buenas prácticas de Google Play.
 */
const OfflineBanner = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="fixed top-0 left-0 right-0 z-50 bg-destructive text-destructive-foreground px-4 py-2 shadow-md"
    >
      <div className="flex items-center justify-center gap-2 text-sm font-medium">
        <WifiOff className="h-4 w-4 shrink-0" aria-hidden="true" />
        <span>Sin conexión. A la Gloria necesita internet para funcionar.</span>
      </div>
    </div>
  );
};

export default OfflineBanner;
