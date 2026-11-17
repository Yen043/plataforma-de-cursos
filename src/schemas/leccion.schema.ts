import { z } from 'zod';
export const crearLeccionSchema = z.object({
  titulo: z.string().trim().min(5, 'El título debe tener al menos 5 caracteres').max(120, 'El título no puede superar los 120 caracteres'),
  contenidoMarkdown: z.string().trim().min(10, 'El contenido debe tener al menos 10 caracteres').max(50000, 'El contenido no puede superar los 50000 caracteres'),
  orden: z.number().int('El orden debe ser un número entero').positive('El orden debe ser mayor que cero'),
  vistaPrevia: z.boolean(),
  videoUrl: z.string().trim().url('La URL del video no es válida').optional(),
  subtitulosUrl: z.string().trim().url('La URL de subtítulos no es válida').optional(),
}).strict().superRefine((leccion, ctx) => {
  if (leccion.videoUrl && !leccion.subtitulosUrl) ctx.addIssue({ code: 'custom', message: 'Los videos deben incluir una pista de subtítulos.', path: ['subtitulosUrl'] });
});
export type CrearLeccionDTO = z.infer<typeof crearLeccionSchema>;
