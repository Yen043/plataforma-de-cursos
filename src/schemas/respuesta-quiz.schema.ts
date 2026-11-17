import { z } from 'zod';

export const enviarRespuestasQuizSchema = z.object({
  respuestas: z
    .record(z.string(), z.string().trim().min(1, 'La respuesta no puede estar vacía'))
    .refine(
      (respuestas) => Object.keys(respuestas).length > 0,
      'Debes responder al menos una pregunta',
    ),
}).strict();

export type EnviarRespuestasQuizDTO = z.infer<typeof enviarRespuestasQuizSchema>;
