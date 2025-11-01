/**
 * HOOK DE AUTENTICACIÓN - useAuth
 * 
 * Este hook gestionará el estado de autenticación global de la aplicación.
 * 
 * TODO: IMPLEMENTAR CUANDO LOVABLE CLOUD ESTÉ HABILITADO
 * 
 * ESTRUCTURA:
 * 
 * import { useState, useEffect } from 'react';
 * import { User, Session } from '@supabase/supabase-js';
 * import { supabase } from '@/lib/supabase';
 * 
 * export const useAuth = () => {
 *   const [user, setUser] = useState<User | null>(null);
 *   const [session, setSession] = useState<Session | null>(null);
 *   const [loading, setLoading] = useState(true);
 * 
 *   useEffect(() => {
 *     // 1. Configurar listener de cambios de autenticación (PRIMERO)
 *     const { data: { subscription } } = supabase.auth.onAuthStateChange(
 *       (event, session) => {
 *         setSession(session);
 *         setUser(session?.user ?? null);
 *         setLoading(false);
 *       }
 *     );
 * 
 *     // 2. Verificar sesión existente (DESPUÉS)
 *     supabase.auth.getSession().then(({ data: { session } }) => {
 *       setSession(session);
 *       setUser(session?.user ?? null);
 *       setLoading(false);
 *     });
 * 
 *     return () => subscription.unsubscribe();
 *   }, []);
 * 
 *   const signUp = async (email: string, password: string, metadata: { name: string, hermandad: string }) => {
 *     const redirectUrl = `${window.location.origin}/`;
 *     
 *     const { error } = await supabase.auth.signUp({
 *       email,
 *       password,
 *       options: {
 *         emailRedirectTo: redirectUrl,
 *         data: metadata // Se guardará en auth.users.raw_user_meta_data
 *       }
 *     });
 *     return { error };
 *   };
 * 
 *   const signIn = async (email: string, password: string) => {
 *     const { error } = await supabase.auth.signInWithPassword({
 *       email,
 *       password,
 *     });
 *     return { error };
 *   };
 * 
 *   const signOut = async () => {
 *     const { error } = await supabase.auth.signOut();
 *     return { error };
 *   };
 * 
 *   return {
 *     user,
 *     session,
 *     loading,
 *     signUp,
 *     signIn,
 *     signOut,
 *   };
 * };
 * 
 * SEGURIDAD CRÍTICA:
 * - Nunca usar async functions directamente en onAuthStateChange
 * - Nunca llamar otras funciones de Supabase dentro del callback
 * - Si necesitas fetch data, usa setTimeout(() => fetchData(), 0)
 * - Siempre almacenar session completo, no solo user
 */

// TODO: Implementar cuando Lovable Cloud esté habilitado
