import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { registerSchema, loginSchema, resetPasswordSchema, newPasswordSchema } from "@/lib/validations";
import { supabase } from "@/integrations/supabase/client";
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
  const [selectedHermandad, setSelectedHermandad] = useState<string>('');
  const [resetEmail, setResetEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showResetForm, setShowResetForm] = useState(false);
  const [showResetInLogin, setShowResetInLogin] = useState(false);
  const [isRecoveryMode, setIsRecoveryMode] = useState(false);
  const { signIn, signUp, user, resetPassword, updatePassword } = useAuth();

  // Detectar modo reset desde URL y establecer sesión de recovery
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const mode = searchParams.get('mode');
    
    if (mode === 'reset') {
      setShowResetForm(true);
      setIsRecoveryMode(true);
      
      // Escuchar específicamente el evento PASSWORD_RECOVERY
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          if (event === 'PASSWORD_RECOVERY') {
            // Sesión de recovery establecida correctamente
            console.log('Recovery session established');
          }
        }
      );
      
      return () => subscription.unsubscribe();
    }
  }, []);

  // Redirigir si ya está autenticado (excepto en modo recovery)
  useEffect(() => {
    if (user && !isRecoveryMode && !showResetForm) {
      navigate('/');
    }
  }, [user, navigate, isRecoveryMode, showResetForm]);

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
    
    // Login exitoso - verificar si es admin
    toast.success('¡Bienvenido de vuelta!');
    
    // Verificar rol de admin para ESTE usuario específico
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: adminRole } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .maybeSingle();
      
      if (adminRole) {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } else {
      navigate('/');
    }
  };

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const hermandad = selectedHermandad; // Usar estado local en lugar de FormData
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    
    // 1. Validar datos con Zod
    const validation = registerSchema.safeParse({ name, hermandad, email, password });
    if (!validation.success) {
      const errorMessage = validation.error.errors[0].message;
      console.error('Error de validación:', validation.error.errors);
      toast.error(errorMessage);
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
    setSelectedHermandad(''); // Resetear estado
    
    // Por defecto los nuevos usuarios no son admin, van a home
    navigate('/');
  };

  const handleRequestReset = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    try {
      resetPasswordSchema.parse({ email: resetEmail });
    } catch (error: any) {
      toast.error(error.errors[0]?.message || "Email inválido");
      return;
    }

    setIsLoading(true);
    const { error } = await resetPassword(resetEmail);
    setIsLoading(false);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Email de recuperación enviado. Revisa tu bandeja de entrada.");
      setResetEmail('');
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Verificar que hay sesión de recovery
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast.error("Tu enlace de recuperación ha expirado. Solicita uno nuevo.");
      setShowResetForm(false);
      setShowResetInLogin(true);
      setIsRecoveryMode(false);
      return;
    }
    
    try {
      newPasswordSchema.parse({ password: newPassword, confirmPassword });
    } catch (error: any) {
      toast.error(error.errors[0]?.message || "Las contraseñas no coinciden");
      return;
    }

    setIsLoading(true);
    const { error } = await updatePassword(newPassword);
    setIsLoading(false);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Contraseña actualizada correctamente");
      setShowResetForm(false);
      setIsRecoveryMode(false);
      setNewPassword('');
      setConfirmPassword('');
      // Limpiar el parámetro mode de la URL
      window.history.replaceState({}, '', '/auth');
      navigate('/');
    }
  };

  return <div className="min-h-screen bg-gradient-to-b from-primary to-primary/80 flex items-center justify-center px-6 py-4">
      <div className="w-full max-w-md space-y-4">
        {/* Logo/Header */}
        <div className="text-center space-y-1">
          <img src={logo} alt="A la Gloria" className="w-44 mx-auto drop-shadow-2xl" />
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
              {!showResetInLogin && !showResetForm ? (
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input id="login-email" name="email" type="email" placeholder="tu@email.com" required className="h-12" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Contraseña</Label>
                    <Input id="login-password" name="password" type="password" placeholder="••••••••" required className="h-12" />
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowResetInLogin(true)}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors underline"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                  <Button type="submit" className="w-full h-12 bg-accent hover:bg-accent/90 text-accent-foreground font-bold text-base mt-6" disabled={isLoading}>
                    {isLoading ? "Cargando..." : "Iniciar Sesión"}
                  </Button>
                </form>
              ) : showResetForm ? (
                <form onSubmit={handleUpdatePassword} className="space-y-4">
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
                    onClick={() => {
                      setShowResetForm(false);
                      setShowResetInLogin(false);
                      window.history.replaceState({}, '', '/auth');
                    }}
                  >
                    Volver al inicio de sesión
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleRequestReset} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="reset-email" className="text-foreground">
                      Email de recuperación
                    </Label>
                    <Input
                      id="reset-email"
                      type="email"
                      placeholder="tu@email.com"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
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
                    onClick={() => setShowResetInLogin(false)}
                  >
                    Volver al inicio de sesión
                  </Button>
                </form>
              )}
            </TabsContent>

            {/* Register Form */}
            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="register-name">Nombre</Label>
                  <Input id="register-name" name="name" type="text" placeholder="Tu nombre" required className="h-12" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-hermandad">Hermandad favorita</Label>
                  <Select name="hermandad" value={selectedHermandad} onValueChange={setSelectedHermandad} required>
                    <SelectTrigger className="h-12" id="register-hermandad">
                      <SelectValue placeholder="Selecciona tu hermandad" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px] bg-background z-[100]">
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

        <p className="text-center text-primary-foreground/80 text-xs space-x-1">
          <span>Al registrarte, aceptas los</span>
          <Link to="/terminos" className="underline hover:text-primary-foreground transition-colors">
            términos y condiciones
          </Link>
          <span>y la</span>
          <Link to="/privacidad" className="underline hover:text-primary-foreground transition-colors">
            política de privacidad
          </Link>
        </p>
      </div>
    </div>;
};
export default Auth;