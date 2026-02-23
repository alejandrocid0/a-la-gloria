import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { registerSchema, loginSchema, resetPasswordSchema, newPasswordSchema } from "@/lib/validations";
import { supabase } from "@/integrations/supabase/client";
import LoginForm from "@/components/auth/LoginForm";
import RegisterForm from "@/components/auth/RegisterForm";
import RequestResetForm from "@/components/auth/RequestResetForm";
import UpdatePasswordForm from "@/components/auth/UpdatePasswordForm";
import logo from "@/assets/logo.png";

type LoginView = 'login' | 'requestReset' | 'updatePassword';

const Auth = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [loginView, setLoginView] = useState<LoginView>('login');
  const [isRecoveryMode, setIsRecoveryMode] = useState(false);
  const { signIn, signUp, user, resetPassword, updatePassword } = useAuth();

  // Detectar modo reset desde URL
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const mode = searchParams.get('mode');

    if (mode === 'reset') {
      setLoginView('updatePassword');
      setIsRecoveryMode(true);
    } else {
      const cleanupInvalidSession = async () => {
        try {
          const { error } = await supabase.auth.getSession();
          if (error && error.message.includes('Refresh Token')) {
            await supabase.auth.signOut();
          }
        } catch (e) {
          // Ignorar errores
        }
      };
      cleanupInvalidSession();
    }
  }, []);

  // Redirigir si ya está autenticado (excepto en modo recovery)
  useEffect(() => {
    if (user && !isRecoveryMode && loginView !== 'updatePassword') {
      navigate('/');
    }
  }, [user, navigate, isRecoveryMode, loginView]);

  const handleLogin = async (email: string, password: string) => {
    setIsLoading(true);
    const validation = loginSchema.safeParse({ email, password });
    if (!validation.success) {
      toast.error(validation.error.errors[0].message);
      setIsLoading(false);
      return;
    }

    const { error } = await signIn(email, password);
    if (error) {
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

    toast.success('¡Bienvenido de vuelta!');
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    if (currentUser) {
      const { data: adminRole } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', currentUser.id)
        .eq('role', 'admin')
        .maybeSingle();
      navigate(adminRole ? '/admin' : '/');
    } else {
      navigate('/');
    }
  };

  const handleRegister = async (name: string, hermandad: string, email: string, password: string) => {
    setIsLoading(true);
    const validation = registerSchema.safeParse({ name, hermandad, email, password });
    if (!validation.success) {
      console.error('Error de validación:', validation.error.errors);
      toast.error(validation.error.errors[0].message);
      setIsLoading(false);
      return;
    }

    const { error } = await signUp(email, password, { name, hermandad });
    if (error) {
      if (error.message.includes('User already registered')) {
        toast.error('Este email ya está registrado');
      } else if (error.message.includes('Password should be at least 6 characters')) {
        toast.error('La contraseña debe tener al menos 6 caracteres');
      } else if (error.message.includes('weak_password') || error.message.includes('weak and easy to guess')) {
        toast.error('La contraseña es demasiado débil. Usa una combinación más segura de letras, números y símbolos.');
      } else {
        console.error('Error de registro:', error.message);
        toast.error('Error al crear cuenta. Inténtalo de nuevo.');
      }
      setIsLoading(false);
      return;
    }

    toast.success('¡Cuenta creada con éxito!');
    navigate('/');
  };

  const handleRequestReset = async (email: string) => {
    try {
      resetPasswordSchema.parse({ email });
    } catch (error: any) {
      toast.error(error.errors[0]?.message || "Email inválido");
      return;
    }

    setIsLoading(true);
    const { error } = await resetPassword(email);
    setIsLoading(false);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Email de recuperación enviado. Revisa tu bandeja de entrada.");
    }
  };

  const handleUpdatePassword = async (password: string, confirmPassword: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast.error("Tu enlace de recuperación ha expirado. Solicita uno nuevo.");
      setLoginView('requestReset');
      setIsRecoveryMode(false);
      return;
    }

    try {
      newPasswordSchema.parse({ password, confirmPassword });
    } catch (error: any) {
      toast.error(error.errors[0]?.message || "Las contraseñas no coinciden");
      return;
    }

    setIsLoading(true);
    const { error } = await updatePassword(password);
    setIsLoading(false);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Contraseña actualizada correctamente");
      setLoginView('login');
      setIsRecoveryMode(false);
      window.history.replaceState({}, '', '/auth');
      navigate('/');
    }
  };

  const handleBackToLogin = () => {
    setLoginView('login');
    window.history.replaceState({}, '', '/auth');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary to-primary/80 flex items-center justify-center px-6 py-4">
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

            <TabsContent value="login">
              {loginView === 'login' && (
                <LoginForm
                  isLoading={isLoading}
                  onSubmit={handleLogin}
                  onForgotPassword={() => setLoginView('requestReset')}
                />
              )}
              {loginView === 'requestReset' && (
                <RequestResetForm
                  isLoading={isLoading}
                  onSubmit={handleRequestReset}
                  onBack={handleBackToLogin}
                />
              )}
              {loginView === 'updatePassword' && (
                <UpdatePasswordForm
                  isLoading={isLoading}
                  onSubmit={handleUpdatePassword}
                  onBack={handleBackToLogin}
                />
              )}
            </TabsContent>

            <TabsContent value="register">
              <RegisterForm isLoading={isLoading} onSubmit={handleRegister} />
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
    </div>
  );
};

export default Auth;
