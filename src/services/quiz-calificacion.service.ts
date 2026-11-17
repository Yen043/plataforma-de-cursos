const PORCENTAJE_MINIMO_APROBACION = 70;

interface PreguntaCalificacion {
  id: string;
  puntaje: number;
}

interface CalificarQuizParams {
  preguntas: PreguntaCalificacion[];
  respuestasCorrectas: Record<string, string>;
  respuestasEstudiante: Record<string, string>;
}

interface ResultadoCalificacion {
  puntajeObtenido: number;
  puntajeMaximo: number;
  porcentaje: number;
  aprobado: boolean;
}

export function calificarQuiz({
  preguntas,
  respuestasCorrectas,
  respuestasEstudiante,
}: CalificarQuizParams): ResultadoCalificacion {
  const puntajeMaximo = preguntas.reduce((total, pregunta) => total + pregunta.puntaje, 0);

  const puntajeObtenido = preguntas.reduce((total, pregunta) => {
    const respuestaCorrecta = respuestasCorrectas[pregunta.id];
    const respuestaEstudiante = respuestasEstudiante[pregunta.id];

    if (
      respuestaCorrecta !== undefined &&
      respuestaEstudiante !== undefined &&
      respuestaEstudiante === respuestaCorrecta
    ) {
      return total + pregunta.puntaje;
    }

    return total;
  }, 0);

  const porcentaje = puntajeMaximo > 0 ? (puntajeObtenido / puntajeMaximo) * 100 : 0;

  return {
    puntajeObtenido,
    puntajeMaximo,
    porcentaje,
    aprobado: porcentaje >= PORCENTAJE_MINIMO_APROBACION,
  };
}
