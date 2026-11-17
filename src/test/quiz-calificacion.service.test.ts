import { describe, expect, it } from 'vitest';
import { calificarQuiz } from '../services/quiz-calificacion.service';

const preguntas = [
  { id: 'p1', puntaje: 50 },
  { id: 'p2', puntaje: 30 },
  { id: 'p3', puntaje: 20 },
];

const respuestasCorrectas = {
  p1: 'a',
  p2: 'b',
  p3: 'c',
};

describe('calificarQuiz: resultados', () => {
  it('aprueba cuando obtiene el 70 % o más', () => {
    const resultado = calificarQuiz({
      preguntas,
      respuestasCorrectas,
      respuestasEstudiante: {
        p1: 'a',
        p2: 'b',
      },
    });

    expect(resultado.puntajeObtenido).toBe(80);
    expect(resultado.puntajeMaximo).toBe(100);
    expect(resultado.porcentaje).toBe(80);
    expect(resultado.aprobado).toBe(true);
  });

  it('reprueba cuando obtiene menos del 70 %', () => {
    const resultado = calificarQuiz({
      preguntas,
      respuestasCorrectas,
      respuestasEstudiante: {
        p1: 'a',
      },
    });

    expect(resultado.puntajeObtenido).toBe(50);
    expect(resultado.porcentaje).toBe(50);
    expect(resultado.aprobado).toBe(false);
  });

  it('aprueba exactamente con el 70 %', () => {
    const resultado = calificarQuiz({
      preguntas,
      respuestasCorrectas,
      respuestasEstudiante: {
        p1: 'a',
        p2: 'b',
        p3: 'incorrecta',
      },
    });

    expect(resultado.puntajeObtenido).toBe(80);
    expect(resultado.aprobado).toBe(true);
  });
});

describe('calificarQuiz: validaciones', () => {
  it('no suma puntos por respuestas incorrectas', () => {
    const resultado = calificarQuiz({
      preguntas,
      respuestasCorrectas,
      respuestasEstudiante: {
        p1: 'incorrecta',
        p2: 'incorrecta',
        p3: 'incorrecta',
      },
    });

    expect(resultado.puntajeObtenido).toBe(0);
    expect(resultado.aprobado).toBe(false);
  });

  it('no suma puntos cuando el estudiante deja preguntas sin responder', () => {
    const resultado = calificarQuiz({
      preguntas,
      respuestasCorrectas,
      respuestasEstudiante: {},
    });

    expect(resultado.puntajeObtenido).toBe(0);
    expect(resultado.aprobado).toBe(false);
  });

  it('devuelve cero cuando el cuestionario no tiene preguntas', () => {
    const resultado = calificarQuiz({
      preguntas: [],
      respuestasCorrectas: {},
      respuestasEstudiante: {},
    });

    expect(resultado.puntajeMaximo).toBe(0);
    expect(resultado.porcentaje).toBe(0);
    expect(resultado.aprobado).toBe(false);
  });
});
