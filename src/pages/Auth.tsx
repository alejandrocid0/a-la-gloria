import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import logo from "@/assets/logo.png";

// Lista de hermandades de Sevilla (77 hermandades ordenadas alfabéticamente)
const HERMANDADES = [
  "Bendición y Esperanza",
  "Cristo de Burgos",
  "Divino Perdón de Alcosa",
  "Dulce Nombre (Bellavista)",
  "El Amor",
  "El Baratillo",
  "El Buen Fin",
  "El Cachorro",
  "El Calvario",
  "El Carmen Doloroso",
  "El Cerro",
  "El Dulce Nombre",
  "El Museo",
  "El Santo Entierro",
  "El Silencio",
  "El Sol",
  "El Valle",
  "Esperanza de Triana",
  "Gran Poder",
  "Jesús Despojado",
  "La Amargura",
  "La Borriquita",
  "La Candelaria",
  "La Carretería",
  "La Cena",
  "La Corona",
  "La Espiga",
  "La Estrella",
  "La Exaltación",
  "La Hiniesta",
  "La Lanzada",
  "La Macarena",
  "La Milagrosa",
  "La Misión",
  "La Mortaja",
  "La O",
  "La Paz",
  "La Quinta Angustia",
  "La Resurrección",
  "La Sed",
  "La Trinidad",
  "Las Aguas",
  "Las Cigarreras",
  "Las Maravillas",
  "Las Penas",
  "Las Siete Palabras",
  "Los Desamparados de Santo Ángel",
  "Los Estudiantes",
  "Los Gitanos",
  "Los Javieres",
  "Los Negritos",
  "Los Panaderos",
  "Los Servitas",
  "Montesión",
  "Montserrat",
  "Padre Pío",
  "Pasión",
  "Pasión y Muerte",
  "Paz y Misericordia",
  "Pino Montano",
  "Redención",
  "San Benito",
  "San Bernardo",
  "San Esteban",
  "San Gonzalo",
  "San Isidoro",
  "San Jerónimo",
  "San José Obrero",
  "San Pablo",
  "San Roque",
  "Santa Cruz",
  "Santa Genoveva",
  "Santa Marta",
  "Soledad de San Buenaventura",
  "Soledad de San Lorenzo",
  "Torreblanca",
  "Vera Cruz",
];

/**
 * ESTRUCTURA DE BASE DE DATOS NECESARIA:
 * 
 * 1. Tabla: auth.users (gestionada por Lovable Cloud)
 *    - id: uuid (primary key)
 *    - email: string
 *    - encrypted_password: string
 *    - created_at: timestamp
 * 
 * 2. Tabla: public.profiles (crear con migración)
 *    - id: uuid (primary key, foreign key a auth.users.id)
 *    - name: string (nombre del usuario)
 *    - hermandad: string (hermandad seleccionada)
 *    - total_points: integer (default: 0)
 *    - games_played: integer (default: 0)
 *    - best_score: integer (default: 0)
 *    - current_streak: integer (default: 0)
 *    - last_game_date: date (para controlar "una partida por día")
 *    - created_at: timestamp
 *    - updated_at: timestamp
 * 
 * 3. Trigger: handle_new_user() 
 *    - Se ejecuta automáticamente al crear un usuario en auth.users
 *    - Crea el perfil en public.profiles con los datos del registro
 * 
 * 4. RLS Policies necesarias:
 *    - Users can read their own profile: (auth.uid() = id)
 *    - Users can update their own profile: (auth.uid() = id)
 *    - Admins can read all profiles (para ranking)
 */

const Auth = () => {
  const [isLoading, setIsLoading] = useState(false);

  // TODO: Implementar validación con Zod
  // Ejemplo de schema:
  // const registerSchema = z.object({
  //   name: z.string().min(2, "El nombre debe tener al menos 2 caracteres").max(50),
  //   hermandad: z.string().min(1, "Debes seleccionar una hermandad"),
  //   email: z.string().email("Email inválido"),
  //   password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres")
  // });

  // TODO: conectar a Lovable Cloud Auth (Supabase) aquí
  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    
    // TODO: Implementar login con Lovable Cloud
    // const { data, error } = await supabase.auth.signInWithPassword({
    //   email: formData.email,
    //   password: formData.password,
    // });
    // 
    // if (error) {
    //   // Manejar errores (email no registrado, contraseña incorrecta, etc.)
    //   console.error("Error en login:", error.message);
    //   return;
    // }
    // 
    // // Redirigir a home después del login exitoso
    // navigate("/");
    
    // Simulación de login
    setTimeout(() => {
      setIsLoading(false);
      console.log("Login exitoso");
    }, 1000);
  };

  // TODO: conectar a Lovable Cloud Auth (Supabase) para registro
  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    
    // TODO: Implementar registro con Lovable Cloud
    // 1. Validar datos con Zod
    // const validatedData = registerSchema.parse(formData);
    // 
    // 2. Crear usuario en Auth
    // const { data: authData, error: authError } = await supabase.auth.signUp({
    //   email: validatedData.email,
    //   password: validatedData.password,
    //   options: {
    //     emailRedirectTo: `${window.location.origin}/`,
    //     data: {
    //       name: validatedData.name,
    //       hermandad: validatedData.hermandad,
    //     }
    //   }
    // });
    // 
    // if (authError) {
    //   // Manejar errores (email ya registrado, contraseña débil, etc.)
    //   console.error("Error en registro:", authError.message);
    //   return;
    // }
    // 
    // 3. El trigger handle_new_user() creará automáticamente el perfil en public.profiles
    // 
    // 4. Mostrar mensaje de éxito y redirigir
    // toast.success("¡Cuenta creada! Revisa tu email para confirmar.");
    // navigate("/");
    
    // Simulación de registro
    setTimeout(() => {
      setIsLoading(false);
      console.log("Registro exitoso");
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary to-primary/80 flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md space-y-8">
        {/* Logo/Header */}
        <div className="text-center space-y-4">
          <img 
            src={logo} 
            alt="A la Gloria" 
            className="w-64 mx-auto drop-shadow-2xl"
          />
          <p className="text-primary-foreground/90 text-sm font-medium">
            Trivia de Semana Santa
          </p>
        </div>

        {/* Auth Card */}
        <Card className="p-6 border-accent/20 shadow-2xl">
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Iniciar Sesión</TabsTrigger>
              <TabsTrigger value="register">Registrarse</TabsTrigger>
            </TabsList>

            {/* Login Form */}
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="tu@email.com"
                    required
                    className="h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Contraseña</Label>
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="••••••••"
                    required
                    className="h-12"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full h-12 bg-accent hover:bg-accent/90 text-accent-foreground font-bold text-base mt-6"
                  disabled={isLoading}
                >
                  {isLoading ? "Cargando..." : "Iniciar Sesión"}
                </Button>
              </form>
            </TabsContent>

            {/* Register Form */}
            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="register-name">Nombre</Label>
                  <Input
                    id="register-name"
                    type="text"
                    placeholder="Tu nombre"
                    required
                    className="h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-hermandad">Hermandad</Label>
                  <Select required>
                    <SelectTrigger className="h-12" id="register-hermandad">
                      <SelectValue placeholder="Selecciona tu hermandad" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                      {HERMANDADES.map((hermandad) => (
                        <SelectItem key={hermandad} value={hermandad}>
                          {hermandad}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-email">Email</Label>
                  <Input
                    id="register-email"
                    type="email"
                    placeholder="tu@email.com"
                    required
                    className="h-12"
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
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full h-12 bg-accent hover:bg-accent/90 text-accent-foreground font-bold text-base mt-6"
                  disabled={isLoading}
                >
                  {isLoading ? "Cargando..." : "Crear Cuenta"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </Card>

        <p className="text-center text-primary-foreground/70 text-xs">
          Al registrarte, aceptas las condiciones de uso
        </p>
      </div>
    </div>
  );
};

export default Auth;
