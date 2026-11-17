import { z } from 'zod';
import { quizBaseSchema, validarEstructuraPreguntas } from './quiz.schema';

export const crearQuizConClaveSchema = quizBaseSchema.extend({
  respuestasCorrectas: z.record(z.string(), z.string().trim().min(1)),
}).strict().superRefine((quiz, ctx) => {
  validarEstructuraPreguntas(quiz, ctx);
  const preguntas = new Map(quiz.preguntas.map((pregunta) => [pregunta.id, pregunta]));
  for (const pregunta of quiz.preguntas) {
    const opcion = quiz.respuestasCorrectas[pregunta.id];
    if (!opcion || !pregunta.opciones.some((item) => item.id === opcion)) ctx.addIssue({ code: 'custom', message: 'Cada pregunta debe tener una respuesta correcta válida.', path: ['respuestasCorrectas', pregunta.id] });
  }
  for (const preguntaId of Object.keys(quiz.respuestasCorrectas)) {
    if (!preguntas.has(preguntaId)) ctx.addIssue({ code: 'custom', message: 'La clave contiene una pregunta ajena al cuestionario.', path: ['respuestasCorrectas', preguntaId] });
  }
});
export type CrearQuizConClaveDTO = z.infer<typeof crearQuizConClaveSchema>;
