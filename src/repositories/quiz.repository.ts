import 'server-only';

import { Timestamp } from 'firebase-admin/firestore';
import { getAdminDb } from '../lib/firebase-admin';
import type { Quiz } from '../types/quiz';

export interface QuizConRespuestas {
  quiz: Quiz;
  respuestasCorrectas: Record<string, string>;
}

export async function consultarQuizConRespuestas(
  cursoSlug: string,
  quizId: string,
): Promise<QuizConRespuestas> {
  const quizRef = getAdminDb().collection('cursos').doc(cursoSlug).collection('quizzes').doc(quizId);

  const documentoQuiz = await quizRef.get();

  if (!documentoQuiz.exists) {
    throw new Error('El cuestionario no existe');
  }

  const datosQuiz = documentoQuiz.data();

  if (!datosQuiz) {
    throw new Error('No se pudo consultar el cuestionario');
  }

  const documentoClave = await quizRef.collection('claves').doc('respuestas').get();

  if (!documentoClave.exists) {
    throw new Error('No se encontró la clave de respuestas');
  }

  const datosClave = documentoClave.data();
  const respuestasCorrectas = datosClave?.respuestas as Record<string, string> | undefined;

  if (!respuestasCorrectas) {
    throw new Error('La clave de respuestas no tiene información válida');
  }

  const fechaCreacion = datosQuiz.fechaCreacion as Timestamp;
  const fechaActualizacion = datosQuiz.fechaActualizacion as Timestamp;

  const quiz: Quiz = {
    ...datosQuiz,
    id: documentoQuiz.id,
    cursoSlug,
    fechaCreacion: fechaCreacion.toDate(),
    fechaActualizacion: fechaActualizacion.toDate(),
  } as Quiz;

  return {
    quiz,
    respuestasCorrectas,
  };
}
