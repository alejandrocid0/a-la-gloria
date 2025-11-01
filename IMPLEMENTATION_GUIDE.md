# 🚀 Guía de Implementación - A la Gloria

Esta guía detalla todos los pasos necesarios para conectar la aplicación con **Lovable Cloud** (Supabase) e implementar la lógica de juego.

---

## 📋 Índice

1. [Habilitar Lovable Cloud](#1-habilitar-lovable-cloud)
2. [Configurar Base de Datos](#2-configurar-base-de-datos)
3. [Implementar Autenticación](#3-implementar-autenticación)
4. [Conectar Pantallas](#4-conectar-pantallas)
5. [Lógica del Juego](#5-lógica-del-juego)
6. [Testing](#6-testing)
7. [Despliegue](#7-despliegue)

---

## 1. Habilitar Lovable Cloud

### Paso 1: Activar desde el Dashboard
1. En el proyecto de Lovable, ve a **Settings** → **Integrations**
2. Habilita **Lovable Cloud**
3. Espera a que se provisione el proyecto Supabase (~30 segundos)

### Paso 2: Verificar Variables de Entorno
Las siguientes variables se añadirán automáticamente:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

No es necesario añadirlas manualmente.

---

## 2. Configurar Base de Datos

### Paso 1: Abrir SQL Editor
1. En Lovable, ve a la pestaña **Cloud** → **Database**
2. Haz clic en **SQL Editor**

### Paso 2: Ejecutar Script de Base de Datos
Copia y ejecuta el contenido completo de `src/lib/database.sql` en el SQL Editor.

**Este script crea:**
- ✅ Tabla `profiles` (perfiles de usuario)
- ✅ Tabla `questions` (preguntas del trivia)
- ✅ Tabla `games` (partidas jugadas)
- ✅ Tabla `user_answers` (respuestas individuales)
- ✅ Trigger `handle_new_user()` (creación automática de perfil)
- ✅ Políticas RLS (Row Level Security)

### Paso 3: Verificar Creación
```sql
-- Ejecuta esto para verificar:
SELECT tablename FROM pg_tables WHERE schemaname = 'public';
```

Deberías ver: `profiles`, `questions`, `games`, `user_answers`

### Paso 4: Insertar Preguntas de Ejemplo
```sql
INSERT INTO public.questions (question_text, option_a, option_b, option_c, option_d, correct_answer, difficulty) VALUES
('¿En qué año se fundó la Hermandad de la Macarena?', '1595', '1650', '1701', '1820', 0, 'medium'),
('¿Cuántas cofradías procesionan en Sevilla?', '58', '60', '68', '77', 3, 'easy'),
('¿Qué día sale la Hermandad del Gran Poder?', 'Domingo de Ramos', 'Lunes Santo', 'Miércoles Santo', 'Jueves Santo', 3, 'easy');
```

---

## 3. Implementar Autenticación

### Paso 1: Instalar Dependencia de Supabase
```bash
npm install @supabase/supabase-js
```

### Paso 2: Descomentar y Completar `src/lib/supabase.ts`
```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: window.localStorage,
  }
})
```

### Paso 3: Implementar Hook `useAuth`
Descomentar y completar `src/hooks/useAuth.ts` siguiendo la plantilla incluida.

**Funciones del hook:**
- `signUp(email, password, metadata)` - Registro
- `signIn(email, password)` - Login
- `signOut()` - Logout
- `user` - Usuario actual
- `session` - Sesión actual
- `loading` - Estado de carga

### Paso 4: Implementar Validaciones
Descomentar `src/lib/validations.ts` y ajustar esquemas de Zod.

### Paso 5: Conectar Pantalla de Auth
En `src/pages/Auth.tsx`:
1. Importar `useAuth` y `toast`
2. Descomentar funciones `handleLogin` y `handleRegister`
3. Añadir `react-hook-form` con `zodResolver`
4. Implementar manejo de errores

### Paso 6: Proteger Rutas
En `src/App.tsx`:
1. Crear componente `<ProtectedRoute>`
2. Envolver rutas privadas
3. Redirigir a `/auth` si no hay sesión

**Ejemplo:**
```tsx
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) return <div>Cargando...</div>;
  if (!user) return <Navigate to="/auth" replace />;
  
  return <>{children}</>;
};
```

---

## 4. Conectar Pantallas

### Home (`src/pages/Home.tsx`)
**TODOs a implementar:**
- [ ] Cargar perfil del usuario con `useQuery`
- [ ] Verificar si ya jugó hoy (`last_game_date === today`)
- [ ] Deshabilitar botón si ya jugó
- [ ] Mostrar posición en ranking real
- [ ] Cargar total de usuarios

**Query ejemplo:**
```typescript
const { data: profile } = useQuery({
  queryKey: ['profile'],
  queryFn: async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user?.id)
      .single();
    if (error) throw error;
    return data;
  }
});
```

### Play (`src/pages/Play.tsx`)
**TODOs a implementar:**
- [ ] Cargar 10 preguntas aleatorias al iniciar
- [ ] Verificar que el usuario no haya jugado hoy
- [ ] Implementar sistema de puntuación por tiempo
- [ ] Guardar respuestas individuales en `user_answers`
- [ ] Guardar partida en `games` al terminar
- [ ] Actualizar perfil (`total_points`, `games_played`, etc.)

**Sistema de puntuación:**
```typescript
const calculatePoints = (timeLeft: number) => {
  return Math.round(100 * (timeLeft / 15));
};
// 15s → 100 pts
// 10s → 67 pts
// 5s → 33 pts
```

### Ranking (`src/pages/Ranking.tsx`)
**TODOs a implementar:**
- [ ] Cargar ranking global (TOP 100)
- [ ] Calcular posición del usuario
- [ ] Añadir filtros (Global / Mi hermandad / Amigos)

**Query ejemplo:**
```typescript
const { data: ranking } = useQuery({
  queryKey: ['ranking'],
  queryFn: async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, name, hermandad, total_points')
      .order('total_points', { ascending: false })
      .limit(100);
    if (error) throw error;
    return data.map((user, index) => ({
      ...user,
      position: index + 1
    }));
  }
});
```

### Profile (`src/pages/Profile.tsx`)
**TODOs a implementar:**
- [ ] Cargar perfil completo
- [ ] Mostrar email desde `auth.users`
- [ ] Calcular promedio de puntos
- [ ] Implementar botón de logout funcional

---

## 5. Lógica del Juego

### Flujo Completo de una Partida

#### 1. Verificar Disponibilidad
```typescript
// Al entrar a /jugar
const canPlay = profile?.last_game_date !== new Date().toISOString().split('T')[0];
if (!canPlay) {
  toast.error('Ya jugaste hoy. ¡Vuelve mañana!');
  navigate('/');
}
```

#### 2. Cargar Preguntas
```typescript
const { data: questions } = await supabase
  .from('questions')
  .select('*')
  .order('random()')
  .limit(10);
```

#### 3. Calcular Puntos por Respuesta
```typescript
const handleAnswer = (selectedAnswer: number, correctAnswer: number, timeLeft: number) => {
  const isCorrect = selectedAnswer === correctAnswer;
  const points = isCorrect ? Math.round(100 * (timeLeft / 15)) : 0;
  
  setTotalScore(prev => prev + points);
  if (isCorrect) setCorrectCount(prev => prev + 1);
  
  // Guardar respuesta individual
  await supabase.from('user_answers').insert({
    game_id: currentGameId,
    question_id: currentQuestion.id,
    selected_answer: selectedAnswer,
    is_correct: isCorrect,
    time_taken: 15 - timeLeft,
    points_earned: points
  });
};
```

#### 4. Guardar Resultados al Terminar
```typescript
const saveGameResults = async () => {
  // 1. Guardar partida
  const { data: game, error: gameError } = await supabase
    .from('games')
    .insert({
      user_id: user.id,
      date: new Date().toISOString().split('T')[0],
      total_score: totalScore,
      correct_answers: correctCount,
      incorrect_answers: 10 - correctCount,
      avg_time: avgTime
    })
    .select()
    .single();

  if (gameError) throw gameError;

  // 2. Actualizar perfil
  const { error: profileError } = await supabase.rpc('update_user_stats', {
    p_user_id: user.id,
    p_new_points: totalScore,
    p_new_best_score: totalScore
  });

  if (profileError) throw profileError;
};
```

#### 5. Crear Función SQL para Actualizar Stats
```sql
CREATE OR REPLACE FUNCTION update_user_stats(
  p_user_id UUID,
  p_new_points INTEGER,
  p_new_best_score INTEGER
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE profiles
  SET 
    total_points = total_points + p_new_points,
    games_played = games_played + 1,
    best_score = GREATEST(best_score, p_new_best_score),
    last_game_date = CURRENT_DATE,
    current_streak = CASE 
      WHEN last_game_date = CURRENT_DATE - 1 THEN current_streak + 1
      ELSE 1 
    END,
    updated_at = NOW()
  WHERE id = p_user_id;
END;
$$;
```

---

## 6. Testing

### Tests Manuales Esenciales

#### Autenticación
- [ ] Registro con email nuevo
- [ ] Login con credenciales correctas
- [ ] Login con credenciales incorrectas
- [ ] Logout y redireccionamiento
- [ ] Sesión persiste al recargar página

#### Juego
- [ ] Cargar 10 preguntas aleatorias
- [ ] Timer funciona correctamente
- [ ] Puntuación por tiempo es correcta
- [ ] No se puede jugar dos veces el mismo día
- [ ] Resultados se guardan en BD

#### Ranking
- [ ] Muestra TOP 100
- [ ] Posición del usuario es correcta
- [ ] Botón fijo aparece/desaparece al hacer scroll

#### Perfil
- [ ] Datos cargados correctamente
- [ ] Logout funciona

### Verificar RLS Policies
```sql
-- Intentar leer datos de otro usuario (debería fallar)
SELECT * FROM profiles WHERE id != auth.uid();

-- Intentar actualizar otro perfil (debería fallar)
UPDATE profiles SET total_points = 9999 WHERE id != auth.uid();
```

---

## 7. Despliegue

### Configuración de Auth (Importante)
1. Ve a **Cloud** → **Auth** → **Email Templates**
2. Personaliza plantillas de email
3. Si es solo testing: Desactiva "Confirm email" en **Auth** → **Providers** → **Email**

### Variables de Entorno
Lovable Cloud añade automáticamente:
- ✅ `VITE_SUPABASE_URL`
- ✅ `VITE_SUPABASE_ANON_KEY`

No es necesario configurar nada más.

### Deploy
1. Haz clic en **Publish** en el dashboard
2. La app se desplegará automáticamente en Lovable
3. URL: `https://tuapp.lovable.app`

---

## 🎯 Checklist Final

Antes de considerar el MVP completo:

### Backend
- [ ] Lovable Cloud habilitado
- [ ] Tablas creadas (profiles, questions, games, user_answers)
- [ ] Trigger `handle_new_user()` funcionando
- [ ] RLS policies activas
- [ ] Al menos 50 preguntas en `questions`

### Frontend
- [ ] Hook `useAuth` implementado
- [ ] Validaciones con Zod
- [ ] Protección de rutas
- [ ] Home carga datos reales
- [ ] Play carga preguntas y guarda resultados
- [ ] Ranking muestra TOP 100
- [ ] Profile muestra datos y permite logout

### UX
- [ ] Loading states en todas las pantallas
- [ ] Feedback de errores con toasts
- [ ] Mensajes de éxito
- [ ] "Ya jugaste hoy" funciona
- [ ] Celebración al completar partida

### Testing
- [ ] Registro y login funcionan
- [ ] Juego completo funciona
- [ ] Puntuación correcta
- [ ] Ranking actualiza en tiempo real
- [ ] No se puede hacer trampa

---

## 📚 Recursos

- **Documentación Lovable Cloud**: https://docs.lovable.dev/features/cloud
- **Supabase Docs**: https://supabase.com/docs
- **React Query**: https://tanstack.com/query/latest
- **Zod**: https://zod.dev

---

## 🆘 Solución de Problemas

### Error: "No se cargan los datos"
1. Verifica que Lovable Cloud esté habilitado
2. Revisa las variables de entorno
3. Comprueba las RLS policies

### Error: "User already registered"
- Ese email ya existe. Usa otro o resetea la contraseña.

### Error: "Invalid login credentials"
- Verifica email y contraseña
- Si acabas de registrarte, confirma tu email primero

### Error: "Ya jugaste hoy" pero no es cierto
- Verifica la query en `last_game_date`
- Comprueba timezone del servidor

---

**¡Listo para empezar! 🚀**

Sigue esta guía paso a paso y tendrás tu MVP funcional en poco tiempo.
