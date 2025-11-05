import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { registerSchema, loginSchema } from "@/lib/validations";
import logo from "@/assets/logo.png";

// Lista de hermandades de Sevilla (77 hermandades ordenadas alfabéticamente)
const HERMANDADES = ["Bendición y Esperanza", "Cristo de Burgos", "Divino Perdón de Alcosa", "Dulce Nombre (Bellavista)", "El Amor", "El Baratillo", "El Buen Fin", "El Cachorro", "El Calvario", "El Carmen Doloroso", "El Cerro", "El Dulce Nombre", "El Museo", "El Santo Entierro", "El Silencio", "El Sol", "El Valle", "Esperanza de Triana", "Gran Poder", "Jesús Despojado", "La Amargura", "La Borriquita", "La Candelaria", "La Carretería", "La Cena", "La Corona", "La Espiga", "La Estrella", "La Exaltación", "La Hiniesta", "La Lanzada", "La Macarena", "La Milagrosa", "La Misión", "La Mortaja", "La O", "La Paz", "La Quinta Angustia", "La Resurrección", "La Sed", "La Trinidad", "Las Aguas", "Las Cigarreras", "Las Maravillas", "Las Penas", "Las Siete Palabras", "Los Desamparados de Santo Ángel", "Los Estudiantes", "Los Gitanos", "Los Javieres", "Los Negritos", "Los Panaderos", "Los Servitas", "Montesión", "Montserrat", "Padre Pío", "Pasión", "Pasión y Muerte", "Paz y Misericordia", "Pino Montano", "Redención", "San Benito", "San Bernardo", "San Esteban", "San Gonzalo", "San Isidoro", "San Jerónimo", "San José Obrero", "San Pablo", "San Roque", "Santa Cruz", "Santa Genoveva", "Santa Marta", "Soledad de San Buenaventura", "Soledad de San Lorenzo", "Torreblanca", "Vera Cruz"];

/**
 * ESTRUCTURA DE BASE DE DATOS NECESARIA:
 * 
 * Ver archivo completo en: src/lib/database.sql
 * 
 * RESUMEN:
 * 1. Tabla: auth.users (gestionada por Lovable Cloud)
 *    - id, email, encrypted_password, raw_user_meta_data, created_at
 * 
 * 2. Tabla: public.profiles (se crea automáticamente con trigger)
 *    - id, name, email, hermandad, total_points, games_played, 
 *      best_score, current_streak, last_game_date
 * 
 * 3. Trigger: handle_new_user() 
 *    - Se ejecuta automáticamente al crear usuario en auth.users
 *    - Extrae name y hermandad de raw_user_meta_data
 *    - Crea perfil en public.profiles
 * 
 * 4. RLS Policies:
 *    - Public profiles viewable by everyone (para ranking)
 *    - Users can update their own profile
 * 
 * FLUJO DE AUTENTICACIÓN:
 * 
 * REGISTRO:
 * 1. Validar datos con Zod (ver src/lib/validations.ts)
 * 2. Llamar a supabase.auth.signUp() con email, password y metadata
 * 3. El trigger handle_new_user() crea el perfil automáticamente
 * 4. Usuario recibe email de confirmación (si está habilitado)
 * 5. Redirigir a home (/)
 * 
 * LOGIN:
 * 1. Validar email y password con Zod
 * 2. Llamar a supabase.auth.signInWithPassword()
 * 3. Si exitoso, actualizar session con useAuth hook
 * 4. Redirigir a home (/)
 * 
 * MANEJO DE ERRORES:
 * - "User already registered" → mostrar en toast
 * - "Invalid login credentials" → mostrar en toast
 * - "Email not confirmed" → mostrar instrucciones
 * - Validación de campos → mostrar debajo de cada input
 * 
 * SEGURIDAD:
 * - NUNCA loguear passwords en console.log
 * - Usar HTTPS en producción
 * - Validar SIEMPRE en frontend Y backend (RLS)
 * - Sanitizar inputs para prevenir SQL injection
 */

const Auth = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, signUp, user } = useAuth();

  // Redirigir si ya está autenticado
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    
    // Validar con Zod
    const validation = loginSchema.safeParse({ email, password });
    if (!validation.success) {
      toast.error(validation.error.errors[0].message);
      setIsLoading(false);
      return;
    }
    
    const { error } = await signIn(email, password);
    
    if (error) {
      // Manejar errores específicos
      if (error.message.includes('Invalid login credentials')) {
        toast.error('Email o contraseña incorrectos');
      } else if (error.message.includes('Email not confirmed')) {
        toast.error('Debes confirmar tu email antes de iniciar sesión');
      } else {
        toast.error('Error al iniciar sesión');
      }
      setIsLoading(false);
      return;
    }
    
    // Login exitoso
    toast.success('¡Bienvenido de vuelta!');
    navigate('/');
  };

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const hermandad = formData.get('hermandad') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    
    // 1. Validar datos con Zod
    const validation = registerSchema.safeParse({ name, hermandad, email, password });
    if (!validation.success) {
      toast.error(validation.error.errors[0].message);
      setIsLoading(false);
      return;
    }
    
    // 2. Crear usuario en Auth con metadata
    const { error } = await signUp(email, password, { name, hermandad });
    
    if (error) {
      // Manejar errores específicos
      if (error.message.includes('User already registered')) {
        toast.error('Este email ya está registrado');
      } else if (error.message.includes('Password should be at least 6 characters')) {
        toast.error('La contraseña debe tener al menos 6 caracteres');
      } else {
        toast.error('Error al crear cuenta');
      }
      setIsLoading(false);
      return;
    }
    
    // 3. El trigger handle_new_user() creará automáticamente el perfil
    toast.success('¡Cuenta creada con éxito!');
    navigate('/');
  };
  return <div className="min-h-screen bg-gradient-to-b from-primary to-primary/80 flex items-center justify-center px-6 py-4">
      <div className="w-full max-w-md space-y-4">
        {/* Logo/Header */}
        <div className="text-center space-y-2">
          <img src={logo} alt="A la Gloria" className="w-52 mx-auto drop-shadow-2xl" />
          <p className="text-primary-foreground/90 text-xs font-medium">El mejor juego de la Semana Santa.</p>
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
                  <Input id="login-email" name="email" type="email" placeholder="tu@email.com" required className="h-12" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Contraseña</Label>
                  <Input id="login-password" name="password" type="password" placeholder="••••••••" required className="h-12" />
                </div>
                <Button type="submit" className="w-full h-12 bg-accent hover:bg-accent/90 text-accent-foreground font-bold text-base mt-6" disabled={isLoading}>
                  {isLoading ? "Cargando..." : "Iniciar Sesión"}
                </Button>
              </form>
            </TabsContent>

            {/* Register Form */}
            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="register-name">Nombre</Label>
                  <Input id="register-name" name="name" type="text" placeholder="Tu nombre" required className="h-12" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-hermandad">Hermandad</Label>
                  <Select name="hermandad" required>
                    <SelectTrigger className="h-12" id="register-hermandad">
                      <SelectValue placeholder="Selecciona tu hermandad" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                      {HERMANDADES.map(hermandad => <SelectItem key={hermandad} value={hermandad}>
                          {hermandad}
                        </SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-email">Email</Label>
                  <Input id="register-email" name="email" type="email" placeholder="tu@email.com" required className="h-12" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-password">Contraseña</Label>
                  <Input id="register-password" name="password" type="password" placeholder="••••••••" required minLength={6} className="h-12" />
                </div>
                <Button type="submit" className="w-full h-12 bg-accent hover:bg-accent/90 text-accent-foreground font-bold text-base mt-6" disabled={isLoading}>
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
    </div>;
};
export default Auth;