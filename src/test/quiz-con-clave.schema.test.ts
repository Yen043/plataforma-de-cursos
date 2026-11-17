import { describe, expect, it } from 'vitest';
import { crearQuizConClaveSchema } from '@/schemas/quiz-con-clave.schema';
const quiz = {
  titulo: 'Evaluación de React',
  descripcion: 'Comprueba los conceptos esenciales del curso.',
  preguntas: [{ id: 'p1', enunciado: '¿Qué es un componente?', opciones: [{ id: 'a', texto: 'Una parte de interfaz' }, { id: 'b', texto: 'Una base de datos' }], orden: 1, puntaje: 10 }],
  respuestasCorrectas: { p1: 'a' },
};
describe('crearQuizConClaveSchema', () => {
  it('acepta un quiz con una clave válida', () => { expect(crearQuizConClaveSchema.safeParse(quiz).success).toBe(true); });
  it('rechaza una clave que apunta a una opción inexistente', () => { expect(crearQuizConClaveSchema.safeParse({ ...quiz, respuestasCorrectas: { p1: 'z' } }).success).toBe(false); });
  it('rechaza claves para preguntas que no existen', () => { expect(crearQuizConClaveSchema.safeParse({ ...quiz, respuestasCorrectas: { p1: 'a', p2: 'b' } }).success).toBe(false); });
});
