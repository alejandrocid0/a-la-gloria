import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { HermandadCombobox } from "@/components/HermandadCombobox";
import { PasswordStrengthIndicator } from "@/components/PasswordStrengthIndicator";

interface RegisterFormProps {
  isLoading: boolean;
  onSubmit: (name: string, hermandad: string, email: string, password: string) => Promise<void>;
}

const RegisterForm = ({ isLoading, onSubmit }: RegisterFormProps) => {
  const [name, setName] = useState("");
  const [hermandad, setHermandad] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await onSubmit(name, hermandad, email, password);
    // Resetear estado tras envío exitoso
    setHermandad("");
    setPassword("");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="register-name">Nombre</Label>
        <Input
          id="register-name"
          type="text"
          placeholder="Tu nombre"
          required
          className="h-12"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="register-hermandad">Hermandad favorita</Label>
        <HermandadCombobox value={hermandad} onValueChange={setHermandad} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="register-email">Email</Label>
        <Input
          id="register-email"
          type="email"
          placeholder="tu@email.com"
          required
          className="h-12"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="register-password">Contraseña</Label>
        <Input
          id="register-password"
          type="password"
          placeholder="••••••••"
          required
          minLength={6}
          className="h-12"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <PasswordStrengthIndicator password={password} />
      </div>
      <Button
        type="submit"
        className="w-full h-12 bg-accent hover:bg-accent/90 text-accent-foreground font-bold text-base mt-6"
        disabled={isLoading}
      >
        {isLoading ? "Cargando..." : "Crear Cuenta"}
      </Button>
    </form>
  );
};

export default RegisterForm;
