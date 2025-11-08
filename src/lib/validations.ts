import { z } from 'zod';

/**
 * Schema para registro de usuario
 */
export const registerSchema = z.object({
  name: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(50, "El nombre no puede exceder 50 caracteres")
    .regex(/^[a-záéíóúñA-ZÁÉÍÓÚÑ\s]+$/, "El nombre solo puede contener letras"),
  
  hermandad: z
    .string()
    .min(1, "Debes seleccionar una hermandad"),
  
  email: z
    .string()
    .email("Email inválido")
    .toLowerCase(),
  
  password: z
    .string()
    .min(6, "La contraseña debe tener al menos 6 caracteres")
    .max(72, "La contraseña no puede exceder 72 caracteres"),
});

export type RegisterFormData = z.infer<typeof registerSchema>;

/**
 * Schema para login
 */
export const loginSchema = z.object({
  email: z
    .string()
    .email("Email inválido")
    .toLowerCase(),
  
  password: z
    .string()
    .min(1, "La contraseña es requerida")
});

export type LoginFormData = z.infer<typeof loginSchema>;

/**
 * Schema para preguntas del juego
 */
export const questionSchema = z.object({
  question_text: z
    .string()
    .trim()
    .min(10, "La pregunta debe tener al menos 10 caracteres")
    .max(500, "La pregunta no puede exceder 500 caracteres"),
  
  option_a: z
    .string()
    .trim()
    .min(1, "La opción A es requerida")
    .max(200, "La opción A no puede exceder 200 caracteres"),
  
  option_b: z
    .string()
    .trim()
    .min(1, "La opción B es requerida")
    .max(200, "La opción B no puede exceder 200 caracteres"),
  
  option_c: z
    .string()
    .trim()
    .min(1, "La opción C es requerida")
    .max(200, "La opción C no puede exceder 200 caracteres"),
  
  option_d: z
    .string()
    .trim()
    .min(1, "La opción D es requerida")
    .max(200, "La opción D no puede exceder 200 caracteres"),
  
  correct_answer: z
    .number()
    .int()
    .min(1, "Debes seleccionar una respuesta correcta")
    .max(4, "La respuesta correcta debe ser entre 1 y 4"),
  
  difficulty: z
    .enum(["fácil", "media", "difícil"], {
      errorMap: () => ({ message: "Debes seleccionar una dificultad" })
    }),
  
  category: z
    .string()
    .trim()
    .max(100, "La categoría no puede exceder 100 caracteres")
    .optional()
});

export type QuestionFormData = z.infer<typeof questionSchema>;
