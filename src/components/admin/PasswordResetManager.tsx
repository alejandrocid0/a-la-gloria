import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Search, Mail, Loader2, KeyRound } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  hermandad: string;
}

export const PasswordResetManager = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sendingTo, setSendingTo] = useState<string | null>(null);

  // Buscar usuarios
  const { data: users = [], isLoading } = useQuery({
    queryKey: ["admin-users-search", searchTerm],
    queryFn: async () => {
      if (searchTerm.length < 2) return [];

      const { data, error } = await supabase
        .from("profiles")
        .select("id, name, email, hermandad")
        .or(`name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`)
        .limit(20);

      if (error) throw error;
      return data as UserProfile[];
    },
    enabled: searchTerm.length >= 2,
  });

  const handleSendResetEmail = async (user: UserProfile) => {
    if (!user.email) {
      toast.error("Este usuario no tiene email registrado");
      return;
    }

    setSendingTo(user.id);
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${window.location.origin}/auth?mode=reset`,
      });

      if (error) throw error;

      toast.success(`Email de recuperación enviado a ${user.email}`);
    } catch (error: any) {
      console.error("Error sending reset email:", error);
      toast.error(`Error al enviar email: ${error.message}`);
    } finally {
      setSendingTo(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <KeyRound className="h-5 w-5" />
          Recuperación de Contraseñas
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Busca un usuario por nombre o email y envíale un enlace para restablecer su contraseña.
        </p>

        {/* Buscador */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre o email (mínimo 2 caracteres)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Resultados */}
        {searchTerm.length >= 2 && (
          <div className="border rounded-lg">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No se encontraron usuarios
              </div>
            ) : (
              <ScrollArea className="max-h-[400px]">
                <div className="divide-y">
                  {users.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{user.name}</p>
                        <p className="text-sm text-muted-foreground truncate">
                          {user.email}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {user.hermandad}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleSendResetEmail(user)}
                        disabled={sendingTo === user.id}
                        className="ml-4 flex items-center gap-2"
                      >
                        {sendingTo === user.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Mail className="h-4 w-4" />
                        )}
                        Enviar reset
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>
        )}

        {/* Info adicional */}
        <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground space-y-2">
          <p className="font-medium text-foreground">ℹ️ Información:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>El usuario recibirá un email con un enlace para crear una nueva contraseña</li>
            <li>El enlace es válido por 24 horas</li>
            <li>Por seguridad, las contraseñas no son visibles ni recuperables</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
