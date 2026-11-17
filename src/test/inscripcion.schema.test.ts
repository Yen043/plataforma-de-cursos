import { describe, expect, it } from 'vitest';
import { crearInscripcionSchema } from '@/schemas/inscripcion.schema';

describe('crearInscripcionSchema', () => {
  it('acepta una inscripción con un identificador válido', () => {
    const resultado = crearInscripcionSchema.safeParse({
      cursoSlug: 'javascript-basico',
    });

    expect(resultado.success).toBe(true);
  });

  it('rechaza un identificador demasiado corto', () => {
    const resultado = crearInscripcionSchema.safeParse({
      cursoSlug: 'js',
    });

    expect(resultado.success).toBe(false);
  });

  it('rechaza un identificador con espacios', () => {
    const resultado = crearInscripcionSchema.safeParse({
      cursoSlug: 'javascript basico',
    });

    expect(resultado.success).toBe(false);
  });

  it('rechaza un identificador con letras mayúsculas', () => {
    const resultado = crearInscripcionSchema.safeParse({
      cursoSlug: 'JavaScript-Basico',
    });

    expect(resultado.success).toBe(false);
  });

  it('rechaza un identificador vacío', () => {
    const resultado = crearInscripcionSchema.safeParse({
      cursoSlug: '',
    });

    expect(resultado.success).toBe(false);
  });
});
