import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordStrengthIndicator } from "@/components/PasswordStrengthIndicator";

interface UpdatePasswordFormProps {
  isLoading: boolean;
  onSubmit: (password: string, confirmPassword: string) => Promise<void>;
  onBack: () => void;
}

const UpdatePasswordForm = ({ isLoading, onSubmit, onBack }: UpdatePasswordFormProps) => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await onSubmit(newPassword, confirmPassword);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="new-password" className="text-foreground">
          Nueva Contraseña
        </Label>
        <Input
          id="new-password"
          type="password"
          placeholder="Mínimo 6 caracteres"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="h-12"
          required
        />
        <PasswordStrengthIndicator password={newPassword} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirm-password" className="text-foreground">
          Confirmar Contraseña
        </Label>
        <Input
          id="confirm-password"
          type="password"
          placeholder="Repite la contraseña"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="h-12"
          required
        />
      </div>
      <Button
        type="submit"
        className="w-full h-12 bg-accent hover:bg-accent/90 text-accent-foreground font-bold text-base mt-6"
        disabled={isLoading}
      >
        {isLoading ? "Actualizando..." : "Cambiar Contraseña"}
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

export default UpdatePasswordForm;
