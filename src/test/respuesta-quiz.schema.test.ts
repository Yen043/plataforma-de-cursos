import { describe, expect, it } from 'vitest';
import { enviarRespuestasQuizSchema } from '../schemas/respuesta-quiz.schema';

describe('enviarRespuestasQuizSchema', () => {
  it('acepta respuestas válidas', () => {
    const resultado = enviarRespuestasQuizSchema.safeParse({
      respuestas: {
        'pregunta-1': 'opcion-1',
        'pregunta-2': 'opcion-3',
      },
    });

    expect(resultado.success).toBe(true);
  });

  it('rechaza un objeto de respuestas vacío', () => {
    const resultado = enviarRespuestasQuizSchema.safeParse({
      respuestas: {},
    });

    expect(resultado.success).toBe(false);
  });

  it('rechaza respuestas vacías', () => {
    const resultado = enviarRespuestasQuizSchema.safeParse({
      respuestas: {
        'pregunta-1': '',
      },
    });

    expect(resultado.success).toBe(false);
  });

  it('rechaza respuestas que no sean texto', () => {
    const resultado = enviarRespuestasQuizSchema.safeParse({
      respuestas: {
        'pregunta-1': 123,
      },
    });

    expect(resultado.success).toBe(false);
  });

  it('elimina espacios al inicio y al final de las respuestas', () => {
    const resultado = enviarRespuestasQuizSchema.safeParse({
      respuestas: {
        'pregunta-1': '  opcion-1  ',
      },
    });

    expect(resultado.success).toBe(true);

    if (resultado.success) {
      expect(resultado.data.respuestas['pregunta-1']).toBe('opcion-1');
    }
  });
});
