import { describe, expect, it } from 'vitest';
import { crearQuizSchema } from '../schemas/quiz.schema';

const preguntaValida = {
  id: 'pregunta-1',
  enunciado: '¿Qué palabra se utiliza para declarar una clase?',
  opciones: [
    { id: 'opcion-1', texto: 'class' },
    { id: 'opcion-2', texto: 'function' },
  ],
  orden: 1,
  puntaje: 5,
};

const quizValido = {
  titulo: 'Introducción a Java',
  descripcion: 'Evaluación sobre los conceptos básicos de Java.',
  preguntas: [preguntaValida],
};

describe('crearQuizSchema: datos generales', () => {
  it('acepta un cuestionario válido', () => {
    expect(crearQuizSchema.safeParse(quizValido).success).toBe(true);
  });

  it('rechaza un título demasiado corto', () => {
    const resultado = crearQuizSchema.safeParse({
      ...quizValido,
      titulo: 'Java',
    });

    expect(resultado.success).toBe(false);
  });

  it('rechaza un cuestionario sin preguntas', () => {
    const resultado = crearQuizSchema.safeParse({
      ...quizValido,
      preguntas: [],
    });

    expect(resultado.success).toBe(false);
  });
});

describe('crearQuizSchema: validación de preguntas', () => {
  it('rechaza preguntas con menos de dos opciones', () => {
    const resultado = crearQuizSchema.safeParse({
      ...quizValido,
      preguntas: [
        {
          ...preguntaValida,
          opciones: [{ id: 'opcion-1', texto: 'class' }],
        },
      ],
    });

    expect(resultado.success).toBe(false);
  });

  it('rechaza identificadores de opciones repetidos', () => {
    const resultado = crearQuizSchema.safeParse({
      ...quizValido,
      preguntas: [
        {
          ...preguntaValida,
          opciones: [
            { id: 'opcion-1', texto: 'class' },
            { id: 'opcion-1', texto: 'function' },
          ],
        },
      ],
    });

    expect(resultado.success).toBe(false);
  });

  it('rechaza preguntas con el mismo orden', () => {
    const resultado = crearQuizSchema.safeParse({
      ...quizValido,
      preguntas: [preguntaValida, { ...preguntaValida, id: 'pregunta-2' }],
    });

    expect(resultado.success).toBe(false);
  });
});
