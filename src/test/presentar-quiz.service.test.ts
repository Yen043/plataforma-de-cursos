import { beforeEach, describe, expect, it, vi } from 'vitest';

const { consultarQuizMock, registrarIntentoMock } = vi.hoisted(() => ({
  consultarQuizMock: vi.fn(),
  registrarIntentoMock: vi.fn(),
}));

vi.mock('../repositories/quiz.repository', () => ({
  consultarQuizConRespuestas: consultarQuizMock,
}));

vi.mock('../repositories/resultado-quiz.repository', () => ({
  registrarIntentoQuiz: registrarIntentoMock,
}));

import { presentarQuiz } from '../services/presentar-quiz.service';

const quizMock = {
  id: 'quiz-1',
  cursoSlug: 'javascript-basico',
  titulo: 'Evaluación de JavaScript',
  descripcion: 'Evaluación de conocimientos básicos',
  preguntas: [
    {
      id: 'pregunta-1',
      enunciado: '¿Qué palabra declara una constante?',
      opciones: [
        { id: 'opcion-a', texto: 'const' },
        { id: 'opcion-b', texto: 'var' },
      ],
      orden: 1,
      puntaje: 100,
    },
  ],
  numeroMaximoIntentos: 3,
  fechaCreacion: new Date(),
  fechaActualizacion: new Date(),
};

function configurarMocks() {
  vi.clearAllMocks();

  consultarQuizMock.mockResolvedValue({
    quiz: quizMock,
    respuestasCorrectas: {
      'pregunta-1': 'opcion-a',
    },
  });

  registrarIntentoMock.mockResolvedValue({
    id: 'resultado-1',
    quizId: 'quiz-1',
    estudianteId: 'estudiante-1',
    cursoSlug: 'javascript-basico',
    numeroIntento: 1,
    respuestas: { 'pregunta-1': 'opcion-a' },
    puntajeObtenido: 100,
    puntajeMaximo: 100,
    estado: 'aprobado',
    fechaPresentacion: new Date(),
  });
}

describe('presentarQuiz', () => {
  beforeEach(configurarMocks);

  it('califica y registra una respuesta correcta', async () => {
    const resultado = await presentarQuiz({
      estudianteId: 'estudiante-1',
      cursoSlug: 'javascript-basico',
      quizId: 'quiz-1',
      respuestas: { 'pregunta-1': 'opcion-a' },
    });

    expect(resultado.estado).toBe('aprobado');
    expect(consultarQuizMock).toHaveBeenCalledOnce();
    expect(registrarIntentoMock).toHaveBeenCalledOnce();
  });
});

describe('validación de respuestas de presentarQuiz', () => {
  beforeEach(configurarMocks);

  it('rechaza respuestas vacías', async () => {
    await expect(
      presentarQuiz({
        estudianteId: 'estudiante-1',
        cursoSlug: 'javascript-basico',
        quizId: 'quiz-1',
        respuestas: {},
      }),
    ).rejects.toThrow('Debes responder al menos una pregunta');

    expect(consultarQuizMock).not.toHaveBeenCalled();
  });

  it('rechaza preguntas que no pertenecen al cuestionario', async () => {
    await expect(
      presentarQuiz({
        estudianteId: 'estudiante-1',
        cursoSlug: 'javascript-basico',
        quizId: 'quiz-1',
        respuestas: { 'pregunta-inventada': 'opcion-a' },
      }),
    ).rejects.toThrow('Se recibió una pregunta que no pertenece al cuestionario');

    expect(registrarIntentoMock).not.toHaveBeenCalled();
  });

  it('rechaza opciones que no pertenecen a la pregunta', async () => {
    await expect(
      presentarQuiz({
        estudianteId: 'estudiante-1',
        cursoSlug: 'javascript-basico',
        quizId: 'quiz-1',
        respuestas: { 'pregunta-1': 'opcion-inventada' },
      }),
    ).rejects.toThrow('Se recibió una opción que no pertenece a la pregunta');

    expect(registrarIntentoMock).not.toHaveBeenCalled();
  });
  it('rechaza cuestionarios con preguntas sin responder', async () => {
    const segundaPregunta = {
      id: 'pregunta-2',
      enunciado: '¿Qué estructura permite repetir instrucciones?',
      opciones: [{ id: 'opcion-a', texto: 'for' }, { id: 'opcion-b', texto: 'const' }],
      orden: 2,
      puntaje: 10,
    };
    consultarQuizMock.mockResolvedValueOnce({
      quiz: { ...quizMock, preguntas: [...quizMock.preguntas, segundaPregunta] },
      respuestasCorrectas: { 'pregunta-1': 'opcion-a', 'pregunta-2': 'opcion-a' },
    });
    await expect(presentarQuiz({
      estudianteId: 'estudiante-1',
      cursoSlug: 'javascript-basico',
      quizId: 'quiz-1',
      respuestas: { 'pregunta-1': 'opcion-a' },
    })).rejects.toThrow('Debes responder todas las preguntas del cuestionario');
    expect(registrarIntentoMock).not.toHaveBeenCalled();
  });

});
