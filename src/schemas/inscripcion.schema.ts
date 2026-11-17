import { z } from 'zod';

export const crearInscripcionSchema = z.object({
  cursoSlug: z
    .string()
    .trim()
    .min(3, 'El identificador del curso debe tener al menos 3 caracteres')
    .max(80, 'El identificador del curso no puede superar los 80 caracteres')
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      'El identificador del curso solo permite letras minúsculas, números y guiones',
    ),
}).strict();

export type CrearInscripcionDTO = z.infer<typeof crearInscripcionSchema>;
