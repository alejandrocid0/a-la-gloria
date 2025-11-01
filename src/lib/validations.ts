/**
 * VALIDACIONES CON ZOD
 * 
 * Esquemas de validación para formularios de la aplicación.
 * 
 * TODO: IMPLEMENTAR CUANDO SE CONECTE LOVABLE CLOUD
 */

// import { z } from 'zod';

/**
 * Schema para registro de usuario
 * 
 * export const registerSchema = z.object({
 *   name: z
 *     .string()
 *     .min(2, "El nombre debe tener al menos 2 caracteres")
 *     .max(50, "El nombre no puede exceder 50 caracteres")
 *     .regex(/^[a-záéíóúñA-ZÁÉÍÓÚÑ\s]+$/, "El nombre solo puede contener letras"),
 *   
 *   hermandad: z
 *     .string()
 *     .min(1, "Debes seleccionar una hermandad"),
 *   
 *   email: z
 *     .string()
 *     .email("Email inválido")
 *     .toLowerCase(),
 *   
 *   password: z
 *     .string()
 *     .min(6, "La contraseña debe tener al menos 6 caracteres")
 *     .max(72, "La contraseña no puede exceder 72 caracteres")
 *     .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 
 *       "La contraseña debe contener al menos una mayúscula, una minúscula y un número"),
 *   
 *   confirmPassword: z.string()
 * }).refine((data) => data.password === data.confirmPassword, {
 *   message: "Las contraseñas no coinciden",
 *   path: ["confirmPassword"],
 * });
 * 
 * export type RegisterFormData = z.infer<typeof registerSchema>;
 */

/**
 * Schema para login
 * 
 * export const loginSchema = z.object({
 *   email: z
 *     .string()
 *     .email("Email inválido")
 *     .toLowerCase(),
 *   
 *   password: z
 *     .string()
 *     .min(1, "La contraseña es requerida")
 * });
 * 
 * export type LoginFormData = z.infer<typeof loginSchema>;
 */

/**
 * USO EN COMPONENTES:
 * 
 * import { useForm } from 'react-hook-form';
 * import { zodResolver } from '@hookform/resolvers/zod';
 * import { registerSchema, RegisterFormData } from '@/lib/validations';
 * 
 * const form = useForm<RegisterFormData>({
 *   resolver: zodResolver(registerSchema),
 *   defaultValues: {
 *     name: '',
 *     hermandad: '',
 *     email: '',
 *     password: '',
 *     confirmPassword: ''
 *   }
 * });
 * 
 * const onSubmit = async (data: RegisterFormData) => {
 *   // Datos ya validados
 *   const { error } = await signUp(data.email, data.password, {
 *     name: data.name,
 *     hermandad: data.hermandad
 *   });
 * };
 */

// TODO: Descomentar cuando se implemente autenticación
