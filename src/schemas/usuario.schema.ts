import { z } from 'zod';

export const crearUsuarioSchema = z.object({
  nombre: z
    .string()
    .trim()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(80, 'El nombre no puede superar los 80 caracteres'),

  correo: z
    .string()
    .trim()
    .email('Debes ingresar un correo electrónico válido')
    .max(254, 'El correo es demasiado largo')
    .toLowerCase(),
}).strict();

export type CrearUsuarioDTO = z.infer<typeof crearUsuarioSchema>;
