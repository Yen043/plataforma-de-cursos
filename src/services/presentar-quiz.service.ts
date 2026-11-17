import { randomUUID } from 'node:crypto';
import { enviarRespuestasQuizSchema } from '../schemas/respuesta-quiz.schema';
import { consultarQuizConRespuestas } from '../repositories/quiz.repository';
import { registrarIntentoQuiz } from '../repositories/resultado-quiz.repository';
import { calificarQuiz } from './quiz-calificacion.service';
import { verificarDisponibilidadIntento } from './quiz-intentos.service';
import type { ResultadoQuiz } from '../types/resultado-quiz';

interface PresentarQuizParams {
  estudianteId: string;
  cursoSlug: string;
  quizId: string;
  respuestas: Record<string, string>;
}

function validarRespuestasDelEstudiante(
  preguntas: {
    id: string;
    opciones: { id: string }[];
  }[],
  respuestas: Record<string, string>,
): void {
  const preguntasValidas = new Map(preguntas.map((pregunta) => [pregunta.id, pregunta]));
  if (Object.keys(respuestas).length !== preguntas.length) throw new Error('Debes responder todas las preguntas del cuestionario');

  for (const [preguntaId, opcionId] of Object.entries(respuestas)) {
    const pregunta = preguntasValidas.get(preguntaId);

    if (!pregunta) {
      throw new Error('Se recibió una pregunta que no pertenece al cuestionario');
    }

    const opcionValida = pregunta.opciones.some((opcion) => opcion.id === opcionId);

    if (!opcionValida) {
      throw new Error('Se recibió una opción que no pertenece a la pregunta');
    }
  }
}

export async function presentarQuiz(params: PresentarQuizParams): Promise<ResultadoQuiz> {
  const validacion = enviarRespuestasQuizSchema.safeParse({
    respuestas: params.respuestas,
  });

  if (!validacion.success) {
    throw new Error(validacion.error.issues[0]?.message ?? 'Las respuestas no son válidas');
  }

  const { quiz, respuestasCorrectas } = await consultarQuizConRespuestas(
    params.cursoSlug,
    params.quizId,
  );

  validarRespuestasDelEstudiante(quiz.preguntas, validacion.data.respuestas);

  const calificacion = calificarQuiz({
    preguntas: quiz.preguntas,
    respuestasCorrectas,
    respuestasEstudiante: validacion.data.respuestas,
  });

  const nuevoResultado = {
    id: randomUUID(),
    quizId: params.quizId,
    estudianteId: params.estudianteId,
    cursoSlug: params.cursoSlug,
    respuestas: validacion.data.respuestas,
    puntajeObtenido: calificacion.puntajeObtenido,
    puntajeMaximo: calificacion.puntajeMaximo,
    estado: calificacion.aprobado ? ('aprobado' as const) : ('reprobado' as const),
  };

  return registrarIntentoQuiz(nuevoResultado, verificarDisponibilidadIntento);
}
