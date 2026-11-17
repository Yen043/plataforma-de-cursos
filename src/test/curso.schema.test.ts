import { describe, expect, it } from 'vitest';
import { crearCursoSchema } from '@/schemas/curso.schema';

const cursoValido = {
  slug: 'javascript-basico',
  titulo: 'JavaScript desde cero',
  descripcion: 'Aprende los fundamentos de JavaScript.',
};

describe('crearCursoSchema', () => {
  it('acepta un curso con datos válidos', () => {
    const resultado = crearCursoSchema.safeParse(cursoValido);

    expect(resultado.success).toBe(true);
  });

  it('rechaza un identificador con espacios', () => {
    const resultado = crearCursoSchema.safeParse({
      ...cursoValido,
      slug: 'javascript basico',
    });

    expect(resultado.success).toBe(false);
  });

  it('rechaza un título demasiado corto', () => {
    const resultado = crearCursoSchema.safeParse({
      ...cursoValido,
      titulo: 'JS',
    });

    expect(resultado.success).toBe(false);
  });

  it('rechaza una descripción demasiado corta', () => {
    const resultado = crearCursoSchema.safeParse({
      ...cursoValido,
      descripcion: 'Corto',
    });

    expect(resultado.success).toBe(false);
  });

  it('acepta una URL de imagen válida', () => {
    const resultado = crearCursoSchema.safeParse({
      ...cursoValido,
      imagenUrl: 'https://ejemplo.com/imagen.jpg',
    });

    expect(resultado.success).toBe(true);
  });

  it('rechaza una URL de imagen inválida', () => {
    const resultado = crearCursoSchema.safeParse({
      ...cursoValido,
      imagenUrl: 'no-es-una-url',
    });

    expect(resultado.success).toBe(false);
  });
});
