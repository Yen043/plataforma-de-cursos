import { z } from 'zod';

export const crearCursoSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(3, 'El identificador debe tener al menos 3 caracteres')
    .max(80, 'El identificador no puede superar los 80 caracteres')
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      'El identificador solo permite letras minúsculas, números y guiones',
    ),

  titulo: z
    .string()
    .trim()
    .min(5, 'El título debe tener al menos 5 caracteres')
    .max(100, 'El título no puede superar los 100 caracteres'),

  descripcion: z
    .string()
    .trim()
    .min(10, 'La descripción debe tener al menos 10 caracteres')
    .max(500, 'La descripción no puede superar los 500 caracteres'),

  imagenUrl: z.string().trim().url('Debes ingresar una URL válida').optional(),
}).strict();

export type CrearCursoDTO = z.infer<typeof crearCursoSchema>;
