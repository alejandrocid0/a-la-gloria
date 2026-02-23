import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface RequestResetFormProps {
  isLoading: boolean;
  onSubmit: (email: string) => Promise<void>;
  onBack: () => void;
}

const RequestResetForm = ({ isLoading, onSubmit, onBack }: RequestResetFormProps) => {
  const [email, setEmail] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await onSubmit(email);
    setEmail("");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="reset-email" className="text-foreground">
          Email de recuperación
        </Label>
        <Input
          id="reset-email"
          type="email"
          placeholder="tu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-12"
          required
        />
      </div>
      <p className="text-sm text-muted-foreground">
        Te enviaremos un enlace para restablecer tu contraseña.
      </p>
      <Button
        type="submit"
        className="w-full h-12 bg-accent hover:bg-accent/90 text-accent-foreground font-bold text-base mt-6"
        disabled={isLoading}
      >
        {isLoading ? "Enviando..." : "Enviar Enlace de Recuperación"}
      </Button>
      <Button
        type="button"
        variant="ghost"
        className="w-full text-muted-foreground"
        onClick={onBack}
      >
        Volver al inicio de sesión
      </Button>
    </form>
  );
};

export default RequestResetForm;
