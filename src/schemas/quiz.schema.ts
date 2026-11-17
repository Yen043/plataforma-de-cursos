import { z } from 'zod';

export const opcionQuizSchema = z.object({
  id: z.string().trim().min(1, 'La opción debe tener un identificador'),
  texto: z.string().trim().min(1, 'El texto de la opción es obligatorio').max(200, 'La opción no puede superar los 200 caracteres'),
});

export const preguntaQuizSchema = z.object({
  id: z.string().trim().min(1, 'La pregunta debe tener un identificador'),
  enunciado: z.string().trim().min(5, 'El enunciado debe tener al menos 5 caracteres').max(1000, 'El enunciado no puede superar los 1000 caracteres'),
  opciones: z.array(opcionQuizSchema).min(2, 'Cada pregunta debe tener al menos 2 opciones'),
  orden: z.number().int().positive('El orden debe ser mayor que cero'),
  puntaje: z.number().positive('El puntaje debe ser mayor que cero'),
}).superRefine((pregunta, ctx) => {
  const ids = pregunta.opciones.map((opcion) => opcion.id);
  if (new Set(ids).size !== ids.length) ctx.addIssue({ code: 'custom', message: 'Las opciones no pueden tener identificadores repetidos', path: ['opciones'] });
});

export const quizBaseSchema = z.object({
  titulo: z.string().trim().min(5, 'El título debe tener al menos 5 caracteres').max(100, 'El título no puede superar los 100 caracteres'),
  descripcion: z.string().trim().min(10, 'La descripción debe tener al menos 10 caracteres').max(500, 'La descripción no puede superar los 500 caracteres'),
  preguntas: z.array(preguntaQuizSchema).min(1, 'El cuestionario debe tener al menos una pregunta'),
}).strict();

export function validarEstructuraPreguntas(quiz: { preguntas: { id: string; orden: number }[] }, ctx: z.RefinementCtx) {
  const ids = quiz.preguntas.map((pregunta) => pregunta.id);
  const ordenes = quiz.preguntas.map((pregunta) => pregunta.orden);
  if (new Set(ids).size !== ids.length) ctx.addIssue({ code: 'custom', message: 'Las preguntas no pueden tener identificadores repetidos', path: ['preguntas'] });
  if (new Set(ordenes).size !== ordenes.length) ctx.addIssue({ code: 'custom', message: 'Las preguntas no pueden tener el mismo orden', path: ['preguntas'] });
}

export const crearQuizSchema = quizBaseSchema.superRefine(validarEstructuraPreguntas);
export type CrearQuizDTO = z.infer<typeof crearQuizSchema>;
