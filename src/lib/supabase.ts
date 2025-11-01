/**
 * CONFIGURACIÓN DE LOVABLE CLOUD (SUPABASE)
 * 
 * Este archivo contendrá la inicialización del cliente de Supabase.
 * 
 * TODO: Habilitar Lovable Cloud desde el dashboard
 * TODO: Las credenciales se añadirán automáticamente como variables de entorno:
 *       - VITE_SUPABASE_URL
 *       - VITE_SUPABASE_ANON_KEY
 * 
 * CONFIGURACIÓN DEL CLIENTE:
 * 
 * import { createClient } from '@supabase/supabase-js'
 * 
 * const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
 * const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
 * 
 * export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
 *   auth: {
 *     autoRefreshToken: true,
 *     persistSession: true,
 *     detectSessionInUrl: true,
 *     storage: window.localStorage,
 *   }
 * })
 * 
 * IMPORTANTE: No modificar la configuración del cliente, ya viene optimizada.
 */

// TODO: Descomentar cuando Lovable Cloud esté habilitado
// export const supabase = createClient(...)
